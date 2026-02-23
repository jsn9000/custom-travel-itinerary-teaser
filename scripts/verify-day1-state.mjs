import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking Day 1 current state in database...\n');

const { data: day1, error } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

if (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

console.log('📋 Day 1 Database State:');
console.log(`  Total items: ${day1.items.length}`);
console.log('');

if (day1.items.length === 0) {
  console.log('  ⚠️  Day 1 is EMPTY - no activities or dining');
} else {
  day1.items.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.name}`);
    console.log(`     Type: ${item.type}`);
    console.log(`     ID: ${item.id}`);
    if (item.description) {
      console.log(`     Description: ${item.description.substring(0, 80)}...`);
    }
    console.log('');
  });
}

// Also check what activities exist in the database
console.log('\n🔍 Checking for temple activities in database...');

const { data: temples } = await supabase
  .from('wanderlog_activities')
  .select('id, name, type')
  .eq('trip_id', tripId)
  .or('name.ilike.%Taoist%,name.ilike.%Leah%')
  .order('created_at', { ascending: false });

console.log(`\nFound ${temples?.length || 0} temple activities:`);
temples?.forEach(t => {
  console.log(`  - ${t.name} (ID: ${t.id}, Type: ${t.type})`);
});
