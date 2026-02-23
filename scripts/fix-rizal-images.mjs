import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔧 Fixing Rizal Boulevard images...\n');

// Get all Rizal activities
const { data: rizalActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Rizal%');

console.log(`Found ${rizalActivities?.length || 0} Rizal activities\n`);

// Delete ALL images for all Rizal activities
console.log('🗑️  Deleting all old Rizal images...');
for (const act of rizalActivities || []) {
  await supabase.from('wanderlog_images').delete().eq('activity_id', act.id);
  console.log(`  ✅ Deleted images for ${act.name}`);
}

console.log('\n📸 Adding NEW boulevard/promenade images...\n');

// Add proper boulevard images to each Rizal activity
const boulevardImages = [
  {
    url: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=80',
    alt: 'Rizal Boulevard - People walking along waterfront promenade'
  },
  {
    url: 'https://images.unsplash.com/photo-1568711409621-7477a0af1cab?w=800&q=80',
    alt: 'Rizal Boulevard - Seaside walkway with sunset views'
  },
  {
    url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&q=80',
    alt: 'Rizal Boulevard - Waterfront promenade with people strolling'
  }
];

for (const act of rizalActivities || []) {
  console.log(`Adding images for ${act.name}:`);

  for (let i = 0; i < boulevardImages.length; i++) {
    const img = boulevardImages[i];
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

console.log('✅ DONE! Rizal Boulevard now has proper walkway/promenade images');
