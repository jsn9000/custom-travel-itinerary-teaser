import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking Day 2 for Oslob activity...\n');

// Get Day 2
const { data: day2 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 2)
  .single();

console.log('📋 Day 2 Schedule:');
console.log(`Total items: ${day2?.items?.length || 0}\n`);

day2?.items?.forEach((item, i) => {
  console.log(`${i + 1}. ${item.name}`);
  console.log(`   Type: ${item.type}`);
  console.log(`   ID: ${item.id}`);
  console.log('');
});

// Search for Oslob activities
console.log('\n🔍 Searching for Oslob activities in database...');

const { data: oslobActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Oslob%');

console.log(`\nFound ${oslobActivities?.length || 0} Oslob activities:`);
oslobActivities?.forEach((act) => {
  console.log(`\n  Name: ${act.name}`);
  console.log(`  ID: ${act.id}`);
  console.log(`  Description: ${act.description?.substring(0, 100)}...`);

  // Check for images
  console.log(`  Checking images...`);
});

// Check images for Oslob activities
for (const act of oslobActivities || []) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', act.id);

  console.log(`\n  ${act.name}: ${images?.length || 0} images`);
  if (images && images.length > 0) {
    images.forEach((img, idx) => {
      console.log(`    ${idx + 1}. ${img.url.substring(0, 80)}...`);
    });
  }
}
