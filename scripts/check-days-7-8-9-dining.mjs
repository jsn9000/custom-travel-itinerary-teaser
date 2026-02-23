import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking dining venues on Days 7, 8, and 9...\n');

for (const dayNum of [7, 8, 9]) {
  const { data: day } = await supabase
    .from('wanderlog_daily_schedules')
    .select('*')
    .eq('trip_id', tripId)
    .eq('day_number', dayNum)
    .single();

  console.log(`\n📅 Day ${dayNum} (${day.date}):`);
  console.log(`Total items: ${day.items.length}\n`);

  const diningItems = day.items.filter(item => item.type === 'dining');

  console.log(`Dining venues: ${diningItems.length}`);
  for (const item of diningItems) {
    console.log(`\n  - ${item.name} (ID: ${item.id})`);

    // Get images for this dining venue
    if (item.id) {
      const { data: images } = await supabase
        .from('wanderlog_images')
        .select('url, alt')
        .eq('activity_id', item.id)
        .order('position');

      console.log(`    Images: ${images?.length || 0}`);
      images?.forEach((img, idx) => {
        console.log(`      ${idx + 1}. ${img.alt}`);
        console.log(`         URL: ${img.url.substring(0, 60)}...`);
      });
    }
  }
}

// Get all unique dining venues
console.log('\n\n🔍 Checking for duplicate images across different venues...\n');

const { data: allDining } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('type', 'dining');

const imageUrlMap = new Map();

for (const restaurant of allDining || []) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url')
    .eq('activity_id', restaurant.id);

  if (images && images.length > 0) {
    for (const img of images) {
      if (!imageUrlMap.has(img.url)) {
        imageUrlMap.set(img.url, []);
      }
      imageUrlMap.get(img.url).push(restaurant.name);
    }
  }
}

console.log('Images used by multiple restaurants:\n');
for (const [url, restaurants] of imageUrlMap.entries()) {
  if (restaurants.length > 1) {
    console.log(`❌ DUPLICATE: ${url.substring(0, 60)}...`);
    console.log(`   Used by: ${restaurants.join(', ')}`);
    console.log('');
  }
}
