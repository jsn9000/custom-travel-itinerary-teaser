# Wanderlog to Supabase Scraper - Setup Guide

This guide will help you set up and use the Wanderlog scraper to extract trip data and store it in Supabase.

## Prerequisites

All dependencies are already installed:
- `@supabase/supabase-js` - Supabase client
- `@browserbasehq/sdk` - Browserbase for web scraping
- `playwright` - Browser automation

Environment variables are configured in `.env.local`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `BROWSERBASE_API_KEY`
- `BROWSERBASE_PROJECT_ID`

## Step 1: Set Up Supabase Database

1. Go to your Supabase project: https://eaofdajkpqyddlbawdli.supabase.co
2. Navigate to the **SQL Editor**
3. Copy the contents of `supabase-schema.sql` (in the root directory)
4. Paste and run the SQL to create all necessary tables:
   - `trips` - Main trip information
   - `trip_notes` - Trip notes/descriptions
   - `flights` - Flight details
   - `hotels` - Hotel information
   - `car_rentals` - Car rental options
   - `activities` - Activities and attractions
   - `daily_schedule` - Day-by-day itinerary
   - `images` - All images with activity associations

## Step 2: Start Your Development Server

```bash
pnpm dev
```

The server will start at http://localhost:3000

## Step 3: Scrape a Wanderlog Trip

### Option A: Using the API endpoint (Recommended)

Open your browser or use curl to call the API:

```bash
# Basic scrape
http://localhost:3000/api/scrape-wanderlog?url=https://wanderlog.com/view/znjfochocj/trip-to-edmonton

# Force re-scrape (if trip already exists)
http://localhost:3000/api/scrape-wanderlog?url=https://wanderlog.com/view/znjfochocj/trip-to-edmonton&force=true
```

Or using curl:

```bash
curl "http://localhost:3000/api/scrape-wanderlog?url=https://wanderlog.com/view/znjfochocj/trip-to-edmonton"
```

Or using POST:

```bash
curl -X POST http://localhost:3000/api/scrape-wanderlog \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://wanderlog.com/view/znjfochocj/trip-to-edmonton",
    "force": false
  }'
```

### Option B: Using the functions directly in your code

```typescript
import { scrapeWanderlogTrip } from '@/lib/wanderlog-scraper';
import { storeWanderlogDataInSupabase } from '@/lib/wanderlog-to-supabase';

async function scrapeAndStore() {
  const url = 'https://wanderlog.com/view/znjfochocj/trip-to-edmonton';

  // Scrape the data
  const data = await scrapeWanderlogTrip(url);

  // Store in Supabase
  const tripId = await storeWanderlogDataInSupabase(data);

  console.log('Trip stored with ID:', tripId);
}
```

## What Gets Scraped

The scraper extracts the following data:

### Basic Trip Information
- Trip title (e.g., "Trip to Edmonton")
- Creator name
- Start and end dates
- Number of views
- Publication date
- Header/banner images

### Trip Sections
- **Notes**: Trip description and overview
- **Flights**:
  - Airline names
  - Flight codes
  - Departure/arrival airports
  - Times
  - Prices and currency
  - Baggage options
- **Hotels**:
  - Hotel names
  - Room types
  - Amenities
  - Ratings
  - Prices
  - Addresses
- **Car Rentals**:
  - Company names
  - Vehicle types
  - Pickup/dropoff locations
  - Pricing
  - Discount information
- **Activities**:
  - Activity names
  - Descriptions
  - Locations and addresses
  - Operating hours
  - Ratings
  - Contact information
  - **Images associated with each activity**

### Daily Schedule
- Day-by-day itinerary
- Times and durations
- Travel segments
- Accommodations

### Images with Smart Association
- All images are captured with context
- Images are linked to their associated activities
- Header images are labeled as such
- Position/order is preserved
- Alt text and captions are stored

## API Response Format

Successful response:

```json
{
  "success": true,
  "tripId": "uuid-here",
  "message": "Successfully scraped and stored trip data",
  "duration": "45.2s",
  "stats": {
    "flights": 2,
    "hotels": 3,
    "carRentals": 2,
    "activities": 15,
    "dailyScheduleDays": 7,
    "images": {
      "total": 25,
      "associated": 22,
      "unassociated": 3
    }
  },
  "data": {
    "title": "Trip to Edmonton",
    "startDate": "Sun 7/13",
    "endDate": "Sat 7/19",
    "creator": "Deja Bryant"
  }
}
```

## Querying Your Data

After scraping, you can query the data from Supabase:

```typescript
import { supabase } from '@/lib/supabase';

// Get a trip with all related data
const { data: trip } = await supabase
  .from('trips')
  .select(`
    *,
    trip_notes (*),
    flights (*),
    hotels (*),
    car_rentals (*),
    activities (*),
    daily_schedule (*),
    images (*)
  `)
  .eq('wanderlog_url', 'https://wanderlog.com/view/...')
  .single();

// Get activities with their images
const { data: activities } = await supabase
  .from('activities')
  .select(`
    *,
    images (*)
  `)
  .eq('trip_id', tripId);
```

## Image Handling

Images are stored with smart associations:

1. **Header Images**: Stored with `associated_section = 'header'`
2. **Activity Images**: Linked via `associated_activity_id`
3. **Unassociated Images**: Can be manually associated or used for AI-generated alternatives

To get images for a specific activity:

```typescript
const { data: activityImages } = await supabase
  .from('images')
  .select('*')
  .eq('associated_activity_id', activityId)
  .order('position');
```

To generate images for activities without photos, you can:
1. Check which activities have `images.length === 0`
2. Use the activity description to generate AI images
3. Store the generated images with proper `associated_activity_id`

## Troubleshooting

### Issue: "Trip already exists"
**Solution**: Use `?force=true` to re-scrape

### Issue: Scraping fails or times out
**Solution**:
- Check your Browserbase credentials
- Verify the Wanderlog URL is accessible
- Check server logs for detailed error messages

### Issue: Images not associated properly
**Solution**:
- The scraper does its best to associate images with activities
- Check `imageAssociationStats` in the response
- Unassociated images can be manually linked or regenerated using AI

### Issue: Missing data fields
**Solution**:
- Wanderlog pages have varying structures
- Check the scraped data and adjust selectors in `lib/wanderlog-scraper.ts` if needed
- Some fields may not be present on all trips

## Files Created

```
├── lib/
│   ├── supabase.ts                 # Supabase client and types
│   ├── wanderlog-scraper.ts        # Web scraping logic
│   └── wanderlog-to-supabase.ts    # Database insertion
├── types/
│   └── wanderlog.ts                # TypeScript types
├── app/api/scrape-wanderlog/
│   └── route.ts                    # API endpoint
└── supabase-schema.sql             # Database schema
```

## Next Steps

1. Run the SQL schema in Supabase
2. Start your dev server with `pnpm dev`
3. Scrape the Edmonton trip
4. View your data in Supabase dashboard
5. Build UI components to display the trip data
6. Generate AI images for activities without photos

Enjoy your automated trip data collection!
