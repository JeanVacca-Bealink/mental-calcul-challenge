import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BarChart3, Calendar, Clock, ExternalLink, InfoIcon, LinkIcon, Share2, Target, TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data: claims, error } = await supabase.auth.getClaims();
  if (error || !claims) {
    redirect("/auth/login");
    return;
  }

  // Fetch user challenges
  const { data: challenges, error: chErr } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false })
    .eq("user_id", claims.claims.sub);

  // Fetch leaderboard entries for the user
  const myUserId = claims.claims.sub;

  const { data: myLeaderboard, error: myLbErr } = await supabase
    .from("leaderboard")
    .select("score, time_ms, challenge_id, challenges(id, total_questions, user_id)")
    .eq("user_id", myUserId);


  // Fetch challenge details for the leaderboard entries to compute percentages
  let challengeMap: Record<string, { total_questions: number }> = {};
  if (myLeaderboard && myLeaderboard.length > 0) {
    const challengeIds = myLeaderboard.map((r: any) => r.challenge_id);
    const { data: challengeDetails } = await supabase
      .from("challenges")
      .select("id, total_questions")
      .in("id", challengeIds);

    if (challengeDetails) {
      challengeDetails.forEach((c: any) => {
        challengeMap[c.id] = { total_questions: c.total_questions || 0 };
      });
    }
  }



  // Compute average percentage based on user's leaderboard entries
  const avgPercent =
    myLeaderboard && myLeaderboard.length > 0
      ? myLeaderboard
        .map((r: any) => {
          const total = challengeMap[r.challenge_id]?.total_questions || 0;
          if (!total || total === 0) return 0;
          return (r.score / total) * 100;
        })
        .reduce((sum: number, p: number) => sum + p, 0) / myLeaderboard.length
      : 0;

  // Fetch challenges that are NOT mine, including their leaderboard entries
  const { data: externalChallenges, error: extErr } = await supabase
    .from("challenges")
    .select("id, created_at, difficulty, total_questions, leaderboard(user_id,score,time_ms,nickname)")
    .neq("user_id", myUserId);

  // Prepare external blocks data (compute my rank if I have an entry)
  const externalBlocks = (externalChallenges || []).map((ch: any) => {
    const entries = (ch.leaderboard || []).slice();
    entries.sort((a: any, b: any) => {
      if (b.score !== a.score) return b.score - a.score;
      const ta = a.time_ms ? Number(a.time_ms) : Infinity;
      const tb = b.time_ms ? Number(b.time_ms) : Infinity;
      return ta - tb;
    });
    const myEntry = entries.find((e: any) => e.user_id === myUserId) || null;
    const myRank = myEntry ? entries.findIndex((e: any) => e.user_id === myUserId) + 1 : null;
    return {
      id: ch.id,
      created_at: ch.created_at,
      difficulty: ch.difficulty,
      total_questions: ch.total_questions,
      entries,
      myEntry,
      myRank,
    };
  });

  // Aggregate stats: total time, avg time per question, number of challenges
  const totalTimeMs = (myLeaderboard || []).reduce(
    (sum: number, r: any) => sum + (Number(r.time_ms) || 0),
    0
  );

  const numChallengesDone = (myLeaderboard || []).length;

  const totalQuestionsAnswered = (myLeaderboard || []).reduce(
    (sum: number, r: any) => sum + (challengeMap[r.challenge_id]?.total_questions || 0),
    0
  );

  const avgTimePerQuestionMs =
    totalQuestionsAnswered > 0 ? totalTimeMs / totalQuestionsAnswered : 0;

  const formatMs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const percentage = (score: number, total: number) => {
    return total <= 0 ? 0 : ((score / total) * 100).toFixed(2)
  }

  const myScore = (challengId: number) => {
    return myLeaderboard?.find(x => x.challenge_id == challengId) || { score: 0, time_ms: 0 };
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'hard':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (

    <>
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-6">
              <BarChart3 className="size-16 text-blue-600" />
            </div>
            <h1 className="text-4xl text-purple-900 mb-4">
              My Statistics
            </h1>
            <p className="text-lg text-gray-600">
              Track your progress and challenge performance
            </p>
          </div>

          {/* Average Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="size-8 text-purple-600" />
                  <TrendingUp className="size-4 text-green-600" />
                </div>
                <div className="text-3xl text-purple-600 mb-1">{avgPercent}</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="size-8 text-blue-600" />
                </div>
                <div className="text-3xl text-blue-600 mb-1">{avgPercent}%</div>
                <div className="text-sm text-gray-600">Average Accuracy</div>
                <Progress value={avgPercent} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="size-8 text-orange-600" />
                </div>
                <div className="text-3xl text-orange-600 mb-1">{avgTimePerQuestionMs}</div>
                <div className="text-sm text-gray-600">Average Time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="size-8 text-green-600" />
                </div>
                <div className="text-3xl text-green-600 mb-1">{numChallengesDone}</div>
                <div className="text-sm text-gray-600">Total Challenges</div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Performance */}
          <Card className="shadow-xl border-purple-100 mb-8">
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>Your lifetime statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Best Score</span>
                    <span className="text-purple-600">{numChallengesDone}</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Questions</span>
                    <span className="text-blue-600">{numChallengesDone}</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Correct Answers</span>
                    <span className="text-green-600">{numChallengesDone}</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Challenge Results */}
          <Card className="shadow-xl border-purple-100">
            <CardHeader>
              <CardTitle>Challenge History</CardTitle>
              <CardDescription>
                View your created challenges and results on others' challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="created" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="created">My Challenges</TabsTrigger>
                  <TabsTrigger value="completed">Other Challenges</TabsTrigger>
                </TabsList>

                {/* My Created Challenges Tab */}
                <TabsContent value="created" className="space-y-3 mt-6">
                  {challenges?.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{challenge.total_questions} questions</span>
                          <span>•</span>
                          <span>{challenge.completions} completions</span>
                          <span>•</span>
                          <span>Created {new Date(challenge.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-purple-600">{challenge.averageScore}</div>
                          <div className="text-xs text-gray-500">Avg Score</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => )}
                          >
                            <Share2 className="size-4" />
                            Share
                          </Button> */}
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Link href={`/leaderboard/` + challenge.code}>
                              <ExternalLink className="size-4" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Other Challenges Results Tab */}
                <TabsContent value="completed" className="space-y-3 mt-6">
                  {externalBlocks?.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                    >
                      {/* <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-900">{result.challengeName}</span>
                          <Badge className={getDifficultyColor(result.difficulty)}>
                            {result.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>by {result.creator}</span>
                          <span>•</span>
                          <span>Completed {result.completedAt}</span>
                          <span>•</span>
                          <span>
                            Rank #{result.rank} of {result.totalParticipants}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="text-purple-600">{result.score}</div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900">{result.accuracy}%</div>
                          <div className="text-xs text-gray-500">Accuracy</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900">{result.time}</div>
                          <div className="text-xs text-gray-500">Time</div>
                        </div>
                      </div> */}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="flex-1 min-w-[500px] flex flex-col gap-12">
        {/* User stats card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between">
                <span>Your stats</span>
                <span className="text-xs font-normal">Challenges done : {numChallengesDone}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Average percentage</span>
                <div className="bg-cyan-300 w-full min-w-[200px] p-6 rounded-md">
                  <div className="flex flex-col justify-stretch content-stretch items-center">
                    <span className="font-semibold text-2xl">{avgPercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Total time spent</span>
                <div className="bg-green-300 w-full min-w-[200px] p-6 rounded-md">
                  <div className="flex flex-col justify-stretch content-stretch items-center">
                    <span className="font-semibold text-2xl">{formatMs(totalTimeMs)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Avg time / question</span>
                <div className="bg-purple-300 w-full min-w-[200px] p-6 rounded-md">
                  <div className="flex flex-col justify-stretch content-stretch items-center">
                    <span className="font-semibold text-2xl">{(avgTimePerQuestionMs / 1000).toFixed(2)}s</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Tabs defaultValue="challenges">
            <TabsList>
              <TabsTrigger value="challenges">Your challenges</TabsTrigger>
              <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            </TabsList>
            <TabsContent value="challenges">
              <div className="flex flex-col gap-4 ">
                {challenges && challenges.length > 0 ? (
                  challenges.map((c) => (
                    <div
                      key={c.id}
                      className={`border rounded p-4 shadow-sm flex flex-col gap-2 challenge-card ${c.difficulty}`}
                    >
                      <div className="font-semibold text-right">
                        {new Date(c.created_at).toLocaleString()}
                      </div>
                      <div>Score: {percentage(c.score, c.total_questions)}% ({c.score}/{c.total_questions}) on {formatMs(myScore(c.id).time_ms)}</div>
                      <Link href={`/leaderboard/${c.code}`} target="_blank" >
                        <span className="flex gap-2">
                          <LinkIcon></LinkIcon>
                          Leaderboard
                        </span>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p>No challenges found.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="leaderboards">
              <div className="flex flex-col gap-4">
                {externalBlocks && externalBlocks.length > 0 ? (
                  externalBlocks.map((b) => (
                    <div key={b.id} className={`border rounded p-4 shadow-sm flex flex-col gap-2 challenge-card ${b.difficulty}`}>
                      <div className="font-semibold">Challenge: {b.created_at}</div>
                      <div>Difficulty: {b.difficulty}</div>
                      <div>Total Questions: {b.total_questions}</div>
                      {b.myEntry ? (
                        <div className="mt-2">
                          <div>My Rank: <strong>{b.myRank}</strong></div>
                          <div>My Score: <strong>{b.myEntry.score}</strong></div>
                          <div>My Time: <strong>{b.myEntry.time_ms ?? '—'}</strong> ms</div>
                          <div>


                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">You don't have an entry for this leaderboard.</div>
                      )}

                      {/* show top 3 as preview */}
                      {b.entries && b.entries.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium">Top players:</div>
                          <ol className="list-decimal list-inside">
                            {b.entries.slice(0, 3).map((e: any, i: number) => (
                              <li key={i} className="text-sm">
                                {e.nickname} — {e.score} pts — {e.time_ms ?? '—'} ms
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No leaderboards found.</p>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* List of user challenges */}


        {/* External leaderboards (challenges not created by me) */}

      </div>

    </>
  );
}
