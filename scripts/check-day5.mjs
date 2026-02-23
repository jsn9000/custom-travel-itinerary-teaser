import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📋 Day 5 Current State\n');

const { data: day5 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 5)
  .single();

console.log(`Date: ${day5.date}`);
console.log(`Total items: ${day5.items.length}\n`);

console.log('Current Day 5 items:');
day5.items.forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.name}`);
  console.log(`   Type: ${item.type}`);
  console.log(`   ID: ${item.id}`);
});

// Find Rizal activities
console.log('\n\n🔍 Searching for Rizal activities...');
const { data: rizalActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Rizal%');

console.log(`\nFound ${rizalActivities?.length || 0} Rizal activities:`);
rizalActivities?.forEach(act => {
  console.log(`\n  - ${act.name}`);
  console.log(`    ID: ${act.id}`);
  console.log(`    Description: ${act.description?.substring(0, 80)}...`);
});

// Check images for Rizal activities
for (const act of rizalActivities || []) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', act.id);

  console.log(`\n  ${act.name}: ${images?.length || 0} images`);
  if (images && images.length > 0) {
    images.forEach((img, idx) => {
      console.log(`    ${idx + 1}. ${img.alt}`);
    });
  }
}
