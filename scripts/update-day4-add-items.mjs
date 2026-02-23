import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🏖️  Setting up Day 4 with Alona Beach and The Lost Cow...\n');

// Get current Day 4
const { data: day4 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 4)
  .single();

console.log(`Current Day 4 has ${day4.items.length} items`);

// Create or find Alona Beach activity
let alonaBeachId = 'e8a9c5f0-3b4d-4e2a-9c7f-1a2b3c4d5e6f'; // Generate a new UUID

const { error: alonaError } = await supabase
  .from('wanderlog_activities')
  .upsert({
    id: alonaBeachId,
    trip_id: tripId,
    name: 'Alona Beach',
    type: 'activity',
    description: 'A stunning white sand beach known for its crystal-clear turquoise waters, vibrant marine life, and picturesque sunset views. Perfect for swimming, snorkeling, and relaxing by the shore.',
    city: 'Panglao',
    region: 'Bohol',
    country: 'Philippines'
  });

if (alonaError) {
  console.error('❌ Error creating Alona Beach:', alonaError);
} else {
  console.log('✅ Alona Beach activity created/updated');
}

// Add Alona Beach images
await supabase.from('wanderlog_images').delete().eq('activity_id', alonaBeachId);

const alonaImages = [
  {
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    alt: 'Alona Beach - White sand beach with turquoise waters'
  },
  {
    url: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&q=80',
    alt: 'Alona Beach - Crystal clear tropical waters and palm trees'
  },
  {
    url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
    alt: 'Alona Beach - Sunset views over the ocean'
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
}

console.log('✅ Alona Beach images added');

// Create or find The Lost Cow restaurant
let lostCowId = 'f9b0d6e1-4c5e-4f3a-0d8e-2b3c4d5e6f7a'; // Generate a new UUID

const { error: cowError } = await supabase
  .from('wanderlog_activities')
  .upsert({
    id: lostCowId,
    trip_id: tripId,
    name: 'The Lost Cow',
    type: 'dining',
    description: 'A cozy beachside restaurant serving fresh seafood, grilled specialties, and refreshing tropical drinks with stunning ocean views.',
    city: 'Panglao',
    region: 'Bohol',
    country: 'Philippines'
  });

if (cowError) {
  console.error('❌ Error creating The Lost Cow:', cowError);
} else {
  console.log('✅ The Lost Cow restaurant created/updated');
}

// Add The Lost Cow images
await supabase.from('wanderlog_images').delete().eq('activity_id', lostCowId);

const cowImages = [
  {
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    alt: 'The Lost Cow - Beachside dining with ocean views'
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    alt: 'The Lost Cow - Fresh grilled seafood and specialties'
  }
];

for (let i = 0; i < cowImages.length; i++) {
  const img = cowImages[i];
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: lostCowId,
    url: img.url,
    alt: img.alt,
    associated_section: 'dining',
    position: i + 1
  });
}

console.log('✅ The Lost Cow images added');

// Update Day 4 schedule
const updatedItems = [
  {
    id: alonaBeachId,
    name: 'Alona Beach',
    type: 'activity'
  },
  {
    id: lostCowId,
    name: 'The Lost Cow',
    type: 'dining'
  }
];

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: updatedItems })
  .eq('trip_id', tripId)
  .eq('day_number', 4);

if (updateError) {
  console.error('❌ Error updating Day 4:', updateError);
} else {
  console.log('\n✅ Day 4 updated with Alona Beach and The Lost Cow');
}

console.log('\nDay 4 now has:');
updatedItems.forEach(item => {
  console.log(`  - ${item.name} (${item.type})`);
});
