import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Cebu Taoist Temple activity
console.log('\n🏯 Adding Cebu Taoist Temple...');
const taoistTemple = {
  trip_id: tripId,
  name: 'Cebu Taoist Temple',
  description: 'A stunning Taoist temple perched 300 meters above sea level in Beverly Hills, Cebu. This ornate temple features intricate architecture, colorful dragons, and offers panoramic views of Cebu City. Built by the Chinese community in 1972, it\'s a serene place for prayer, meditation, and cultural exploration.',
  address: 'Beverly Hills, Lahug, Cebu City, Cebu, Philippines',
  rating: 4.6,
  hours: '6:00 AM - 6:00 PM',
  contact: null
};

const { data: templeData, error: templeError } = await supabase
  .from('wanderlog_activities')
  .insert(taoistTemple)
  .select()
  .single();

if (templeError) {
  console.error('❌ Error adding Cebu Taoist Temple:', templeError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${templeData.name} (ID: ${templeData.id})`);
}

// 2. Add Temple of Leah activity
console.log('\n⛪ Adding Temple of Leah...');
const templeOfLeah = {
  trip_id: tripId,
  name: 'Temple of Leah',
  description: 'An awe-inspiring Roman-inspired temple built as a testament of undying love. Modeled after the Parthenon, this grand structure features 24 chambers filled with antique pieces and a massive bronze statue. Set atop Busay hills, it offers breathtaking 360-degree views of Cebu City and the surrounding islands.',
  address: 'Busay, Cebu City, Cebu, Philippines',
  rating: 4.7,
  hours: '6:00 AM - 11:00 PM',
  contact: null
};

const { data: leahData, error: leahError } = await supabase
  .from('wanderlog_activities')
  .insert(templeOfLeah)
  .select()
  .single();

if (leahError) {
  console.error('❌ Error adding Temple of Leah:', leahError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${leahData.name} (ID: ${leahData.id})`);
}

// 3. Add likealocalrestaurant
console.log('\n🍽️ Adding likealocalrestaurant...');
const likeALocal = {
  trip_id: tripId,
  name: 'likealocalrestaurant',
  description: 'An authentic Filipino dining experience serving traditional local cuisine in a welcoming atmosphere. Known for home-style cooking that showcases the rich flavors and culinary heritage of the Philippines. Perfect for your first taste of genuine Cebuano dishes.',
  address: 'Cebu City, Philippines',
  rating: 4.5,
  hours: '11:00 AM - 9:00 PM',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(likeALocal)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding likealocalrestaurant:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 4. Update Day 1
console.log('\n🔄 Updating Day 1...');
const updatedItems = [
  {
    id: templeData.id,
    name: templeData.name,
    type: 'activity',
    description: templeData.description
  },
  {
    id: leahData.id,
    name: leahData.name,
    type: 'activity',
    description: leahData.description
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
  .eq('day_number', 1);

if (updateError) {
  console.error('❌ Error updating Day 1:', updateError);
  process.exit(1);
}

console.log('✅ Day 1 updated successfully!');
console.log(`💡 Day 1 activities: ${templeData.name}, ${leahData.name}`);
console.log(`💡 Day 1 dining: ${restaurantData.name}`);
