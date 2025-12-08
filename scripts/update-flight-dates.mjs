import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Trip ID
const TRIP_ID = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

async function updateTripData() {
  console.log('📝 Updating trip dates and flight information...\n');

  try {
    // First, fetch the current trip
    const { data: currentTrip, error: fetchError } = await supabase
      .from('wanderlog_trips')
      .select('*')
      .eq('id', TRIP_ID)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching trip:', fetchError);
      return;
    }

    console.log('Current start_date:', currentTrip.start_date);
    console.log('Current end_date:', currentTrip.end_date);
    console.log('\nCurrent flights:', JSON.stringify(currentTrip.flights, null, 2));
    console.log('\n---\n');

    // Update dates from Feb 17-25 to Feb 18-26
    const updates = {
      start_date: '2026-02-18',
      end_date: '2026-02-26'
    };

    // Update flights if they exist
    if (currentTrip.flights && Array.isArray(currentTrip.flights)) {
      const updatedFlights = currentTrip.flights.map((flight, index) => {
        // Update flight option 1
        if (index === 0) {
          return {
            ...flight,
            route: 'ALB ↔ OAX',
            layover: 'One layover',
            departure_date: '2026-02-18',
            return_date: '2026-02-26',
            price: 1357.00,
            description: 'Total airfare for two travelers'
          };
        }
        // Update flight option 2 with same format
        if (index === 1) {
          return {
            ...flight,
            route: 'ALB ↔ OAX',
            layover: 'One layover',
            departure_date: '2026-02-18',
            return_date: '2026-02-26',
            description: 'Total airfare for two travelers'
          };
        }
        return flight;
      });

      updates.flights = updatedFlights;
    }

    // Update the trip
    const { data, error } = await supabase
      .from('wanderlog_trips')
      .update(updates)
      .eq('id', TRIP_ID)
      .select();

    if (error) {
      console.error('❌ Error updating trip:', error);
      return;
    }

    console.log('✅ Trip updated successfully!');
    console.log('New start_date:', data[0].start_date);
    console.log('New end_date:', data[0].end_date);
    console.log('\nNew flights:', JSON.stringify(data[0].flights, null, 2));

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateTripData();
