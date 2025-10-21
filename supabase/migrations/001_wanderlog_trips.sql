-- Migration: Rename wanderlog_pdfs to wanderlog_trips (for web scraping)
-- Run this SQL in your Supabase SQL Editor

-- Create enum for trip status
CREATE TYPE trip_status AS ENUM ('scraped', 'processing', 'ready', 'error');

-- Create wanderlog_trips table (for web-scraped data)
CREATE TABLE IF NOT EXISTS public.wanderlog_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Source information (Wanderlog URL)
  source_url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL DEFAULT 'wanderlog',

  -- Trip metadata
  trip_title TEXT,
  trip_dates TEXT,
  destination TEXT,

  -- Processing status
  status trip_status NOT NULL DEFAULT 'scraped',

  -- Scraped data (JSONB for flexibility)
  metadata JSONB,

  -- User tracking (optional - set if you have auth)
  user_id UUID
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wanderlog_trips_created_at ON public.wanderlog_trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wanderlog_trips_destination ON public.wanderlog_trips(destination);
CREATE INDEX IF NOT EXISTS idx_wanderlog_trips_status ON public.wanderlog_trips(status);
CREATE INDEX IF NOT EXISTS idx_wanderlog_trips_user_id ON public.wanderlog_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_wanderlog_trips_source_url ON public.wanderlog_trips(source_url);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wanderlog_trips_updated_at
  BEFORE UPDATE ON public.wanderlog_trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.wanderlog_trips ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)

-- Policy: Anyone can read trips (adjust if you need auth)
CREATE POLICY "Public read access"
  ON public.wanderlog_trips
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert trips
CREATE POLICY "Public insert access"
  ON public.wanderlog_trips
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update all trips (or restrict to their own)
CREATE POLICY "Public update access"
  ON public.wanderlog_trips
  FOR UPDATE
  USING (true);

-- Policy: Users can delete all trips (or restrict to their own)
CREATE POLICY "Public delete access"
  ON public.wanderlog_trips
  FOR DELETE
  USING (true);

-- If you want to restrict to user_id when auth is enabled, replace 'true' with:
-- (auth.uid() = user_id)
