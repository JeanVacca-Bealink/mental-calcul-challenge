import getLeaderboard, {
  LeaderboardEntry,
} from "@/app/actions/leaderboard.actions";
import { getChallengeByCode } from "@/app/actions/challenges.actions";
import { headers } from "next/headers";
import { Award, Medal, Share2, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ShareLinkButton from "@/components/ui/share-link-button";
export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: code } = await params;
  const headersKeys = await headers();
  console.dir(headersKeys);

  const origin = new URL(headersKeys.get("referer") || `http://${headersKeys.get("host")}`).origin;
  console.log(code);

  const result = await getChallengeByCode(code as string);
  if (result?.error) return <div>Challenge Not Found</div>;

  const challenge = result?.challenge;
  // Fetch leaderboard entries
  const entries = await getLeaderboard(challenge?.id ?? "");

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="size-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="size-5 text-gray-400" />;
    if (rank === 3) return <Award className="size-5 text-amber-600" />;
    return <span className="text-sm text-gray-500">#{rank}</span>;
  };

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-yellow-100 rounded-full mb-6">
              <Trophy className="size-16 text-yellow-600" />
            </div>
            <h1 className="text-4xl text-purple-900 mb-4">
              Leaderboard
            </h1>
            <p className="text-lg text-gray-600">
              Top performers in math challenges
            </p>
          </div>

          {/* Leaderboard Card */}
          <Card className="shadow-xl border-purple-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Rankings</CardTitle>
                  <CardDescription>
                    See how you stack up against other math enthusiasts
                  </CardDescription>
                </div>
                <ShareLinkButton code={challenge?.code} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">

                {entries?.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${entry.rank <= 3
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                      : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-center w-12">
                      {getMedalIcon(entry.rank)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{entry.nickname}</span>
                        {entry.rank === 1 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Top Player
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right w-[75px]">
                        <div className="text-purple-600">{entry.score}</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                      <div className="text-right w-[75px]">
                        <div className="text-gray-900">{100 * entry.score / entry.total_questions}%</div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <div className="text-right w-[75px]">
                        <div className="text-gray-900">{(entry.time_ms/1000).toFixed(3)}s</div>
                        <div className="text-xs text-gray-500">Time</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="p-4 max-w-3xl mx-auto">
        {challenge?.is_author && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Share this challenge
            </label>
            <input
              type="text"
              readOnly
              value={`${origin}/challenge/${code}`}
              className="w-full border rounded px-3 py-2 bg-muted text-sm"
            />
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">Leaderboard for challenge</h2>

        {entries ? (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b py-2 text-left">Nickname</th>
                <th className="border-b py-2 text-left">Timer</th>
                <th className="border-b py-2 text-left">Score</th>
                <th className="border-b py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={idx}>
                  <td className="border-b py-2">{e.nickname}</td>
                  <td className="border-b py-2">{(e.time_ms ?? 0) / 1000}</td>
                  <td className="border-b py-2">{e.score / (challenge?.total_questions || 1)}</td>
                  <td className="border-b py-2">
                    {new Date(e.created_at).toLocaleDateString()} {new Date(e.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No entries yet.</p>
        )}
      </div>
    </>

  );
}
