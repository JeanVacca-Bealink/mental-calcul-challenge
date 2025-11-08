/*
      # Create leaderboard table with optional user_id

      1. New Tables
        - `leaderboard`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `challenge_id` (uuid, not null, foreign key to `challenges(id)`, cascade delete)
          - `user_id` (uuid, nullable, foreign key to `auth.users(id)`)
          - `nickname` (text, not null)
          - `score` (integer, not null, default 0)
          - `created_at` (timestamptz, default now())

      2. Security
        - Enable RLS on `leaderboard`
        - Public SELECT policy for all users (authenticated and anon)
        - DELETE policy: only the creator of the challenge can delete entries for that challenge
        - INSERT policy:
            * Authenticated users can insert entries for themselves (user_id matches auth.uid())
            * Unauthenticated users can insert entries only when user_id is NULL

      3. Notes
        - Policies are named uniquely to avoid conflicts.
        - The table is created with IF NOT EXISTS to be idempotent.
    */

    CREATE TABLE IF NOT EXISTS leaderboard (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      nickname text NOT NULL,
      score integer NOT NULL DEFAULT 0,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Leaderboard public select" ON leaderboard
      FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Leaderboard delete by challenge creator" ON leaderboard
      FOR DELETE
      TO authenticated
      USING (auth.uid() = (SELECT user_id FROM challenges WHERE id = challenge_id));

    CREATE POLICY "Leaderboard insert by owner" ON leaderboard
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Leaderboard insert by anon when user_id is NULL" ON leaderboard
      FOR INSERT
      TO anon
      WITH CHECK (user_id IS NULL and nickname IS NOT NULL);

    CREATE INDEX IF NOT EXISTS idx_leaderboard_challenge_id ON leaderboard(challenge_id);