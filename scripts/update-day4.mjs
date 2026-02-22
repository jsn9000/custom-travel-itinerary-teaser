import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Alona Beach activity
console.log('\n🏖️ Adding Alona Beach...');
const alonaBeach = {
  trip_id: tripId,
  name: 'Alona Beach',
  description: 'One of the most beautiful beaches in Bohol with pristine white sand, crystal-clear turquoise waters, and vibrant marine life. Perfect for swimming, snorkeling, and beach relaxation.',
  address: 'Panglao, Bohol, Philippines',
  rating: 4.6,
  hours: 'Open 24 hours',
  contact: null
};

const { data: alonaData, error: alonaError } = await supabase
  .from('wanderlog_activities')
  .insert(alonaBeach)
  .select()
  .single();

if (alonaError) {
  console.error('❌ Error adding Alona Beach:', alonaError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${alonaData.name} (ID: ${alonaData.id})`);
}

// 2. Add Luna Tiger Spa and Massage
console.log('\n💆 Adding Luna Tiger Spa and Massage...');
const lunaTigerSpa = {
  trip_id: tripId,
  name: 'Luna Tiger Spa and Massage',
  description: 'Luxurious spa offering traditional Filipino massage and wellness treatments. Relax and rejuvenate with expert therapists in a tranquil setting.',
  address: 'Bohol, Philippines',
  rating: 4.8,
  hours: '10:00 AM - 10:00 PM',
  contact: null
};

const { data: spaData, error: spaError } = await supabase
  .from('wanderlog_activities')
  .insert(lunaTigerSpa)
  .select()
  .single();

if (spaError) {
  console.error('❌ Error adding Luna Tiger Spa:', spaError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${spaData.name} (ID: ${spaData.id})`);
}

// 3. Add Bready to Go 24/7 restaurant
console.log('\n🍞 Adding Bready to Go 24/7...');
const breadyToGo = {
  trip_id: tripId,
  name: 'Bready to Go 24/7 Open',
  description: 'Convenient 24-hour bakery and cafe serving fresh breads, pastries, sandwiches, and coffee. Perfect for any time of day or night cravings.',
  address: 'Bohol, Philippines',
  rating: 4.5,
  hours: '24 hours',
  contact: null
};

const { data: restaurantData, error: restaurantError } = await supabase
  .from('wanderlog_activities')
  .insert(breadyToGo)
  .select()
  .single();

if (restaurantError) {
  console.error('❌ Error adding Bready to Go:', restaurantError);
  process.exit(1);
} else {
  console.log(`✅ Added restaurant: ${restaurantData.name} (ID: ${restaurantData.id})`);
}

// 4. Update Day 4 with all items
console.log('\n🔄 Updating Day 4...');
const updatedItems = [
  {
    id: alonaData.id,
    name: alonaData.name,
    type: 'activity',
    description: alonaData.description
  },
  {
    id: spaData.id,
    name: spaData.name,
    type: 'activity',
    description: spaData.description
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
  .eq('day_number', 4);

if (updateError) {
  console.error('❌ Error updating Day 4:', updateError);
  process.exit(1);
}

console.log('✅ Day 4 updated successfully!');
console.log(`💡 Day 4 activities: ${alonaData.name}, ${spaData.name}`);
console.log(`💡 Day 4 dining: ${restaurantData.name}`);
