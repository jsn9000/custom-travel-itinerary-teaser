-- Safe Migration: Add PDF processing tables for extracted content
-- This version checks for existing objects before creating them

-- Create enum for PDF processing status (skip if exists)
DO $$ BEGIN
    CREATE TYPE pdf_processing_status AS ENUM ('uploaded', 'processing', 'processed', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table for PDF files
CREATE TABLE IF NOT EXISTS public.pdf_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',

  -- Processing status
  status pdf_processing_status NOT NULL DEFAULT 'uploaded',

  -- Processing metadata
  processing_error TEXT,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,

  -- User tracking (optional)
  user_id UUID,

  -- Additional metadata
  metadata JSONB
);

-- Create table for extracted text content
CREATE TABLE IF NOT EXISTS public.pdf_text_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_file_id UUID NOT NULL REFERENCES public.pdf_files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Text content
  page_number INTEGER NOT NULL,
  text_content TEXT NOT NULL,
  extraction_method TEXT NOT NULL DEFAULT 'normal', -- 'normal' or 'ocr'

  -- OCR specific fields
  confidence_score DECIMAL(3,2), -- For OCR confidence

  -- Additional metadata
  metadata JSONB
);

-- Create table for extracted images
CREATE TABLE IF NOT EXISTS public.pdf_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_file_id UUID NOT NULL REFERENCES public.pdf_files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Image information
  page_number INTEGER NOT NULL,
  image_index INTEGER NOT NULL,
  image_data TEXT NOT NULL, -- Base64 encoded image data
  image_format TEXT NOT NULL DEFAULT 'png',
  width INTEGER,
  height INTEGER,

  -- Additional metadata
  metadata JSONB
);

-- Create table for extracted trip information
CREATE TABLE IF NOT EXISTS public.pdf_trip_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_file_id UUID NOT NULL REFERENCES public.pdf_files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Trip details
  trip_title TEXT,
  trip_dates TEXT,
  destination TEXT,
  description TEXT,

  -- Structured data
  locations JSONB, -- Array of location objects
  activities JSONB, -- Array of activity objects
  accommodations JSONB, -- Array of accommodation objects

  -- Additional metadata
  metadata JSONB
);

-- Create indexes for performance (skip if exists)
CREATE INDEX IF NOT EXISTS idx_pdf_files_created_at ON public.pdf_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdf_files_status ON public.pdf_files(status);
CREATE INDEX IF NOT EXISTS idx_pdf_files_user_id ON public.pdf_files(user_id);

CREATE INDEX IF NOT EXISTS idx_pdf_text_content_pdf_file_id ON public.pdf_text_content(pdf_file_id);
CREATE INDEX IF NOT EXISTS idx_pdf_text_content_page_number ON public.pdf_text_content(page_number);

CREATE INDEX IF NOT EXISTS idx_pdf_images_pdf_file_id ON public.pdf_images(pdf_file_id);
CREATE INDEX IF NOT EXISTS idx_pdf_images_page_number ON public.pdf_images(page_number);

CREATE INDEX IF NOT EXISTS idx_pdf_trip_info_pdf_file_id ON public.pdf_trip_info(pdf_file_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger (drop and recreate to be safe)
DROP TRIGGER IF EXISTS update_pdf_files_updated_at ON public.pdf_files;
CREATE TRIGGER update_pdf_files_updated_at
  BEFORE UPDATE ON public.pdf_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.pdf_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_text_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_trip_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read access for pdf_files" ON public.pdf_files;
    DROP POLICY IF EXISTS "Public insert access for pdf_files" ON public.pdf_files;
    DROP POLICY IF EXISTS "Public update access for pdf_files" ON public.pdf_files;
    DROP POLICY IF EXISTS "Public delete access for pdf_files" ON public.pdf_files;

    DROP POLICY IF EXISTS "Public read access for pdf_text_content" ON public.pdf_text_content;
    DROP POLICY IF EXISTS "Public insert access for pdf_text_content" ON public.pdf_text_content;

    DROP POLICY IF EXISTS "Public read access for pdf_images" ON public.pdf_images;
    DROP POLICY IF EXISTS "Public insert access for pdf_images" ON public.pdf_images;

    DROP POLICY IF EXISTS "Public read access for pdf_trip_info" ON public.pdf_trip_info;
    DROP POLICY IF EXISTS "Public insert access for pdf_trip_info" ON public.pdf_trip_info;
END $$;

-- Create policies for public access (adjust based on your auth requirements)
CREATE POLICY "Public read access for pdf_files"
  ON public.pdf_files
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for pdf_files"
  ON public.pdf_files
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access for pdf_files"
  ON public.pdf_files
  FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access for pdf_files"
  ON public.pdf_files
  FOR DELETE
  USING (true);

-- Similar policies for other tables
CREATE POLICY "Public read access for pdf_text_content"
  ON public.pdf_text_content
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for pdf_text_content"
  ON public.pdf_text_content
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read access for pdf_images"
  ON public.pdf_images
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for pdf_images"
  ON public.pdf_images
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read access for pdf_trip_info"
  ON public.pdf_trip_info
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for pdf_trip_info"
  ON public.pdf_trip_info
  FOR INSERT
  WITH CHECK (true);

-- If you want to restrict to user_id when auth is enabled, replace 'true' with:
-- (auth.uid() = user_id)
