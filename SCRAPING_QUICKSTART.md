# Wanderlog Scraping - Quick Start Guide

## 3 Easy Ways to Scrape Wanderlog URLs

### ✅ Method 1: Edit Variable in Script (Easiest!)

1. Open `scripts/scrape-wanderlog.ts`
2. Change the URL variable at the top:

```typescript
// Line 18 - CHANGE THIS URL
const WANDERLOG_URL = 'https://wanderlog.com/view/YOUR-TRIP-ID/your-trip-name';
```

3. Run:
```bash
pnpm scrape
```

That's it! The script will scrape the URL and store it in Supabase.

### ✅ Method 2: Pass URL as Command Line Argument

```bash
pnpm scrape https://wanderlog.com/view/abc123/trip-to-paris
```

Or with force re-scrape:
```bash
pnpm scrape https://wanderlog.com/view/abc123/trip-to-paris --force
```

### ✅ Method 3: Scrape Multiple URLs from a List

1. Open `wanderlog-urls.txt` (in the root directory)
2. Add your URLs, one per line:

```text
# Wanderlog URLs to Scrape
https://wanderlog.com/view/abc123/trip-to-paris
https://wanderlog.com/view/def456/trip-to-tokyo
https://wanderlog.com/view/ghi789/trip-to-london
```

3. Run:
```bash
pnpm scrape:multiple
```

The script will scrape all URLs in the list, with a 5-second delay between each to be nice to the server.

## Before You Start

### 1. Make sure your Supabase database is set up

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor:
https://eaofdajkpqyddlbawdli.supabase.co

### 2. Environment variables are configured

Check that `.env.local` has:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `BROWSERBASE_API_KEY`
- `BROWSERBASE_PROJECT_ID`

✅ All set? These are already configured!

## What Happens When You Scrape

1. 🔍 Checks if trip already exists in database
2. 🌐 Opens the Wanderlog page in a cloud browser
3. 📋 Expands all dropdown sections
4. 📸 Extracts all data + images with associations
5. 💾 Stores everything in your Supabase database
6. ✅ Returns trip ID and statistics

## Handling Duplicate Trips

By default, if a trip already exists in the database, it will be skipped.

To re-scrape an existing trip:

**Method 1 (Script):**
Edit `scripts/scrape-wanderlog.ts` and set:
```typescript
const FORCE_RESCRAPE = true;
```

**Method 2 (Command Line):**
```bash
pnpm scrape https://wanderlog.com/view/... --force
```

## Output Example

```
======================================================================
🚀 WANDERLOG SCRAPER
======================================================================

📍 URL: https://wanderlog.com/view/znjfochocj/trip-to-edmonton
🔄 Force Re-scrape: No

🔍 Checking if trip already exists...
✅ Trip not found in database, proceeding with scrape

🔍 Starting scrape...

🌐 Browserbase session created: abc123
✅ Page loaded
🔓 Expanding all sections...
✅ Sections expanded
📋 Extracted trip: Trip to Edmonton
🖼️  Found 3 header images
✈️  Found 2 flights
🏨 Found 3 hotels
🚗 Found 2 car rentals
🎯 Found 15 activities
📅 Found 7 days in schedule
📊 Image stats: 22/25 associated
✅ Browser closed

📊 Scraped Data Summary:
──────────────────────────────────────────────────────────────────────
  Title: Trip to Edmonton
  Creator: Deja Bryant
  Dates: Sun 7/13 - Sat 7/19
  Flights: 2
  Hotels: 3
  Car Rentals: 2
  Activities: 15
  Daily Schedule: 7 days
  Images: 25 total
    └─ Associated: 22
    └─ Unassociated: 3
──────────────────────────────────────────────────────────────────────

💾 Storing data in Supabase...

✅ Trip created with ID: uuid-here
✅ Notes inserted
✅ 2 flights inserted
✅ 3 hotels inserted
✅ 2 car rentals inserted
✅ 15 activities inserted
✅ 7 days of schedule inserted
✅ 25 images inserted
🎉 All data successfully stored in Supabase!

======================================================================
✅ SUCCESS!
======================================================================
Trip ID: uuid-here
Duration: 45.2s
======================================================================
```

## Troubleshooting

### "Trip already exists"
Use `--force` flag or set `FORCE_RESCRAPE = true`

### Script won't run
Make sure you ran `pnpm install` first

### TypeScript errors
Run `pnpm tsc --noEmit` to check for errors

### Scraping takes a long time
This is normal! Browserbase needs to:
- Launch a cloud browser
- Load the page
- Wait for all content
- Extract data
- Store in database

Typical time: 30-60 seconds per trip

### Some data is missing
Wanderlog pages vary in structure. Check the output to see what was found.
You may need to adjust selectors in `lib/wanderlog-scraper.ts`

## Advanced Usage

### Use the API endpoint directly

```bash
curl "http://localhost:3000/api/scrape-wanderlog?url=https://wanderlog.com/view/..."
```

### Import in your own code

```typescript
import { scrapeWanderlogTrip } from '@/lib/wanderlog-scraper';
import { storeWanderlogDataInSupabase } from '@/lib/wanderlog-to-supabase';

const data = await scrapeWanderlogTrip(url);
const tripId = await storeWanderlogDataInSupabase(data);
```

## Files Reference

```
├── scripts/
│   ├── scrape-wanderlog.ts      # Single URL scraper
│   └── scrape-multiple.ts       # Batch scraper
├── wanderlog-urls.txt           # URL list for batch scraping
├── lib/
│   ├── wanderlog-scraper.ts     # Scraping logic
│   └── wanderlog-to-supabase.ts # Database storage
└── SCRAPING_QUICKSTART.md       # This file
```

Happy scraping! 🚀
