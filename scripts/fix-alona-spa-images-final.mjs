import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

const alonaBeachId = 'a756ee83-5ce7-460b-a6cf-01c3567091c2';
const lunaTigerId = 'b2c1edf2-624b-4552-98cf-befd2fd88603';

console.log('🗑️  DELETING ALL OLD IMAGES FOR ALONA BEACH AND LUNA TIGER SPA...\n');

// Delete ALL images for both activities
await supabase.from('wanderlog_images').delete().eq('activity_id', alonaBeachId);
await supabase.from('wanderlog_images').delete().eq('activity_id', lunaTigerId);

console.log('✅ All old images deleted\n');

// Add UNIQUE Alona Beach images (TROPICAL BEACH ONLY)
console.log('🏖️  Adding NEW Alona Beach images (BEACH ONLY)...');

const alonaImages = [
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    alt: 'Alona Beach - Tropical white sand beach with blue water'
  },
  {
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    alt: 'Alona Beach - Crystal clear turquoise ocean water'
  },
  {
    url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80',
    alt: 'Alona Beach - Paradise beach with palm trees and sand'
  }
];

for (let i = 0; i < alonaImages.length; i++) {
  const img = alonaImages[i];
  const { error } = await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: alonaBeachId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });

  if (error) {
    console.error(`  ❌ Error: ${error.message}`);
  } else {
    console.log(`  ✅ ${img.alt}`);
  }
}

// Add UNIQUE Luna Tiger Spa images (MASSAGE/SPA ONLY)
console.log('\n💆 Adding NEW Luna Tiger Spa images (MASSAGE ONLY)...');

const spaImages = [
  {
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    alt: 'Luna Tiger Spa - Hot stone massage therapy'
  },
  {
    url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
    alt: 'Luna Tiger Spa - Professional massage with aromatherapy oils'
  },
  {
    url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
    alt: 'Luna Tiger Spa - Relaxing spa treatment and wellness'
  }
];

for (let i = 0; i < spaImages.length; i++) {
  const img = spaImages[i];
  const { error } = await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: lunaTigerId,
    url: img.url,
    alt: img.alt,
    associated_section: 'activity',
    position: i + 1
  });

  if (error) {
    console.error(`  ❌ Error: ${error.message}`);
  } else {
    console.log(`  ✅ ${img.alt}`);
  }
}

console.log('\n✅ DONE! NEW IMAGES ADDED.\n');

// Verify what's actually in database now
console.log('🔍 VERIFYING DATABASE CONTENTS:\n');

const { data: alonaCheck } = await supabase
  .from('wanderlog_images')
  .select('url, alt')
  .eq('activity_id', alonaBeachId)
  .order('position');

const { data: spaCheck } = await supabase
  .from('wanderlog_images')
  .select('url, alt')
  .eq('activity_id', lunaTigerId)
  .order('position');

console.log('Alona Beach images in database:');
alonaCheck?.forEach((img, i) => {
  console.log(`  ${i + 1}. ${img.alt}`);
  console.log(`     URL: ${img.url.substring(0, 80)}...`);
});

console.log('\nLuna Tiger Spa images in database:');
spaCheck?.forEach((img, i) => {
  console.log(`  ${i + 1}. ${img.alt}`);
  console.log(`     URL: ${img.url.substring(0, 80)}...`);
});
