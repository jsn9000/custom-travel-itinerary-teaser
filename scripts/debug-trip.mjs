import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const tripId = 'e158c0f6-a4a0-41ad-bc01-36ea647faab1';

const { data, error } = await supabase
  .from('wanderlog_trips')
  .select('*')
  .eq('id', tripId)
  .single();

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('\n=== Trip Data Debug ===\n');
console.log('Title:', data.trip_title);
console.log('Dates:', data.trip_dates);
console.log('\n--- Metadata Stats ---');
console.log('Flights in metadata:', data.metadata?.flights?.length || 0);
console.log('Hotels in metadata:', data.metadata?.hotels?.length || 0);
console.log('Locations:', data.metadata?.locations?.length || 0);
console.log('Images:', data.metadata?.images?.length || 0);

if (data.metadata?.flights && data.metadata.flights.length > 0) {
  console.log('\n--- Flights Found ---');
  data.metadata.flights.forEach((flight, idx) => {
    console.log(`Flight ${idx + 1}:`, JSON.stringify(flight, null, 2));
  });
} else {
  console.log('\n⚠️  No flights found in metadata');
}

if (data.metadata?.hotels && data.metadata.hotels.length > 0) {
  console.log('\n--- Hotels Found ---');
  data.metadata.hotels.forEach((hotel, idx) => {
    console.log(`Hotel ${idx + 1}:`, JSON.stringify(hotel, null, 2));
  });
} else {
  console.log('\n⚠️  No hotels found in metadata');
}

// Check if markdown contains flight keywords
if (data.metadata?.firecrawl_data) {
  console.log('\n--- Firecrawl Data ---');
  console.log('Markdown length:', data.metadata.firecrawl_data.markdown_length);
  console.log('Scraped at:', data.metadata.firecrawl_data.scraped_at);
}

console.log('\n=== End Debug ===\n');
