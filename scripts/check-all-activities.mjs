import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Searching for activities...\n');

// Search for Cebu Taoist Temple
const { data: taoist, error: taoistError } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Taoist%');

console.log('Cebu Taoist Temple search:');
if (taoist && taoist.length > 0) {
  taoist.forEach(act => console.log(`  - ${act.name} (ID: ${act.id})`));
} else {
  console.log('  NOT FOUND');
  console.log(`  Error: ${taoistError?.message || 'None'}`);
}

// Search for Temple of Leah
const { data: leah, error: leahError } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Leah%');

console.log('\nTemple of Leah search:');
if (leah && leah.length > 0) {
  leah.forEach(act => console.log(`  - ${act.name} (ID: ${act.id})`));
} else {
  console.log('  NOT FOUND');
  console.log(`  Error: ${leahError?.message || 'None'}`);
}

// List all activities for this trip
console.log('\n\nAll activities for this trip:');
const { data: allActivities } = await supabase
  .from('wanderlog_activities')
  .select('name')
  .eq('trip_id', tripId)
  .order('name');

if (allActivities && allActivities.length > 0) {
  console.log(`Total: ${allActivities.length} activities`);
  allActivities.slice(0, 20).forEach((act, i) => {
    console.log(`  ${i + 1}. ${act.name}`);
  });
  if (allActivities.length > 20) {
    console.log(`  ... and ${allActivities.length - 20} more`);
  }
} else {
  console.log('  NO ACTIVITIES FOUND');
}
