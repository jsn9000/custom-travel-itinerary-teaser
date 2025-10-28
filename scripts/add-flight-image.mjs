import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Edmonton trip ID (most recent)
const TRIP_ID = '101e9403-c527-4b27-9244-210d43ba8fa7';

// Commercial airplane image URL
const IMAGE_URL = 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800';

async function addFlightImage() {
  console.log('🚀 Adding commercial airplane image to Supabase...\n');

  try {
    // Fetch the image
    console.log('📥 Fetching image from Unsplash...');
    const response = await fetch(IMAGE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    console.log(`✅ Image fetched (${(dataUrl.length / 1024).toFixed(1)} KB)\n`);

    // Insert into wanderlog_images table
    console.log('💾 Inserting image into database...');
    const { data, error } = await supabase
      .from('wanderlog_images')
      .insert({
        trip_id: TRIP_ID,
        url: dataUrl,
        associated_section: 'flight',
        position: 0,
        alt: 'Commercial airplane - Economy connection flight',
        caption: 'Budget-friendly commercial flight option'
      })
      .select();

    if (error) {
      console.error('❌ Error inserting image:', error);
      return;
    }

    console.log('✅ Commercial airplane image added successfully!');
    console.log('📊 Image details:', {
      id: data[0].id,
      trip_id: data[0].trip_id,
      associated_section: data[0].associated_section,
      alt: data[0].alt
    });

    console.log('\n🎉 Complete! You can now use this image for flight options.');
    console.log('💡 The image is stored with associated_section: "flight"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addFlightImage().catch(console.error);
