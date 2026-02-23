import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🎨 Finding and fixing ALL Pinspired activities...\n');

// Get ALL Pinspired activities
const { data: allPinspired } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Pinspired%');

console.log(`Found ${allPinspired?.length || 0} Pinspired activities\n`);

// Woman-centric gift shop images
const womanCentricImages = [
  {
    url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80',
    alt: 'Pinspired - Boutique gift shop with handmade crafts'
  },
  {
    url: 'https://images.unsplash.com/photo-1594834898355-6c3b8e4ef5dc?w=800&q=80',
    alt: 'Pinspired - Artistic gifts and jewelry display'
  },
  {
    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    alt: 'Pinspired - Colorful crafts and accessories shop'
  }
];

// Load user-provided image if available
let userImage = null;
try {
  const imagePath = '/Users/jsimpson/Downloads/pinspired.jpeg';
  const imageBuffer = readFileSync(imagePath);
  userImage = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
  console.log('✅ User-provided image loaded\n');
} catch (err) {
  console.log('⚠️  User image not available, using stock images only\n');
}

for (const act of allPinspired || []) {
  console.log(`${act.name} (ID: ${act.id})`);

  // Check current images
  const { data: currentImages } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', act.id);

  console.log(`  Current: ${currentImages?.length || 0} image(s)`);

  // Check if it has mens clothing or inappropriate images
  const hasMensClothing = currentImages?.some(img =>
    img.alt?.toLowerCase().includes('cloth') ||
    img.alt?.toLowerCase().includes('apparel') ||
    img.url?.includes('photo-1441986300917') || // gift shop
    img.url?.includes('photo-1472851294608') || // souvenir store
    img.url?.includes('photo-1524758631624') // artisan shop
  );

  // Delete old images
  await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);

  // If this is the Day 10 Pinspired and we have user image, use it
  if (act.id === 'f51fa73c-8f39-4047-9411-2f2ae04bbe40' && userImage) {
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: act.id,
      url: userImage,
      alt: 'Pinspired Art Souvenirs - Colorful local crafts and gifts',
      associated_section: 'activity',
      position: 1
    });
    console.log('  ✅ Added USER PROVIDED image (colorful gift shop)');
  } else {
    // Use woman-centric stock images for other Pinspired instances
    for (let i = 0; i < womanCentricImages.length; i++) {
      await supabase.from('wanderlog_images').insert({
        trip_id: tripId,
        activity_id: act.id,
        url: womanCentricImages[i].url,
        alt: womanCentricImages[i].alt,
        associated_section: 'activity',
        position: i + 1
      });
    }
    console.log('  ✅ Added woman-centric gift shop images');
  }
  console.log('');
}

console.log('✅ DONE! All Pinspired activities now have woman-centric images');
