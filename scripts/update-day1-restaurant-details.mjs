import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking likealocalrestaurant details...\n');

// Get the restaurant from activities
const { data: restaurant, error } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'likealocalrestaurant')
  .single();

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('Current restaurant data:');
console.log(`  Name: ${restaurant.name}`);
console.log(`  Hours: ${restaurant.hours}`);
console.log(`  Address: ${restaurant.address}`);
console.log(`  Rating: ${restaurant.rating}`);
console.log(`  Description: ${restaurant.description}`);

// Update with correct details
console.log('\n🔄 Updating restaurant details...');

const { error: updateError } = await supabase
  .from('wanderlog_activities')
  .update({
    name: 'LIKEALOCALRESTAURANT',
    hours: '11:00 AM - 11:59 PM',
    address: 'Cebu City, Philippines',
    rating: 4.5,
    description: 'Authentic Filipino dining experience serving traditional local cuisine in a welcoming atmosphere. Known for home-style cooking that showcases the rich flavors and culinary heritage of the Philippines.'
  })
  .eq('id', restaurant.id);

if (updateError) {
  console.error('❌ Error updating:', updateError);
  process.exit(1);
}

console.log('✅ Restaurant details updated!');

// Update Day 1 schedule with the updated info
console.log('\n🔄 Updating Day 1 schedule...');

const { data: day1 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

// Update the items array with correct restaurant name
const updatedItems = day1.items.map(item => {
  if (item.type === 'food') {
    return {
      id: restaurant.id,
      name: 'LIKEALOCALRESTAURANT',
      type: 'food',
      description: 'Authentic Filipino dining experience serving traditional local cuisine in a welcoming atmosphere. Known for home-style cooking that showcases the rich flavors and culinary heritage of the Philippines.'
    };
  }
  return item;
});

const { error: scheduleError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: updatedItems })
  .eq('trip_id', tripId)
  .eq('day_number', 1);

if (scheduleError) {
  console.error('❌ Error updating schedule:', scheduleError);
  process.exit(1);
}

console.log('✅ Day 1 schedule updated!');
console.log('\n📋 Final details:');
console.log('  Name: LIKEALOCALRESTAURANT');
console.log('  Hours: 11:00 AM - 11:59 PM');
console.log('  Location: Cebu City, Philippines');
console.log('  Type: Authentic Filipino dining');
