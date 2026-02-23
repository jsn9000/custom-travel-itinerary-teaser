import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📋 Day 4 Current State\n');

const { data: day4 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 4)
  .single();

console.log(`Date: ${day4.date}`);
console.log(`Total items: ${day4.items.length}\n`);

console.log('Current Day 4 items:');
day4.items.forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.name}`);
  console.log(`   Type: ${item.type}`);
  console.log(`   ID: ${item.id}`);
  if (item.description) console.log(`   Description: ${item.description.substring(0, 80)}...`);
});
