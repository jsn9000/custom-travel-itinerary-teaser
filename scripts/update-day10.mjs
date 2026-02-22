import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Pinspired Art Souvenirs activity
console.log('\n🎨 Adding Pinspired Art Souvenirs...');
const pinspiredArt = {
  trip_id: tripId,
  name: 'Pinspired Art Souvenirs',
  description: 'A charming shop featuring locally crafted art, handmade souvenirs, and unique Filipino-inspired gifts. Perfect for finding meaningful mementos and supporting local artisans before heading home.',
  address: 'Bohol, Philippines',
  rating: 4.6,
  hours: '9:00 AM - 6:00 PM',
  contact: null
};

const { data: artData, error: artError } = await supabase
  .from('wanderlog_activities')
  .insert(pinspiredArt)
  .select()
  .single();

if (artError) {
  console.error('❌ Error adding Pinspired Art Souvenirs:', artError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${artData.name} (ID: ${artData.id})`);
}

// 2. Add Neva's Pizza restaurant
console.log('\n🍕 Adding Neva\'s Pizza...');
const nevasPizza = {
  trip_id: tripId,
  name: 'Neva\'s Pizza',
  description: 'A beloved local pizzeria serving authentic wood-fired pizzas with creative Filipino-inspired toppings alongside classic favorites. Casual atmosphere perfect for a final meal before departure.',
  address: 'Bohol, Philippines',
  rating: 4.7,
  hours: '11:00 AM - 9:00 PM',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(nevasPizza)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding Neva\'s Pizza:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 3. Update Day 10
console.log('\n🔄 Updating Day 10...');
const updatedItems = [
  {
    id: artData.id,
    name: artData.name,
    type: 'activity',
    description: artData.description
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
  .eq('day_number', 10);

if (updateError) {
  console.error('❌ Error updating Day 10:', updateError);
  process.exit(1);
}

console.log('✅ Day 10 updated successfully!');
console.log(`💡 Day 10 activity: ${artData.name}`);
console.log(`💡 Day 10 dining: ${restaurantData.name}`);
