import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Get Day 1 schedule
const { data: day1 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

console.log('Day 1 Schedule Items:');
day1.items.forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.name}`);
  console.log(`   Type: ${item.type}`);
  console.log(`   ID: ${item.id}`);
  console.log(`   Description: ${item.description?.substring(0, 80)}...`);
});

// Now check if these IDs exist in wanderlog_activities
console.log('\n\nChecking if these IDs exist in wanderlog_activities...\n');

for (const item of day1.items) {
  const { data: activity, error } = await supabase
    .from('wanderlog_activities')
    .select('*')
    .eq('id', item.id)
    .single();

  if (error) {
    console.log(`❌ ID ${item.id} (${item.name}) - NOT FOUND in activities table`);
    console.log(`   Error: ${error.message}`);
  } else {
    console.log(`✅ ID ${item.id} - Found in activities:`);
    console.log(`   Name: ${activity.name}`);
    console.log(`   Hours: ${activity.hours}`);
    console.log(`   Address: ${activity.address}`);
    console.log(`   Rating: ${activity.rating}`);
  }
  console.log('');
}
