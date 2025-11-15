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
The **mental‑calcul‑challenge** repository is a fully‑featured full‑stack web application built with **Next.js 13 App Router**. It provides a platform for users to create, solve, and share simple calculation puzzles. Core capabilities include:

* **Authentication** – Powered by **Supabase Auth**; users can sign up, log in, reset passwords, and manage sessions. The `components/auth‑button.tsx` and `components/logout‑button.tsx` components expose the current user state.
* **Data persistence** – Challenges, questions, user info, and leaderboard data are stored in Supabase Postgres tables, created via migrations in `supabase/migrations`. The server‑side actions (`app/actions/*.ts`) and API routes (`app/api/*`) use a Supabase SSR client (`lib/supabase/server.ts`).
* **Dynamic routing** – Challenge pages (`app/(public)/challenge/[id]/page.tsx`) and leaderboard pages (`app/(public)/leaderboard/[id]/page.tsx`) are generated at runtime based on the database records.
* **UI & theming** – Styling is handled by **Tailwind CSS** and **shadcn/ui** primitives. The app supports dark/light mode via `next‑themes`, and the global layout (`app/layout.tsx`) provides a consistent theme provider and meta‑tags.
* **Extensibility** – The codebase follows Next.js best practices: server‑side actions, modular components, and TypeScript typings. Adding new features (e.g., a “high‑score” badge component) can be done by extending the existing component library.

In short, this repo offers a solid foundation for building educational or gamified math challenge platforms, with a clean separation of concerns and a modern tech stack.