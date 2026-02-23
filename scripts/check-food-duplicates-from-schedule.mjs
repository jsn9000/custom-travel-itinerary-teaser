import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 CHECKING ALL FOOD VENUES FOR DUPLICATE IMAGES...\n');

// Get all daily schedules
const { data: allDays } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number');

// Collect all food items
const foodItems = [];

for (const day of allDays || []) {
  for (const item of day.items) {
    if (item.type === 'food' || item.type === 'dining') {
      foodItems.push({
        day: day.day_number,
        name: item.name,
        id: item.id
      });
    }
  }
}

console.log(`Found ${foodItems.length} food items across all days:\n`);

foodItems.forEach(item => {
  console.log(`  Day ${item.day}: ${item.name}`);
});

// Map to track: image URL -> [venues using it]
const imageUsageMap = new Map();

// Get images for each food item
console.log('\n📸 Checking images for each food venue...\n');

for (const item of foodItems) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', item.id);

  console.log(`Day ${item.day} - ${item.name}: ${images?.length || 0} images`);

  if (images && images.length > 0) {
    for (const img of images) {
      const url = img.url;
      if (!imageUsageMap.has(url)) {
        imageUsageMap.set(url, []);
      }
      imageUsageMap.get(url).push({
        name: item.name,
        day: item.day,
        id: item.id
      });
    }
  }
}

// Find duplicates - images used by DIFFERENT venues
console.log('\n' + '='.repeat(80));
console.log('DUPLICATE IMAGE REPORT');
console.log('='.repeat(80));

let duplicatesFound = 0;

for (const [url, venues] of imageUsageMap.entries()) {
  // Check if this URL is used by different venue NAMES
  const uniqueVenueNames = new Set(venues.map(v => v.name));

  if (uniqueVenueNames.size > 1) {
    duplicatesFound++;
    const urlPreview = url.startsWith('data:')
      ? 'data:image/...[BASE64]'
      : url.substring(0, 70) + '...';

    console.log(`\n❌ DUPLICATE #${duplicatesFound}:`);
    console.log(`   Image: ${urlPreview}`);
    console.log(`   Used by ${uniqueVenueNames.size} DIFFERENT venues:`);

    venues.forEach(v => {
      console.log(`     - Day ${v.day}: ${v.name}`);
    });
  }
}

console.log('\n' + '='.repeat(80));

if (duplicatesFound === 0) {
  console.log('\n✅ SUCCESS! No duplicate food images found!');
  console.log('   Each unique food venue has its own distinct images.\n');
} else {
  console.log(`\n❌ FOUND ${duplicatesFound} DUPLICATE IMAGE(S)!`);
  console.log('   These images are being used by multiple DIFFERENT venues.');
  console.log('   This violates CLAUDE.md rules.\n');
  process.exit(1);
}
