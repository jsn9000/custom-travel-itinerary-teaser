/**
 * EXAMPLE: Validated API Route for Scraping Wanderlog
 *
 * This is a refactored version of /api/scrape with proper validation,
 * error handling, and response formatting.
 *
 * Key improvements:
 * - Input validation with Zod schemas
 * - Consistent error handling
 * - Type-safe responses
 * - Rate limiting
 * - Better error messages
 */

import { NextRequest } from 'next/server';
import { scrapeWanderlogTrip } from '@/lib/wanderlog-scraper';
import {
  storeWanderlogDataInSupabase,
  tripExists,
  getTripByUrl,
  deleteTripByUrl,
} from '@/lib/wanderlog-to-supabase';
import {
  validateQuery,
  validateBody,
  successResponse,
  handleError,
  withErrorHandling,
  NotFoundError,
  checkRateLimit,
} from '@/lib/utils/api-helpers';
import { scrapeWanderlogSchema } from '@/lib/validations/api-schemas';

/**
 * GET /api/scrape-validated?url=https://wanderlog.com/view/...&force=true
 *
 * Scrapes a Wanderlog trip and stores it in Supabase
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const startTime = Date.now();

  // Rate limiting: 5 requests per minute per IP
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  checkRateLimit(`scrape:${clientIp}`, 5, 60000);

  // Validate query parameters
  const { url, force } = validateQuery(request, scrapeWanderlogSchema);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Starting Wanderlog scrape`);
  console.log(`URL: ${url}`);
  console.log(`Force: ${force}`);
  console.log(`${'='.repeat(60)}\n`);

  // Check if trip already exists
  const exists = await tripExists(url);

  if (exists && !force) {
    // Trip exists and force is not enabled
    const existingTrip = await getTripByUrl(url);

    if (!existingTrip) {
      throw new NotFoundError('Trip exists but could not be retrieved');
    }

    console.log('ℹ️  Trip already exists in database');

    return successResponse(
      {
        tripId: existingTrip.id,
        existingTrip,
        hint: 'Use ?force=true to re-scrape',
      },
      'Trip already exists in database'
    );
  }

  if (exists && force) {
    // Delete existing trip and all related data
    console.log('🔄 Force re-scrape enabled, deleting existing trip...');
    await deleteTripByUrl(url);
  }

  // Scrape the Wanderlog page
  console.log('🔍 Starting scrape...');
  const scrapedData = await scrapeWanderlogTrip(url);

  // Store in Supabase
  console.log('💾 Storing in Supabase...');
  const tripId = await storeWanderlogDataInSupabase(scrapedData);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Scraping completed in ${duration}s`);
  console.log(`Trip ID: ${tripId}`);
  console.log(`${'='.repeat(60)}\n`);

  return successResponse(
    {
      tripId,
      duration: `${duration}s`,
      stats: {
        flights: scrapedData.flights.length,
        hotels: scrapedData.hotels.length,
        carRentals: scrapedData.carRentals.length,
        activities: scrapedData.activities.length,
        dailyScheduleDays: scrapedData.dailySchedule.length,
        images: scrapedData.imageAssociationStats,
      },
      trip: {
        title: scrapedData.title,
        startDate: scrapedData.startDate,
        endDate: scrapedData.endDate,
        creator: scrapedData.creator,
      },
    },
    'Successfully scraped and stored trip data',
    201
  );
});

/**
 * POST /api/scrape-validated
 * Body: { "url": "https://wanderlog.com/view/...", "force": true }
 *
 * Same functionality as GET but accepts JSON body
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const startTime = Date.now();

  // Rate limiting: 5 requests per minute per IP
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  checkRateLimit(`scrape:${clientIp}`, 5, 60000);

  // Validate request body
  const { url, force } = await validateBody(request, scrapeWanderlogSchema);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Starting Wanderlog scrape`);
  console.log(`URL: ${url}`);
  console.log(`Force: ${force}`);
  console.log(`${'='.repeat(60)}\n`);

  // Check if trip already exists
  const exists = await tripExists(url);

  if (exists && !force) {
    const existingTrip = await getTripByUrl(url);

    if (!existingTrip) {
      throw new NotFoundError('Trip exists but could not be retrieved');
    }

    console.log('ℹ️  Trip already exists in database');

    return successResponse(
      {
        tripId: existingTrip.id,
        existingTrip,
        hint: 'Set "force": true to re-scrape',
      },
      'Trip already exists in database'
    );
  }

  if (exists && force) {
    console.log('🔄 Force re-scrape enabled, deleting existing trip...');
    await deleteTripByUrl(url);
  }

  // Scrape the Wanderlog page
  console.log('🔍 Starting scrape...');
  const scrapedData = await scrapeWanderlogTrip(url);

  // Store in Supabase
  console.log('💾 Storing in Supabase...');
  const tripId = await storeWanderlogDataInSupabase(scrapedData);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Scraping completed in ${duration}s`);
  console.log(`Trip ID: ${tripId}`);
  console.log(`${'='.repeat(60)}\n`);

  return successResponse(
    {
      tripId,
      duration: `${duration}s`,
      stats: {
        flights: scrapedData.flights.length,
        hotels: scrapedData.hotels.length,
        carRentals: scrapedData.carRentals.length,
        activities: scrapedData.activities.length,
        dailyScheduleDays: scrapedData.dailySchedule.length,
        images: scrapedData.imageAssociationStats,
      },
      trip: {
        title: scrapedData.title,
        startDate: scrapedData.startDate,
        endDate: scrapedData.endDate,
        creator: scrapedData.creator,
      },
    },
    'Successfully scraped and stored trip data',
    201
  );
});
