import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📸 Adding images to Pinspired Art Souvenirs (Day 10)...\n');

const pinspiredId = 'f51fa73c-8f39-4047-9411-2f2ae04bbe40';

// Delete any old images
await supabase.from('wanderlog_images').delete().eq('activity_id', pinspiredId);
console.log('✅ Deleted old images (if any)');

// Add new art gallery/souvenir shop images
const newImages = [
  {
    url: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800&q=80',
    alt: 'Colorful art gallery with local artwork and souvenirs'
  },
  {
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    alt: 'Handcrafted souvenirs and local artisan products'
  },
  {
    url: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&q=80',
    alt: 'Art studio with unique handmade gifts and crafts'
  }
];

console.log('\nAdding new images:');
for (let i = 0; i < newImages.length; i++) {
  const img = newImages[i];
  const { error } = await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: pinspiredId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });

  if (error) {
    console.error(`❌ Error: ${error.message}`);
  } else {
    console.log(`  ✅ ${img.alt}`);
  }
}

// Verify
const { data: images } = await supabase
  .from('wanderlog_images')
  .select('url, alt')
  .eq('activity_id', pinspiredId)
  .order('position');

console.log(`\n🔍 Verification - Pinspired now has ${images?.length || 0} images:`);
images?.forEach((img, idx) => {
  console.log(`  ${idx + 1}. ${img.alt}`);
});

console.log('\n✅ DONE! Pinspired Art Souvenirs images updated');
