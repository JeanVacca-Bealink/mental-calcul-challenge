-- Ensure uuid-ossp extension is available for uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create userinfo table to store user nicknames
CREATE TABLE IF NOT EXISTS userinfo (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);