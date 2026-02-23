import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🗑️  DELETING YELLOW VAN AND MOUNTAIN IMAGES FOREVER...\n');

// Find all images with yellow van / desert / mountain / road URLs
const { data: allImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId);

console.log(`Found ${allImages?.length || 0} total images in database\n`);

// Keywords that indicate yellow van / desert / mountain images
const badKeywords = [
  'photo-1476514525535',
  'photo-1591695998773',
  'photo-1548013146',
  'photo-1535620636271',
  'photo-1580837119756',
  'photo-1558862107',
  'photo-1551871812',
  'photo-1566574966039',
  'photo-1546026423',
  'photo-1437622368342',
  'photo-1520454974749',
  'photo-1559827260'
];

let deletedCount = 0;

for (const img of allImages || []) {
  // Check if this image URL contains any bad keywords
  const isBadImage = badKeywords.some(keyword => img.url.includes(keyword));

  if (isBadImage) {
    console.log(`🗑️  Deleting: ${img.url.substring(0, 80)}...`);
    const { error } = await supabase
      .from('wanderlog_images')
      .delete()
      .eq('id', img.id);

    if (!error) {
      deletedCount++;
    }
  }
}

console.log(`\n✅ Deleted ${deletedCount} bad images\n`);

// Now add proper images for Luna Tiger Spa
const lunaTigerId = 'b2c1edf2-624b-4552-98cf-befd2fd88603';

console.log('💆 Adding PROPER massage images for Luna Tiger Spa...');

const massageImages = [
  {
    url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
    alt: 'Professional massage therapy session'
  },
  {
    url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
    alt: 'Spa massage treatment with aromatherapy oils'
  },
  {
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    alt: 'Relaxing massage with hot stones'
  }
];

for (let i = 0; i < massageImages.length; i++) {
  const img = massageImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: lunaTigerId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ ${img.alt}`);
}

console.log('\n✅ YELLOW VAN DELETED FOREVER. MASSAGE IMAGES ADDED.');
