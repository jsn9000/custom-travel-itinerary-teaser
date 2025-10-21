# Supabase Setup for Wanderlog PDF Storage

This directory contains the database schema and setup instructions for Supabase integration.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Setup Steps

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name: `wanderlog-pdfs`
5. Public bucket: **No** (keep private)
6. Click **Create bucket**

### 2. Run Database Schema

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **New query**
3. Copy the contents of `schema.sql` from this directory
4. Paste into the SQL editor
5. Click **Run** to execute

This will create:
- `wanderlog_pdfs` table with proper schema
- Indexes for performance
- Row Level Security (RLS) policies
- Storage bucket policies

### 3. Get API Credentials

1. Go to **Settings** → **API** in your Supabase Dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - **Keep this secret!**

### 4. Configure Environment Variables

Create or update `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

**Important:**
- The `NEXT_PUBLIC_` variables are safe to expose to the browser
- The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the browser

### 5. Test the Integration

You can test the setup by:

1. Starting your dev server: `pnpm dev`
2. Using the upload API endpoint: `POST /api/pdfs/upload`
3. Example with curl:

```bash
curl -X POST http://localhost:3000/api/pdfs/upload \
  -F "file=@path/to/your-pdf.pdf" \
  -F "trip_title=Travel Adventure" \
  -F "destination=Greece"
```

## API Endpoints

Once configured, you'll have access to:

- `POST /api/pdfs/upload` - Upload a PDF file
- `GET /api/pdfs/list` - List all PDFs (with optional filters)
- `GET /api/pdfs/[id]` - Get PDF metadata by ID
- `PATCH /api/pdfs/[id]` - Update PDF metadata
- `DELETE /api/pdfs/[id]` - Delete a PDF

## Storage Structure

PDFs are stored with the following structure:

```
wanderlog-pdfs/
  ├── {timestamp}_{sanitized_filename}.pdf
  └── ...
```

## Database Schema

The `wanderlog_pdfs` table includes:

- `id` - UUID primary key
- `file_name` - Original filename
- `file_path` - Storage path
- `file_size` - File size in bytes
- `trip_title` - Optional trip title
- `trip_dates` - Optional trip dates
- `destination` - Optional destination
- `status` - Processing status (uploaded, processing, processed, error)
- `metadata` - Additional JSONB metadata
- `created_at` / `updated_at` - Timestamps

## Security Notes

- RLS is enabled by default
- Storage bucket is private by default
- Adjust RLS policies in `schema.sql` based on your auth requirements
- Use the service role key only in API routes (server-side)
- Use the anon key for client-side operations

## Troubleshooting

### "Missing environment variable" errors

Make sure all environment variables are set in `.env.local` and restart your dev server.

### Storage bucket not found

Ensure the bucket `wanderlog-pdfs` is created in your Supabase dashboard under Storage.

### Permission denied errors

Check your RLS policies in the Supabase dashboard. By default, the schema allows public read and authenticated writes.

### Upload fails

1. Check file size limit (default 50MB in API)
2. Verify file is a valid PDF
3. Check Supabase storage quota
4. Review server logs for detailed error messages
