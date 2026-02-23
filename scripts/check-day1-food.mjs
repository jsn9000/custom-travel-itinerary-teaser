import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking Day 1 food...\n');

// Get Day 1 schedule
const { data: day1 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

console.log('Day 1 items:');
day1.items.forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.name} (${item.type})`);
  console.log(`   Description: ${item.description}`);
});

// Find the food item
const foodItem = day1.items.find(item => item.type === 'food');

if (foodItem) {
  console.log('\n✅ Day 1 food found:');
  console.log(`   Name: ${foodItem.name}`);

  // Get full details from activities table
  const { data: restaurant } = await supabase
    .from('wanderlog_activities')
    .select('*')
    .eq('id', foodItem.id)
    .single();

  if (restaurant) {
    console.log(`\n📋 Restaurant details:`);
    console.log(`   ID: ${restaurant.id}`);
    console.log(`   Name: ${restaurant.name}`);
    console.log(`   Hours: ${restaurant.hours}`);
    console.log(`   Description: ${restaurant.description}`);
    console.log(`   Rating: ${restaurant.rating}`);
    console.log(`   Address: ${restaurant.address}`);

    // Update hours if needed
    if (restaurant.hours !== '11:00 AM - 11:59 PM') {
      console.log('\n🔄 Updating hours to match Wanderlog...');
      const { error: updateError } = await supabase
        .from('wanderlog_activities')
        .update({
          hours: '11:00 AM - 11:59 PM'
        })
        .eq('id', restaurant.id);

      if (updateError) {
        console.error('Error updating:', updateError);
      } else {
        console.log('✅ Hours updated to: 11:00 AM - 11:59 PM');
      }
    } else {
      console.log('\n✅ Hours already correct');
    }
  }
} else {
  console.log('\n❌ No food item found on Day 1');
}
