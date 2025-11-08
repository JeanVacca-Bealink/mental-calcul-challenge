-- Add time_ms column to leaderboard
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS time_ms bigint;