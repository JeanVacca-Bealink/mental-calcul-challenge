"use server";

import { createClient } from "@/lib/supabase/server";
import { addLeaderboardEntry } from "./leaderboard.actions";

interface QuestionModel {
  a: number;
  q: string;
}

export async function addChallenge(challenge: {
  difficulty: string;
  total: number;
  score: number;
  elapsed_time: number;
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

  addLeaderboardEntry(
    challenge_id,
    "Anonymous",
    challenge.score,
    challenge.elapsed_time
  );

  return { shareUrl: `/leaderboard/${code}` };
}

export async function getChallengeByCode(
  challengeCode: string,
  withQuestion: boolean = false
): Promise<ChallengeByCodeResponse | null> {
  const supabase = await createClient();
  const user_id = (await supabase.auth.getUser()).data.user?.id;
  const { data: challenge, error: challengeErr } = await supabase
    .from("challenges")
    .select("id, user_id, code, difficulty, total_questions")
    .eq("code", challengeCode)
    .single();
  if (challengeErr) return { error: challengeErr.message };
  
  const result =  {
      id: challenge?.id || "",
      code: challenge?.code,
      created_by: challenge?.user_id,
      is_author: challenge?.user_id == user_id,
      total_questions: challenge?.total_questions,
      difficulty: challenge?.difficulty,
    } as ChallengeEntry;
  if(withQuestion){
      const { data: questions, error: challengeErr } = await supabase
        .from("questions")
        .select("question, answer")
        .eq("id", challenge?.id);

      result.questions = questions;
  }
  
  return {
    challenge: result
  };
}

/**
 * Checks whether the currently authenticated user has already answered the challenge.
 * Returns true if an entry exists in the leaderboard for this challenge and user.
 */
export async function hasUserAnsweredChallenge(
  challengeId: string
): Promise<boolean> {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user_id) return false;

  const { data: entries, error } = await supabase
    .from("leaderboard")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", user_id)
    .limit(1);

  if (error) {
    console.error("Error checking answered status:", error);
    return false;
  }

  return entries && entries.length > 0;
}

export interface ChallengeByCodeResponse {
  error?: string | null;
  challenge?: ChallengeEntry | null;
}

export interface ChallengeEntry {
  id: string;
  code: string;
  difficulty: string;
  total_questions: number;
  created_by: string;
  is_author: boolean;
  questions?: QuestionEntry[] | null;
}

export interface QuestionEntry {
  question:string;
  answer: number;
}
