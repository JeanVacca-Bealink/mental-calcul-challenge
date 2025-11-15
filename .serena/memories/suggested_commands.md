# Commands & Development Workflow

## Development Commands
```bash
# Start dev server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint

# Type check (via tsc, not a direct command but can run)
npx tsc --noEmit
```

## Environment Setup
1. Create `.env.local` from `.env.example`
2. Set Supabase URL and publishable key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=[project-url]
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[anon-key]
   ```
3. Run `pnpm install` to install dependencies
4. Run `pnpm dev` to start development

## After Task Completion
1. **Linting**: Run `pnpm lint` to check for ESLint violations
2. **Type Safety**: Run `npx tsc --noEmit` to verify TypeScript compilation
3. **Testing**: Manually test in browser (dev server at http://localhost:3000)
4. **Git**: Stage, commit, and push changes (git commands work normally on Windows)

## Key Development Practices
- Use `"use client"` for client components, `"use server"` for server actions
- Server actions go in `app/actions/*.actions.ts`
- Test anonymous user flow separately from authenticated flow
- localStorage is only available in browser (check `typeof window !== "undefined"`)
- Supabase calls must use `await createClient()` on server, `createClient()` on client

## Windows-Specific Notes
- Use forward slashes `/` in paths even on Windows (Next.js handles this)
- PowerShell is configured with `core.autocrlf true` (CRLF line endings preserved)
- Use `pnpm` as the package manager (faster and more reliable than npm)
