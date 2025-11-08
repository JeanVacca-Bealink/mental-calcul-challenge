
import getLeaderboard, { LeaderboardEntry } from "@/app/actions/leaderboard.actions";
import { getChallengeByCode } from "@/app/actions/challenges.actions";
export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const { id: code } = await params

  const challenge = await getChallengeByCode(code as string);
  if (!challenge)
    return (
      <div>Challenge Not Found</div>
    );

  // Fetch leaderboard entries
  const entries = await getLeaderboard(challenge?.id);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {challenge.is_author && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Share this challenge
          </label>
          <input
            type="text"
            readOnly
            value={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/leaderboard/${code}`}
            className="w-full border rounded px-3 py-2 bg-muted text-sm"
          />
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">
        Leaderboard for challenge
      </h2>

      {entries ? (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 text-left">Nickname</th>
              <th className="border-b py-2 text-left">Score</th>
              <th className="border-b py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr key={idx}>
                <td className="border-b py-2">{e.nickname}</td>
                <td className="border-b py-2">{e.score}</td>
                <td className="border-b py-2">
                  {new Date(e.created_at).toLocaleDateString()}
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