import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Define Bohol hotels (Oct 8-10, 2026) - 2 nights total
const boholHotels = [
  {
    trip_id: tripId,
    name: 'Samadhi Resort & Hydrospa',
    address: 'Bohol • click here to book: https://www.booking.com/Share-9bFROV',
    room_type: '1 Economy Double + 2 Double/Twin with Pool View',
    price: 337.00, // Total for 2 nights
    currency: 'USD',
    rating: 4.6,
    amenities: ['Pool View', 'Checkout 11am', 'Oct 8-10 (2 nights)', 'Motorbike rental 500php/day', 'Ferry transfer 1000php']
  },
  {
    trip_id: tripId,
    name: 'CRAZE Artisan Cafe Airbnb Casa Giuseppe Bohol 4',
    address: 'Near Alona Beach, Bohol • click here to book: https://www.airbnb.com/l/XPFg2Lb3',
    room_type: '4-Bedroom Property',
    price: 343.00, // Total for 2 nights
    currency: 'USD',
    rating: 4.7,
    amenities: ['Near Alona Beach', 'Near CRAZE Artisan Cafe', 'Checkout 11am', 'Oct 8-10 (2 nights)']
  },
  {
    trip_id: tripId,
    name: "CONCORDIA'S COUNTRY RESORT Villa Agripina",
    address: 'Lila, Bohol • Airbnb • click here to book: https://www.airbnb.com/rooms/1292349443356074764?viralityEntryPoint=1&s=76',
    room_type: 'Villa',
    price: 353.00, // Total for 2 nights
    currency: 'USD',
    rating: 4.5,
    amenities: ['Country Resort', 'Checkout 11am', 'Oct 8-10 (2 nights)']
  }
];

// Insert Bohol hotels
console.log('\n🏨 Inserting Bohol hotels...');
for (const hotel of boholHotels) {
  const { data, error } = await supabase
    .from('wanderlog_hotels')
    .insert(hotel)
    .select()
    .single();

  if (error) {
    console.error(`❌ Error inserting hotel ${hotel.name}:`, error);
  } else {
    console.log(`✅ Inserted: ${hotel.name} - $${hotel.price} (2 nights)`);
  }
}

console.log('\n🎉 Bohol hotels added successfully!');
console.log('💡 Next: Add Dumaguete (Oct 10-14) hotels');
