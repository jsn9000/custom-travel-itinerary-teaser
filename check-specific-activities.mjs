import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eaofdajkpqyddlbawdli.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhb2ZkYWprcHF5ZGRsYmF3ZGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODYwMzgsImV4cCI6MjA3NjY2MjAzOH0.KUj3CxNeJJIILB6HKXEE1JI35eg3_B9Rx0K2VB6C71Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkActivities() {
  const tripId = '8415408d-3d79-4324-9156-788359d09c14';

  // Get specific activities
  const activityNames = [
    'TELUS World of Science - Edmonton',
    'Edmonton Valley Zoo',
    'University of Alberta Botanic Garden'
  ];

  for (const name of activityNames) {
    console.log(`\n=== ${name} ===\n`);

    const { data: activities } = await supabase
      .from('wanderlog_activities')
      .select('id, name')
      .eq('trip_id', tripId)
      .ilike('name', `%${name}%`);

    if (!activities || activities.length === 0) {
      console.log('Not found in database');
      continue;
    }

    const activity = activities[0];
    console.log('Activity ID:', activity.id);

    // Get images for this activity
    const { data: images } = await supabase
      .from('wanderlog_images')
      .select('*')
      .eq('activity_id', activity.id);

    console.log(`Total images: ${images?.length || 0}\n`);

    if (images && images.length > 0) {
      images.forEach((img, idx) => {
        console.log(`Image ${idx + 1}:`);
        console.log('  URL:', img.url?.substring(0, 100));
        console.log('  Alt:', img.alt);
        console.log('');
      });
    }
  }

  // Check Day 4 activities
  console.log('\n=== ALL ACTIVITIES (for checking Day 4) ===\n');
  const { data: allActivities } = await supabase
    .from('wanderlog_activities')
    .select('id, name')
    .eq('trip_id', tripId)
    .order('name');

  allActivities?.forEach((act, idx) => {
    console.log(`${idx + 1}. ${act.name}`);
  });
}

checkActivities();
