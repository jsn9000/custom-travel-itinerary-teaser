import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🍽️  Changing Ground Zero Restaurant images...\n');

// Find Ground Zero Restaurant
const { data: groundZeroActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Ground Zero%');

console.log(`Found ${groundZeroActivities?.length || 0} Ground Zero activities\n`);

for (const act of groundZeroActivities || []) {
  console.log(`Updating: ${act.name} (ID: ${act.id})`);

  // Check current images
  const { data: oldImages } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', act.id);

  console.log(`  Current images: ${oldImages?.length || 0}`);
  oldImages?.forEach(img => {
    console.log(`    - ${img.alt}`);
  });

  // DELETE ALL old images
  await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);
  console.log('  ✅ Deleted all old images');

  // Add NEW restaurant images
  const newImages = [
    {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      alt: 'Modern restaurant interior with elegant dining atmosphere'
    },
    {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      alt: 'Upscale restaurant with contemporary design and lighting'
    },
    {
      url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
      alt: 'Stylish dining venue with sophisticated ambiance'
    }
  ];

  for (let i = 0; i < newImages.length; i++) {
    const img = newImages[i];
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: act.id,
      url: img.url,
      alt: img.alt,
      associated_section: 'dining',
      position: i + 1
    });
  }

  console.log(`  ✅ Added ${newImages.length} new restaurant images\n`);
}

// Verify
console.log('🔍 VERIFICATION:\n');
for (const act of groundZeroActivities || []) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', act.id)
    .order('position');

  console.log(`${act.name}: ${images?.length || 0} images`);
  images?.forEach((img, idx) => {
    console.log(`  ${idx + 1}. ${img.alt}`);
  });
  console.log('');
}

console.log('✅ DONE! Ground Zero Restaurant images replaced');
