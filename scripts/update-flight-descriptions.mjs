import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TRIP_ID = '1c2a975d-9bf6-4ed0-8d9f-e27611bbf042';

async function updateFlights() {
  console.log('✈️  Updating flight descriptions...\n');

  // Get current flights
  const { data: flights, error: fetchError } = await supabase
    .from('wanderlog_flights')
    .select('*')
    .eq('trip_id', TRIP_ID);

  if (fetchError) {
    console.error('Error fetching flights:', fetchError);
    return;
  }

  console.log(`Found ${flights.length} flights\n`);

  // Update each flight with generic seating descriptions
  for (const flight of flights) {
    let newDescription = '';

    // Based on price, assign appropriate seating class
    if (flight.price >= 700) {
      newDescription = 'Premium Economy Seating';
    } else if (flight.price >= 500) {
      newDescription = 'Economy Plus Seating';
    } else if (flight.price >= 400) {
      newDescription = 'Standard Economy Seating';
    } else {
      newDescription = 'Basic Economy Seating';
    }

    console.log(`Updating flight from ${flight.departure_airport} to ${flight.arrival_airport}`);
    console.log(`  Old: ${flight.airline}`);
    console.log(`  New: ${newDescription}`);
    console.log(`  Price: $${flight.price} ${flight.currency}\n`);

    // Update the flight
    const { error: updateError } = await supabase
      .from('wanderlog_flights')
      .update({ airline: newDescription })
      .eq('id', flight.id);

    if (updateError) {
      console.error(`Error updating flight ${flight.id}:`, updateError);
    } else {
      console.log(`✅ Updated successfully\n`);
    }
  }

  console.log('🎉 All flights updated!');
}

updateFlights().catch(console.error);
