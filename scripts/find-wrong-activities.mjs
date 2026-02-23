import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Searching for wrong activities...\n');

// Search for Kawasan Falls
const { data: kawasan } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Kawasan%');

console.log('Kawasan Falls:');
if (kawasan && kawasan.length > 0) {
  kawasan.forEach(act => {
    console.log(`  - ${act.name} (ID: ${act.id})`);
  });
} else {
  console.log('  NOT FOUND');
}

// Search for CRAZE
const { data: craze } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%CRAZE%');

console.log('\nCRAZE Artisan Cafe:');
if (craze && craze.length > 0) {
  craze.forEach(act => {
    console.log(`  - ${act.name} (ID: ${act.id})`);
  });
} else {
  console.log('  NOT FOUND');
}

// List ALL activities to see what we have
console.log('\n\nALL activities for this trip (first 30):');
const { data: allActivities } = await supabase
  .from('wanderlog_activities')
  .select('id, name')
  .eq('trip_id', tripId)
  .order('name')
  .limit(30);

if (allActivities && allActivities.length > 0) {
  allActivities.forEach((act, i) => {
    console.log(`  ${i + 1}. ${act.name} (${act.id})`);
  });
} else {
  console.log('  NO ACTIVITIES FOUND');
}
