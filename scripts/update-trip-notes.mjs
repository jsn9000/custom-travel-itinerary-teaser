import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Trip ID
const TRIP_ID = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

// New appropriate trip description for Taryn's journey
const NEW_NOTES = "Taryn get ready for an unforgettable adventure! From world-class attractions to culinary delights, this carefully curated itinerary will take you on a journey of discovery. Experience the perfect blend of urban excitement and natural beauty!";

async function updateTripNotes() {
  console.log('📝 Updating trip notes and dates...\n');

  try {
    // First, fetch the current trip to see what we're changing
    const { data: currentTrip, error: fetchError } = await supabase
      .from('wanderlog_trips')
      .select('notes, start_date, end_date')
      .eq('id', TRIP_ID)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching trip:', fetchError);
      return;
    }

    console.log('Current notes:', currentTrip.notes);
    console.log('Current start_date:', currentTrip.start_date);
    console.log('Current end_date:', currentTrip.end_date);
    console.log('\n---\n');

    // Update the notes and dates
    const { data, error } = await supabase
      .from('wanderlog_trips')
      .update({
        notes: NEW_NOTES,
        start_date: '2026-02-18',
        end_date: '2026-02-26'
      })
      .eq('id', TRIP_ID)
      .select();

    if (error) {
      console.error('❌ Error updating trip:', error);
      return;
    }

    console.log('✅ Trip updated successfully!');
    console.log('New notes:', NEW_NOTES);
    console.log('New start_date: 2026-02-18');
    console.log('New end_date: 2026-02-26');
    console.log('\nTrip data:', data);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateTripNotes();
