import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📸 Changing Hayahay Treehouse Bar images...\n');

// Find Hayahay Treehouse Bar activities
const { data: hayahayActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Hayahay%');

console.log(`Found ${hayahayActivities?.length || 0} Hayahay activities`);

for (const act of hayahayActivities || []) {
  console.log(`\nUpdating: ${act.name}`);

  // Delete old images
  await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);
  console.log('  ✅ Deleted old images');

  // Add NEW treehouse bar images
  const newImages = [
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      alt: 'Treehouse bar with ocean sunset views'
    },
    {
      url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
      alt: 'Elevated viewpoint bar overlooking tropical scenery'
    },
    {
      url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80',
      alt: 'Tropical bar deck with panoramic island views'
    }
  ];

  for (let i = 0; i < newImages.length; i++) {
    const img = newImages[i];
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: act.id,
      url: img.url,
      alt: img.alt,
      associated_section: 'activity',
      position: i + 1
    });
  }

  console.log(`  ✅ Added ${newImages.length} new images`);
}

console.log('\n📸 Changing Pinspired Art Souvenirs images...\n');

// Find Pinspired Art Souvenirs (the specific one used on Day 10)
const pinspiredId = 'f51fa73c-8f39-4047-9411-2f2ae04bbe40';

// Delete old images
await supabase.from('wanderlog_images').delete().eq('activity_id', pinspiredId);
console.log('✅ Deleted old Pinspired images');

// Add COMPLETELY DIFFERENT images - using gift shop/craft store themes
const newPinspiredImages = [
  {
    url: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=800&q=80',
    alt: 'Local craft store with colorful handmade items'
  },
  {
    url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80',
    alt: 'Artisan gift shop with unique souvenirs'
  },
  {
    url: 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=800&q=80',
    alt: 'Boutique shop displaying local artwork and crafts'
  }
];

for (let i = 0; i < newPinspiredImages.length; i++) {
  const img = newPinspiredImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: pinspiredId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
}

console.log(`✅ Added ${newPinspiredImages.length} completely new Pinspired images`);

// Verify
console.log('\n🔍 Verifying changes...\n');

for (const act of hayahayActivities || []) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', act.id)
    .order('position');

  console.log(`${act.name}: ${images?.length || 0} images`);
  images?.forEach((img, idx) => {
    console.log(`  ${idx + 1}. ${img.alt}`);
  });
}

const { data: pinspiredImages } = await supabase
  .from('wanderlog_images')
  .select('url, alt')
  .eq('activity_id', pinspiredId)
  .order('position');

console.log(`\nPinspired Art Souvenirs: ${pinspiredImages?.length || 0} images`);
pinspiredImages?.forEach((img, idx) => {
  console.log(`  ${idx + 1}. ${img.alt}`);
});

console.log('\n✅ DONE! All images updated');
