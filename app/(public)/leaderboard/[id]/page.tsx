import getLeaderboard, {
  LeaderboardEntry,
} from "@/app/actions/leaderboard.actions";
import { getChallengeByCode } from "@/app/actions/challenges.actions";
import { headers } from "next/headers";
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

  return (
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
                <td className="border-b py-2">{(e.time_ms ?? 0 )/1000}</td>
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
  );
}
