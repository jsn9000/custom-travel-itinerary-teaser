import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('✅ Day 1 Final Verification\n');

// Get Day 1
const { data: day1 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 1)
  .single();

console.log('📋 Day 1 Schedule:');
console.log(`Date: ${day1.date || 'October 5'}`);
console.log(`Total items: ${day1.items.length}\n`);

day1.items.forEach((item, i) => {
  console.log(`${i + 1}. ${item.name}`);
  console.log(`   Type: ${item.type}`);
  console.log(`   ID: ${item.id}`);
  if (item.hours) console.log(`   Hours: ${item.hours}`);
  if (item.location) console.log(`   Location: ${item.location}`);
  console.log('');
});

// Check for images
console.log('🖼️  Checking for images...\n');

for (const item of day1.items) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', item.id);

  console.log(`${item.name}:`);
  console.log(`  Images: ${images?.length || 0}`);
  if (images && images.length > 0) {
    images.forEach((img, idx) => {
      console.log(`    ${idx + 1}. ${img.alt || 'No alt text'}`);
    });
  }
  console.log('');
}
