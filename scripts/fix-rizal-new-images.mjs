import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔧 Fixing Rizal Boulevard with NEW images...\n');

// Get all Rizal activities
const { data: rizalActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Rizal%');

console.log(`Found ${rizalActivities?.length || 0} Rizal activities\n`);

// Delete ALL old images
console.log('🗑️  Deleting all old Rizal images...');
for (const act of rizalActivities || []) {
  await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);
  console.log(`  ✅ Deleted images for ${act.name}`);
}

console.log('\n📸 Adding NEW waterfront promenade images...\n');

// Add completely NEW waterfront images (different photo IDs)
const newBoulevardImages = [
  {
    url: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800&q=80',
    alt: 'Waterfront promenade with people walking at sunset'
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    alt: 'Seaside boulevard with pedestrians strolling'
  },
  {
    url: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&q=80',
    alt: 'Coastal walkway with people enjoying evening walk'
  }
];

for (const act of rizalActivities || []) {
  console.log(`Adding images for ${act.name}:`);

  for (let i = 0; i < newBoulevardImages.length; i++) {
    const img = newBoulevardImages[i];
    const { error } = await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: act.id,
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
  console.log('');
}

// Verify the changes
console.log('🔍 Verifying new images...\n');
for (const act of rizalActivities || []) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url, alt')
    .eq('activity_id', act.id)
    .order('position');

  console.log(`${act.name}:`);
  images?.forEach((img, idx) => {
    console.log(`  ${idx + 1}. ${img.alt}`);
    console.log(`     URL: ${img.url.substring(0, 60)}...`);
  });
  console.log('');
}

console.log('✅ DONE! Rizal Boulevard now has completely NEW waterfront promenade images');
