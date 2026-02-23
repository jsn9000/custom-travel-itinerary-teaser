import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔥 Fixing ALL instances of Ground Zero, Adamo, and Hayahay...\n');

// Get ALL Ground Zero Restaurant activities
console.log('📅 Ground Zero Restaurant - Finding all instances...');
const { data: allGroundZero } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Ground Zero%');

console.log(`Found ${allGroundZero?.length || 0} instances\n`);

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

for (const act of allGroundZero || []) {
  console.log(`  Updating: ${act.name} (ID: ${act.id})`);
  await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);

  for (let i = 0; i < groundZeroImages.length; i++) {
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: act.id,
      url: groundZeroImages[i].url,
      alt: groundZeroImages[i].alt,
      associated_section: 'dining',
      position: i + 1
    });
  }
  console.log(`    ✅ Updated with unique images`);
}

// Get ALL Adamo Dumaguete activities
console.log('\n📅 Adamo Dumaguete - Finding all instances...');
const { data: allAdamo } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Adamo%');

console.log(`Found ${allAdamo?.length || 0} instances\n`);

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

for (const act of allAdamo || []) {
  console.log(`  Updating: ${act.name} (ID: ${act.id})`);

  // Check if it has Wanderlog images
  const { data: existingImages } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', act.id);

  const hasWanderlogImages = existingImages?.some(img =>
    img.url?.includes('googleusercontent.com')
  );

  if (!hasWanderlogImages || existingImages.length === 0) {
    await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);

    for (let i = 0; i < adamoImages.length; i++) {
      await supabase.from('wanderlog_images').insert({
        trip_id: tripId,
        activity_id: act.id,
        url: adamoImages[i].url,
        alt: adamoImages[i].alt,
        associated_section: 'dining',
        position: i + 1
      });
    }
    console.log(`    ✅ Updated with unique images`);
  } else {
    console.log(`    ✅ Keeping Wanderlog images`);
  }
}

// Get ALL Hayahay Treehouse Bar activities
console.log('\n📅 Hayahay Treehouse Bar - Finding all instances...');
const { data: allHayahay } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Hayahay%');

console.log(`Found ${allHayahay?.length || 0} instances\n`);

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

for (const act of allHayahay || []) {
  console.log(`  Updating: ${act.name} (ID: ${act.id})`);
  await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);

  for (let i = 0; i < hayahayImages.length; i++) {
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: act.id,
      url: hayahayImages[i].url,
      alt: hayahayImages[i].alt,
      associated_section: 'dining',
      position: i + 1
    });
  }
  console.log(`    ✅ Updated with unique images`);
}

console.log('\n✅ DONE! All instances updated with unique images for each venue');
