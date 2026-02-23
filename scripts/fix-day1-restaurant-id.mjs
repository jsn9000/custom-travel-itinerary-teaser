import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔧 Fixing Day 1 to use correct restaurant...\n');

// Get the correct restaurant (the one with hours)
const correctRestaurantId = 'fcfbc479-bf85-424a-9107-0ae51db6ab98';

const { data: restaurant } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('id', correctRestaurantId)
  .single();

console.log(`Using restaurant: ${restaurant.name}`);
console.log(`  Hours: ${restaurant.hours}`);
console.log(`  Location: ${restaurant.address}`);

// Get temples
const { data: taoistResults } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Cebu Taoist Temple')
  .order('created_at', { ascending: false })
  .limit(1);

const { data: leahResults } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Temple of Leah')
  .order('created_at', { ascending: false })
  .limit(1);

const taoistTemple = taoistResults?.[0];
const templeOfLeah = leahResults?.[0];

// Update Day 1 with correct restaurant ID
const updatedItems = [
  {
    id: restaurant.id,
    name: restaurant.name,
    type: 'food',
    description: restaurant.description,
    hours: restaurant.hours,
    location: restaurant.address
  },
  {
    id: taoistTemple.id,
    name: taoistTemple.name,
    type: 'activity',
    description: taoistTemple.description
  },
  {
    id: templeOfLeah.id,
    name: templeOfLeah.name,
    type: 'activity',
    description: templeOfLeah.description
  }
];

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: updatedItems })
  .eq('trip_id', tripId)
  .eq('day_number', 1);

if (updateError) {
  console.error('❌ Error:', updateError);
  process.exit(1);
}

console.log('\n✅ Day 1 updated with correct restaurant!');

// Delete the wrong duplicate
console.log('\n🗑️  Deleting wrong duplicate restaurant...');
const { error: deleteError } = await supabase
  .from('wanderlog_activities')
  .delete()
  .eq('id', '7a6445d7-7b08-4bb5-96a3-f2bc76f5ad4b');

if (deleteError) {
  console.error('❌ Error deleting:', deleteError);
} else {
  console.log('✅ Duplicate deleted');
}
