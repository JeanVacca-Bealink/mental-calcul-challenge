"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Get statistics for a specific challenge created by the user
 * Includes: number of completions, average score
 */
export async function getChallengeStats(challengeId: string) {
  const supabase = await createClient();

  // Get all leaderboard entries for this challenge
  const { data: entries, error } = await supabase
    .from("leaderboard")
    .select("score")
    .eq("challenge_id", challengeId);

  if (error) {
    console.error("Error fetching challenge stats:", error);
    return { completions: 0, averageScore: 0 };
  }

  const completions = entries?.length || 0;
  const averageScore =
    entries && entries.length > 0
      ? (entries.reduce((sum: number, e: any) => sum + (e.score || 0), 0) / entries.length).toFixed(2)
      : 0;

  return { completions, averageScore };
}

/**
 * Get all challenges stats for the authenticated user
 */
export async function getAllUserChallengesStats(challengeIds: string[]) {
  const supabase = await createClient();

  if (!challengeIds || challengeIds.length === 0) {
    return {};
  }

  const { data: entries, error } = await supabase
    .from("leaderboard")
    .select("challenge_id, score")
    .in("challenge_id", challengeIds);

  if (error) {
    console.error("Error fetching challenges stats:", error);
    return {};
  }

  const stats: Record<string, { completions: number; averageScore: string }> = {};

  challengeIds.forEach((id) => {
    const challengeEntries = entries?.filter((e: any) => e.challenge_id === id) || [];
    const completions = challengeEntries.length;
    const averageScore =
      completions > 0
        ? (
          challengeEntries.reduce((sum: number, e: any) => sum + (e.score || 0), 0) / completions
        ).toFixed(2)
        : "0";

    stats[id] = { completions, averageScore };
  });

  return stats;
}
