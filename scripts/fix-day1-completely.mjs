import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking Day 1 current state...\n');

// Get Day 1
const { data: day1 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

console.log('Current Day 1 items:');
day1.items.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name} (${item.type})`);
});

// Get the correct activities
const { data: taoistTemple } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Cebu Taoist Temple')
  .single();

const { data: templeOfLeah } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Temple of Leah')
  .single();

const { data: restaurant } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'LIKEALOCALRESTAURANT')
  .single();

console.log('\n✅ Found activities:');
console.log(`  - ${taoistTemple.name} (${taoistTemple.id})`);
console.log(`  - ${templeOfLeah.name} (${templeOfLeah.id})`);
console.log(`  - ${restaurant.name} (${restaurant.id})`);
console.log(`    Hours: ${restaurant.hours}`);
console.log(`    Address: ${restaurant.address}`);

// Update Day 1 with correct items
const updatedItems = [
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
  },
  {
    id: restaurant.id,
    name: restaurant.name,
    type: 'food',
    description: restaurant.description
  }
];

console.log('\n🔄 Updating Day 1...');
const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: updatedItems })
  .eq('trip_id', tripId)
  .eq('day_number', 1);

if (updateError) {
  console.error('❌ Error:', updateError);
  process.exit(1);
}

console.log('✅ Day 1 updated!');
console.log('\nFinal Day 1 items:');
updatedItems.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name} (${item.type})`);
});
