# User Profile Management

## Features Implemented

### 1. Nickname Storage on Signup
- When user signs up, the nickname is automatically saved to the `userinfo` table
- Modified `components/sign-up-form.tsx` to call `upsertUserInfo(nickname)` after successful auth signup
- Server action `app/actions/userinfo.actions.ts` handles the database operation

### 2. User Info Server Actions
File: `app/actions/userinfo.actions.ts`
- `getUserInfo()` - Fetch current user's profile from `userinfo` table
- `upsertUserInfo(nickname)` - Create or update user info (insert if new, update if exists)
- `UserInfo` interface - user profile data structure

### 3. Edit Profile Page
Route: `/protected/profile` (requires authentication)
- Client component that displays and edits user nickname
- Fetches current user info on mount (redirects to login if not authenticated)
- Form with save/cancel buttons
- Success/error feedback messages
- Auto-hides success message after 3 seconds

## Database Integration
- Table: `userinfo` with fields: id, user_id, nickname, created_at
- Foreign key: `user_id` references `auth.users(id)` with ON DELETE CASCADE
- One-to-one relationship between users and their profile info

## Access Pattern
- Authenticated users can edit their profile at `/protected/profile`
- Unauthenticated access redirects to login
- Nickname updates are immediately saved to database
