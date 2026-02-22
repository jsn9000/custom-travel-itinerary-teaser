import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Chocolate Hills activity
console.log('\n⛰️ Adding Chocolate Hills...');
const chocolateHills = {
  trip_id: tripId,
  name: 'Chocolate Hills',
  description: 'One of the Philippines\' most iconic natural wonders featuring over 1,200 perfectly cone-shaped hills that turn chocolate brown during the dry season. Stunning panoramic views await at the viewing deck.',
  address: 'Carmen, Bohol, Philippines',
  rating: 4.9,
  hours: '8:00 AM - 5:00 PM',
  contact: null
};

const { data: hillsData, error: hillsError } = await supabase
  .from('wanderlog_activities')
  .insert(chocolateHills)
  .select()
  .single();

if (hillsError) {
  console.error('❌ Error adding Chocolate Hills:', hillsError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${hillsData.name} (ID: ${hillsData.id})`);
}

// 2. Add Maholo restaurant
console.log('\n🍽️ Adding Maholo restaurant...');
const maholo = {
  trip_id: tripId,
  name: 'Maholo Restaurant',
  description: 'Popular local restaurant serving delicious Filipino and international cuisine with a focus on fresh seafood and authentic island flavors.',
  address: 'Bohol, Philippines',
  rating: 4.6,
  hours: '11:00 AM - 10:00 PM',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(maholo)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding Maholo:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 3. Update Day 5
console.log('\n🔄 Updating Day 5...');
const updatedItems = [
  {
    id: hillsData.id,
    name: hillsData.name,
    type: 'activity',
    description: hillsData.description
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
  .eq('day_number', 5);

if (updateError) {
  console.error('❌ Error updating Day 5:', updateError);
  process.exit(1);
}

console.log('✅ Day 5 updated successfully!');
console.log(`💡 Day 5 activity: ${hillsData.name}`);
console.log(`💡 Day 5 dining: ${restaurantData.name}`);
