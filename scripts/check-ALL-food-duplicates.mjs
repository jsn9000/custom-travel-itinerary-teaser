import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 CHECKING ALL FOOD VENUES FOR DUPLICATE IMAGES...\n');

// Get all dining/food activities
const { data: allFoodActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .or('type.eq.dining,type.eq.food');

console.log(`Total food/dining activities: ${allFoodActivities?.length || 0}\n`);

// Map to track: image URL -> [venues using it]
const imageUsageMap = new Map();

// Also track which activities are used on which days
const activityDayMap = new Map();

// Get all daily schedules
const { data: allDays } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number');

// Build activity -> day mapping
for (const day of allDays || []) {
  for (const item of day.items) {
    if (item.type === 'food' || item.type === 'dining') {
      if (!activityDayMap.has(item.id)) {
        activityDayMap.set(item.id, []);
      }
      activityDayMap.get(item.id).push(day.day_number);
    }
  }
}

// Check images for each food activity
for (const activity of allFoodActivities || []) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url')
    .eq('activity_id', activity.id);

  const daysUsed = activityDayMap.get(activity.id) || [];

  if (images && images.length > 0) {
    for (const img of images) {
      const url = img.url;
      if (!imageUsageMap.has(url)) {
        imageUsageMap.set(url, []);
      }
      imageUsageMap.get(url).push({
        name: activity.name,
        id: activity.id,
        days: daysUsed
      });
    }
  }
}

// Find duplicates
console.log('='.repeat(80));
console.log('DUPLICATE IMAGE REPORT');
console.log('='.repeat(80));

let duplicatesFound = 0;
const duplicateDetails = [];

for (const [url, venues] of imageUsageMap.entries()) {
  // Check if this URL is used by different venues (not the same venue on different days)
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
      const daysStr = v.days.length > 0 ? `Day(s) ${v.days.join(', ')}` : 'Not on schedule';
      console.log(`     - ${v.name} (${daysStr})`);
    });

    duplicateDetails.push({ url, venues });
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

  // Exit with error code so we know there are duplicates
  process.exit(1);
}
