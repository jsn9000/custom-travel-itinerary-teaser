/**
 * Simple script to scrape a Wanderlog URL and store in Supabase
 *
 * Usage:
 * 1. Change the WANDERLOG_URL variable below to the URL you want to scrape
 * 2. Run: pnpm scrape
 *
 * Or pass URL as command line argument:
 * pnpm scrape https://wanderlog.com/view/znjfochocj/trip-to-edmonton
 */

import { scrapeWanderlogTrip } from '../lib/wanderlog-scraper';
import { storeWanderlogDataInSupabase, tripExists } from '../lib/wanderlog-to-supabase';

// ============================================
// CHANGE THIS URL TO SCRAPE DIFFERENT TRIPS
// ============================================
const WANDERLOG_URL = 'https://wanderlog.com/view/znjfochocj/trip-to-edmonton';

// Set to true to re-scrape even if the trip already exists in database
const FORCE_RESCRAPE = false;

// ============================================

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 WANDERLOG SCRAPER');
  console.log('='.repeat(70) + '\n');

  // Check if URL was passed as command line argument
  const urlFromArgs = process.argv[2];
  const forceFromArgs = process.argv.includes('--force') || process.argv.includes('-f');

  const urlToScrape = urlFromArgs || WANDERLOG_URL;
  const shouldForce = forceFromArgs || FORCE_RESCRAPE;

  console.log(`📍 URL: ${urlToScrape}`);
  console.log(`🔄 Force Re-scrape: ${shouldForce ? 'Yes' : 'No'}\n`);

  // Validate URL
  if (!urlToScrape.includes('wanderlog.com')) {
    console.error('❌ Error: Must be a wanderlog.com URL');
    process.exit(1);
  }

  try {
    // Check if trip already exists
    if (!shouldForce) {
      console.log('🔍 Checking if trip already exists...');
      const exists = await tripExists(urlToScrape);

      if (exists) {
        console.log('\n⚠️  This trip already exists in the database!');
        console.log('💡 To re-scrape, either:');
        console.log('   - Set FORCE_RESCRAPE = true in the script');
        console.log('   - Run: pnpm scrape <url> --force\n');
        process.exit(0);
      }
      console.log('✅ Trip not found in database, proceeding with scrape\n');
    }

    // Scrape the trip
    const startTime = Date.now();
    console.log('🔍 Starting scrape...\n');

    const scrapedData = await scrapeWanderlogTrip(urlToScrape);

    console.log('\n📊 Scraped Data Summary:');
    console.log('─'.repeat(70));
    console.log(`  Title: ${scrapedData.title}`);
    console.log(`  Creator: ${scrapedData.creator || 'N/A'}`);
    console.log(`  Dates: ${scrapedData.startDate} - ${scrapedData.endDate}`);
    console.log(`  Flights: ${scrapedData.flights.length}`);
    console.log(`  Hotels: ${scrapedData.hotels.length}`);
    console.log(`  Car Rentals: ${scrapedData.carRentals.length}`);
    console.log(`  Activities: ${scrapedData.activities.length}`);
    console.log(`  Daily Schedule: ${scrapedData.dailySchedule.length} days`);
    console.log(`  Images: ${scrapedData.imageAssociationStats.total} total`);
    console.log(`    └─ Associated: ${scrapedData.imageAssociationStats.associated}`);
    console.log(`    └─ Unassociated: ${scrapedData.imageAssociationStats.unassociated}`);
    console.log('─'.repeat(70) + '\n');

    // Store in Supabase
    console.log('💾 Storing data in Supabase...\n');
    const tripId = await storeWanderlogDataInSupabase(scrapedData);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(70));
    console.log('✅ SUCCESS!');
    console.log('='.repeat(70));
    console.log(`Trip ID: ${tripId}`);
    console.log(`Duration: ${duration}s`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ ERROR');
    console.error('='.repeat(70));
    console.error(error);
    console.error('='.repeat(70) + '\n');
    process.exit(1);
  }
}

main();
