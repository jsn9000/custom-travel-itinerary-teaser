import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔧 Fixing LIKEALOCALRESTAURANT details...\n');

const { data: restaurant } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'LIKEALOCALRESTAURANT')
  .single();

if (!restaurant) {
  console.error('❌ Restaurant not found');
  process.exit(1);
}

console.log(`Current hours: ${restaurant.hours}`);
console.log(`Current address: ${restaurant.address}`);

// Update with correct details
const { error: updateError } = await supabase
  .from('wanderlog_activities')
  .update({
    hours: '11:00 AM - 11:59 PM',
    address: 'Cebu City, Philippines',
    description: 'Authentic Filipino dining experience featuring traditional Cebu cuisine'
  })
  .eq('id', restaurant.id);

if (updateError) {
  console.error('❌ Error updating:', updateError);
  process.exit(1);
}

console.log('\n✅ Updated LIKEALOCALRESTAURANT:');
console.log('   Hours: 11:00 AM - 11:59 PM');
console.log('   Location: Cebu City, Philippines');
console.log('   Type: Authentic Filipino dining');
