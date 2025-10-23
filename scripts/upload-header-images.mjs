import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TRIP_ID = '1c2a975d-9bf6-4ed0-8d9f-e27611bbf042';
const BUCKET_NAME = 'wanderlog-edmonton-images';

const localImages = [
  '/Users/jsimpson/Downloads/edmonton-skyline.jpeg',
  '/Users/jsimpson/Downloads/edmonton-lights.jpeg',
  '/Users/jsimpson/Downloads/edmonton-whitehouse.jpg',
  '/Users/jsimpson/Downloads/downtown-edmonton-yeg-night-skyline-buildings-rob-moses-photography-portland-calgary-vancouver-seattle-spokane-photographer-wa-bc-native-american-tlingit-ojibaway-famous-un-celebrity-can1.jpg',
  '/Users/jsimpson/Downloads/edmonton-view.webp'
];

async function uploadImages() {
  console.log('🚀 Starting image upload process...\n');

  // Convert images to base64 data URLs so they can be embedded directly
  const uploadedUrls = [];

  // Step 1: Convert local images to base64 data URLs
  for (let i = 0; i < localImages.length; i++) {
    const imagePath = localImages[i];
    const fileName = path.basename(imagePath);

    console.log(`📝 Converting ${fileName} to base64...`);

    const fileBuffer = fs.readFileSync(imagePath);
    const base64 = fileBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    uploadedUrls.push(dataUrl);
    console.log(`✅ Converted: ${fileName} (${(dataUrl.length / 1024).toFixed(1)} KB)\n`);
  }

  console.log('✅ All images converted to base64 data URLs\n');

  // Step 3: Delete old header images
  console.log('🗑️  Deleting old header images from database...');
  const { error: deleteError } = await supabase
    .from('wanderlog_images')
    .delete()
    .eq('trip_id', TRIP_ID)
    .eq('associated_section', 'header');

  if (deleteError) {
    console.error('❌ Error deleting old images:', deleteError);
    return;
  }
  console.log('✅ Old header images deleted\n');

  // Step 4: Insert new header images
  console.log('💾 Inserting new header images into database...');
  const newImages = uploadedUrls.map((url, index) => ({
    trip_id: TRIP_ID,
    url,
    associated_section: 'header',
    position: index,
    alt: `Edmonton header image ${index + 1}`
  }));

  const { data: insertedImages, error: insertError } = await supabase
    .from('wanderlog_images')
    .insert(newImages)
    .select();

  if (insertError) {
    console.error('❌ Error inserting new images:', insertError);
    return;
  }

  console.log('✅ New header images inserted successfully!');
  console.log(`📊 Total images: ${insertedImages.length}\n`);

  console.log('🎉 Complete! Your Edmonton teaser now has these header images:');
  uploadedUrls.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });
  console.log(`\n🌐 View your teaser at: /teaser/${TRIP_ID}`);
}

uploadImages().catch(console.error);
