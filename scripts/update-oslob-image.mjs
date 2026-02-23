import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Find Oslob activity
console.log('🔍 Finding Oslob Whale Shark Watching activity...');
const { data: oslob, error: oslobError } = await supabase
  .from('wanderlog_activities')
  .select('id, name')
  .eq('trip_id', tripId)
  .eq('name', 'Oslob Whale Shark Watching')
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (oslobError) {
  console.error('❌ Error finding Oslob activity:', oslobError);
  process.exit(1);
}

console.log(`✅ Found activity: ${oslob.name} (ID: ${oslob.id})`);

// Whale shark image from Unsplash
const imageUrl = 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800&auto=format&fit=crop';

console.log('\n📷 Fetching whale shark image...');
const response = await fetch(imageUrl);
const arrayBuffer = await response.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
const base64 = buffer.toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64}`;

console.log(`✅ Image fetched and converted to base64 (${Math.round(base64.length / 1024)}KB)`);

// Check if image already exists for this activity
console.log('\n🔍 Checking for existing images...');
const { data: existingImages, error: checkError } = await supabase
  .from('wanderlog_images')
  .select('id')
  .eq('trip_id', tripId)
  .eq('activity_id', oslob.id);

if (checkError) {
  console.error('❌ Error checking for existing images:', checkError);
  process.exit(1);
}

if (existingImages && existingImages.length > 0) {
  console.log(`⚠️  Found ${existingImages.length} existing image(s). Deleting...`);
  const { error: deleteError } = await supabase
    .from('wanderlog_images')
    .delete()
    .eq('trip_id', tripId)
    .eq('activity_id', oslob.id);

  if (deleteError) {
    console.error('❌ Error deleting existing images:', deleteError);
    process.exit(1);
  }
  console.log('✅ Existing images deleted');
}

// Insert new image
console.log('\n➕ Adding new whale shark image...');
const { data: imageData, error: imageError } = await supabase
  .from('wanderlog_images')
  .insert({
    trip_id: tripId,
    url: dataUrl,
    associated_section: 'activity',
    activity_id: oslob.id,
    position: 0,
    alt: 'Whale shark swimming underwater in Oslob',
    caption: 'Swim with gentle giant whale sharks in their natural habitat'
  })
  .select()
  .single();

if (imageError) {
  console.error('❌ Error adding image:', imageError);
  process.exit(1);
}

console.log('✅ Whale shark image added successfully!');
console.log(`💡 Image ID: ${imageData.id}`);
console.log('\n🎉 Done! The Oslob activity will now display the whale shark image.');
