import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Challenge } from "@/components/challenge";
import Header from "@/components/header";
import { Brain, Trophy, ArrowRight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
export default function Home() {
  return (
    <>
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-purple-100 rounded-full mb-6">
              <Brain className="size-16 text-purple-600" />
            </div>
            <h1 className="text-4xl text-purple-900 mb-4">
              Challenge Your Math Skills
            </h1>
            <p className="text-lg text-gray-600">
              Test your mathematical prowess with custom challenges. Choose your difficulty and question count to begin.
            </p>
          </div>
          
          <Challenge />

          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl text-purple-600 mb-1">1,234</div>
                <div className="text-sm text-gray-600">Challenges Completed</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl text-purple-600 mb-1">567</div>
                <div className="text-sm text-gray-600">Active Players</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl text-purple-600 mb-1">89%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>


{/* 
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
        
      </footer> */}
    </>
  );
}
