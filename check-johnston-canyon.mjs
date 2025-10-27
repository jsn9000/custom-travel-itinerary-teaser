import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eaofdajkpqyddlbawdli.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhb2ZkYWprcHF5ZGRsYmF3ZGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODYwMzgsImV4cCI6MjA3NjY2MjAzOH0.KUj3CxNeJJIILB6HKXEE1JI35eg3_B9Rx0K2VB6C71Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkJohnstonCanyon() {
  const tripId = '8415408d-3d79-4324-9156-788359d09c14';

  // Search for Johnston Canyon (note: might be spelled different ways)
  const { data: activities } = await supabase
    .from('wanderlog_activities')
    .select('id, name')
    .eq('trip_id', tripId)
    .or('name.ilike.%johnston%,name.ilike.%johnson%');

  console.log('=== JOHNSTON/JOHNSON CANYON ===\n');

  if (!activities || activities.length === 0) {
    console.log('Not found');
    return;
  }

  for (const activity of activities) {
    console.log(`Activity: ${activity.name}`);
    console.log(`ID: ${activity.id}\n`);

    // Get images
    const { data: images } = await supabase
      .from('wanderlog_images')
      .select('*')
      .eq('activity_id', activity.id);

    console.log(`Total images: ${images?.length || 0}\n`);

    if (images && images.length > 0) {
      images.forEach((img, idx) => {
        console.log(`Image ${idx + 1}:`);
        console.log(`  URL: ${img.url}`);
        console.log(`  Alt: ${img.alt}`);
        console.log('');
      });
    }
  }
}

checkJohnstonCanyon();
