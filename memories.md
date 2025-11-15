# Project Overview
This repository is a Mathematical Challenge App built with Next.js 13 (App Router) that allows users to create, solve, and share simple calculation challenges.
It uses Supabase for authentication and data persistence, Tailwind CSS for styling, shadcn/ui components for UI consistency, and next‑themes for dark/light mode.

## Dependencies
- next, react, react-dom (latest)  
- @supabase/ssr, @supabase/supabase-js  
- next-themes, lucide-react, class-variance-authority, clsx, tailwind-merge  
- Radix UI primitives for form controls  
- Typescript, ESLint, TailwindCSS, autoprefixer, postcss  

## Configuration
- `next.config.ts` is currently empty; defaults are used.  
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or anon key) are required.  
- `lib/supabase/server.ts` creates a Supabase client with SSR support.  

## Layout & Routing
- `app/layout.tsx` sets global metadata, loads Geist font, and wraps content in `ThemeProvider`.
- `app/page.tsx` renders the home page with navigation, auth button, hero, challenge component, and footer.
- Dynamic routes under `app/(public)/challenge/[id]` serve challenge pages.
- Dynamic routes under `app/(public)/leaderboard/[id]` serve leaderboard pages.
- Protected routes under `app/protected` require authentication.

## Authentication Flow
- `components/auth-button.tsx` checks Supabase claims to determine if a user is logged in.  
- If logged in, shows user email and a `LogoutButton`; otherwise shows Sign‑in/Sign‑up links.  
- `components/logout-button.tsx` calls `supabase.auth.signOut()` and redirects to home.  

## Supabase Integration
- Supabase client is instantiated in `lib/supabase/client.ts` for client‑side usage.  
- Server‑side actions and API routes use the SSR client from `lib/supabase/server.ts`.  
- Migrations in `supabase/migrations` create tables for challenges, questions, leaderboard, and userinfo.  

## UI Components
- Uses shadcn/ui primitives (`button`, `card`, `input`, etc.) for consistent styling.  
- `components/challenge.tsx` displays a challenge card with title, description, and a share button.  
- `components/hero.tsx` shows a landing hero section.  
- `components/tutorial/*` provide step‑by‑step guides for setting up Supabase and signing up users.  

## Summary
The project is a ready‑to‑run template that demonstrates how to combine Next.js, Supabase, and modern UI libraries to build a full‑stack application for creating, solving, and sharing mathematical calculation challenges with authentication, data persistence, and theming.