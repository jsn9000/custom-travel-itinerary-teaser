import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Define Dumaguete hotels (Oct 10-14, 2026) - 4 nights total
const dumagueteHotels = [
  {
    trip_id: tripId,
    name: 'Yucca Villa',
    address: 'Near G-Ging store, Dumaguete • Airbnb • click here to book: https://www.airbnb.com/rooms/1170091678756711714?check_in=2026-10-10&check_out=2026-10-14&guests=1&adults=5&s=67&unique_share_id=48c1033e-c0fc-461a-89b0-d4ef3f0108d7',
    room_type: 'Stylish City Retreat with Pool',
    price: 1002.00, // Total for 4 nights
    currency: 'USD',
    rating: 4.6,
    amenities: ['City Retreat', 'Pool', 'Checkout 11am', 'Oct 10-14 (4 nights)']
  },
  {
    trip_id: tripId,
    name: 'A Luxe Villa',
    address: 'Near Ronax Store, Dumaguete • Airbnb • click here to book: https://www.airbnb.com/rooms/43499954?check_in=2026-10-10&check_out=2026-10-14&guests=5&adults=5&s=67&unique_share_id=55028803-aa87-46e1-8b43-78bfbdf4e9cf',
    room_type: 'Private Pool Villa',
    price: 1356.00, // Total for 4 nights
    currency: 'USD',
    rating: 4.8,
    amenities: ['Private Pool', 'Free Netflix', 'WiFi', 'Oct 10-14 (4 nights)']
  },
  {
    trip_id: tripId,
    name: 'Hotel Dumaguete',
    address: 'Dumaguete • click here to book: https://www.booking.com/Share-alY2f4',
    room_type: '2 Standard Deluxe + 1 Superior Deluxe',
    price: 1356.00, // Total for 4 nights
    currency: 'USD',
    rating: 4.4,
    amenities: ['Breakfast included', 'Oct 10-14 (4 nights)']
  }
];

// Insert Dumaguete hotels
console.log('\n🏨 Inserting Dumaguete hotels...');
for (const hotel of dumagueteHotels) {
  const { data, error } = await supabase
    .from('wanderlog_hotels')
    .insert(hotel)
    .select()
    .single();

  if (error) {
    console.error(`❌ Error inserting hotel ${hotel.name}:`, error);
  } else {
    console.log(`✅ Inserted: ${hotel.name} - $${hotel.price} (4 nights)`);
  }
}

console.log('\n🎉 Dumaguete hotels added successfully!');
console.log('💡 All accommodation sections complete: Cebu, Bohol, Dumaguete');
