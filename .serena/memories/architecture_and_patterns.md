# Architecture & Important Patterns

## Authentication Flow
1. **Anonymous Users**: Can take challenges, scores stored in localStorage and Supabase (user_id IS NULL)
2. **Authenticated Users**: Signed-in users get their user_id attached to all entries
3. **Migration**: When user signs up/logs in, `AuthSync` component migrates localStorage entries to user account

## Challenge Flow
1. User clicks "Start" → Challenge component sets countdown → displays questions
2. User enters answer → checks against correct answer
3. On correct/incorrect → show feedback → advance to next question
4. On final question completion → save to leaderboard and redirect to leaderboard page
5. For anonymous users → also save locally to localStorage

## Server Actions
- Located in `app/actions/*.actions.ts`
- Called directly from client components (client can see them as regular async functions)
- Run on server, return data to client
- Have access to Supabase server client (authenticated context)

## Key State Patterns
- `useState` for UI state (started, currentQuestion, score, etc.)
- `useRef` for DOM elements (input focus management)
- `useEffect` for side effects (fetching data, setting up listeners)
- `useInterval` from react-use for countdown and main timer

## localStorage Usage
- Key: `localCompletedChallenges` - array of completed challenge objects
- Key: `nickname` - user's nickname preference
- Key: `lastChallenge` - last played challenge (used in `/score` route)
- Only accessible in browser (check `typeof window !== "undefined"`)

## Important Interfaces
- `ChallengeEntry` - Challenge metadata with questions
- `LeaderboardEntry` - Leaderboard row (nickname, score, created_at, time_ms)
- `QuestionEntry` - Individual question with answer
