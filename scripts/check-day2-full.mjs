import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📋 Day 2 Full State\n');

const { data: day2 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 2)
  .single();

console.log(`Date: ${day2.date}`);
console.log(`Total items: ${day2.items.length}\n`);

day2.items.forEach((item, i) => {
  console.log(`${i + 1}. ${item.name}`);
  console.log(`   Type: ${item.type}`);
  console.log(`   ID: ${item.id}`);
  if (item.description) console.log(`   Description: ${item.description.substring(0, 80)}...`);
  if (item.hours) console.log(`   Hours: ${item.hours}`);
  if (item.location) console.log(`   Location: ${item.location}`);
  console.log('');
});
