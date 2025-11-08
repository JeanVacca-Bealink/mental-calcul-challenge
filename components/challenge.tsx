/*  
  This component now runs on the client, supports a chaining mode where the user can  
  choose the number of questions and difficulty, automatically advances on a correct  
  answer, shows a countdown timer, keeps focus on the input, and allows submission via the  
  Enter key.  
  When the challenge ends it redirects to a dedicated score screen.  
*/
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { generateChallengeQuestion } from "@/lib/client/challenge";
import { useInterval } from "react-use";

export function Challenge() {
  const router = useRouter();

  // --- Mode configuration ---
  const [isStarted, setIsStarted] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  // --- Challenge state ---
  const [questions, setQuestions] = useState<Array<{ q: string; a: number }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Timer state ---
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Input ref for focus ---
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Generate a single question based on difficulty ---
  const generateQuestion = () => {
    const { question, answer } = generateChallengeQuestion(difficulty);
    return { q: question, a: answer };
  };

  // --- Persist challenge data to localStorage ---
  const persistChallenge = (finalScore: number, total: number) => {
    const data = { difficulty, score: finalScore, total, questions };
    if (typeof window !== "undefined") {
      localStorage.setItem("lastChallenge", JSON.stringify(data));
    }else{
      console.log("unable to store");
    }
  };

  // --- Start the challenge ---
  const handleStart = () => {
    const qs = Array.from({ length: totalQuestions }, () => generateQuestion());
    console.log("generate questions");
    console.dir(qs);
    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setIsStarted(true);
    // Set timer based on difficulty
    const baseTime = difficulty === "easy" ? 60 : difficulty === "medium" ? 45 : 30;
    setTimeLeft(baseTime);
  };

  // --- Handle answer submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!inputRef.current?.value)
      return;

    const current = questions[currentIndex];
    const userAns = parseInt((inputRef.current?.value ?? ""), 10);
    const isCorrect = userAns === current.a;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setFeedback("✅ Correct! Great job.");
    } else {
      setFeedback(`❌ Incorrect. The correct answer was ${current.a}.`);
    }
    // Advance after a short delay to show feedback
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setFeedback(null);
        if (inputRef.current) inputRef.current.value = "";
        inputRef.current?.focus();
      } else {
        // End of challenge
        setIsStarted(false);
        persistChallenge(newScore, questions.length);
        router.push(`/score`);
      }
    }, 200);
    setScore(newScore);
  };

  // --- Handle Enter key for quick submit ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  // --- Timer logic using react-use's useInterval ---
  useInterval(
    () => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up, end challenge
          setIsStarted(false);
          persistChallenge(score, questions.length);
          router.push(`/score`);
          return 0;
        }
        return t - 1;
      });
    },
    isStarted ? 1000 : null
  );

  // --- Focus input when question changes ---
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Daily Mental Math Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        {!isStarted ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="total">Number of Questions</Label>
              <Input
                id="total"
                type="number"
                min={1}
                max={20}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                className="border rounded px-2 py-1"
              >
                <option value="easy">Easy (1‑20)</option>
                <option value="medium">Medium (1‑50)</option>
                <option value="hard">Hard (1‑100)</option>
              </select>
            </div>
            <Button onClick={handleStart} className="w-full">
              Start Challenges
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-center mb-2">
              Question {currentIndex + 1} / {questions.length}
            </p>
            <p className="text-center mb-4">{questions[currentIndex].q}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Input
                id="answer"
                type="number"
                ref={inputRef}
                onKeyDown={handleKeyDown}
                required
              />
              <Button type="submit" className="w-full mt-2">
                Check
              </Button>
            </form>
            {feedback && (
              <p className="mt-4 text-center font-medium">{feedback}</p>
            )}
            <p className="mt-4 text-center">
              Time left: {timeLeft}s
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
