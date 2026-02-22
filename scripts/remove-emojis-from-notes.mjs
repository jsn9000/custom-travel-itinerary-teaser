import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Fetch current trip notes
const { data: tripData, error: fetchError } = await supabase
  .from('wanderlog_trips')
  .select('notes')
  .eq('id', tripId)
  .single();

if (fetchError) {
  console.error('Error fetching trip:', fetchError);
  process.exit(1);
}

console.log('Original notes:');
console.log(tripData.notes);
console.log('\n---\n');

// Remove all emojis from the notes
const notesWithoutEmojis = tripData.notes
  .replace(/🎉/g, '')
  .replace(/🌴/g, '')
  .replace(/✨/g, '')
  .replace(/✈️/g, '')
  .trim();

console.log('Notes without emojis:');
console.log(notesWithoutEmojis);
console.log('\n---\n');

// Update the trip notes
const { error: updateError } = await supabase
  .from('wanderlog_trips')
  .update({ notes: notesWithoutEmojis })
  .eq('id', tripId);

if (updateError) {
  console.error('Error updating trip notes:', updateError);
  process.exit(1);
}

console.log('✅ Emojis removed from trip notes successfully!');
