import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Ensure user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { difficulty, total_questions, score } = body;

  const user_id = session.user.id;

  const code = crypto.randomUUID();

  const { data, error } = await supabase
    .from("challenges")
    .insert({
      code,
      difficulty,
      total_questions,
      score,
      user_id,
    })
    .select("code")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const shareUrl = `${origin}/share/${data.code}`;

  return NextResponse.json({ shareUrl });
}