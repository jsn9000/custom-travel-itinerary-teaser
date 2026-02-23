import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Finding all Oslob activities...\n');

// Find ALL Oslob activities
const { data: allOslob, error } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Oslob Whale Shark Watching')
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Found ${allOslob.length} Oslob activities:\n`);
allOslob.forEach((activity, i) => {
  console.log(`${i + 1}. ID: ${activity.id}`);
  console.log(`   Created: ${activity.created_at}`);
  console.log(`   Description: ${activity.description.substring(0, 80)}...`);
  console.log('');
});

// Keep the NEWEST one (first in array since we ordered by created_at desc)
const keepOslob = allOslob[0];
const deleteOslob = allOslob.slice(1);

console.log(`✅ KEEPING: ${keepOslob.id} (newest)`);
console.log(`🗑️  DELETING: ${deleteOslob.map(o => o.id).join(', ')}\n`);

// Delete old ones
for (const old of deleteOslob) {
  const { error: delError } = await supabase
    .from('wanderlog_activities')
    .delete()
    .eq('id', old.id);

  if (delError) {
    console.error(`Error deleting ${old.id}:`, delError);
  } else {
    console.log(`✅ Deleted old Oslob: ${old.id}`);
  }
}

// Now check/update the image
console.log('\n📸 Checking images for the kept Oslob activity...');
const { data: existingImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId)
  .eq('activity_id', keepOslob.id);

console.log(`Found ${existingImages?.length || 0} existing images`);

if (!existingImages || existingImages.length === 0) {
  console.log('\n➕ Adding whale shark image...');

  // Fetch and add whale shark image
  const imageUrl = 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800&auto=format&fit=crop';
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  const { data: newImage, error: imgError } = await supabase
    .from('wanderlog_images')
    .insert({
      trip_id: tripId,
      url: dataUrl,
      associated_section: 'activity',
      activity_id: keepOslob.id,
      position: 0,
      alt: 'Whale shark swimming underwater in Oslob',
      caption: 'Swim with gentle giant whale sharks'
    })
    .select()
    .single();

  if (imgError) {
    console.error('Error adding image:', imgError);
  } else {
    console.log(`✅ Added whale shark image: ${newImage.id}`);
  }
} else {
  console.log('✅ Whale shark image already exists');
}

// Update Day 2 to use the correct Oslob ID
console.log('\n📅 Updating Day 2 schedule...');
const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: [{
      id: keepOslob.id,
      name: keepOslob.name,
      type: 'activity',
      description: keepOslob.description
    }]
  })
  .eq('trip_id', tripId)
  .eq('day_number', 2);

if (updateError) {
  console.error('Error updating Day 2:', updateError);
} else {
  console.log('✅ Day 2 updated with correct Oslob ID');
}

console.log('\n🎉 DONE! Fixed Oslob duplicates and image');
