'use client';

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScoreContent() {
  const stored = typeof window !== "undefined" ? localStorage.getItem("lastChallenge") : null;
  const data = stored ? JSON.parse(stored) : null;

  const score = (data?.score ?? "0");
  const total = (data?.total ?? "0");
  console.dir(data);
  // Optionally clear stored data after reading
  if (data && typeof window !== "undefined") {
    //localStorage.removeItem("lastChallenge");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Challenge Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold">{score} / {total}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
