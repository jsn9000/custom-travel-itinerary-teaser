import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '32d01c91-1572-4d88-af7f-01609497d1ba';

// Get trip data
const { data: trip, error: tripError } = await supabase
  .from('wanderlog_trips')
  .select('*')
  .eq('id', tripId)
  .maybeSingle();

if (tripError) {
  console.error('Error fetching trip:', tripError);
  process.exit(1);
}

if (!trip) {
  console.log('❌ Trip not found in wanderlog_trips table');
  console.log('Let me check what trips exist...\n');

  const { data: allTrips, error: allError } = await supabase
    .from('wanderlog_trips')
    .select('id, trip_title, destination, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!allError && allTrips) {
    console.log('Recent trips:');
    allTrips.forEach(t => {
      console.log(`  - ${t.id}: ${t.trip_title || 'Untitled'} (${t.destination || 'No destination'})`);
    });
  }

  process.exit(0);
}

console.log('=== TRIP DATA ===');
console.log('Full trip object:', JSON.stringify(trip, null, 2));
console.log('\nTitle:', trip?.trip_title);
console.log('Dates:', trip?.trip_dates);
console.log('Destination:', trip?.destination);
console.log('Status:', trip?.status);
console.log('Source URL:', trip?.source_url);
console.log('\n=== METADATA ===');
console.log('Hotels:', trip?.metadata?.hotels?.length || 0);
console.log('Flights:', trip?.metadata?.flights?.length || 0);
console.log('Activities:', trip?.metadata?.itinerary?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0);
console.log('Images:', trip?.metadata?.images?.length || 0);

// Get images
const { data: images, error: imagesError } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId);

if (!imagesError) {
  console.log('\n=== IMAGES IN DATABASE ===');
  console.log('Total images:', images.length);
  const grouped = images.reduce((acc, img) => {
    acc[img.associated_section || 'unassociated'] = (acc[img.associated_section || 'unassociated'] || 0) + 1;
    return acc;
  }, {});
  Object.entries(grouped).forEach(([section, count]) => {
    console.log(`  ${section}: ${count}`);
  });
}
