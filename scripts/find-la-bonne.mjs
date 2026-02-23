import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Searching for "La Bonne Franquette" in database...\n');

// Search in activities
const { data: activities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%La Bonne%');

if (activities && activities.length > 0) {
  console.log(`Found ${activities.length} "La Bonne Franquette" activities:`);
  activities.forEach(act => {
    console.log(`  - ID: ${act.id}`);
    console.log(`    Name: ${act.name}`);
    console.log(`    Created: ${act.created_at}`);
    console.log('');
  });

  // Delete them
  console.log('🗑️  Deleting all "La Bonne Franquette" activities...');
  const { error: deleteError } = await supabase
    .from('wanderlog_activities')
    .delete()
    .eq('trip_id', tripId)
    .ilike('name', '%La Bonne%');

  if (deleteError) {
    console.error('Error deleting:', deleteError);
  } else {
    console.log('✅ Deleted all "La Bonne Franquette" activities');
  }
} else {
  console.log('No "La Bonne Franquette" activities found in database');
}

// Double check Day 1
console.log('\n📅 Current Day 1 state:');
const { data: day1 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

console.log(`Day 1 has ${day1.items.length} items`);
day1.items.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name} (${item.type})`);
});
