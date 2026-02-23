import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Finding Oslob activities...\n');

// Get ALL Oslob activities
const { data: allOslob } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Oslob Whale Shark Watching')
  .order('created_at', { ascending: false });

console.log(`Found ${allOslob.length} Oslob activity/activities`);

// Use the newest one
const oslobId = allOslob[0].id;
console.log(`Using Oslob ID: ${oslobId}`);

// Delete existing images for this activity
console.log('\n🗑️  Deleting old images...');
const { error: deleteError } = await supabase
  .from('wanderlog_images')
  .delete()
  .eq('trip_id', tripId)
  .eq('activity_id', oslobId);

if (deleteError) {
  console.error('Delete error:', deleteError);
} else {
  console.log('✅ Old images deleted');
}

// Add NEW Philippines whale shark image (Oslob-specific)
console.log('\n📸 Adding Philippines whale shark image...');

// Using a Philippines/Oslob-specific whale shark image
const imageUrl = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop';

const response = await fetch(imageUrl);
const arrayBuffer = await response.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
const base64 = buffer.toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64}`;

console.log(`✅ Image fetched (${Math.round(base64.length / 1024)}KB)`);

// Insert new image
const { data: newImage, error: imgError } = await supabase
  .from('wanderlog_images')
  .insert({
    trip_id: tripId,
    url: dataUrl,
    associated_section: 'activity',
    activity_id: oslobId,
    position: 0,
    alt: 'Swimming with whale sharks in Oslob, Philippines',
    caption: 'Experience the majestic whale sharks of Oslob'
  })
  .select()
  .single();

if (imgError) {
  console.error('❌ Error adding image:', imgError);
  process.exit(1);
}

console.log(`✅ New Philippines whale shark image added!`);
console.log(`   Image ID: ${newImage.id}`);

console.log('\n🎉 DONE! Oslob now has a Philippines whale shark image');
