import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📸 Adding missing images...\n');

// Add Cebu Taoist Temple images
const taoistId = '40489ff6-d830-44b6-a4cd-657382c1a90f';
console.log('🏛️  Adding Cebu Taoist Temple images...');

const taoistImages = [
  {
    url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80',
    alt: 'Traditional Chinese temple with ornate architecture'
  },
  {
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
    alt: 'Taoist temple with red pillars and golden details'
  },
  {
    url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    alt: 'Asian temple with panoramic city views'
  }
];

for (let i = 0; i < taoistImages.length; i++) {
  const img = taoistImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: taoistId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ ${img.alt}`);
}

// Add more Oslob images (needs 1 more to have 3 total)
const oslobId = 'bba5ee6b-4b26-42f8-922f-7b89afef27a7';
console.log('\n🦈 Adding more Oslob Whale Shark images...');

const oslobImage = {
  url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80',
  alt: 'Whale shark swimming in blue ocean waters'
};

await supabase.from('wanderlog_images').insert({
  trip_id: tripId,
  activity_id: oslobId,
  url: oslobImage.url,
  alt: oslobImage.alt,
  associated_section: 'activity',
  position: 3
});
console.log(`  ✅ ${oslobImage.alt}`);

// Add more Kawasan Falls images (needs 1 more to have 3 total)
const kawasanId = '96d17381-b07c-4645-ab1e-ff909916fe42';
console.log('\n💧 Adding more Kawasan Falls images...');

const kawasanImage = {
  url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  alt: 'Turquoise waterfall pool in jungle setting'
};

await supabase.from('wanderlog_images').insert({
  trip_id: tripId,
  activity_id: kawasanId,
  url: kawasanImage.url,
  alt: kawasanImage.alt,
  associated_section: 'activity',
  position: 3
});
console.log(`  ✅ ${kawasanImage.alt}`);

// Add more Alona Beach images (needs 2 more to have 3 total)
const alonaId = 'a756ee83-5ce7-460b-a6cf-01c3567091c2';
console.log('\n🏖️  Adding more Alona Beach images...');

const alonaImages = [
  {
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    alt: 'White sand beach with crystal clear water'
  },
  {
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80',
    alt: 'Tropical beach paradise with palm trees'
  }
];

for (let i = 0; i < alonaImages.length; i++) {
  const img = alonaImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: alonaId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 2
  });
  console.log(`  ✅ ${img.alt}`);
}

console.log('\n✅ All missing images added!');
