import { NextRequest, NextResponse } from 'next/server';
import { scrapeWanderlogTrip } from '@/lib/wanderlog-scraper';
import {
  storeWanderlogDataInSupabase,
  tripExists,
  getTripByUrl,
  deleteTripByUrl,
} from '@/lib/wanderlog-to-supabase';

/**
 * API endpoint to scrape Wanderlog trip and store in Supabase
 *
 * GET /api/scrape-wanderlog?url=https://wanderlog.com/view/...&force=true
 *
 * Query Parameters:
 * - url (required): The Wanderlog trip URL to scrape
 * - force (optional): Set to 'true' to force re-scrape even if trip exists
 *
 * Returns:
 * - success: boolean
 * - tripId: string (Supabase trip ID)
 * - message: string
 * - data: Scraped trip data
 * - stats: Image association statistics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const force = searchParams.get('force') === 'true';

    // Validate URL parameter
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL parameter is required',
          example: '/api/scrape-wanderlog?url=https://wanderlog.com/view/...',
        },
        { status: 400 }
      );
    }

    // Validate it's a Wanderlog URL
    if (!url.includes('wanderlog.com')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL. Must be a wanderlog.com URL',
        },
        { status: 400 }
      );
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting Wanderlog scrape`);
    console.log(`URL: ${url}`);
    console.log(`Force: ${force}`);
    console.log(`${'='.repeat(60)}\n`);

    // Check if trip already exists
    const exists = await tripExists(url);

    if (exists) {
      if (force) {
        // Delete existing trip and all related data
        console.log('🔄 Force re-scrape enabled, deleting existing trip...');
        await deleteTripByUrl(url);
      } else {
        // Trip exists and force is not enabled
        const existingTrip = await getTripByUrl(url);
        console.log('ℹ️  Trip already exists in database');

        return NextResponse.json({
          success: true,
          message: 'Trip already exists in database',
          tripId: existingTrip?.id,
          existingTrip,
          hint: 'Use ?force=true to re-scrape',
        });
      }
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

    return NextResponse.json({
      success: true,
      tripId,
      message: 'Successfully scraped and stored trip data',
      duration: `${duration}s`,
      stats: {
        flights: scrapedData.flights.length,
        hotels: scrapedData.hotels.length,
        carRentals: scrapedData.carRentals.length,
        activities: scrapedData.activities.length,
        dailyScheduleDays: scrapedData.dailySchedule.length,
        images: scrapedData.imageAssociationStats,
      },
      data: {
        title: scrapedData.title,
        startDate: scrapedData.startDate,
        endDate: scrapedData.endDate,
        creator: scrapedData.creator,
      },
    });
  } catch (error) {
    console.error('\n❌ Error in scrape-wanderlog API:', error);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to scrape Wanderlog trip',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}s`,
        hint: 'Check server logs for more details',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint - same functionality as GET but accepts JSON body
 *
 * POST /api/scrape-wanderlog
 * Body: { "url": "https://wanderlog.com/view/...", "force": true }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { url, force } = body;

    // Validate URL parameter
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required in request body',
          example: '{ "url": "https://wanderlog.com/view/..." }',
        },
        { status: 400 }
      );
    }

    // Validate it's a Wanderlog URL
    if (!url.includes('wanderlog.com')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL. Must be a wanderlog.com URL',
        },
        { status: 400 }
      );
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting Wanderlog scrape`);
    console.log(`URL: ${url}`);
    console.log(`Force: ${force || false}`);
    console.log(`${'='.repeat(60)}\n`);

    // Check if trip already exists
    const exists = await tripExists(url);

    if (exists) {
      if (force) {
        // Delete existing trip and all related data
        console.log('🔄 Force re-scrape enabled, deleting existing trip...');
        await deleteTripByUrl(url);
      } else {
        // Trip exists and force is not enabled
        const existingTrip = await getTripByUrl(url);
        console.log('ℹ️  Trip already exists in database');

        return NextResponse.json({
          success: true,
          message: 'Trip already exists in database',
          tripId: existingTrip?.id,
          existingTrip,
          hint: 'Set "force": true to re-scrape',
        });
      }
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

    return NextResponse.json({
      success: true,
      tripId,
      message: 'Successfully scraped and stored trip data',
      duration: `${duration}s`,
      stats: {
        flights: scrapedData.flights.length,
        hotels: scrapedData.hotels.length,
        carRentals: scrapedData.carRentals.length,
        activities: scrapedData.activities.length,
        dailyScheduleDays: scrapedData.dailySchedule.length,
        images: scrapedData.imageAssociationStats,
      },
      data: {
        title: scrapedData.title,
        startDate: scrapedData.startDate,
        endDate: scrapedData.endDate,
        creator: scrapedData.creator,
      },
    });
  } catch (error) {
    console.error('\n❌ Error in scrape-wanderlog API:', error);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to scrape Wanderlog trip',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}s`,
        hint: 'Check server logs for more details',
      },
      { status: 500 }
    );
  }
}
