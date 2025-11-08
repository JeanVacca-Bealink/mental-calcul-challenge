"use server";

import { createClient } from "@/lib/supabase/server";

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  created_at: string;
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
    .eq("code", challengeCode)
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
    .select("nickname, score, created_at")
    .eq("challenge_id", challenge.id)
    .order("score", { ascending: false });

  if (entriesErr) {
    console.error("Leaderboard fetch: entries error", entriesErr);
    return null;
  }

  return entries as LeaderboardEntry[];
}