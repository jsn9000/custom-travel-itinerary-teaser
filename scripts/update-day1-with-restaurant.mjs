import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔄 Updating Day 1 with LIKEALOCALRESTAURANT + activities...\n');

// Check if LIKEALOCALRESTAURANT exists
let { data: restaurant } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'LIKEALOCALRESTAURANT')
  .limit(1);

if (!restaurant || restaurant.length === 0) {
  console.log('Creating LIKEALOCALRESTAURANT...');
  // Create it
  const { data: newRestaurant, error: createError } = await supabase
    .from('wanderlog_activities')
    .insert({
      trip_id: tripId,
      name: 'LIKEALOCALRESTAURANT',
      description: 'Authentic Filipino dining experience featuring traditional Cebu cuisine',
      hours: '11:00 AM - 11:59 PM',
      address: 'Cebu City, Philippines',
      rating: 4.5
    })
    .select()
    .single();

  if (createError) {
    console.error('❌ Error creating restaurant:', createError);
    process.exit(1);
  }
  restaurant = [newRestaurant];
}

const restaurantData = restaurant[0];
console.log(`✅ Found restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);

// Get Cebu Taoist Temple
const { data: taoistResults } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Cebu Taoist Temple')
  .order('created_at', { ascending: false })
  .limit(1);

const taoistTemple = taoistResults?.[0];

// Get Temple of Leah
const { data: leahResults } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Temple of Leah')
  .order('created_at', { ascending: false })
  .limit(1);

const templeOfLeah = leahResults?.[0];

if (!taoistTemple || !templeOfLeah) {
  console.error('❌ Could not find temple activities');
  process.exit(1);
}

console.log(`✅ Found: ${taoistTemple.name}`);
console.log(`✅ Found: ${templeOfLeah.name}`);

// Update Day 1 with restaurant + 2 activities
const updatedItems = [
  {
    id: restaurantData.id,
    name: restaurantData.name,
    type: 'food',
    description: restaurantData.description,
    hours: restaurantData.hours,
    location: restaurantData.address
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

console.log('✅ Day 1 updated successfully!');
console.log('\n📋 Day 1 now has:');
console.log('  Dining:');
console.log(`    - ${restaurantData.name}`);
console.log(`      Hours: ${restaurantData.hours}`);
console.log(`      Location: ${restaurantData.address}`);
console.log('  Activities:');
console.log(`    1. ${taoistTemple.name}`);
console.log(`    2. ${templeOfLeah.name}`);
