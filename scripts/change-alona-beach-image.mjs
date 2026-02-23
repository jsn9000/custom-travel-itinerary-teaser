import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🏖️  Changing Alona Beach images...\n');

// Get ALL Alona Beach activities
const { data: allAlonaBeach } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Alona%');

console.log(`Found ${allAlonaBeach?.length || 0} Alona Beach activities\n`);

// New beach images - completely different from before
const newAlonaImages = [
  {
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
    alt: 'Alona Beach - Pristine white sand and crystal clear waters'
  },
  {
    url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80',
    alt: 'Alona Beach - Tropical paradise with turquoise water'
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    alt: 'Alona Beach - Stunning sunset views over the ocean'
  }
];

for (const act of allAlonaBeach || []) {
  console.log(`Updating: ${act.name} (ID: ${act.id})`);

  // Check current images
  const { data: oldImages } = await supabase
    .from('wanderlog_images')
    .select('alt')
    .eq('activity_id', act.id);

  console.log(`  Current images: ${oldImages?.length || 0}`);

  // DELETE all old images
  await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);
  console.log('  ✅ Deleted old images');

  // Add NEW images
  for (let i = 0; i < newAlonaImages.length; i++) {
    const img = newAlonaImages[i];
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: act.id,
      url: img.url,
      alt: img.alt,
      associated_section: 'activity',
      position: i + 1
    });
  }

  console.log(`  ✅ Added ${newAlonaImages.length} NEW beach images\n`);
}

// Verify
console.log('🔍 VERIFICATION:\n');
for (const act of allAlonaBeach || []) {
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

console.log('✅ DONE! Alona Beach images completely replaced');
