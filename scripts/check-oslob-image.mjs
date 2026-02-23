import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Checking Oslob Whale Shark Watching image setup...\n');

// 1. Get Oslob activity
const { data: oslob, error: oslobError } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Oslob Whale Shark Watching')
  .single();

if (oslobError) {
  console.error('Error finding Oslob:', oslobError);
  process.exit(1);
}

console.log('✅ Found Oslob activity:');
console.log(`   ID: ${oslob.id}`);
console.log(`   Name: ${oslob.name}`);
console.log(`   Description: ${oslob.description.substring(0, 100)}...`);

// 2. Check images associated with this activity
console.log('\n📸 Checking images in wanderlog_images table...');
const { data: images, error: imgError } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId)
  .eq('activity_id', oslob.id);

if (imgError) {
  console.error('Error fetching images:', imgError);
} else if (!images || images.length === 0) {
  console.log('❌ NO IMAGES found for Oslob activity');
} else {
  console.log(`✅ Found ${images.length} image(s):`);
  images.forEach((img, i) => {
    console.log(`\n   Image ${i + 1}:`);
    console.log(`   - ID: ${img.id}`);
    console.log(`   - Alt: ${img.alt}`);
    console.log(`   - Caption: ${img.caption}`);
    console.log(`   - Section: ${img.associated_section}`);
    console.log(`   - Position: ${img.position}`);
    console.log(`   - URL type: ${img.url.substring(0, 30)}...`);
    console.log(`   - Created: ${img.created_at}`);
  });
}

// 3. Check if activity has images field
console.log('\n🔍 Checking if activity record has images array...');
if (oslob.images) {
  console.log(`✅ Activity has images field with ${oslob.images.length} image(s)`);
  oslob.images.forEach((img, i) => {
    console.log(`   ${i + 1}. URL: ${img.url?.substring(0, 50)}...`);
  });
} else {
  console.log('❌ Activity record does NOT have images field');
}

// 4. Check Day 2 to see what it references
console.log('\n📅 Checking Day 2 schedule...');
const { data: day2 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 2)
  .single();

console.log(`Day 2 has ${day2.items.length} item(s):`);
day2.items.forEach((item, i) => {
  console.log(`\n   ${i + 1}. ${item.name}`);
  console.log(`      - ID: ${item.id}`);
  console.log(`      - Type: ${item.type}`);
  if (item.images) {
    console.log(`      - Has images in item: ${item.images.length}`);
  } else {
    console.log(`      - No images field in item`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`Oslob activity ID: ${oslob.id}`);
console.log(`Images in wanderlog_images table: ${images?.length || 0}`);
console.log(`Images in activity record: ${oslob.images?.length || 0}`);
console.log(`Day 2 items: ${day2.items.length}`);
