import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Forest Camp Resort activity
console.log('\n🌲 Adding Forest Camp Resort...');
const forestCamp = {
  trip_id: tripId,
  name: 'Forest Camp Resort',
  description: 'A peaceful mountain retreat surrounded by lush forest and natural hot springs. Experience the tranquility of nature while enjoying comfortable accommodations and scenic hiking trails.',
  address: 'Valencia, Negros Oriental, Philippines',
  rating: 4.7,
  hours: 'Open daily',
  contact: null
};

const { data: forestData, error: forestError } = await supabase
  .from('wanderlog_activities')
  .insert(forestCamp)
  .select()
  .single();

if (forestError) {
  console.error('❌ Error adding Forest Camp Resort:', forestError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${forestData.name} (ID: ${forestData.id})`);
}

// 2. Add Sulfur Vents activity
console.log('\n💨 Adding Sulfur Vents...');
const sulfurVents = {
  trip_id: tripId,
  name: 'Sulfur Vents',
  description: 'Witness the raw power of geothermal activity at these natural sulfur vents. Steam and sulfurous gases escape from cracks in the earth, creating an otherworldly landscape that showcases the volcanic origins of the region.',
  address: 'Valencia, Negros Oriental, Philippines',
  rating: 4.5,
  hours: 'Daylight hours recommended',
  contact: null
};

const { data: sulfurData, error: sulfurError } = await supabase
  .from('wanderlog_activities')
  .insert(sulfurVents)
  .select()
  .single();

if (sulfurError) {
  console.error('❌ Error adding Sulfur Vents:', sulfurError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${sulfurData.name} (ID: ${sulfurData.id})`);
}

// 3. Add Adamo Dumaguete restaurant
console.log('\n🍽️ Adding Adamo Dumaguete...');
const adamoRestaurant = {
  trip_id: tripId,
  name: 'Adamo Dumaguete',
  description: 'Contemporary dining destination offering innovative dishes with a focus on local ingredients and modern presentation. A stylish atmosphere perfect for a memorable meal.',
  address: 'Dumaguete City, Negros Oriental, Philippines',
  rating: 4.6,
  hours: '11:00 AM - 10:00 PM',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(adamoRestaurant)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding Adamo Dumaguete:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 4. Update Day 8
console.log('\n🔄 Updating Day 8...');
const updatedItems = [
  {
    id: forestData.id,
    name: forestData.name,
    type: 'activity',
    description: forestData.description
  },
  {
    id: sulfurData.id,
    name: sulfurData.name,
    type: 'activity',
    description: sulfurData.description
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
  .eq('day_number', 8);

if (updateError) {
  console.error('❌ Error updating Day 8:', updateError);
  process.exit(1);
}

console.log('✅ Day 8 updated successfully!');
console.log(`💡 Day 8 activities: ${forestData.name}, ${sulfurData.name}`);
console.log(`💡 Day 8 dining: ${restaurantData.name}`);
