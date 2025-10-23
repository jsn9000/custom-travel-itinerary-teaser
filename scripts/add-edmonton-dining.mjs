import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TRIP_ID = '1c2a975d-9bf6-4ed0-8d9f-e27611bbf042';

// Popular Edmonton dining establishments
const edmontonDining = [
  {
    name: "RGE RD",
    description: "Farm-to-table Canadian cuisine featuring locally sourced ingredients and innovative dishes",
    address: "10643 123 St NW, Edmonton, AB T5N 1N8, Canada",
    rating: 4.6,
    contact: "+1 780-447-4577",
    hours: "Tue-Sat: 5:00 PM - 10:00 PM"
  },
  {
    name: "Corso 32",
    description: "Intimate Italian restaurant serving handmade pasta and authentic regional Italian dishes",
    address: "10345 Jasper Ave, Edmonton, AB T5J 1Y7, Canada",
    rating: 4.7,
    contact: "+1 780-421-4622",
    hours: "Tue-Sat: 5:00 PM - 10:00 PM"
  },
  {
    name: "Bundok",
    description: "Modern Asian fusion restaurant with creative cocktails and shareable plates",
    address: "10360 104 St NW, Edmonton, AB T5J 1B7, Canada",
    rating: 4.5,
    contact: "+1 780-425-1917",
    hours: "Mon-Sun: 11:30 AM - 2:00 AM"
  },
  {
    name: "The Marc Restaurant",
    description: "Upscale French-inspired fine dining with seasonal tasting menus and extensive wine selection",
    address: "9940 106 St NW, Edmonton, AB T5K 2N2, Canada",
    rating: 4.8,
    contact: "+1 780-429-2828",
    hours: "Tue-Sat: 5:30 PM - 10:00 PM"
  },
  {
    name: "Tres Carnales Taqueria",
    description: "Vibrant Mexican street food with authentic tacos, ceviches, and craft cocktails",
    address: "10119 100A St NW, Edmonton, AB T5J 0N7, Canada",
    rating: 4.4,
    contact: "+1 780-760-0909",
    hours: "Mon-Sun: 11:00 AM - 11:00 PM"
  },
  {
    name: "Coliseum Steak & Pizza",
    description: "Classic steakhouse and pizzeria offering hearty portions and family-friendly atmosphere",
    address: "7308 118 Ave NW, Edmonton, AB T5B 0T5, Canada",
    rating: 4.3,
    contact: "+1 780-479-6333",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM"
  },
  {
    name: "Bündok",
    description: "Contemporary Asian-inspired cuisine with creative cocktails in a trendy downtown setting",
    address: "10360 104 St NW, Edmonton, AB T5J 1B7, Canada",
    rating: 4.5,
    contact: "+1 780-425-1917",
    hours: "Mon-Sun: 11:30 AM - Late"
  },
  {
    name: "Japonais Bistro",
    description: "Elegant Japanese dining featuring fresh sushi, sashimi, and traditional cooked dishes",
    address: "10133 125 St NW, Edmonton, AB T5N 1S2, Canada",
    rating: 4.6,
    contact: "+1 780-454-3335",
    hours: "Tue-Sun: 5:00 PM - 10:00 PM"
  },
  {
    name: "Uccellino",
    description: "Rustic Italian eatery with wood-fired pizzas and housemade pastas in cozy setting",
    address: "10020 101A Ave NW, Edmonton, AB T5J 3G2, Canada",
    rating: 4.5,
    contact: "+1 780-705-2823",
    hours: "Mon-Sun: 5:00 PM - 10:00 PM"
  },
  {
    name: "Sabor Restaurant",
    description: "Portuguese and Latin American fusion with bold flavors and warm hospitality",
    address: "10220 103 St NW, Edmonton, AB T5J 0Y1, Canada",
    rating: 4.7,
    contact: "+1 780-757-1114",
    hours: "Tue-Sat: 5:00 PM - 10:00 PM"
  },
  {
    name: "Tzin Wine & Tapas",
    description: "Spanish tapas bar with extensive wine list and authentic Mediterranean small plates",
    address: "10115 104 St NW, Edmonton, AB T5J 1A1, Canada",
    rating: 4.4,
    contact: "+1 780-428-8946",
    hours: "Tue-Sat: 5:00 PM - 11:00 PM"
  },
  {
    name: "Pampa Brazilian Steakhouse",
    description: "Traditional Brazilian churrascaria with endless carved meats and extensive salad bar",
    address: "10418 81 Ave NW, Edmonton, AB T6E 1X5, Canada",
    rating: 4.5,
    contact: "+1 780-433-0000",
    hours: "Mon-Sun: 5:00 PM - 10:00 PM"
  }
];

async function addDiningPlaces() {
  console.log('🍽️  Adding Edmonton dining places to database...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const dining of edmontonDining) {
    try {
      const { data, error } = await supabase
        .from('wanderlog_activities')
        .insert({
          trip_id: TRIP_ID,
          name: dining.name,
          description: dining.description,
          address: dining.address,
          rating: dining.rating,
          contact: dining.contact,
          hours: dining.hours
        })
        .select();

      if (error) {
        console.error(`❌ Failed to add ${dining.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Added: ${dining.name} (${dining.rating}⭐)`);
        successCount++;
      }
    } catch (e) {
      console.error(`❌ Error adding ${dining.name}:`, e);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📍 Total dining places: ${edmontonDining.length}`);
  console.log(`\n🎉 Done! View your teaser at: /teaser/${TRIP_ID}`);
}

addDiningPlaces().catch(console.error);
