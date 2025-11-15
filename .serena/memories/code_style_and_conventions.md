# Code Style & Conventions

## TypeScript
- Strict mode enabled (`"strict": true` in tsconfig.json)
- Explicit type annotations for function parameters and returns
- Path alias `@/*` for imports from project root

## React/JSX
- Functional components with hooks
- "use client" directive for client components
- "use server" directive for server actions
- Use `useState`, `useEffect`, `useRef` from React
- Event handlers: camelCase naming (e.g., `handleStart`, `handleSubmit`)

## Naming Conventions
- Component files: PascalCase (e.g., `Challenge.tsx`, `AuthSync.tsx`)
- Page files: lowercase with brackets for dynamic routes (e.g., `[id]/page.tsx`)
- Hook files: camelCase with `use` prefix (e.g., `useInterval` from react-use)
- Server action files: `*.actions.ts` suffix (e.g., `challenges.actions.ts`)
- Function names: camelCase (e.g., `getChallengeByCode`, `addLeaderboardEntry`)
- Constants: UPPER_SNAKE_CASE when module-level (e.g., `STORAGE_KEY`)
- Event handlers: `handle{Action}` pattern

## Component Structure
- Props defined as inline interface or explicit type
- Server actions placed in dedicated `app/actions/` folder
- Shared UI components in `components/ui/`
- Feature components in `components/`
- Client-side utilities in `lib/client/`
- Supabase clients in `lib/supabase/`

## TypeScript Patterns
- Optional parameters use `?`
- Return types explicitly specified for async functions
- Interfaces for data models (e.g., `ChallengeEntry`, `LeaderboardEntry`)
- Type guard checks for runtime safety

## CSS/Styling
- Tailwind CSS utility classes for styling
- shadcn/ui components with className props
- Theme support via next-themes (light/dark)
- Custom CSS in `globals.css`
