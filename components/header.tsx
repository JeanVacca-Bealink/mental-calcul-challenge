import { BarChart3, Brain, Trophy } from "lucide-react";
import { AuthButton } from "./auth-button";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="size-8 text-purple-600" />
          <span className="text-xl text-purple-900">
            <Link href="/">
              Math Challenge
            </Link>
          </span>
        </div>
        <div className="flex items-center gap-2">

          <AuthButton></AuthButton>
          {/* <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Trophy className="size-4" />
            Leaderboard
          </Button> */}
        </div>
      </div>
    </header>


  );
}