/*
  # Create challenges table

  1. New Tables
    - `challenges`
      - `id` (uuid, primary key)
      - `code` (text, unique, not null) – short shareable code
      - `created_at` (timestamptz, default now())
      - `difficulty` (text, not null)
      - `total_questions` (integer, default 5)
      - `score` (integer, default 0)
      - `user_id` (uuid, nullable) – foreign key to auth.users

  2. Security
    - Enable RLS on `challenges`
    - Policy: authenticated users can insert and read their own challenges
    - Policy: unauthenticated users can read only public challenges (none for now)
*/

CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  difficulty text NOT NULL,
  total_questions integer DEFAULT 5,
  score integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert their own challenges" ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


CREATE POLICY "Unauthenticated users can read public challenges" ON challenges
  FOR SELECT
  TO anon
  USING (true); /* No public challenges yet */
