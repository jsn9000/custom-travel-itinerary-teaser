import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking Day 2 current state...\n');

// Get Day 2 data
const { data: day2, error: day2Error } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 2)
  .single();

if (day2Error) {
  console.error('Error:', day2Error);
  process.exit(1);
}

console.log('Current Day 2 items:');
day2.items.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name} (${item.type})`);
});

// Get Oslob activity
const { data: oslob } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Oslob Whale Shark Watching')
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

console.log('\n🔄 Updating Day 2 to ONLY have Oslob...');

// Update Day 2 to ONLY have Oslob
const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: [{
      id: oslob.id,
      name: oslob.name,
      type: 'activity',
      description: oslob.description
    }]
  })
  .eq('trip_id', tripId)
  .eq('day_number', 2);

if (updateError) {
  console.error('Update error:', updateError);
  process.exit(1);
}

console.log('✅ Day 2 updated - now has ONLY Oslob Whale Shark Watching');

// Check images for Oslob
console.log('\n🖼️  Checking Oslob images...');
const { data: oslobImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId)
  .eq('activity_id', oslob.id);

console.log(`Found ${oslobImages?.length || 0} images for Oslob`);
if (oslobImages && oslobImages.length > 0) {
  oslobImages.forEach((img, i) => {
    console.log(`  ${i + 1}. ${img.alt || 'No alt text'} - URL starts with: ${img.url.substring(0, 50)}...`);
  });
}

console.log('\n✅ DONE! Day 2 now has only Oslob Whale Shark Watching');
