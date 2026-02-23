import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking for food-type activities in database...\n');

const { data: foodActivities, error } = await supabase
  .from('wanderlog_activities')
  .select('id, name, type, category')
  .eq('trip_id', tripId)
  .eq('type', 'food');

if (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

console.log(`Found ${foodActivities?.length || 0} food-type activities in database:`);
if (foodActivities && foodActivities.length > 0) {
  foodActivities.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.name} (ID: ${item.id})`);
  });
  console.log('\n⚠️  THE PAGE IS PULLING THESE FOOD ACTIVITIES FOR DISPLAY');
  console.log('Even though Day 1 schedule has no food items, the page shows any food-type activities from the activities table');
} else {
  console.log('  No food-type activities found');
}
