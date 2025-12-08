import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TRIP_ID = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

async function updateFlights() {
  console.log('✈️  Updating flight information...\n');

  try {
    // Fetch current flights
    const { data: flights, error: fetchError } = await supabase
      .from('wanderlog_flights')
      .select('*')
      .eq('trip_id', TRIP_ID);

    if (fetchError) {
      console.error('❌ Error fetching flights:', fetchError);
      return;
    }

    console.log('Current flights:', JSON.stringify(flights, null, 2));
    console.log('\n---\n');

    if (!flights || flights.length === 0) {
      console.log('No flights found for this trip.');
      return;
    }

    // Update each flight
    for (const flight of flights) {
      console.log(`Updating flight ${flight.id}...`);

      const updates = {
        departure_airport: 'ALB',
        arrival_airport: 'OAX',
        departure_time: '2026-02-18',
        arrival_time: '2026-02-26',
        // Set total price for two travelers
        price: flight.airline?.includes('Option 1') || flight.id === flights[0].id ? 1357.00 : flight.price,
        // Add round trip indicator and layover info
        airline: flight.airline // Keep existing airline description
      };

      const { data, error } = await supabase
        .from('wanderlog_flights')
        .update(updates)
        .eq('id', flight.id)
        .select();

      if (error) {
        console.error(`❌ Error updating flight ${flight.id}:`, error);
      } else {
        console.log(`✅ Updated flight ${flight.id}`);
      }
    }

    // Fetch and display updated flights
    const { data: updatedFlights } = await supabase
      .from('wanderlog_flights')
      .select('*')
      .eq('trip_id', TRIP_ID);

    console.log('\n📋 Updated flights:');
    console.log(JSON.stringify(updatedFlights, null, 2));

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateFlights();
