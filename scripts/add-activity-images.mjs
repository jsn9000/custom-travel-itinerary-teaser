import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

// Activity images - using Unsplash Source API for reliable downloads
const activityImages = [
  // Mexico City Museums & Landmarks
  {
    url: 'https://source.unsplash.com/1200x800/?frida-kahlo-museum',
    activityName: 'Frida Kahlo Museum',
    alt: 'The blue house (Casa Azul) - Frida Kahlo Museum in Coyoacan',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?palacio-bellas-artes-mexico',
    activityName: 'Palacio de Bellas Artes',
    alt: 'Stunning golden dome of Palacio de Bellas Artes in Mexico City',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?anthropology-museum-mexico',
    activityName: 'Museo Nacional de Antropología',
    alt: 'National Museum of Anthropology with iconic umbrella fountain',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?basilica-guadalupe-mexico',
    activityName: 'Basilica of Our Lady of Guadalupe',
    alt: 'Basilica of Our Lady of Guadalupe - most visited Catholic shrine',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?museo-soumaya-mexico',
    activityName: 'Museo Soumaya',
    alt: 'Striking silver architecture of Museo Soumaya',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?library-mexico-city',
    activityName: 'Biblioteca Vasconcelos',
    alt: 'Magnificent multi-level Biblioteca Vasconcelos library',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?coyoacan-market-mexico',
    activityName: 'Coyoacan Market',
    alt: 'Vibrant Coyoacan market with traditional crafts and food',
  },
  // Oaxaca Activities
  {
    url: 'https://source.unsplash.com/1200x800/?oaxaca-weaving-textile',
    activityName: 'Teotitlán del Valle',
    alt: 'Traditional Zapotec weaving village of Teotitlán del Valle',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?alebrijes-oaxaca',
    activityName: 'San Martín Tilcajete',
    alt: 'Colorful alebrijes wooden carvings from San Martín Tilcajete',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?black-pottery-oaxaca',
    activityName: 'San Bartolo Coyotepec',
    alt: 'Famous black pottery of San Bartolo Coyotepec',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?teatro-oaxaca',
    activityName: 'TEATRO MACEDONIO ALCALÁ',
    alt: 'Historic Teatro Macedonio Alcalá in Oaxaca city center',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?zicatela-beach-surfing',
    activityName: 'Playa Zicatela',
    alt: 'Spectacular surfing waves at Playa Zicatela, Puerto Escondido',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?hot-springs-mexico',
    activityName: 'Grutas Tolantongo',
    alt: 'Stunning turquoise thermal pools at Grutas Tolantongo',
  },
  {
    url: 'https://source.unsplash.com/1200x800/?oaxaca-nature',
    activityName: 'Santiago Apoala',
    alt: 'Beautiful natural landscapes of Santiago Apoala in Oaxaca',
  },
];

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    return null;
  }
}

async function findActivityId(activityName) {
  const { data, error } = await supabase
    .from('wanderlog_activities')
    .select('id, name')
    .eq('trip_id', tripId)
    .ilike('name', `%${activityName}%`)
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0].id;
}

async function addActivityImages() {
  console.log('🎨 Adding activity images to database...\n');

  let successCount = 0;
  let skipCount = 0;

  for (const [index, image] of activityImages.entries()) {
    console.log(`[${index + 1}/${activityImages.length}] Processing ${image.activityName}...`);

    // Find the activity ID in the database
    const activityId = await findActivityId(image.activityName);

    if (!activityId) {
      console.log(`   ⚠️  Activity not found in database, skipping\n`);
      skipCount++;
      continue;
    }

    // Download and convert to base64
    const dataUrl = await downloadImage(image.url);

    if (!dataUrl) {
      console.log(`   ⚠️  Skipped (download failed)\n`);
      skipCount++;
      continue;
    }

    // Insert into database
    const { data, error } = await supabase
      .from('wanderlog_images')
      .insert({
        trip_id: tripId,
        activity_id: activityId,
        url: dataUrl,
        associated_section: 'activity',
        position: index,
        alt: image.alt,
        caption: image.activityName,
      })
      .select();

    if (error) {
      console.error(`   ❌ Database error:`, error.message);
      skipCount++;
    } else {
      console.log(`   ✅ Added to database (ID: ${data[0].id})\n`);
      successCount++;
    }
  }

  console.log(`\n🎉 Finished processing activity images!`);
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ⚠️  Skipped: ${skipCount}`);
}

addActivityImages().catch(console.error);
