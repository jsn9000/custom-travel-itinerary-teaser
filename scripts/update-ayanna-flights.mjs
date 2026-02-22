import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// First, delete existing flights for this trip
console.log('🗑️  Deleting existing flights...');
const { error: deleteError } = await supabase
  .from('wanderlog_flights')
  .delete()
  .eq('trip_id', tripId);

if (deleteError) {
  console.error('Error deleting existing flights:', deleteError);
  process.exit(1);
}

console.log('✅ Deleted existing flights');

// Define Ayanna's flights only
const ayannaFlights = [
  {
    trip_id: tripId,
    airline: 'Your Flight - Economy',
    departure_airport: 'SFO',
    arrival_airport: 'CEBU',
    departure_time: 'Sun, Oct 4 at 12:30am',
    arrival_time: 'Mon, Oct 5 at 10:35am',
    price: 363,
    currency: 'USD',
    baggage_options: 'Economy • click here to book'
  },
  {
    trip_id: tripId,
    airline: 'Your Flight Back - Economy',
    departure_airport: 'DGT',
    arrival_airport: 'SFO',
    departure_time: 'Wed, Oct 14 at 8:10pm',
    arrival_time: 'Wed, Oct 14 at 9:10pm',
    price: 634,
    currency: 'USD',
    baggage_options: 'Economy • click here to book'
  }
];

// Insert Ayanna's flights
console.log('\n✈️  Inserting Ayanna\'s flights...');
for (const flight of ayannaFlights) {
  const { data, error } = await supabase
    .from('wanderlog_flights')
    .insert(flight)
    .select()
    .single();

  if (error) {
    console.error(`❌ Error inserting flight ${flight.airline}:`, error);
  } else {
    console.log(`✅ Inserted: ${flight.airline} (${flight.departure_airport} → ${flight.arrival_airport}) - $${flight.price}`);
  }
}

console.log('\n🎉 Ayanna\'s flight options updated!');
console.log('💡 Parents\' flights will be added next.');
