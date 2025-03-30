/*
  # Create subscription plans table
  
  1. New Tables
    - `subscription_plans`
      - `id` (text, primary key)
      - `name` (text)
      - `price` (numeric)
      - `duration_days` (integer)
      - `is_lifetime` (boolean)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `subscription_plans` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  duration_days integer,
  is_lifetime boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to subscription plans"
  ON subscription_plans
  FOR SELECT
  TO public
  USING (true);
