import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔧 Fixing images for Day 1 and Day 2...\n');

// Fix Cebu Taoist Temple (Day 1) - ID from Day 1 schedule
const taoistTempleId = '40489ff6-d830-44b6-a4cd-657382c1a90f';

// Fix Oslob Whale Shark Watching (Day 2) - ID from Day 2 schedule
const oslobId = '9dd86c1e-e5b0-405c-872d-9769edb30991';

// Delete old images for both
console.log('🗑️  Deleting old images...');
await supabase.from('wanderlog_images').delete().eq('activity_id', taoistTempleId);
await supabase.from('wanderlog_images').delete().eq('activity_id', oslobId);
console.log('✅ Deleted old images\n');

// Add proper Cebu Taoist Temple images
console.log('📸 Adding Cebu Taoist Temple images...');
const taoistImages = [
  {
    url: 'https://images.unsplash.com/photo-1591695998773-4ff5e5c29d4e?w=800',
    alt: 'Cebu Taoist Temple - Traditional Chinese temple architecture'
  },
  {
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    alt: 'Cebu Taoist Temple - Ornate temple details'
  },
  {
    url: 'https://images.unsplash.com/photo-1535620636271-24c1e3e543c5?w=800',
    alt: 'Cebu Taoist Temple - Panoramic city views'
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
  console.log(`  ✅ Added image ${i + 1}`);
}

// Add proper Oslob Whale Shark images
console.log('\n📸 Adding Oslob Whale Shark Watching images...');
const oslobImages = [
  {
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    alt: 'Whale shark swimming underwater - Oslob'
  },
  {
    url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
    alt: 'Swimming with whale sharks in crystal clear waters'
  },
  {
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    alt: 'Majestic whale shark in the ocean'
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
  console.log(`  ✅ Added image ${i + 1}`);
}

console.log('\n✅ Done! Images updated for both activities.');
