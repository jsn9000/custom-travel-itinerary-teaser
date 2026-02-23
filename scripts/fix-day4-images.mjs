import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📸 Adding images for Day 4 activities...\n');

// Alona Beach
const alonaBeachId = 'a756ee83-5ce7-460b-a6cf-01c3567091c2';
console.log('🏖️  Adding Alona Beach images...');

const beachImages = [
  {
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    alt: 'Alona Beach white sand and turquoise water'
  },
  {
    url: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800&q=80',
    alt: 'Tropical beach paradise with palm trees'
  },
  {
    url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
    alt: 'Crystal clear beach water and coastline'
  }
];

for (let i = 0; i < beachImages.length; i++) {
  const img = beachImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: alonaBeachId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ Added: ${img.alt}`);
}

// Luna Tiger Spa and Massage
const spaId = 'b2c1edf2-624b-4552-98cf-befd2fd88603';
console.log('\n💆 Adding Luna Tiger Spa images...');

const spaImages = [
  {
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    alt: 'Relaxing spa treatment with massage stones'
  },
  {
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    alt: 'Tranquil spa atmosphere with candles'
  },
  {
    url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
    alt: 'Professional massage therapy session'
  }
];

for (let i = 0; i < spaImages.length; i++) {
  const img = spaImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: spaId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ Added: ${img.alt}`);
}

// Bready to Go 24/7 Open
const breadyId = '31305d0f-3db4-4e22-a24e-3f2e32ff380d';
console.log('\n🍞 Adding Bready to Go images...');

const bakeryImages = [
  {
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    alt: 'Fresh bread and pastries at bakery'
  },
  {
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    alt: 'Artisan bakery with baked goods'
  },
  {
    url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80',
    alt: 'Cozy bakery cafe interior'
  }
];

for (let i = 0; i < bakeryImages.length; i++) {
  const img = bakeryImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: breadyId,
    url: img.url,
    alt: img.alt,
    associated_section: 'dining',
    position: i + 1
  });
  console.log(`  ✅ Added: ${img.alt}`);
}

console.log('\n✅ All Day 4 images added!');
