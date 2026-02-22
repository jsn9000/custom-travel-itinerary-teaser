import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Apo Island activity
console.log('\n🏝️ Adding Apo Island...');
const apoIsland = {
  trip_id: tripId,
  name: 'Apo Island',
  description: 'A protected marine sanctuary renowned for world-class snorkeling and diving. Swim with sea turtles, explore vibrant coral reefs, and experience one of the Philippines\' most pristine underwater ecosystems.',
  address: 'Apo Island, Negros Oriental, Philippines',
  rating: 4.9,
  hours: 'Day trips typically 8:00 AM - 4:00 PM',
  contact: null
};

const { data: apoData, error: apoError } = await supabase
  .from('wanderlog_activities')
  .insert(apoIsland)
  .select()
  .single();

if (apoError) {
  console.error('❌ Error adding Apo Island:', apoError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${apoData.name} (ID: ${apoData.id})`);
}

// 2. Add Ground Zero restaurant
console.log('\n🍽️ Adding Ground Zero Restaurant...');
const groundZero = {
  trip_id: tripId,
  name: 'Ground Zero Restaurant',
  description: 'Popular dining spot in Dumaguete offering a diverse menu of Filipino and international dishes in a casual, friendly atmosphere. Great for post-island adventure meals.',
  address: 'Dumaguete City, Negros Oriental, Philippines',
  rating: 4.6,
  hours: '11:00 AM - 10:00 PM',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(groundZero)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding Ground Zero:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 3. Update Day 7
console.log('\n🔄 Updating Day 7...');
const updatedItems = [
  {
    id: apoData.id,
    name: apoData.name,
    type: 'activity',
    description: apoData.description
  },
  {
    id: restaurantData.id,
    name: restaurantData.name,
    type: 'food',
    description: restaurantData.description
  }
];

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: updatedItems
  })
  .eq('trip_id', tripId)
  .eq('day_number', 7);

if (updateError) {
  console.error('❌ Error updating Day 7:', updateError);
  process.exit(1);
}

console.log('✅ Day 7 updated successfully!');
console.log(`💡 Day 7 activity: ${apoData.name}`);
console.log(`💡 Day 7 dining: ${restaurantData.name}`);
