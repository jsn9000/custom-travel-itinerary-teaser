import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Tales and Feelings restaurant
console.log('\n🍽️ Adding Tales and Feelings restaurant...');
const restaurant = {
  trip_id: tripId,
  name: 'Tales and Feelings',
  description: 'A charming local restaurant offering authentic Filipino cuisine with a cozy, welcoming atmosphere. Known for their fresh seafood and traditional dishes.',
  address: 'Cebu, Philippines',
  rating: 4.7,
  hours: '11:00 AM - 10:00 PM',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(restaurant)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding restaurant:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 2. Fetch current Day 3 schedule
console.log('\n📅 Fetching Day 3 schedule...');
const { data: day3Data, error: day3Error } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 3)
  .single();

if (day3Error) {
  console.error('❌ Error fetching Day 3:', day3Error);
  process.exit(1);
}

console.log('Current Day 3 items:', day3Data.items.length);

// 3. Replace dining items with Tales and Feelings
// Keep activities, but replace food items
const updatedItems = day3Data.items.map(item => {
  // If it's a food item, replace it with Tales and Feelings
  if (item.type === 'food') {
    return {
      id: restaurantData.id,
      name: restaurantData.name,
      type: 'food',
      description: restaurantData.description
    };
  }
  return item;
});

// If there are no food items, add Tales and Feelings
const hasFoodItem = updatedItems.some(item => item.type === 'food');
if (!hasFoodItem) {
  updatedItems.push({
    id: restaurantData.id,
    name: restaurantData.name,
    type: 'food',
    description: restaurantData.description
  });
}

console.log('\n🔄 Updating Day 3 dining...');
const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: updatedItems
  })
  .eq('trip_id', tripId)
  .eq('day_number', 3);

if (updateError) {
  console.error('❌ Error updating Day 3:', updateError);
  process.exit(1);
}

console.log('✅ Day 3 updated successfully!');
console.log(`💡 Day 3 dining now shows: ${restaurantData.name}`);
