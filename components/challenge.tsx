/*  
  This component now runs on the client, supports a chaining mode where the user can  
  choose the number of questions and difficulty, automatically advances on a correct  
  answer, shows a countdown timer, keeps focus on the input, and allows submission via the  
  Enter key.  
  When the challenge ends it redirects to a dedicated score screen.  
*/
"use client";

import { useState, useEffect, useRef, EventHandler, ReactEventHandler } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { generateChallengeQuestion } from "@/lib/client/challenge";
import { useInterval } from "react-use";
import { ChallengeEntry, QuestionEntry } from "@/app/actions/challenges.actions";
import { addLeaderboardEntry } from "@/app/actions/leaderboard.actions";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import ScoreContent from "./ui/score-content";
import ShareButton from "./ui/share-button";

export function Challenge({ challenge, nickname, started, onStart }: { challenge?: ChallengeEntry, nickname?: string, started?: boolean, onStart?: (s: boolean) => void }) {
  const router = useRouter();

  // --- Mode configuration ---
  const [isStarted, setIsStarted] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState([5]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );

  // --- Countdown state (before questions begin) ---
  const [countdown, setCountdown] = useState<number | null>(null);

  // --- Challenge state ---  
  const [questions, setQuestions] = useState<
    Array<{ question: string; answer: number }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Timing state ---
  const [startTime, setStartTime] = useState<number | null>(null);

  // --- Timer state ---
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Input ref for focus ---
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Persist challenge data to localStorage ---
  const persistChallenge = (
    finalScore: number,
    elapsed_time: number,
    total: number
  ) => {
    const data = {
      difficulty,
      score: finalScore,
      elapsed_time,
      total,
      questions,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("lastChallenge", JSON.stringify(data));
    } else {
      console.log("unable to store");
    }
  };
  function shuffle(array: QuestionEntry[] | []) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  // --- Start the challenge ---
  const handleStart = () => {
    setQuestions(
      shuffle(challenge?.questions ??
        Array.from({ length: totalQuestions[0] }, () =>
          generateChallengeQuestion(difficulty)
        ))
    );
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setIsStarted(true);
    setCountdown(5);
    setStartTime(Date.now());
    const baseTime =
      difficulty === "easy" ? 60 : difficulty === "medium" ? 45 : 30;
    setTimeLeft(baseTime);
    onStart?.(true);
  };

  // --- Handle answer submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current?.value) return;

    const current = questions[currentIndex];
    const userAns = parseInt(inputRef.current?.value ?? "", 10);
    const isCorrect = userAns === current.answer;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setFeedback("✅ Correct! Great job.");
    } else {
      setFeedback(`❌ Incorrect. The correct answer was ${current.answer}.`);
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
        onStart?.(false);
        const elapsedMs = startTime ? Date.now() - startTime : 0;
        (async () => {
          // Save locally for anonymous users so we can migrate after signup
          try {
            const client = createBrowserClient();
            const user = await client.auth.getUser();
            const isAnon = !user.data.user;

            if (challenge) {
              var leaderBoardId = await addLeaderboardEntry(challenge.id, nickname ?? "Anonymous", newScore, elapsedMs);
              // If anonymous, store entry locally and still attempt to write a row server-side
              if (isAnon) {
                try {
                  const key = "localCompletedChallenges";
                  const raw = localStorage.getItem(key);
                  const arr = raw ? JSON.parse(raw) : [];
                  arr.push({
                    leaderBoardId: leaderBoardId,
                    challengeId: challenge.id,
                    nickname: nickname ?? "Anonymous",
                    score: newScore,
                    timeMs: elapsedMs,
                    created_at: new Date().toISOString(),
                    code: challenge.code,
                  });
                  localStorage.setItem(key, JSON.stringify(arr));
                } catch (err) {
                  console.error("error saving local completed challenge", err);
                }
              }
            } else {
              persistChallenge(newScore, elapsedMs, questions.length);
            }
            setShowScore(true);
          } catch (err) {
            console.error("error handling end of challenge", err);
          }
        })();
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

  // --- Countdown timer (before challenge begins) ---
  useInterval(
    () => {
      if (countdown !== null && countdown > 0) {
        setCountdown((c) => (c ?? 0) - 1);
        return;
      }
      if (countdown === 0) {
        setCountdown(null);
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
    },
    isStarted && countdown !== null ? 1000 : null
  );

  // --- Main timer logic (during challenge) ---
  useInterval(
    () => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up, end challenge
          setIsStarted(false);
          onStart?.(false);
          persistChallenge(score, 0, questions.length);
          setShowScore(true);
          return 0;
        }
        return t - 1;
      });
    },
    isStarted && countdown === null ? 1000 : null
  );

  // --- Focus input when question changes ---
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const renderCountDown = () => {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-muted-foreground">Get ready!</p>
        <p className="text-6xl font-bold text-center">{countdown}</p>
      </div>
    )
  }

  return (
    <Card className="shadow-xl border-purple-100 min-w-[300px]">
      <CardHeader>
        <CardTitle>{challenge ? "Start Challenge" : "Create New Challenge"}</CardTitle>
        {!challenge &&
          <CardDescription>
            Customize your math challenge and start competing
          </CardDescription>
        }
      </CardHeader>
      <CardContent className="space-y-6">
        {!isStarted && !showScore ? (<>
          <div className="space-y-3">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            {challenge ? (
              <span className="text-sm text-purple-600 ms-4">{challenge.difficulty}</span>
            ) : (

              <Select value={difficulty} onValueChange={(e) =>
                setDifficulty(e as "easy" | "medium" | "hard")
              }>
                <SelectTrigger className="w-full" id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy - Basic Operations</SelectItem>
                  <SelectItem value="medium">Medium - Mixed Problems</SelectItem>
                  <SelectItem value="hard">Hard - Complex Equations</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="question-count">Number of Questions</Label>
              {challenge ? (
                <span className="text-sm text-purple-600">{challenge.total_questions} questions</span>
              ) : (
                <span className="text-sm text-purple-600">{totalQuestions[0]} questions</span>
              )}
            </div>
            {!challenge &&
              <><Slider
                id="question-count"
                min={5}
                max={50}
                step={5}
                value={totalQuestions}
                onValueChange={setTotalQuestions}
                className="py-4"
              />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </>}
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
            disabled={challenge && !nickname}
          >
            Start Challenge
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </>
        ) : countdown !== null && countdown >= 0 ? (
          renderCountDown()
        ) : showScore ? (
          <div className="flex flex-col items-center justify-center bg-background">
            <p className="text-4xl font-bold">{score} / {questions.length} in {(startTime ? Date.now() - startTime : 0) / 1000}s</p>

            <ShareButton />
          </div>
        )
          :
          (
            <div>
              <p className="text-center mb-2">
                Question {currentIndex + 1} / {questions.length}
              </p>
              <p className="text-center mb-4 text-3xl text-purple-600">
                {questions[currentIndex].question}
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Input
                  id="answer"
                  type="number"
                  ref={inputRef}
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  required
                />
                <Button type="submit" className="w-full mt-2" >
                  Check
                </Button>
              </form>
              {feedback && (
                <p className="mt-4 text-center font-medium">{feedback}</p>
              )}
              <p className="mt-4 text-center">Time left: {timeLeft}s</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
