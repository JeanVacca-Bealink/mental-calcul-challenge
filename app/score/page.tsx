import ScoreContent from "@/components/ui/score-content";
import ShareButton from "@/components/ui/share-button";

export default async function ScorePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <ScoreContent />
      <ShareButton />
    </div>
  );
}
