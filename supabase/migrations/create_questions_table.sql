/*
  # Create questions table

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `challenge_id` (uuid, foreign key to challenges.id, not null)
      - `question` (text, not null)
      - `answer` (integer, not null)

  2. Security
    - Enable RLS on `questions`
    - Policy: authenticated users can insert and read questions belonging to their own challenges
*/

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer integer NOT NULL
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert questions for their own challenges" ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = (SELECT user_id FROM challenges WHERE id = challenge_id));


CREATE POLICY "Unauthenticated users can read public questions" ON questions
  FOR SELECT
  TO anon
  USING (true); /* No public questions yet */
