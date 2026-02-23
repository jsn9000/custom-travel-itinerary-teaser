import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🎨 Replacing Pinspired Day 10 with woman-centric gift shop image...\n');

const pinspiredId = 'f51fa73c-8f39-4047-9411-2f2ae04bbe40';

// Delete old images
await supabase.from('wanderlog_images').delete().eq('activity_id', pinspiredId);
console.log('✅ Deleted old images');

// Try to read the user-provided image first
let imageAdded = false;
const imagePath = '/Users/jsimpson/Downloads/pinspired.jpeg';

try {
  const imageBuffer = readFileSync(imagePath);
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  const { error } = await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: pinspiredId,
    url: base64Image,
    alt: 'Pinspired Art Souvenirs - Colorful local crafts and gifts',
    associated_section: 'activity',
    position: 1
  });

  if (!error) {
    console.log('✅ Added user-provided image (colorful gift shop interior)');
    imageAdded = true;
  }
} catch (err) {
  console.log('⚠️  User image not available, using woman-centric stock image');
}

// If user image not available, use woman-centric stock image
if (!imageAdded) {
  const womansImage = {
    url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80',
    alt: 'Pinspired Art Souvenirs - Boutique gift shop with handmade crafts and jewelry'
  };

  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: pinspiredId,
    url: womansImage.url,
    alt: womansImage.alt,
    associated_section: 'activity',
    position: 1
  });

  console.log('✅ Added woman-centric gift shop image');
}

// Verify
const { data: verify } = await supabase
  .from('wanderlog_images')
  .select('url, alt')
  .eq('activity_id', pinspiredId);

console.log(`\n🔍 Verification: ${verify?.length || 0} image(s)`);
verify?.forEach((img, idx) => {
  const preview = img.url.startsWith('data:')
    ? '✅ USER PROVIDED IMAGE (colorful gift shop)'
    : img.url.substring(0, 80);
  console.log(`  ${idx + 1}. ${img.alt}`);
  console.log(`     ${preview}`);
});

console.log('\n✅ DONE! Pinspired Day 10 now has woman-centric image');
