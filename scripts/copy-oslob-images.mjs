import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('📸 Copying Oslob images to Oslob Whale Shark Watching...\n');

// Source: "Oslob" activity with images
const sourceActivityId = '8d39e69d-13f5-4b77-bfb0-56e0315dfe8c';

// Target: "Oslob Whale Shark Watching" activity on Day 2
const targetActivityId = '9dd86c1e-e5b0-405c-872d-9769edb30991';

// Get images from source
const { data: sourceImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('activity_id', sourceActivityId);

console.log(`Found ${sourceImages?.length || 0} images from Oslob activity`);

// Delete existing images from target
console.log('\n🗑️  Deleting existing images from Oslob Whale Shark Watching...');
const { error: deleteError } = await supabase
  .from('wanderlog_images')
  .delete()
  .eq('activity_id', targetActivityId);

if (deleteError) {
  console.error('Error deleting:', deleteError);
} else {
  console.log('✅ Deleted old images');
}

// Copy images to target
console.log('\n📸 Adding new images to Oslob Whale Shark Watching...');

let addedCount = 0;

for (let i = 0; i < (sourceImages?.length || 0); i++) {
  const img = sourceImages[i];

  const { error: insertError } = await supabase
    .from('wanderlog_images')
    .insert({
      trip_id: tripId,
      activity_id: targetActivityId,
      url: img.url,
      alt: 'Oslob Whale Shark Watching',
      associated_section: 'activity',
      position: i + 1
    });

  if (insertError) {
    console.error(`  ❌ Error adding image ${i + 1}:`, insertError.message);
  } else {
    console.log(`  ✅ Added image ${i + 1}`);
    addedCount++;
  }
}

console.log(`\n✅ Successfully added ${addedCount} images to Oslob Whale Shark Watching!`);

// Verify
const { data: finalImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('activity_id', targetActivityId);

console.log(`\n📋 Oslob Whale Shark Watching now has ${finalImages?.length || 0} images`);
