/**
 * Script to scrape multiple Wanderlog URLs from a list
 *
 * Usage:
 * 1. Add URLs to wanderlog-urls.txt (one per line)
 * 2. Run: pnpm scrape:multiple
 */

import { scrapeWanderlogTrip } from '../lib/wanderlog-scraper';
import { storeWanderlogDataInSupabase, tripExists } from '../lib/wanderlog-to-supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

const URL_FILE = 'wanderlog-urls.txt';
const SKIP_EXISTING = true; // Set to false to re-scrape existing trips

async function scrapeUrl(url: string, index: number, total: number) {
  console.log('\n' + '='.repeat(70));
  console.log(`🚀 SCRAPING ${index + 1}/${total}`);
  console.log('='.repeat(70));
  console.log(`URL: ${url}\n`);

  try {
    // Check if already exists
    if (SKIP_EXISTING) {
      const exists = await tripExists(url);
      if (exists) {
        console.log('⏭️  Trip already exists in database, skipping...\n');
        return { success: true, skipped: true, url };
      }
    }

    // Scrape
    const startTime = Date.now();
    const scrapedData = await scrapeWanderlogTrip(url);

    // Store
    const tripId = await storeWanderlogDataInSupabase(scrapedData);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Success! Trip ID: ${tripId} (${duration}s)\n`);

    return { success: true, skipped: false, url, tripId, duration };

  } catch (error) {
    console.error(`❌ Failed to scrape: ${error}\n`);
    return { success: false, skipped: false, url, error };
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 WANDERLOG BATCH SCRAPER');
  console.log('='.repeat(70) + '\n');

  // Read URLs from file
  const filePath = join(process.cwd(), URL_FILE);
  let urls: string[] = [];

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    urls = fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('wanderlog.com'));

    if (urls.length === 0) {
      console.error(`❌ No valid URLs found in ${URL_FILE}`);
      console.log('\n💡 Add Wanderlog URLs to the file, one per line:');
      console.log('   https://wanderlog.com/view/abc123/trip-1');
      console.log('   https://wanderlog.com/view/xyz789/trip-2\n');
      process.exit(1);
    }

    console.log(`📋 Found ${urls.length} URL(s) to scrape\n`);

  } catch (error) {
    console.error(`❌ Could not read ${URL_FILE}`);
    console.log('\n💡 Create the file with one URL per line:');
    console.log(`   echo "https://wanderlog.com/view/..." > ${URL_FILE}\n`);
    process.exit(1);
  }

  // Scrape each URL
  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const result = await scrapeUrl(urls[i], i, urls.length);
    results.push(result);

    // Wait between requests to be nice to the server
    if (i < urls.length - 1) {
      console.log('⏳ Waiting 5 seconds before next scrape...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 BATCH SCRAPING SUMMARY');
  console.log('='.repeat(70));

  const successful = results.filter(r => r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total URLs: ${urls.length}`);
  console.log(`✅ Successfully scraped: ${successful}`);
  console.log(`⏭️  Skipped (already exist): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed URLs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.url}`);
    });
  }

  console.log('='.repeat(70) + '\n');
}

main();
