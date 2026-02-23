import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🗑️  CLEARING DAY 4 COMPLETELY...\n');

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: [] })
  .eq('trip_id', tripId)
  .eq('day_number', 4);

if (updateError) {
  console.error('❌ Error:', updateError);
  process.exit(1);
}

console.log('✅ Day 4 cleared - NO activities, NO dining\n');

// Verify
const { data: day4 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 4)
  .single();

console.log(`Day 4 now has ${day4.items.length} items`);
