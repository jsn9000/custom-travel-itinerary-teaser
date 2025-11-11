import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const tripId = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

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
console.log('Activities in metadata:', data.metadata?.activities?.length || 0);
console.log('Daily Schedule days:', data.metadata?.dailySchedule?.length || data.metadata?.daily_schedule?.length || 0);
console.log('Flights in metadata:', data.metadata?.flights?.length || 0);
console.log('Hotels in metadata:', data.metadata?.hotels?.length || 0);
console.log('Locations:', data.metadata?.locations?.length || 0);
console.log('Images:', data.metadata?.images?.length || 0);

// Show activities
const dailySchedule = data.metadata?.dailySchedule || data.metadata?.daily_schedule || [];
console.log('\n--- ACTIVITIES WITH DESCRIPTIONS ---\n');

dailySchedule.forEach((day, dayIdx) => {
  const activities = day.items?.filter(item => item.type === 'activity') || [];
  if (activities.length > 0) {
    console.log(`\nDay ${day.dayNumber || dayIdx + 1} (${day.date}):`);
    activities.forEach((activity, actIdx) => {
      console.log(`\n  ${actIdx + 1}. ${activity.name}`);
      if (activity.description) {
        console.log(`     Description: ${activity.description}`);
      } else {
        console.log(`     Description: NO DESCRIPTION`);
      }
    });
  }
});

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
