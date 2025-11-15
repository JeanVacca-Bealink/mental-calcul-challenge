"use server";

import { createClient } from "@/lib/supabase/server";

interface LocalEntry {
  challengeId: string;
  nickname: string;
  score: number;
  timeMs: number;
  created_at?: string;
}

/**
 * Migrate local anonymous leaderboard entries to the authenticated user's account.
 * - If an anonymous leaderboard row exists for the same challenge and nickname, update it to set the user_id.
 * - Otherwise insert a new row with the current user_id.
 */
export default async function migrateLocalEntries(entries: LocalEntry[]) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user_id) return { error: "not_authenticated" };

  for (const e of entries) {
    try {
      // Try to find an anonymous row matching challenge + nickname (best-effort)
      const { data: anonRows, error: anonErr } = await supabase
        .from("leaderboard")
        .select("id, nickname, score, time_ms")
        .is("user_id", null)
        .eq("challenge_id", e.challengeId)
        .eq("nickname", e.nickname)
        .limit(1);

      if (anonErr) {
        console.error("local sync: error searching anon rows", anonErr);
      }

      if (anonRows && anonRows.length > 0) {
        // Update the anonymous row to attach to this user
        const rowId = (anonRows[0] as any).id;
        const { error: updErr } = await supabase
          .from("leaderboard")
          .update({ user_id: user_id })
          .eq("id", rowId);
        if (updErr) console.error("local sync: error updating row", updErr);
        continue;
      }

      // No anonymous match found — ensure we don't already have an entry for this user
      const { data: existing, error: existErr } = await supabase
        .from("leaderboard")
        .select("id")
        .eq("challenge_id", e.challengeId)
        .eq("user_id", user_id)
        .limit(1);

      if (existErr) {
        console.error("local sync: error checking existing user entry", existErr);
      }

      if (existing && existing.length > 0) {
        // already present for user — skip
        continue;
      }

      // Insert a new entry for the authenticated user
      const { error: insErr } = await supabase.from("leaderboard").insert({
        challenge_id: e.challengeId,
        user_id: user_id,
        nickname: e.nickname,
        score: e.score,
        time_ms: e.timeMs,
      });
      if (insErr) console.error("local sync: error inserting entry", insErr);
    } catch (err) {
      console.error("local sync: unexpected error", err);
    }
  }

  return { ok: true };
}
