import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔥 REPLACING PINSPIRED IMAGES NOW...\n');

// Get ALL Pinspired activities
const { data: pinspiredActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Pinspired%');

console.log(`Found ${pinspiredActivities?.length || 0} Pinspired activities\n`);

for (const act of pinspiredActivities || []) {
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

  // Add COMPLETELY NEW images - gift shop/souvenir store theme
  const newImages = [
    {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      alt: 'Gift shop interior with curated local products'
    },
    {
      url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
      alt: 'Souvenir store displaying handcrafted items'
    },
    {
      url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
      alt: 'Artisan shop with unique Filipino crafts'
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

  console.log(`  ✅ Added ${newImages.length} COMPLETELY NEW images\n`);
}

// Verify
console.log('🔍 VERIFICATION:\n');
for (const act of pinspiredActivities || []) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', act.id)
    .order('position');

  console.log(`${act.name}: ${images?.length || 0} images`);
  images?.forEach((img, idx) => {
    console.log(`  ${idx + 1}. ${img.alt}`);
    console.log(`     URL: ${img.url.substring(0, 70)}...`);
  });
  console.log('');
}

console.log('✅ DONE! Pinspired images COMPLETELY replaced');
