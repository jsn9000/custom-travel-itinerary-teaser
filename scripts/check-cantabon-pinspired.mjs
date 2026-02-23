import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Searching for Cantabon Cave and Pinspired Art Souvenirs...\n');

// Get all daily schedules
const { data: schedules } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number');

// Search for Cantabon Cave and Pinspired in items
for (const day of schedules || []) {
  const cantabonItems = day.items.filter(item =>
    item.name?.toLowerCase().includes('cantabon')
  );
  const pinspiredItems = day.items.filter(item =>
    item.name?.toLowerCase().includes('pinspired')
  );

  if (cantabonItems.length > 0) {
    console.log(`📋 Day ${day.day_number} (${day.date}) - Found Cantabon Cave:`);
    cantabonItems.forEach(item => {
      console.log(`   - ${item.name} (ID: ${item.id})`);
    });
    console.log('');
  }

  if (pinspiredItems.length > 0) {
    console.log(`📋 Day ${day.day_number} (${day.date}) - Found Pinspired:`);
    pinspiredItems.forEach(item => {
      console.log(`   - ${item.name} (ID: ${item.id})`);
    });
    console.log('');
  }
}

// Also search in activities table
const { data: cantabonActivity } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%cantabon%')
  .maybeSingle();

if (cantabonActivity) {
  console.log('🎯 Found Cantabon Cave activity:');
  console.log(`   ID: ${cantabonActivity.id}`);
  console.log(`   Name: ${cantabonActivity.name}`);

  // Check images
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', cantabonActivity.id);

  console.log(`   Images: ${images?.length || 0}`);
  console.log('');
}

const { data: pinspiredActivity } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%pinspired%')
  .maybeSingle();

if (pinspiredActivity) {
  console.log('🎯 Found Pinspired activity:');
  console.log(`   ID: ${pinspiredActivity.id}`);
  console.log(`   Name: ${pinspiredActivity.name}`);

  // Check images
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', pinspiredActivity.id);

  console.log(`   Images: ${images?.length || 0}`);
  if (images && images.length > 0) {
    images.forEach((img, idx) => {
      console.log(`     ${idx + 1}. ${img.alt}`);
      console.log(`        ${img.url.substring(0, 60)}...`);
    });
  }
  console.log('');
}
