import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Get activities
const { data: activities, error: activitiesError } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .order('id');

if (activitiesError) {
  console.error('Error fetching activities:', activitiesError);
  process.exit(1);
}

// Get images
const { data: images, error: imagesError } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId)
  .eq('associated_section', 'activity');

if (imagesError) {
  console.error('Error fetching images:', imagesError);
  process.exit(1);
}

console.log('=== ACTIVITIES ===');
console.log(`Total activities: ${activities.length}`);

// Find specific activities
const templeOfLeah = activities.find(a => a.name?.toLowerCase().includes('temple of leah'));
const mcdonalds = activities.find(a => a.name?.toLowerCase().includes('mcdonald'));

console.log('\n=== SPECIFIC ACTIVITIES ===');
if (templeOfLeah) {
  console.log('Temple of Leah:', templeOfLeah.id, '-', templeOfLeah.name);
  const templeImages = images.filter(img => img.activity_id === templeOfLeah.id);
  console.log(`  Images: ${templeImages.length}`);
  templeImages.forEach(img => {
    console.log(`    - ${img.url.substring(0, 100)}...`);
  });
}

if (mcdonalds) {
  console.log('\nMcDonald\'s:', mcdonalds.id, '-', mcdonalds.name);
  const mcImages = images.filter(img => img.activity_id === mcdonalds.id);
  console.log(`  Images: ${mcImages.length}`);
  mcImages.forEach(img => {
    console.log(`    - ${img.url.substring(0, 100)}...`);
  });
}

console.log('\n=== IMAGES SUMMARY ===');
console.log(`Total activity images: ${images.length}`);

// Check for duplicate images
const imageUrls = images.map(img => img.url);
const duplicates = imageUrls.filter((url, index) => imageUrls.indexOf(url) !== index);
if (duplicates.length > 0) {
  console.log(`\n⚠️  Found ${duplicates.length} duplicate image URLs`);
}

// Check for van/desert image
const vanImages = images.filter(img =>
  img.url?.toLowerCase().includes('van') ||
  img.url?.toLowerCase().includes('desert') ||
  img.url?.includes('photo-1464037866556')
);
console.log(`\n🚐 Van/Desert images: ${vanImages.length}`);
vanImages.forEach(img => {
  console.log(`  - Activity ID: ${img.activity_id}`);
  console.log(`    URL: ${img.url.substring(0, 100)}...`);
});

// Show first 20 activities with their image counts
console.log('\n=== ACTIVITIES WITH IMAGE COUNTS ===');
activities.slice(0, 20).forEach(activity => {
  const activityImages = images.filter(img => img.activity_id === activity.id);
  console.log(`${activity.name}: ${activityImages.length} images`);
});
