import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🍽️  Creating The Lost Cow activity...\n');

const lostCowId = 'f9b0d6e1-4c5e-4f3a-0d8e-2b3c4d5e6f7a';

// Create the activity
const { error: activityError } = await supabase
  .from('wanderlog_activities')
  .upsert({
    id: lostCowId,
    trip_id: tripId,
    name: 'The Lost Cow',
    type: 'dining',
    description: 'A cozy beachside restaurant serving fresh seafood, grilled specialties, and refreshing tropical drinks with stunning ocean views.'
  });

if (activityError) {
  console.error(`❌ Error creating activity: ${activityError.message}`);
} else {
  console.log('✅ Activity created\n');
}

// Add images
console.log('Adding images...');

const lostCowImages = [
  {
    url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
    alt: 'The Lost Cow - Beachfront restaurant with fresh seafood'
  },
  {
    url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80',
    alt: 'The Lost Cow - Grilled dishes with ocean view'
  },
  {
    url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
    alt: 'The Lost Cow - Tropical dining experience'
  }
];

for (let i = 0; i < lostCowImages.length; i++) {
  const { error } = await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: lostCowId,
    url: lostCowImages[i].url,
    alt: lostCowImages[i].alt,
    associated_section: 'dining',
    position: i + 1
  });

  if (error) {
    console.error(`❌ Error: ${error.message}`);
  } else {
    console.log(`  ✅ ${lostCowImages[i].alt}`);
  }
}

// Verify
const { data: verifyImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('activity_id', lostCowId);

console.log(`\n🔍 Verification: The Lost Cow now has ${verifyImages?.length || 0} images`);

console.log('\n✅ DONE! The Lost Cow created with images');
