import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking for LIKEALOCALRESTAURANT...\n');

const { data: activities, error } = await supabase
  .from('wanderlog_activities')
  .select('id, name, category')
  .eq('trip_id', tripId)
  .ilike('name', '%LIKEALOCAL%');

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log(`Found ${activities?.length || 0} LIKEALOCALRESTAURANT activities:`);
  activities?.forEach((item) => {
    console.log(`  - ${item.name} (ID: ${item.id}, Category: ${item.category})`);
  });
}

// Also check Day 1 to see if it has any food-type items in the schedule
console.log('\n🔍 Checking Day 1 schedule items...\n');

const { data: day1 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

console.log(`Day 1 has ${day1?.items?.length || 0} items:`);
day1?.items?.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name} (type: ${item.type})`);
});
