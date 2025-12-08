import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Trip ID
const TRIP_ID = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

// New appropriate trip description for Taryn's journey
const NEW_NOTES = "Get ready for an unforgettable adventure! From world-class attractions to culinary delights, this carefully curated itinerary will take you on a journey of discovery. Experience the perfect blend of urban excitement and natural beauty.";

async function updateTripNotes() {
  console.log('📝 Updating trip notes...\n');

  try {
    // First, fetch the current trip to see what we're changing
    const { data: currentTrip, error: fetchError } = await supabase
      .from('wanderlog_trips')
      .select('notes')
      .eq('id', TRIP_ID)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching trip:', fetchError);
      return;
    }

    console.log('Current notes:', currentTrip.notes);
    console.log('\n---\n');

    // Update the notes
    const { data, error } = await supabase
      .from('wanderlog_trips')
      .update({ notes: NEW_NOTES })
      .eq('id', TRIP_ID)
      .select();

    if (error) {
      console.error('❌ Error updating trip notes:', error);
      return;
    }

    console.log('✅ Trip notes updated successfully!');
    console.log('New notes:', NEW_NOTES);
    console.log('\nTrip data:', data);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateTripNotes();
