import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🗑️  Removing Forest Camp from Day 8...\n');

// Get Day 8 current state
const { data: day8 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 8)
  .single();

console.log('📋 Day 8 Current items:');
day8.items.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name} (${item.type})`);
});

// Filter out Forest Camp
const updatedItems = day8.items.filter(item =>
  !item.name.toLowerCase().includes('forest camp')
);

console.log(`\n✅ Removing ${day8.items.length - updatedItems.length} item(s)\n`);

// Update Day 8
const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: updatedItems })
  .eq('trip_id', tripId)
  .eq('day_number', 8);

if (updateError) {
  console.error('❌ Error:', updateError);
  process.exit(1);
}

console.log('📋 Day 8 Updated items:');
updatedItems.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name} (${item.type})`);
});

console.log('\n✅ Forest Camp removed from Day 8');
