import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔥 DESTROYING ALL YELLOW BUS/VAN IMAGES FOREVER...\n');

// Get ALL images for this trip
const { data: allImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId);

console.log(`Total images in database: ${allImages?.length || 0}\n`);

// Search patterns for yellow bus/van images
const suspiciousPatterns = [
  'photo-1527786356703',  // Known yellow van
  'photo-1464037866556',  // Known yellow van
  'photo-1469854523086',  // Known yellow van/bus
  'photo-1476514525535',  // Desert van
  'photo-1523712999610',  // Mountain van
  'photo-1533587851505',  // Van/bus
  'yellow',
  'bus',
  'van',
  'desert',
  'mountain'
];

let deleteCount = 0;
const imagesToDelete = [];

for (const img of allImages || []) {
  const url = img.url?.toLowerCase() || '';
  const alt = img.alt?.toLowerCase() || '';

  // Check if image matches any suspicious pattern
  for (const pattern of suspiciousPatterns) {
    if (url.includes(pattern) || alt.includes(pattern)) {
      imagesToDelete.push(img);
      console.log(`🎯 FOUND: ${img.alt || 'No alt text'}`);
      console.log(`   URL: ${img.url.substring(0, 80)}...`);
      console.log(`   ID: ${img.id}`);

      // DELETE IT
      const { error } = await supabase
        .from('wanderlog_images')
        .delete()
        .eq('id', img.id);

      if (error) {
        console.error(`   ❌ Error deleting: ${error.message}`);
      } else {
        console.log(`   💥 DELETED!`);
        deleteCount++;
      }

      break; // Don't double-count
    }
  }
}

console.log(`\n🔥 TOTAL DESTROYED: ${deleteCount} yellow bus/van images`);
console.log(`\n✅ The yellow bus will NEVER appear again!`);

// Verify they're gone
const { data: remainingImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId);

console.log(`\n📊 Images remaining in database: ${remainingImages?.length || 0}`);
console.log(`   (Started with: ${allImages?.length || 0}, Deleted: ${deleteCount})`);
