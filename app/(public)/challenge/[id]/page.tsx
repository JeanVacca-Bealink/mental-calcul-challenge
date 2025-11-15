"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Challenge } from "@/components/challenge";
import {
  ChallengeEntry,
  getChallengeByCode,
  hasUserAnsweredChallenge,
} from "@/app/actions/challenges.actions";
import { Input } from "@/components/ui/input";

export default function ChallengePage() {
  const { id: code } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<ChallengeEntry | null>(null);
  const [answered, setAnswered] = useState(false);
  const [nickname, setNickname] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState<boolean>(false);
  // Load nickname from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nickname");
      if (stored) setNickname(stored);
    }
  }, []);

  // Fetch challenge data and answered status
  useEffect(() => {
    if (!code) return;
    const fetchData = async () => {
      setLoading(true);
      const resp = await getChallengeByCode(code, true);
      if (resp?.error || !resp?.challenge) {
        setChallenge(null);
        setLoading(false);
        return;
      }
      const { id, difficulty, total_questions } = resp.challenge;
      setChallenge(resp.challenge);
      // Check if authenticated user has answered (server-side)
      const answeredFlag = await hasUserAnsweredChallenge(id);
      // If server says not answered, check localStorage for anonymous entries
      if (!answeredFlag) {
        try {
          if (typeof window !== "undefined") {
            const raw = localStorage.getItem("localCompletedChallenges");
            if (raw) {
              const arr = JSON.parse(raw) as Array<any>;
              const found = arr.find((x) => x.challengeId === id);
              if (found) setAnswered(true);
            }
          }
        } catch (err) {
          console.error("error reading local completed challenges", err);
        }
      } else {
        setAnswered(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [code]);

  // Prompt for nickname if not set
  // useEffect(() => {
  //   if (!nickname || nickname === "Anonymous") {
  //     const name = prompt("Enter a nickname for this challenge:");
  //     if (name) {
  //       setNickname(name);
  //       if (typeof window !== "undefined") localStorage.setItem("nickname", name);
  //     }
  //   }
  // }, [nickname]);

  if (loading) return <div>Loading challenge...</div>;
  if (!challenge) return <div>Challenge not found.</div>;

  // if (answered) {
  //   return (
  //     <div className="max-w-md mx-auto p-4">
  //       <p>You have already answered this challenge.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-md mx-auto p-4 ">
      <div className="mx-auto mb-4">
        <label>Nickname {started ? "start" : ""}</label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target?.value)}
          disabled={started}
        ></Input>
      </div>
      <Challenge
        challenge={challenge}
        nickname={nickname}
        started={started}
        onStart={(s) => setStarted(s)}
      />
    </div>
  );
}
