import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔄 Completely replacing images with NEW URLs...\n');

const taoistTempleId = '40489ff6-d830-44b6-a4cd-657382c1a90f';
const oslobId = '9dd86c1e-e5b0-405c-872d-9769edb30991';

// DELETE ALL old images
console.log('🗑️  Deleting ALL old images...');
await supabase.from('wanderlog_images').delete().eq('activity_id', taoistTempleId);
await supabase.from('wanderlog_images').delete().eq('activity_id', oslobId);
console.log('✅ Deleted\n');

// Add COMPLETELY NEW Cebu Taoist Temple images (different URLs)
console.log('📸 Adding NEW Cebu Taoist Temple images...');
const taoistImages = [
  {
    url: 'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=800',
    alt: 'Chinese temple with red pillars and golden roof'
  },
  {
    url: 'https://images.unsplash.com/photo-1558862107-d49ef2a04d72?w=800',
    alt: 'Traditional Asian temple architecture'
  },
  {
    url: 'https://images.unsplash.com/photo-1551871812-10ecc21ffa2f?w=800',
    alt: 'Temple with mountain views'
  }
];

for (let i = 0; i < taoistImages.length; i++) {
  const img = taoistImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: taoistTempleId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ ${img.alt}`);
}

// Add COMPLETELY NEW Oslob Whale Shark images (different URLs)
console.log('\n📸 Adding NEW Oslob Whale Shark images...');
const oslobImages = [
  {
    url: 'https://images.unsplash.com/photo-1566574966039-6c9e3c8c4b3c?w=800',
    alt: 'Whale shark underwater closeup'
  },
  {
    url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800',
    alt: 'Snorkeling with whale sharks'
  },
  {
    url: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800',
    alt: 'Ocean wildlife experience'
  }
];

for (let i = 0; i < oslobImages.length; i++) {
  const img = oslobImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: oslobId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ ${img.alt}`);
}

console.log('\n✅ Complete! All images replaced with NEW URLs');
