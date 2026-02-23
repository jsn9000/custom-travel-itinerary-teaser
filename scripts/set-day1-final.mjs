import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔄 Setting Day 1 activities...\n');

// Get Cebu Taoist Temple
const { data: taoistTemple } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Cebu Taoist Temple')
  .single();

// Get Temple of Leah
const { data: templeOfLeah } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Temple of Leah')
  .single();

if (!taoistTemple || !templeOfLeah) {
  console.error('❌ Could not find activities');
  process.exit(1);
}

console.log('✅ Found activities:');
console.log(`  1. ${taoistTemple.name}`);
console.log(`  2. ${templeOfLeah.name}`);

// Update Day 1 with ONLY activities, NO DINING
const updatedItems = [
  {
    id: taoistTemple.id,
    name: taoistTemple.name,
    type: 'activity',
    description: taoistTemple.description
  },
  {
    id: templeOfLeah.id,
    name: templeOfLeah.name,
    type: 'activity',
    description: templeOfLeah.description
  }
];

console.log('\n🔄 Updating Day 1 with activities only (NO DINING)...');

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: updatedItems })
  .eq('trip_id', tripId)
  .eq('day_number', 1);

if (updateError) {
  console.error('❌ Error:', updateError);
  process.exit(1);
}

console.log('✅ Day 1 updated!');
console.log('\nDay 1 final state:');
console.log('  Activities:');
console.log(`    1. ${taoistTemple.name}`);
console.log(`    2. ${templeOfLeah.name}`);
console.log('  Dining: NONE');
