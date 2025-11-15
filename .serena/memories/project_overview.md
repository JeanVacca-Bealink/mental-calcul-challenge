# Math-Challenge Project

## Project Purpose
A web app for creating and sharing simple calculation challenges. Users can:
- Create math challenges with configurable difficulty and question count
- Share challenges via unique codes
- Take challenges as anonymous users or authenticated users
- Track leaderboards per challenge
- Sign up and view personal stats

## Tech Stack
- **Framework**: Next.js (latest, App Router) with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with SSR (cookie-based)
- **State Management**: React hooks
- **Build Tool**: Turbopack (via Next.js)
- **Icons**: lucide-react
- **Theme**: next-themes for dark/light mode

## Key Libraries
- `@supabase/ssr` - Server-side auth and SSR support
- `@supabase/supabase-js` - Client SDK
- `react-use` - React hooks utilities
- `class-variance-authority` - Component variants
- Radix UI components (checkbox, dropdown-menu, label, tabs)

## Database Schema
Tables:
- `challenges` - Created challenges with difficulty and question count
- `questions` - Individual questions for challenges
- `leaderboard` - Challenge submissions with score and time
- `userinfo` - User information
