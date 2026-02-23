import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔄 Resetting Day 2 Oslob Whale Shark Watching...\n');

// Step 1: Clear Day 2 completely
console.log('🗑️  Clearing Day 2...');
await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: [] })
  .eq('trip_id', tripId)
  .eq('day_number', 2);
console.log('✅ Day 2 cleared\n');

// Step 2: Find or create Oslob activity with FRESH ID
console.log('🔍 Creating new Oslob Whale Shark Watching activity...');

// Delete any existing Oslob activities to start fresh
await supabase
  .from('wanderlog_activities')
  .delete()
  .eq('trip_id', tripId)
  .ilike('name', '%Oslob%Whale%Shark%');

// Create fresh activity
const { data: newActivity, error: createError } = await supabase
  .from('wanderlog_activities')
  .insert({
    trip_id: tripId,
    name: 'Oslob Whale Shark Watching',
    description: 'Experience swimming with gentle giants in their natural habitat. Oslob is world-famous for whale shark encounters where you can snorkel alongside these magnificent creatures in crystal-clear waters.',
    address: 'Oslob, Cebu',
    rating: 4.8,
    hours: 'Best time: 6:00 AM - 12:00 PM'
  })
  .select()
  .single();

if (createError) {
  console.error('❌ Error creating activity:', createError);
  process.exit(1);
}

console.log(`✅ Created activity: ${newActivity.name} (ID: ${newActivity.id})\n`);

// Step 3: Add proper whale shark images
console.log('📸 Adding whale shark images...');

const whaleSharkImages = [
  {
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    alt: 'Whale shark swimming underwater in blue ocean'
  },
  {
    url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80',
    alt: 'Snorkeler near whale shark in clear water'
  },
  {
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    alt: 'Majestic whale shark in tropical ocean'
  }
];

for (let i = 0; i < whaleSharkImages.length; i++) {
  const img = whaleSharkImages[i];
  const { error: imgError } = await supabase
    .from('wanderlog_images')
    .insert({
      trip_id: tripId,
      activity_id: newActivity.id,
      url: img.url,
      alt: img.alt,
      associated_section: 'activity',
      position: i + 1
    });

  if (imgError) {
    console.error(`  ❌ Error adding image ${i + 1}:`, imgError.message);
  } else {
    console.log(`  ✅ Added: ${img.alt}`);
  }
}

// Step 4: Update Day 2 schedule with new activity
console.log('\n📅 Updating Day 2 schedule...');

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: [
      {
        id: newActivity.id,
        name: newActivity.name,
        type: 'activity',
        description: newActivity.description
      }
    ]
  })
  .eq('trip_id', tripId)
  .eq('day_number', 2);

if (updateError) {
  console.error('❌ Error updating Day 2:', updateError);
  process.exit(1);
}

console.log('✅ Day 2 updated with fresh Oslob activity\n');

console.log('📋 Day 2 Final State:');
console.log(`  Activity: ${newActivity.name}`);
console.log(`  ID: ${newActivity.id}`);
console.log(`  Images: 3 whale shark photos`);
console.log(`  Hours: ${newActivity.hours}`);
console.log(`  Location: ${newActivity.address}`);
