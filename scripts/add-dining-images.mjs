import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7'; // Mexico City and Oaxaca trip

// Restaurant images from Restaurant Guru and Unsplash
const restaurantImages = [
  // Restaurante Arugula
  {
    url: 'https://img.restaurantguru.com/r439-Restaurante-Arugula-dishes-2022-09.jpg',
    restaurant: 'Restaurante Arugula',
    alt: 'Colorful vegan dishes at Restaurante Arugula',
  },
  {
    url: 'https://img.restaurantguru.com/r24e-meals-Restaurante-Arugula-2022-09.jpg',
    restaurant: 'Restaurante Arugula',
    alt: 'Fresh organic meals at Restaurante Arugula',
  },
  // Generic vegan Mexican food images from Unsplash
  {
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    restaurant: 'Los Muchitos Comida Vegana',
    alt: 'Colorful vegan Mexican food with fresh vegetables',
  },
  {
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    restaurant: 'Viriditas Cocina Vegana',
    alt: 'Beautiful vegan sushi platter',
  },
  {
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
    restaurant: 'Etnofood',
    alt: 'Traditional Oaxacan vegan dishes',
  },
  {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    restaurant: 'Herbivora',
    alt: 'Delicious vegan tacos with fresh toppings',
  },
  {
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    restaurant: 'Restaurante Taniperla Oaxaca',
    alt: 'Traditional Oaxacan cuisine',
  },
  {
    url: 'https://images.unsplash.com/photo-1604909052801-2f8f2c70e69d?w=800',
    restaurant: 'Los Muchitos Comida Vegana',
    alt: 'Fresh vegan Mexican street food',
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

async function addDiningImages() {
  console.log('🍽️  Adding dining images to database...\n');

  for (const [index, image] of restaurantImages.entries()) {
    console.log(`[${index + 1}/${restaurantImages.length}] Processing ${image.restaurant}...`);

    // Download and convert to base64
    const dataUrl = await downloadImage(image.url);

    if (!dataUrl) {
      console.log(`   ⚠️  Skipped (download failed)\n`);
      continue;
    }

    // Insert into database
    const { data, error } = await supabase
      .from('wanderlog_images')
      .insert({
        trip_id: tripId,
        url: dataUrl,
        associated_section: 'dining',
        position: index,
        alt: image.alt,
        caption: image.restaurant,
      })
      .select();

    if (error) {
      console.error(`   ❌ Database error:`, error.message);
    } else {
      console.log(`   ✅ Added to database (ID: ${data[0].id})\n`);
    }
  }

  console.log('🎉 All dining images processed!');
}

addDiningImages().catch(console.error);
