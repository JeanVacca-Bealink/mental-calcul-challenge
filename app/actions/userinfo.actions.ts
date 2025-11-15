"use server";

import { createClient } from "@/lib/supabase/server";

export interface UserInfo {
  id: string;
  user_id: string;
  nickname: string;
  created_at: string;
}

/**
 * Get user info for the authenticated user
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;

  if (!user_id) return null;

  let { data, error } = await supabase
    .from("userinfo")
    .select("id, user_id, nickname, created_at")
    .eq("user_id", user_id)
    .single();

    if(error?.code == "PGRST116"){
        let { data: newData, error } = await supabase.from("userinfo").insert({
            user_id: user_id,
            nickname: "Anonymous"
        })
        .select("id, user_id, nickname, created_at")
        .single();
        if(!error)
            return newData as UserInfo;
    }

  if (error) {
    console.error("Error fetching user info:", error);
    return null;
  }

  return data as UserInfo;
}

/**
 * Create or update user info with nickname
 */
export async function upsertUserInfo(nickname: string): Promise<UserInfo | null> {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;

  if (!user_id) {
    throw new Error("User not authenticated");
  }

  // Try to find existing userinfo
  const { data: existing } = await supabase
    .from("userinfo")
    .select("id")
    .eq("user_id", user_id)
    .single();

  let result;
  if (existing) {
    // Update existing
    result = await supabase
      .from("userinfo")
      .update({ nickname })
      .eq("user_id", user_id)
      .select("id, user_id, nickname, created_at")
      .single();
  } else {
    // Insert new
    result = await supabase
      .from("userinfo")
      .insert({
        user_id,
        nickname,
      })
      .select("id, user_id, nickname, created_at")
      .single();
  }

  if (result.error) {
    console.error("Error upserting user info:", result.error);
    return null;
  }

  return result.data as UserInfo;
}
