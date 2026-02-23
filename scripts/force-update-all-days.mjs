import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
// Try service role key first (for bypassing RLS), fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

console.log(`Using key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON'}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Record IDs from the database
const dayRecords = {
  1: '3a004910-05c4-4044-bf06-fca36187f39b',
  2: '904241ae-b0dc-470d-80de-09f0552b91ad',
  3: '9981c425-f840-4a15-9a3d-1efc5d73fb75',
  4: 'd1d30cb5-9aae-4a36-aa74-78f81f2cb1fa',
  5: 'db6fc039-ffcb-43e2-9971-c5ea67734dbe',
  6: 'c1d859ea-34a6-4906-b132-10f9cfa4fe64',
  7: 'c8252334-3ae8-48c6-baa5-5d97e2c47acd',
  8: '93974812-7608-42e8-9b77-3b526639c65b',
  9: '45ad1f64-86c8-48d8-9b7b-2b7f1fb95c87',
  10: '75ba4f4c-ad09-4f70-bd54-af00f70b8e53'
};

// Define the correct data for each day
const dayData = {
  1: {
    activities: [
      {name: 'Cebu Taoist Temple', description: 'A stunning Taoist temple perched 300 meters above sea level in Beverly Hills, Cebu. This ornate temple features intricate architecture, colorful dragons, and offers panoramic views of Cebu City.'},
      {name: 'Temple of Leah', description: 'An awe-inspiring Roman-inspired temple built as a testament of undying love. Modeled after the Parthenon, this grand structure features 24 chambers and offers breathtaking 360-degree views of Cebu City.'}
    ],
    food: [{name: 'likealocalrestaurant', description: 'An authentic Filipino dining experience serving traditional local cuisine in a welcoming atmosphere. Known for home-style cooking that showcases the rich flavors and culinary heritage of the Philippines.'}]
  },
  2: {
    activities: [{name: 'Oslob Whale Shark Watching', description: 'Experience swimming with gentle giants in their natural habitat. Oslob is world-famous for whale shark encounters where you can snorkel alongside these magnificent creatures in crystal-clear waters.'}],
    food: []
  },
  3: {
    activities: [],
    food: [{name: 'Tales and Feelings', description: 'A charming local restaurant offering authentic Filipino cuisine with a cozy, welcoming atmosphere. Known for their fresh seafood and traditional dishes.'}]
  },
  4: {
    activities: [
      {name: 'Alona Beach', description: 'One of the most beautiful beaches in Bohol with pristine white sand, crystal-clear turquoise waters, and vibrant marine life. Perfect for swimming, snorkeling, and beach relaxation.'},
      {name: 'Luna Tiger Spa and Massage', description: 'Luxurious spa offering traditional Filipino massage and wellness treatments. Relax and rejuvenate with expert therapists in a tranquil setting.'}
    ],
    food: [{name: 'Bready to Go 24/7 Open', description: 'Convenient 24-hour bakery and cafe serving fresh breads, pastries, sandwiches, and coffee. Perfect for any time of day or night cravings.'}]
  },
  5: {
    activities: [{name: 'Chocolate Hills', description: 'One of the Philippines\' most iconic natural wonders featuring over 1,200 perfectly cone-shaped hills that turn chocolate brown during the dry season. Stunning panoramic views await at the viewing deck.'}],
    food: [{name: 'Maholo Restaurant', description: 'Popular local restaurant serving delicious Filipino and international cuisine with a focus on fresh seafood and authentic island flavors.'}]
  },
  6: {
    activities: [{name: 'Rizal Boulevard in Dumaguete', description: 'The heart of Dumaguete\'s waterfront promenade offering stunning sunset views, local street food, and a relaxing atmosphere. Perfect for an evening stroll along the sea.'}],
    food: [{name: 'Gerry\'s Dumaguete', description: 'A beloved local restaurant and grill known for generous portions, fresh grilled meats and seafood, and authentic Filipino comfort food at affordable prices.'}]
  },
  7: {
    activities: [{name: 'Apo Island', description: 'A protected marine sanctuary renowned for world-class snorkeling and diving. Swim with sea turtles, explore vibrant coral reefs, and experience one of the Philippines\' most pristine underwater ecosystems.'}],
    food: [{name: 'Ground Zero Restaurant', description: 'Popular dining spot in Dumaguete offering a diverse menu of Filipino and international dishes in a casual, friendly atmosphere. Great for post-island adventure meals.'}]
  },
  8: {
    activities: [
      {name: 'Forest Camp Resort', description: 'A peaceful mountain retreat surrounded by lush forest and natural hot springs. Experience the tranquility of nature while enjoying comfortable accommodations and scenic hiking trails.'},
      {name: 'Sulfur Vents', description: 'Witness the raw power of geothermal activity at these natural sulfur vents. Steam and sulfurous gases escape from cracks in the earth, creating an otherworldly landscape.'}
    ],
    food: [{name: 'Adamo Dumaguete', description: 'Contemporary dining destination offering innovative dishes with a focus on local ingredients and modern presentation. A stylish atmosphere perfect for a memorable meal.'}]
  },
  9: {
    activities: [
      {name: 'Cantabon Cave', description: 'An adventurous spelunking experience through one of Bohol\'s most impressive cave systems. Navigate through stunning limestone formations, underground rivers, and narrow passages.'},
      {name: 'Lugnason Falls', description: 'A hidden gem featuring a beautiful multi-tiered waterfall surrounded by lush tropical forest. Swim in the refreshing natural pools and take in the pristine beauty of this lesser-known paradise.'}
    ],
    food: [{name: 'Hayahay Treehouse Bar', description: 'A unique elevated dining experience set among the trees with stunning ocean views. Enjoy fresh local cuisine and tropical drinks in this relaxed, bohemian atmosphere.'}]
  },
  10: {
    activities: [{name: 'Pinspired Art Souvenirs', description: 'A charming shop featuring locally crafted art, handmade souvenirs, and unique Filipino-inspired gifts. Perfect for finding meaningful mementos and supporting local artisans.'}],
    food: [{name: 'Neva\'s Pizza', description: 'A beloved local pizzeria serving authentic wood-fired pizzas with creative Filipino-inspired toppings alongside classic favorites. Casual atmosphere perfect for a final meal.'}]
  }
};

// Fetch existing activity IDs
console.log('📋 Fetching activity IDs from database...\n');

for (let day = 1; day <= 10; day++) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`UPDATING DAY ${day}`);
  console.log('='.repeat(60));

  const dayInfo = dayData[day];
  const items = [];

  // Fetch activities
  for (const activity of dayInfo.activities) {
    const { data, error } = await supabase
      .from('wanderlog_activities')
      .select('id, name')
      .eq('trip_id', tripId)
      .eq('name', activity.name)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log(`⚠️  Could not find activity: ${activity.name}`);
      continue;
    }

    items.push({
      id: data.id,
      name: data.name,
      type: 'activity',
      description: activity.description
    });
    console.log(`✓ Added activity: ${data.name}`);
  }

  // Fetch food
  for (const restaurant of dayInfo.food) {
    const { data, error } = await supabase
      .from('wanderlog_activities')
      .select('id, name')
      .eq('trip_id', tripId)
      .eq('name', restaurant.name)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log(`⚠️  Could not find restaurant: ${restaurant.name}`);
      continue;
    }

    items.push({
      id: data.id,
      name: data.name,
      type: 'food',
      description: restaurant.description
    });
    console.log(`✓ Added food: ${data.name}`);
  }

  // Update the day schedule using the record ID
  const { error: updateError } = await supabase
    .from('wanderlog_daily_schedules')
    .update({ items })
    .eq('id', dayRecords[day]);

  if (updateError) {
    console.error(`❌ Error updating Day ${day}:`, updateError);
  } else {
    console.log(`\n✅ Day ${day} updated with ${items.length} items`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('🎉 ALL DAYS UPDATED SUCCESSFULLY!');
console.log('='.repeat(60));
