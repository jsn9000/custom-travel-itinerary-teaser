import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📸 FOOD VENUE IMAGES - WHAT YOU SEE ON EACH DAY:\n');
console.log('='.repeat(100));

// Get all daily schedules
const { data: allDays } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number');

for (const day of allDays || []) {
  for (const item of day.items) {
    if (item.type === 'food' || item.type === 'dining') {
      console.log(`\nDAY ${day.day_number}: ${item.name}`);
      console.log('-'.repeat(100));

      // Get images from database
      const { data: images } = await supabase
        .from('wanderlog_images')
        .select('url, alt')
        .eq('activity_id', item.id)
        .order('position');

      if (images && images.length > 0) {
        images.forEach((img, idx) => {
          const urlPreview = img.url.startsWith('http')
            ? img.url.substring(0, 80)
            : 'data:image/...';
          console.log(`   Image ${idx + 1}: ${img.alt}`);
          console.log(`            ${urlPreview}`);
        });
      } else {
        console.log('   ❌ NO IMAGES FOUND IN DATABASE');
      }
    }
  }
}

console.log('\n' + '='.repeat(100));
console.log('\n🔍 CHECKING FOR DUPLICATE URLS:\n');

const urlMap = new Map();

for (const day of allDays || []) {
  for (const item of day.items) {
    if (item.type === 'food' || item.type === 'dining') {
      const { data: images } = await supabase
        .from('wanderlog_images')
        .select('url')
        .eq('activity_id', item.id);

      if (images) {
        for (const img of images) {
          if (!urlMap.has(img.url)) {
            urlMap.set(img.url, []);
          }
          urlMap.get(img.url).push(`Day ${day.day_number}: ${item.name}`);
        }
      }
    }
  }
}

let duplicatesFound = 0;
for (const [url, locations] of urlMap.entries()) {
  if (locations.length > 1) {
    const uniqueNames = new Set(locations.map(l => l.split(': ')[1]));
    if (uniqueNames.size > 1) {
      duplicatesFound++;
      console.log(`❌ DUPLICATE #${duplicatesFound}:`);
      console.log(`   URL: ${url.substring(0, 70)}...`);
      console.log(`   Used by:`);
      locations.forEach(loc => console.log(`      - ${loc}`));
      console.log('');
    }
  }
}

if (duplicatesFound === 0) {
  console.log('✅✅✅ NO DUPLICATES! Each venue has unique images! ✅✅✅\n');
} else {
  console.log(`❌ FOUND ${duplicatesFound} DUPLICATE IMAGE(S)!\n`);
}
