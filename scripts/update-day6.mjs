import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Rizal Boulevard activity
console.log('\n🌆 Adding Rizal Boulevard...');
const rizalBoulevard = {
  trip_id: tripId,
  name: 'Rizal Boulevard in Dumaguete',
  description: 'The heart of Dumaguete\'s waterfront promenade offering stunning sunset views, local street food, and a relaxing atmosphere. Perfect for an evening stroll along the sea.',
  address: 'Rizal Boulevard, Dumaguete City, Negros Oriental, Philippines',
  rating: 4.7,
  hours: 'Open 24 hours',
  contact: null
};

const { data: boulevardData, error: boulevardError } = await supabase
  .from('wanderlog_activities')
  .insert(rizalBoulevard)
  .select()
  .single();

if (boulevardError) {
  console.error('❌ Error adding Rizal Boulevard:', boulevardError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${boulevardData.name} (ID: ${boulevardData.id})`);
}

// 2. Add Gerry's Dumaguete restaurant
console.log('\n🍴 Adding Gerry\'s Dumaguete...');
const gerrys = {
  trip_id: tripId,
  name: 'Gerry\'s Dumaguete',
  description: 'A beloved local restaurant and grill known for generous portions, fresh grilled meats and seafood, and authentic Filipino comfort food at affordable prices.',
  address: 'Dumaguete City, Negros Oriental, Philippines',
  rating: 4.5,
  hours: '10:00 AM - 11:00 PM',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(gerrys)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding Gerry\'s:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 3. Update Day 6
console.log('\n🔄 Updating Day 6...');
const updatedItems = [
  {
    id: boulevardData.id,
    name: boulevardData.name,
    type: 'activity',
    description: boulevardData.description
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
  .eq('day_number', 6);

if (updateError) {
  console.error('❌ Error updating Day 6:', updateError);
  process.exit(1);
}

console.log('✅ Day 6 updated successfully!');
console.log(`💡 Day 6 activity: ${boulevardData.name}`);
console.log(`💡 Day 6 dining: ${restaurantData.name}`);
