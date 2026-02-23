import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking for LIKEALOCALRESTAURANT...\n');

const { data: restaurants, error } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%LIKEALOCAL%');

console.log(`Found ${restaurants?.length || 0} restaurants:`);
restaurants?.forEach(r => {
  console.log(`  ID: ${r.id}`);
  console.log(`  Name: "${r.name}"`);
  console.log(`  Hours: ${r.hours}`);
  console.log(`  Address: ${r.address}`);
  console.log('');
});
