import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// First, delete existing hotels for this trip
console.log('🗑️  Deleting existing hotels...');
const { error: deleteError } = await supabase
  .from('wanderlog_hotels')
  .delete()
  .eq('trip_id', tripId);

if (deleteError) {
  console.error('Error deleting existing hotels:', deleteError);
  process.exit(1);
}

console.log('✅ Deleted existing hotels');

// Define Cebu hotels (Oct 5-8, 2026) - 3 nights total
const cebuHotels = [
  {
    trip_id: tripId,
    name: 'SITIO LOOC Amazing Waterfalls Pool villa/billiard/PS4',
    address: 'Maribago, Lapu-Lapu, Cebu • Airbnb • click here to book',
    room_type: 'Entire Villa',
    price: 924.00, // Total for 3 nights
    currency: 'USD',
    rating: 4.5,
    amenities: ['Pool villa', 'Billiard', 'PS4', 'Waterfalls view', 'Oct 5-8 (3 nights)']
  },
  {
    trip_id: tripId,
    name: 'Banana Residence 4 Bedroom Townhouse',
    address: 'Cebu City • Airbnb near Banana Residence • click here to book',
    room_type: '4 Bedroom Townhouse',
    price: 588.00, // Total for 3 nights
    currency: 'USD',
    rating: 4.7,
    amenities: ['4 Bedrooms', 'Townhouse', 'Oct 5-8 (3 nights)']
  },
  {
    trip_id: tripId,
    name: 'One Central Hotel',
    address: 'Corner Leon Kilat & Sanciangko Street, Cebu City • click here to book',
    room_type: '2 Deluxe Twin + 1 Deluxe Double',
    price: 409.00, // Total for 3 nights
    currency: 'USD',
    rating: 4.3,
    amenities: ['Breakfast included', 'Oct 5-8 (3 nights)']
  }
];

// Insert Cebu hotels
console.log('\n🏨 Inserting Cebu hotels...');
for (const hotel of cebuHotels) {
  const { data, error } = await supabase
    .from('wanderlog_hotels')
    .insert(hotel)
    .select()
    .single();

  if (error) {
    console.error(`❌ Error inserting hotel ${hotel.name}:`, error);
  } else {
    console.log(`✅ Inserted: ${hotel.name} - $${hotel.price} (${hotel.nights} nights)`);
  }
}

console.log('\n🎉 Cebu hotels added successfully!');
console.log('💡 Next: Add Bohol (Oct 8-10) and Dumaguete (Oct 10-14) hotels');
