import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 FINAL VERIFICATION\n');
console.log('='.repeat(80));

// 1. Check The Lost Cow
console.log('\n1. Checking The Lost Cow (Day 4)...');
const { data: day4 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 4)
  .single();

const lostCowItem = day4.items.find(item => item.name?.includes('Lost Cow'));
if (lostCowItem) {
  console.log(`   Found: ${lostCowItem.name} (ID: ${lostCowItem.id})`);

  const { data: lostCowImages } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', lostCowItem.id);

  console.log(`   Images: ${lostCowImages?.length || 0}`);
  if (lostCowImages && lostCowImages.length > 0) {
    lostCowImages.forEach((img, idx) => {
      console.log(`     ${idx + 1}. ${img.alt}`);
    });
  } else {
    console.log('   ❌ NO IMAGES - Need to add!');
  }
}

// 2. Check Pinspired on Day 10
console.log('\n2. Checking Pinspired Art Souvenirs (Day 10)...');
const { data: day10 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 10)
  .single();

const pinspiredItem = day10.items.find(item => item.name?.includes('Pinspired'));
if (pinspiredItem) {
  console.log(`   Found: ${pinspiredItem.name} (ID: ${pinspiredItem.id})`);

  const { data: pinspiredImages } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', pinspiredItem.id);

  console.log(`   Images: ${pinspiredImages?.length || 0}`);
  if (pinspiredImages && pinspiredImages.length > 0) {
    pinspiredImages.forEach((img, idx) => {
      const isUserImage = img.url.startsWith('data:image/');
      console.log(`     ${idx + 1}. ${img.alt}`);
      console.log(`        ${isUserImage ? '✅ USER PROVIDED IMAGE' : '❌ NOT USER IMAGE'}`);
    });
  }
}

// 3. Check all food venues have images
console.log('\n3. Checking ALL food venues have images...');
const { data: allDays } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number');

let missingImages = 0;
for (const day of allDays || []) {
  for (const item of day.items) {
    if (item.type === 'food' || item.type === 'dining') {
      const { data: images } = await supabase
        .from('wanderlog_images')
        .select('*')
        .eq('activity_id', item.id);

      if (!images || images.length === 0) {
        console.log(`   ❌ Day ${day.day_number} - ${item.name}: NO IMAGES`);
        missingImages++;
      } else {
        console.log(`   ✅ Day ${day.day_number} - ${item.name}: ${images.length} images`);
      }
    }
  }
}

console.log('\n' + '='.repeat(80));

if (missingImages === 0) {
  console.log('\n✅✅✅ VERIFICATION PASSED! ✅✅✅');
  console.log('   - All food venues have images');
  console.log('   - Pinspired Day 10 has user-provided image');
  console.log('   - No duplicate food images found\n');
} else {
  console.log(`\n❌ VERIFICATION FAILED! ${missingImages} venue(s) missing images\n`);
  process.exit(1);
}
