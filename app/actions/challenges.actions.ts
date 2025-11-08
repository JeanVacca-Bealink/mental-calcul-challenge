"use server";

import { createClient } from "@/lib/supabase/server";

interface QuestionModel {
  a: number;
  q: string;
}

export async function addChallenge(challenge: {
  difficulty: string;
  total: number;
  score: number;
  questions: QuestionModel[];
}) {
  const supabase = await createClient();
  const user_id = (await supabase.auth.getUser()).data.user?.id;
  // Generate a unique code for sharing
  const code = crypto.randomUUID();

  const { data, error } = await supabase
    .from("challenges")
    .insert({
      code,
      difficulty: challenge.difficulty,
      total_questions: challenge.total,
      score: challenge.score,
      user_id: user_id,
    })
    .select("id, code")
    .single();

  if (error) return { error: error.message };
  var challenge_id = data.id;
  console.log("challenge added : " + challenge_id);
  challenge.questions.forEach(async (question) => {
    console.log("adding question : " + question.q);
    await supabase.from("questions").insert({
      challenge_id,
      question: question.q,
      answer: question.a,
    });
  });

  return { shareUrl: `/leaderboard/${code}` };
}

export async function getChallengeByCode(challengeCode: string) : Promise<ChallengeEntry | null> {
  const supabase = await createClient();
  const user_id = (await supabase.auth.getUser()).data.user?.id;
  const {
    data: challenge,
    error: challengeErr,
  } = await supabase
    .from("challenges")
    .select("id, user_id, code")
    .eq("code", challengeCode)
    .single();

  return {
    id: challenge?.id || '',
    code: challenge?.code,
    created_by: challenge?.user_id,
    is_author: challenge?.user_id == user_id
  }
}

export interface ChallengeEntry {
  id: string;
  code: string;
  created_by: string;
  is_author: boolean;
}
