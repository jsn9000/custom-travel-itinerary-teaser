import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📸 Adding user-provided Pinspired image...\n');

// Read the image file
const imagePath = '/Users/jsimpson/Downloads/pinspired.jpeg';
console.log(`Reading image from: ${imagePath}`);

const imageBuffer = readFileSync(imagePath);
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

console.log(`✅ Image loaded (${Math.round(imageBuffer.length / 1024)}KB)\n`);

// Find Day 10
const { data: day10 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 10)
  .single();

console.log(`📅 Day 10 (${day10.date}):`);
console.log(`Items: ${day10.items.length}\n`);

// Find Pinspired on Day 10
const pinspiredItem = day10.items.find(item =>
  item.name?.toLowerCase().includes('pinspired')
);

if (!pinspiredItem) {
  console.error('❌ No Pinspired found on Day 10!');
  process.exit(1);
}

console.log(`Found: ${pinspiredItem.name}`);
console.log(`ID: ${pinspiredItem.id}\n`);

// Delete old images for this specific Pinspired activity
await supabase.from('wanderlog_images').delete().eq('activity_id', pinspiredItem.id);
console.log('✅ Deleted old images');

// Add the user-provided image
const { error } = await supabase.from('wanderlog_images').insert({
  trip_id: tripId,
  activity_id: pinspiredItem.id,
  url: base64Image,
  alt: 'Pinspired Art Souvenirs - Colorful gift shop with local artwork and crafts',
  associated_section: 'activity',
  position: 1
});

if (error) {
  console.error('❌ Error adding image:', error);
  process.exit(1);
}

console.log('✅ User-provided Pinspired image added to Day 10\n');

// Verify
const { data: verifyImages } = await supabase
  .from('wanderlog_images')
  .select('url, alt')
  .eq('activity_id', pinspiredItem.id);

console.log('🔍 VERIFICATION:');
console.log(`Pinspired on Day 10 now has ${verifyImages?.length || 0} image(s):`);
verifyImages?.forEach((img, idx) => {
  const urlPreview = img.url.startsWith('data:')
    ? 'data:image/jpeg;base64,...[USER PROVIDED IMAGE]'
    : img.url.substring(0, 60);
  console.log(`  ${idx + 1}. ${img.alt}`);
  console.log(`     ${urlPreview}`);
});

console.log('\n✅ DONE! User image successfully added to Day 10 Pinspired');
