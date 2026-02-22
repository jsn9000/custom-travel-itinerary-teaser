import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Define the parents' flights
const parentsFlights = [
  {
    trip_id: tripId,
    airline: 'Parents Flight - Economy',
    departure_airport: 'DFW',
    arrival_airport: 'CEBU',
    departure_time: 'Sat, Oct 3 at 10:50pm',
    arrival_time: 'Mon, Oct 5 at 10:50am',
    price: 921,
    currency: 'USD',
    baggage_options: 'Economy • 1 Layover • click here to book'
  },
  {
    trip_id: tripId,
    airline: 'Parents Flight Back - Economy',
    departure_airport: 'DGT',
    arrival_airport: 'DFW',
    departure_time: 'Wed, Oct 14 at 8:05am',
    arrival_time: 'Wed, Oct 14 at 7:40pm',
    price: 1285,
    currency: 'USD',
    baggage_options: 'Economy • 2 Layovers • click here to book'
  }
];

// Insert the parents' flights
console.log('\n✈️  Adding parents\' flight options...');
for (const flight of parentsFlights) {
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

console.log('\n🎉 Parents\' flight options added!');
console.log('💡 The teaser page now shows all 4 flight options (2 for Ayanna + 2 for Parents).');
