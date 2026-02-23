import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔄 Resetting Day 4 completely...\n');

// Step 1: Clear Day 4 completely
console.log('🗑️  Clearing Day 4...');
await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: [] })
  .eq('trip_id', tripId)
  .eq('day_number', 4);
console.log('✅ Day 4 cleared\n');

// Step 2: Create new activities based on Wanderlog

// Activity 1: Chocolate Hills Tour
console.log('🏔️  Creating Chocolate Hills Tour activity...');
const { data: chocolateHills, error: chError } = await supabase
  .from('wanderlog_activities')
  .insert({
    trip_id: tripId,
    name: 'Chocolate Hills Tour',
    description: 'Private tour of the famous Chocolate Hills with Loboc River Cruise and lunch. Experience scenic views of over 1,200 cone-shaped hills and enjoy a relaxing river cruise through lush tropical landscapes.',
    address: 'Bohol, Philippines',
    rating: 4.7,
    hours: 'Full day tour'
  })
  .select()
  .single();

if (chError) {
  console.error('❌ Error creating Chocolate Hills:', chError);
  process.exit(1);
}
console.log(`✅ Created: ${chocolateHills.name} (ID: ${chocolateHills.id})`);

// Add Chocolate Hills images
console.log('📸 Adding Chocolate Hills images...');
const chocolateImages = [
  {
    url: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80',
    alt: 'Chocolate Hills panoramic view with green cone-shaped hills'
  },
  {
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    alt: 'Scenic Bohol landscape with rolling hills'
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    alt: 'Tropical river cruise through lush greenery'
  }
];

for (let i = 0; i < chocolateImages.length; i++) {
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: chocolateHills.id,
    url: chocolateImages[i].url,
    alt: chocolateImages[i].alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ ${chocolateImages[i].alt}`);
}

// Activity 2: South Farm Panglao
console.log('\n🌾 Creating South Farm Panglao activity...');
const { data: southFarm, error: sfError } = await supabase
  .from('wanderlog_activities')
  .insert({
    trip_id: tripId,
    name: 'South Farm Panglao Bohol',
    description: 'Agricultural attraction showcasing organic farming and sustainable agriculture. Explore tropical gardens, learn about local farming practices, and enjoy farm-to-table experiences.',
    address: 'Panglao, Bohol, Philippines',
    rating: 4.5
  })
  .select()
  .single();

if (sfError) {
  console.error('❌ Error creating South Farm:', sfError);
  process.exit(1);
}
console.log(`✅ Created: ${southFarm.name} (ID: ${southFarm.id})`);

// Add South Farm images
console.log('📸 Adding South Farm images...');
const farmImages = [
  {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    alt: 'Organic farm with tropical plants and gardens'
  },
  {
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    alt: 'Sustainable agriculture and tropical farming'
  },
  {
    url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80',
    alt: 'Farm landscape with lush greenery'
  }
];

for (let i = 0; i < farmImages.length; i++) {
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: southFarm.id,
    url: farmImages[i].url,
    alt: farmImages[i].alt,
    associated_section: 'activity',
    position: i + 1
  });
  console.log(`  ✅ ${farmImages[i].alt}`);
}

// Food: CRAZE Artisan Cafe
console.log('\n☕ Creating CRAZE Artisan Cafe...');
const { data: craze, error: crazeError } = await supabase
  .from('wanderlog_activities')
  .insert({
    trip_id: tripId,
    name: 'CRAZE Artisan Cafe',
    description: 'Popular artisan cafe serving specialty coffee, fresh pastries, and light meals. Known for quality ingredients and cozy atmosphere.',
    address: 'Caltex Tawala, Alona, Panglao, Bohol',
    rating: 4.9,
    hours: '7:00 AM - 11:00 PM',
    contact: 'Daily service'
  })
  .select()
  .single();

if (crazeError) {
  console.error('❌ Error creating CRAZE:', crazeError);
  process.exit(1);
}
console.log(`✅ Created: ${craze.name} (ID: ${craze.id})`);

// Add CRAZE Artisan Cafe images
console.log('📸 Adding CRAZE Artisan Cafe images...');
const cafeImages = [
  {
    url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
    alt: 'Artisan cafe with specialty coffee and pastries'
  },
  {
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    alt: 'Cozy coffee shop interior with warm lighting'
  },
  {
    url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
    alt: 'Cafe atmosphere with fresh baked goods'
  }
];

for (let i = 0; i < cafeImages.length; i++) {
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: craze.id,
    url: cafeImages[i].url,
    alt: cafeImages[i].alt,
    associated_section: 'dining',
    position: i + 1
  });
  console.log(`  ✅ ${cafeImages[i].alt}`);
}

// Step 3: Update Day 4 schedule
console.log('\n📅 Updating Day 4 schedule...');

const day4Items = [
  {
    id: craze.id,
    name: craze.name,
    type: 'food',
    description: craze.description,
    hours: craze.hours,
    location: craze.address
  },
  {
    id: chocolateHills.id,
    name: chocolateHills.name,
    type: 'activity',
    description: chocolateHills.description
  },
  {
    id: southFarm.id,
    name: southFarm.name,
    type: 'activity',
    description: southFarm.description
  }
];

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: day4Items })
  .eq('trip_id', tripId)
  .eq('day_number', 4);

if (updateError) {
  console.error('❌ Error updating Day 4:', updateError);
  process.exit(1);
}

console.log('✅ Day 4 updated successfully!\n');

console.log('📋 Day 4 Final State:');
console.log('  Food:');
console.log(`    - ${craze.name}`);
console.log(`      Hours: ${craze.hours}`);
console.log(`      Location: ${craze.address}`);
console.log('  Activities:');
console.log(`    1. ${chocolateHills.name}`);
console.log(`    2. ${southFarm.name}`);
