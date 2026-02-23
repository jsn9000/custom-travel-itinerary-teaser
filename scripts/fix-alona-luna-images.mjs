import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔄 Fixing Alona Beach and Luna Tiger Spa images...\n');

const alonaBeachId = 'a756ee83-5ce7-460b-a6cf-01c3567091c2';
const lunaTigerId = 'b2c1edf2-624b-4552-98cf-befd2fd88603';

// Check for existing Wanderlog images first
console.log('🔍 Checking for Wanderlog images...');

const { data: alonaWanderlogs } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId)
  .eq('activity_id', alonaBeachId);

const { data: lunaWanderlogs } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId)
  .eq('activity_id', lunaTigerId);

console.log(`Alona Beach Wanderlog images: ${alonaWanderlogs?.length || 0}`);
console.log(`Luna Tiger Spa Wanderlog images: ${lunaWanderlogs?.length || 0}`);

// Delete old images
console.log('\n🗑️  Deleting old images...');
await supabase.from('wanderlog_images').delete().eq('activity_id', alonaBeachId);
await supabase.from('wanderlog_images').delete().eq('activity_id', lunaTigerId);
console.log('✅ Deleted old images\n');

// Add proper Alona Beach images (tropical beach in Bohol, Philippines)
console.log('🏖️  Adding Alona Beach images...');
const alonaImages = [
  {
    url: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800&q=80',
    alt: 'Alona Beach white sand and palm trees'
  },
  {
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    alt: 'Tropical beach with crystal clear turquoise water'
  },
  {
    url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
    alt: 'Paradise beach coastline in the Philippines'
  }
];

for (let i = 0; i < alonaImages.length; i++) {
  const img = alonaImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: alonaBeachId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ ${img.alt}`);
}

// Add proper Luna Tiger Spa images (spa and massage facility)
console.log('\n💆 Adding Luna Tiger Spa and Massage images...');
const spaImages = [
  {
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    alt: 'Spa massage with hot stones and candles'
  },
  {
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    alt: 'Relaxing spa atmosphere with aromatherapy'
  },
  {
    url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
    alt: 'Professional massage therapy treatment'
  }
];

for (let i = 0; i < spaImages.length; i++) {
  const img = spaImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: lunaTigerId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ ${img.alt}`);
}

console.log('\n✅ All images updated with appropriate photos!');
