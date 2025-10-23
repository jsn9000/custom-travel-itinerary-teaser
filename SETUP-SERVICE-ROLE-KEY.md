# Setting Up the Supabase Service Role Key

## Why is this needed?

The flight description updates require **admin-level database permissions** to bypass Row Level Security (RLS) policies. The anon key you're currently using only has read permissions on the `wanderlog_flights` table.

## How to get your Service Role Key

1. **Go to your Supabase project dashboard**: https://supabase.com/dashboard/project/eaofdajkpqyddlbawdli

2. **Navigate to Settings** (gear icon in sidebar) → **API**

3. **Find the "service_role" key** in the "Project API keys" section
   - This is different from the "anon" key
   - It's labeled as "service_role" and has a warning that it should only be used server-side
   - **IMPORTANT**: This key has full access to your database, so never expose it to the client

4. **Copy the service_role key**

5. **Add it to your `.env.local` file**:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-key-here...
   ```

6. **Restart your dev server**:
   ```bash
   # Kill the current server (Ctrl+C or kill process)
   pnpm dev
   ```

## After adding the key

Once you've added the service role key and restarted the server, run:

```bash
curl -X POST http://localhost:3001/api/trips/1c2a975d-9bf6-4ed0-8d9f-e27611bbf042/update-flights
```

This will update all flight descriptions from airline names to seating types based on price:
- **≥ $700**: Premium Economy Seating
- **≥ $500**: Economy Plus Seating
- **≥ $400**: Standard Economy Seating
- **< $400**: Basic Economy Seating

## Files that were created/updated

- ✅ `/lib/supabase-admin.ts` - Admin Supabase client with service role permissions
- ✅ `/app/api/trips/[tripId]/update-flights/route.ts` - API endpoint to update flights
- ✅ Flight update logic implemented

All the code is ready - you just need to add the service role key!
