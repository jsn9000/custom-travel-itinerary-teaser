import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Verifying Day 1 RIGHT NOW...\n');

// Fresh query with timestamp
const { data: day1, error } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Query timestamp: ${new Date().toISOString()}`);
console.log(`\nDay 1 has ${day1.items.length} items:`);

day1.items.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name}`);
  console.log(`     Type: ${item.type}`);
  console.log(`     ID: ${item.id}`);
  console.log('');
});

const foodItems = day1.items.filter(item => item.type === 'food');
const activityItems = day1.items.filter(item => item.type === 'activity');

console.log('Summary:');
console.log(`  Activities: ${activityItems.length}`);
console.log(`  Food: ${foodItems.length}`);

if (foodItems.length > 0) {
  console.log('\n❌ FOOD STILL PRESENT ON DAY 1!');
  foodItems.forEach(food => console.log(`   - ${food.name}`));
} else {
  console.log('\n✅ No food on Day 1 - CORRECT!');
}
