# Codebase Structure

## Directory Layout
```
├── app/
│   ├── (public)/          # Public routes (challenge, leaderboard)
│   ├── auth/              # Auth pages (login, sign-up, forgot-password)
│   ├── protected/         # Protected routes (requires auth)
│   ├── actions/           # Server actions (*.actions.ts)
│   ├── api/               # API routes
│   ├── books/             # Books/resources pages
│   ├── score/             # Score display page
│   ├── layout.tsx         # Root layout with AuthSync
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── auth-*.tsx         # Auth-related components
│   ├── challenge.tsx      # Main challenge component
│   ├── challenge-form.tsx
│   ├── auth-sync.tsx      # Auth state sync to localStorage
│   └── header.tsx, hero.tsx, etc.
├── lib/
│   ├── client/            # Client-side utilities
│   ├── supabase/          # Supabase config (client, server, middleware)
│   └── utils.ts           # Shared utility functions
├── hooks/                 # Custom React hooks
├── supabase/              # Supabase migrations and config
├── middleware.ts          # Next.js middleware for auth
└── package.json, tsconfig.json, eslint.config.mjs, etc.
```

## Key Files
- `middleware.ts` - Auth middleware for protecting routes
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `app/actions/challenges.actions.ts` - Challenge CRUD and game logic
- `app/actions/leaderboard.actions.ts` - Leaderboard entries
- `app/actions/localSync.actions.ts` - Anonymous→Auth entry migration
- `components/challenge.tsx` - Main challenge UI with game loop

## Anonymous/Local Storage Feature
- `components/auth-sync.tsx` - Listens for auth sign-in and migrates localStorage
- `app/actions/localSync.actions.ts` - Server action to attach anonymous entries to users
- localStorage key: `localCompletedChallenges` - stores {challengeId, nickname, score, timeMs, created_at, code}
