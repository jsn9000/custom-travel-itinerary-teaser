import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

// Local images from Downloads folder
const localImages = [
  {
    path: '/Users/jsimpson/Downloads/Playa Zicatela.jpeg',
    activityName: 'Playa Zicatela',
  },
  {
    path: '/Users/jsimpson/Downloads/TEATRO MACEDONIO ALCALÁ.jpeg',
    activityName: 'TEATRO MACEDONIO ALCALÁ',
  },
  {
    path: '/Users/jsimpson/Downloads/San Martín Tilcajete.jpeg',
    activityName: 'San Martín Tilcajete',
  },
  {
    path: '/Users/jsimpson/Downloads/Teotitlán del Valle.jpeg',
    activityName: 'Teotitlán del Valle',
  },
  {
    path: '/Users/jsimpson/Downloads/San Bartolo Coyotepec.jpeg',
    activityName: 'San Bartolo Coyotepec',
  },
];

async function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Error reading ${imagePath}:`, error.message);
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

async function checkIfImageExists(activityId) {
  const { data, error } = await supabase
    .from('wanderlog_images')
    .select('id')
    .eq('trip_id', tripId)
    .eq('activity_id', activityId)
    .eq('associated_section', 'activity')
    .limit(1);

  if (error) {
    console.error('Error checking existing images:', error);
    return false;
  }

  return data && data.length > 0;
}

async function addLocalImages() {
  console.log('📁 Adding local activity images from Downloads folder...\n');

  let successCount = 0;
  let skipCount = 0;

  for (const [index, image] of localImages.entries()) {
    console.log(`[${index + 1}/${localImages.length}] Processing ${image.activityName}...`);

    // Check if file exists
    if (!fs.existsSync(image.path)) {
      console.log(`   ⚠️  File not found at ${image.path}\n`);
      skipCount++;
      continue;
    }

    // Find the activity ID
    const activityId = await findActivityId(image.activityName);

    if (!activityId) {
      console.log(`   ⚠️  Activity not found in database\n`);
      skipCount++;
      continue;
    }

    // Check if activity already has images from Wanderlog
    const hasExistingImages = await checkIfImageExists(activityId);
    if (hasExistingImages) {
      console.log(`   ℹ️  Activity already has Wanderlog images, skipping\n`);
      skipCount++;
      continue;
    }

    // Convert to base64
    const dataUrl = await imageToBase64(image.path);

    if (!dataUrl) {
      console.log(`   ⚠️  Failed to convert image\n`);
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
        alt: `${image.activityName} - Local image`,
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

  console.log(`\n🎉 Finished processing local images!`);
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ⚠️  Skipped: ${skipCount}`);
}

addLocalImages().catch(console.error);
