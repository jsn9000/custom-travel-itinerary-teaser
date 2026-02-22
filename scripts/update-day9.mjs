import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Cantabon Cave activity
console.log('\n🕳️ Adding Cantabon Cave...');
const cantabonCave = {
  trip_id: tripId,
  name: 'Cantabon Cave',
  description: 'An adventurous spelunking experience through one of Bohol\'s most impressive cave systems. Navigate through stunning limestone formations, underground rivers, and narrow passages in this exciting underground exploration.',
  address: 'Anda, Bohol, Philippines',
  rating: 4.7,
  hours: '8:00 AM - 4:00 PM (guided tours only)',
  contact: null
};

const { data: caveData, error: caveError } = await supabase
  .from('wanderlog_activities')
  .insert(cantabonCave)
  .select()
  .single();

if (caveError) {
  console.error('❌ Error adding Cantabon Cave:', caveError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${caveData.name} (ID: ${caveData.id})`);
}

// 2. Add Lugnason Falls activity
console.log('\n💧 Adding Lugnason Falls...');
const lugnasonFalls = {
  trip_id: tripId,
  name: 'Lugnason Falls',
  description: 'A hidden gem featuring a beautiful multi-tiered waterfall surrounded by lush tropical forest. Swim in the refreshing natural pools, enjoy the serene atmosphere, and take in the pristine beauty of this lesser-known paradise.',
  address: 'Anda, Bohol, Philippines',
  rating: 4.8,
  hours: 'Daylight hours',
  contact: null
};

const { data: fallsData, error: fallsError } = await supabase
  .from('wanderlog_activities')
  .insert(lugnasonFalls)
  .select()
  .single();

if (fallsError) {
  console.error('❌ Error adding Lugnason Falls:', fallsError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${fallsData.name} (ID: ${fallsData.id})`);
}

// 3. Add Hayahay Treehouse Bar restaurant
console.log('\n🌳 Adding Hayahay Treehouse Bar...');
const hayahayBar = {
  trip_id: tripId,
  name: 'Hayahay Treehouse Bar',
  description: 'A unique elevated dining experience set among the trees with stunning ocean views. Enjoy fresh local cuisine and tropical drinks in this relaxed, bohemian atmosphere perfect for sunset watching.',
  address: 'Anda, Bohol, Philippines',
  rating: 4.7,
  hours: '11:00 AM - 10:00 PM',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(hayahayBar)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding Hayahay Treehouse Bar:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 4. Update Day 9
console.log('\n🔄 Updating Day 9...');
const updatedItems = [
  {
    id: caveData.id,
    name: caveData.name,
    type: 'activity',
    description: caveData.description
  },
  {
    id: fallsData.id,
    name: fallsData.name,
    type: 'activity',
    description: fallsData.description
  },
  {
    id: restaurantData.id,
    name: restaurantData.name,
    type: 'food',
    description: restaurantData.description
  }
];

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: updatedItems
  })
  .eq('trip_id', tripId)
  .eq('day_number', 9);

if (updateError) {
  console.error('❌ Error updating Day 9:', updateError);
  process.exit(1);
}

console.log('✅ Day 9 updated successfully!');
console.log(`💡 Day 9 activities: ${caveData.name}, ${fallsData.name}`);
console.log(`💡 Day 9 dining: ${restaurantData.name}`);
