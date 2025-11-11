import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const tripId = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

async function getActivities() {
  // Get trip data
  const { data: trip, error: tripError } = await supabase
    .from('wanderlog_trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (tripError) {
    console.error('Error fetching trip:', tripError);
    return;
  }

  console.log('\n=== OAXACA TRIP ACTIVITIES ===\n');

  // Get activities from trip metadata
  const activities = trip.metadata?.activities || [];

  console.log(`Total activities: ${activities.length}\n`);

  activities.forEach((activity, index) => {
    console.log(`\n--- Activity ${index + 1} ---`);
    console.log(`Name: ${activity.name}`);
    console.log(`Description: ${activity.description || 'NO DESCRIPTION'}`);
    console.log(`Location: ${activity.location || 'N/A'}`);
    console.log(`Address: ${activity.address || 'N/A'}`);
    console.log(`Rating: ${activity.rating || 'N/A'}`);
    console.log(`Hours: ${activity.hours || 'N/A'}`);
    console.log(`Contact: ${activity.contact || 'N/A'}`);
    console.log(`Category: ${activity.category || 'N/A'}`);
  });

  // Also check daily schedule
  console.log('\n\n=== DAILY SCHEDULE ACTIVITIES ===\n');

  const dailySchedule = trip.metadata?.dailySchedule || [];

  dailySchedule.forEach((day) => {
    console.log(`\n=== Day ${day.dayNumber} (${day.date}) ===`);

    const dayActivities = day.items?.filter(item => item.type === 'activity') || [];

    dayActivities.forEach((item, itemIdx) => {
      console.log(`\n  Activity ${itemIdx + 1}: ${item.name}`);
      console.log(`  Description: ${item.description || 'NO DESCRIPTION'}`);
      console.log(`  Time: ${item.time || 'N/A'}`);
    });
  });
}

getActivities();
