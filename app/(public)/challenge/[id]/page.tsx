"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Challenge } from "@/components/challenge";
import { getChallengeByCode, hasUserAnsweredChallenge } from "@/app/actions/challenges.actions";

export default function ChallengePage() {
  const { id: code } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<{
    id: string;
    difficulty: string;
    total_questions: number;
  } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [nickname, setNickname] = useState<string>("Anonymous");
  const [loading, setLoading] = useState(true);

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
      const resp = await getChallengeByCode(code);
      if (resp?.error || !resp?.challenge) {
        setChallenge(null);
        setLoading(false);
        return;
      }
      const { id, difficulty, total_questions } = resp.challenge;
      setChallenge({ id, difficulty, total_questions });
      // Check if authenticated user has answered
      const answeredFlag = await hasUserAnsweredChallenge(id);
      setAnswered(answeredFlag);
      setLoading(false);
    };
    fetchData();
  }, [code]);

  // Prompt for nickname if not set
  useEffect(() => {
    if (!nickname || nickname === "Anonymous") {
      const name = prompt("Enter a nickname for this challenge:");
      if (name) {
        setNickname(name);
        if (typeof window !== "undefined") localStorage.setItem("nickname", name);
      }
    }
  }, [nickname]);

  if (loading) return <div>Loading challenge...</div>;
  if (!challenge) return <div>Challenge not found.</div>;

  if (answered) {
    return (
      <div className="max-w-md mx-auto p-4">
        <p>You have already answered this challenge.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Challenge
        challengeId={challenge.id}
        difficulty={challenge.difficulty}
        totalQuestions={challenge.total_questions}
      />
    </div>
  );
}
