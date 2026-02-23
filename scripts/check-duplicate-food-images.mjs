import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking images for Days 7, 8, 9 food venues...\n');

const venues = [
  { day: 7, name: 'Ground Zero Restaurant' },
  { day: 8, name: 'Adamo Dumaguete' },
  { day: 9, name: 'Hayahay Treehouse Bar' }
];

const imageMap = new Map();

for (const venue of venues) {
  console.log(`\n📅 Day ${venue.day}: ${venue.name}`);

  // Find this activity
  const { data: activity } = await supabase
    .from('wanderlog_activities')
    .select('*')
    .eq('trip_id', tripId)
    .ilike('name', `%${venue.name}%`)
    .limit(1)
    .maybeSingle();

  if (!activity) {
    console.log(`   ❌ Not found in activities table`);
    continue;
  }

  console.log(`   ID: ${activity.id}`);

  // Get images
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', activity.id)
    .order('position');

  console.log(`   Images: ${images?.length || 0}`);
  images?.forEach((img, idx) => {
    console.log(`     ${idx + 1}. ${img.alt}`);
    console.log(`        URL: ${img.url.substring(0, 70)}...`);

    // Track this URL
    if (!imageMap.has(img.url)) {
      imageMap.set(img.url, []);
    }
    imageMap.get(img.url).push(`Day ${venue.day}: ${venue.name}`);
  });
}

console.log('\n\n❌ DUPLICATE IMAGES FOUND:\n');
let foundDuplicates = false;

for (const [url, locations] of imageMap.entries()) {
  if (locations.length > 1) {
    foundDuplicates = true;
    console.log(`Image: ${url.substring(0, 70)}...`);
    console.log(`Used by:`);
    locations.forEach(loc => console.log(`  - ${loc}`));
    console.log('');
  }
}

if (!foundDuplicates) {
  console.log('✅ No duplicate images found!');
}
