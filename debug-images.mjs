import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eaofdajkpqyddlbawdli.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhb2ZkYWprcHF5ZGRsYmF3ZGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODYwMzgsImV4cCI6MjA3NjY2MjAzOH0.KUj3CxNeJJIILB6HKXEE1JI35eg3_B9Rx0K2VB6C71Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugImages() {
  // Get one trip
  const { data: trips } = await supabase
    .from('wanderlog_trips')
    .select('id, title')
    .limit(1);

  if (!trips || trips.length === 0) {
    console.log('No trips found');
    return;
  }

  const tripId = trips[0].id;
  console.log('Trip:', trips[0].title);
  console.log('Trip ID:', tripId);
  console.log('\n=== IMAGES IN DATABASE ===\n');

  // Get images for this trip
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('trip_id', tripId)
    .limit(10);

  console.log('Sample images (first 10):');
  images?.forEach((img, idx) => {
    console.log(`\nImage ${idx + 1}:`);
    console.log('  URL:', img.url?.substring(0, 100));
    console.log('  Section:', img.associated_section);
    console.log('  Activity ID:', img.activity_id);
    console.log('  Alt:', img.alt);
  });

  // Get activities
  const { data: activities } = await supabase
    .from('wanderlog_activities')
    .select('id, name')
    .eq('trip_id', tripId)
    .limit(5);

  console.log('\n\n=== ACTIVITIES ===\n');
  activities?.forEach((act, idx) => {
    console.log(`${idx + 1}. ${act.name} (ID: ${act.id})`);
  });

  // Check if any images are associated with activities
  console.log('\n\n=== IMAGE ASSOCIATIONS ===\n');
  const { data: activityImages } = await supabase
    .from('wanderlog_images')
    .select('id, activity_id, associated_section, url')
    .eq('trip_id', tripId)
    .not('activity_id', 'is', null);

  console.log(`Total images with activity_id: ${activityImages?.length || 0}`);
  activityImages?.slice(0, 5).forEach((img) => {
    console.log(`  Activity ID: ${img.activity_id}`);
    console.log(`  Section: ${img.associated_section}`);
    console.log(`  URL: ${img.url?.substring(0, 80)}`);
    console.log('');
  });

  // Check header images
  console.log('\n=== HEADER IMAGES ===\n');
  const { data: headerImages } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('trip_id', tripId)
    .eq('associated_section', 'header');

  console.log(`Total header images: ${headerImages?.length || 0}`);
  headerImages?.forEach((img, idx) => {
    console.log(`${idx + 1}. ${img.url?.substring(0, 80)}`);
  });
}

debugImages();
