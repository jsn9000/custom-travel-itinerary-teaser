import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🏞️  Setting up Day 3 with Kawasan Falls...\n');

// Find Kawasan Falls activity
const { data: kawasanActivities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Kawasan%Falls%')
  .order('created_at', { ascending: false })
  .limit(1);

if (!kawasanActivities || kawasanActivities.length === 0) {
  console.error('❌ Kawasan Falls not found in database');
  process.exit(1);
}

const kawasanFalls = kawasanActivities[0];
console.log(`✅ Found: ${kawasanFalls.name} (ID: ${kawasanFalls.id})`);

// Update Day 3 schedule
console.log('\n📅 Updating Day 3 schedule...');

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: [
      {
        id: kawasanFalls.id,
        name: kawasanFalls.name,
        type: 'activity',
        description: kawasanFalls.description
      }
    ]
  })
  .eq('trip_id', tripId)
  .eq('day_number', 3);

if (updateError) {
  console.error('❌ Error updating Day 3:', updateError);
  process.exit(1);
}

console.log('✅ Day 3 updated with Kawasan Falls');

// Check for images
const { data: images } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('activity_id', kawasanFalls.id);

console.log(`\n📸 Kawasan Falls has ${images?.length || 0} images`);

if (!images || images.length === 0) {
  console.log('\n📸 Adding waterfall images...');

  const waterfallImages = [
    {
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      alt: 'Kawasan Falls turquoise blue water'
    },
    {
      url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
      alt: 'Tropical waterfall cascading into pool'
    },
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      alt: 'Scenic waterfall in lush jungle'
    }
  ];

  for (let i = 0; i < waterfallImages.length; i++) {
    const img = waterfallImages[i];
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: kawasanFalls.id,
      url: img.url,
      alt: img.alt,
      associated_section: 'activity',
      position: i + 1
    });
    console.log(`  ✅ Added: ${img.alt}`);
  }
}

console.log('\n✅ Day 3 setup complete!');
