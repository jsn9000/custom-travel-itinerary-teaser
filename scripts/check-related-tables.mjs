import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '32d01c91-1572-4d88-af7f-01609497d1ba';

// Check for hotels
const { data: hotels } = await supabase
  .from('wanderlog_hotels')
  .select('*')
  .eq('trip_id', tripId);

console.log('=== HOTELS TABLE ===');
console.log(`Found ${hotels?.length || 0} hotels`);
if (hotels && hotels.length > 0) {
  hotels.forEach(h => console.log(`  - ${h.name}: $${h.price_per_night}`));
}

// Check for flights
const { data: flights } = await supabase
  .from('wanderlog_flights')
  .select('*')
  .eq('trip_id', tripId);

console.log('\n=== FLIGHTS TABLE ===');
console.log(`Found ${flights?.length || 0} flights`);
if (flights && flights.length > 0) {
  flights.forEach(f => console.log(`  - ${f.airline}: ${f.departure_airport} → ${f.arrival_airport}`));
}

// Check for activities
const { data: activities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId);

console.log('\n=== ACTIVITIES TABLE ===');
console.log(`Found ${activities?.length || 0} activities`);
if (activities && activities.length > 0) {
  activities.slice(0, 10).forEach(a => console.log(`  - ${a.name} (${a.category || 'uncategorized'})`));
  if (activities.length > 10) console.log(`  ... and ${activities.length - 10} more`);
}

// Check for car rentals
const { data: carRentals } = await supabase
  .from('wanderlog_car_rentals')
  .select('*')
  .eq('trip_id', tripId);

console.log('\n=== CAR RENTALS TABLE ===');
console.log(`Found ${carRentals?.length || 0} car rentals`);
if (carRentals && carRentals.length > 0) {
  carRentals.forEach(c => console.log(`  - ${c.company}: ${c.pickup_location}`));
}
