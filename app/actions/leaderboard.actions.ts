"use server";

import { createClient } from "@/lib/supabase/server";

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  created_at: string;
  time_ms: number | null;
}

export default async function getLeaderboard(
  challengeCode: string
): Promise<LeaderboardEntry[] | null> {
  const supabase = await createClient();

  // Resolve challenge id from code
  const {
    data: challenge,
    error: challengeErr,
  } = await supabase
    .from("challenges")
    .select("id, user_id")
    .eq("id", challengeCode)
    .single();

  if (challengeErr || !challenge) {
    console.error("Leaderboard fetch: challenge not found", challengeErr);
    return null;
  }

  // Fetch leaderboard entries for this challenge
  const {
    data: entries,
    error: entriesErr,
  } = await supabase
    .from("leaderboard")
    .select("nickname, score, created_at, time_ms")
    .eq("challenge_id", challenge.id)
    .order("score", { ascending: false })
    .order("time_ms", { ascending: true })

  if (entriesErr) {
    console.error("Leaderboard fetch: entries error", entriesErr);
    return null;
  }

  return entries as LeaderboardEntry[];
}

// New action to insert a leaderboard entry with elapsed time
export async function addLeaderboardEntry(
  challengeId: string,
  nickname: string,
  score: number,
  timeMs: number
): Promise<boolean> {
  const supabase = await createClient();

  const user_id = (await supabase.auth.getUser()).data.user?.id;

  const { error } = await supabase
    .from("leaderboard")
    .insert({
      challenge_id: challengeId,
      user_id: user_id,
      nickname,
      score,
      time_ms: timeMs,
    });

  if (error) {
    console.error("Leaderboard insert error", error);
    return false;
  }

  return true;
}