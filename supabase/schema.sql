-- Supabase Database Schema for Wanderlog PDF Storage
-- Run this SQL in your Supabase SQL Editor

-- Create enum for PDF status
CREATE TYPE pdf_status AS ENUM ('uploaded', 'processing', 'processed', 'error');

-- Create wanderlog_pdfs table
CREATE TABLE IF NOT EXISTS public.wanderlog_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',

  -- Trip metadata
  trip_title TEXT,
  trip_dates TEXT,
  destination TEXT,

  -- Processing status
  status pdf_status NOT NULL DEFAULT 'uploaded',

  -- Additional metadata (JSONB for flexibility)
  metadata JSONB,

  -- User tracking (optional - set if you have auth)
  user_id UUID
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wanderlog_pdfs_created_at ON public.wanderlog_pdfs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wanderlog_pdfs_destination ON public.wanderlog_pdfs(destination);
CREATE INDEX IF NOT EXISTS idx_wanderlog_pdfs_status ON public.wanderlog_pdfs(status);
CREATE INDEX IF NOT EXISTS idx_wanderlog_pdfs_user_id ON public.wanderlog_pdfs(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wanderlog_pdfs_updated_at
  BEFORE UPDATE ON public.wanderlog_pdfs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.wanderlog_pdfs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)

-- Policy: Anyone can read PDFs (adjust if you need auth)
CREATE POLICY "Public read access"
  ON public.wanderlog_pdfs
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert PDFs
CREATE POLICY "Authenticated users can insert"
  ON public.wanderlog_pdfs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own PDFs (or all if no auth)
CREATE POLICY "Users can update their own PDFs"
  ON public.wanderlog_pdfs
  FOR UPDATE
  USING (true);

-- Policy: Users can delete their own PDFs (or all if no auth)
CREATE POLICY "Users can delete their own PDFs"
  ON public.wanderlog_pdfs
  FOR DELETE
  USING (true);

-- If you want to restrict to user_id when auth is enabled, replace 'true' with:
-- (auth.uid() = user_id)

-- Create storage bucket (run this in Supabase SQL Editor or use Dashboard)
-- Note: You may need to create the bucket via Dashboard UI instead
INSERT INTO storage.buckets (id, name, public)
VALUES ('wanderlog-pdfs', 'wanderlog-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY "Authenticated users can upload PDFs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'wanderlog-pdfs');

CREATE POLICY "Anyone can read PDFs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'wanderlog-pdfs');

CREATE POLICY "Users can update their own PDFs"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'wanderlog-pdfs');

CREATE POLICY "Users can delete their own PDFs"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'wanderlog-pdfs');
