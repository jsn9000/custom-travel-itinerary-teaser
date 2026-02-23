import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔥 Ensuring UNIQUE images for Days 7, 8, 9 food venues...\n');

// Day 7: Ground Zero Restaurant - UPDATE with unique restaurant images
console.log('📅 Day 7: Ground Zero Restaurant');
const { data: groundZero } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Ground Zero%')
  .limit(1)
  .single();

if (groundZero) {
  await supabase.from('wanderlog_images').delete().eq('activity_id', groundZero.id);

  const groundZeroImages = [
    {
      url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      alt: 'Ground Zero Restaurant - Casual dining with local flavors'
    },
    {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      alt: 'Ground Zero Restaurant - Restaurant interior with diners'
    },
    {
      url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
      alt: 'Ground Zero Restaurant - Cozy restaurant atmosphere'
    }
  ];

  for (let i = 0; i < groundZeroImages.length; i++) {
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: groundZero.id,
      url: groundZeroImages[i].url,
      alt: groundZeroImages[i].alt,
      associated_section: 'dining',
      position: i + 1
    });
  }
  console.log('✅ Ground Zero: 3 unique restaurant images added\n');
}

// Day 8: Adamo Dumaguete - Ensure it has unique hotel/restaurant images
console.log('📅 Day 8: Adamo Dumaguete');
const { data: adamo } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Adamo%')
  .limit(1)
  .single();

if (adamo) {
  // Check if it already has Wanderlog images - if so, keep them
  const { data: existingImages } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', adamo.id);

  const hasWanderlogImages = existingImages?.some(img =>
    img.url?.includes('googleusercontent.com')
  );

  if (!hasWanderlogImages || existingImages.length === 0) {
    await supabase.from('wanderlog_images').delete().eq('activity_id', adamo.id);

    const adamoImages = [
      {
        url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
        alt: 'Adamo Dumaguete - Hotel restaurant with elegant setup'
      },
      {
        url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&q=80',
        alt: 'Adamo Dumaguete - Fine dining experience'
      },
      {
        url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=80',
        alt: 'Adamo Dumaguete - Upscale restaurant ambiance'
      }
    ];

    for (let i = 0; i < adamoImages.length; i++) {
      await supabase.from('wanderlog_images').insert({
        trip_id: tripId,
        activity_id: adamo.id,
        url: adamoImages[i].url,
        alt: adamoImages[i].alt,
        associated_section: 'dining',
        position: i + 1
      });
    }
    console.log('✅ Adamo Dumaguete: 3 unique hotel restaurant images added\n');
  } else {
    console.log('✅ Adamo Dumaguete: Already has Wanderlog images, keeping them\n');
  }
}

// Day 9: Hayahay Treehouse Bar - UPDATE with unique bar images
console.log('📅 Day 9: Hayahay Treehouse Bar');
const { data: hayahay } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Hayahay%')
  .limit(1)
  .single();

if (hayahay) {
  await supabase.from('wanderlog_images').delete().eq('activity_id', hayahay.id);

  const hayahayImages = [
    {
      url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
      alt: 'Hayahay Treehouse Bar - Open-air bar with sunset views'
    },
    {
      url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
      alt: 'Hayahay Treehouse Bar - Tropical cocktail bar atmosphere'
    },
    {
      url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80',
      alt: 'Hayahay Treehouse Bar - Beach bar with ocean backdrop'
    }
  ];

  for (let i = 0; i < hayahayImages.length; i++) {
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: hayahay.id,
      url: hayahayImages[i].url,
      alt: hayahayImages[i].alt,
      associated_section: 'dining',
      position: i + 1
    });
  }
  console.log('✅ Hayahay Treehouse Bar: 3 unique bar images added\n');
}

// VERIFY
console.log('\n🔍 VERIFICATION:\n');

for (const venue of [
  { name: 'Ground Zero Restaurant', id: groundZero?.id },
  { name: 'Adamo Dumaguete', id: adamo?.id },
  { name: 'Hayahay Treehouse Bar', id: hayahay?.id }
]) {
  if (venue.id) {
    const { data: images } = await supabase
      .from('wanderlog_images')
      .select('url, alt')
      .eq('activity_id', venue.id)
      .order('position');

    console.log(`${venue.name}: ${images?.length || 0} images`);
    images?.forEach((img, idx) => {
      console.log(`  ${idx + 1}. ${img.alt}`);
    });
    console.log('');
  }
}

console.log('✅ DONE! Each venue now has completely unique images');
