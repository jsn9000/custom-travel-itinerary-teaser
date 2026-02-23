import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🗑️  Removing food from Day 1...\n');

// Get Day 1 current items
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

// Remove food items, keep only activities
const updatedItems = day1.items.filter(item => item.type === 'activity');

console.log('\n🔄 Updating Day 1 to remove food...');
console.log('New Day 1 items:');
updatedItems.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name} (${item.type})`);
});

// Update Day 1
const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: updatedItems
  })
  .eq('trip_id', tripId)
  .eq('day_number', 1);

if (updateError) {
  console.error('❌ Error updating Day 1:', updateError);
  process.exit(1);
}

console.log('\n✅ Day 1 updated - food removed, only activities remain');
console.log(`   Day 1 now has ${updatedItems.length} items (activities only)`);
