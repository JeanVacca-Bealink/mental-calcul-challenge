"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { addChallenge } from "@/app/actions/challenges.actions";

export default function ShareButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleShare = async () => {
    const client = createClient();
    const { data: { session } } = await client.auth.getSession();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("lastChallenge") : null;
      const challenge = stored ? JSON.parse(stored) : null;

      if (!challenge) {
        alert("No challenge data to share.");
        return;
      }
      const res = await addChallenge(challenge);
      if (res.error || !res.shareUrl) throw new Error("Share failed");
      // Store the challenge code for later leaderboard submission
      const code = res.shareUrl.split("/").pop();
      if (typeof window !== "undefined") {
        localStorage.setItem("challengeCode", code || "");
      }
      router.push(res.shareUrl);
      alert(`Share link: ${res.shareUrl}`);
    } catch (e) {
      console.error(e);
      alert("Error sharing challenge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleShare} disabled={loading} className="mt-4">
      {loading ? "Sharing…" : "Share this challenge"}
    </Button>
  );
}