import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Verifying Cantabon Cave removal...\n');

// Check Days 9 and 12
for (const dayNum of [9, 12]) {
  const { data: day } = await supabase
    .from('wanderlog_daily_schedules')
    .select('*')
    .eq('trip_id', tripId)
    .eq('day_number', dayNum)
    .single();

  const hasCantabon = day.items.some(item =>
    item.name?.toLowerCase().includes('cantabon')
  );

  console.log(`Day ${dayNum}: ${hasCantabon ? '❌ Still has Cantabon' : '✅ No Cantabon'} (${day.items.length} items)`);
  if (!hasCantabon) {
    day.items.forEach(item => {
      console.log(`   - ${item.name}`);
    });
  }
  console.log('');
}

console.log('🔍 Checking Pinspired items...\n');

// Check Days 10 and 13
for (const dayNum of [10, 13]) {
  const { data: day } = await supabase
    .from('wanderlog_daily_schedules')
    .select('*')
    .eq('trip_id', tripId)
    .eq('day_number', dayNum)
    .single();

  const pinspiredItems = day.items.filter(item =>
    item.name?.toLowerCase().includes('pinspired')
  );

  if (pinspiredItems.length > 0) {
    console.log(`Day ${dayNum}:`);
    pinspiredItems.forEach(item => {
      console.log(`   - ${item.name} (ID: ${item.id})`);

      // Try to get this activity and its images
      if (item.id) {
        supabase
          .from('wanderlog_images')
          .select('url, alt')
          .eq('activity_id', item.id)
          .then(({ data: images }) => {
            if (images && images.length > 0) {
              console.log(`     Images: ${images.length}`);
              images.forEach((img, idx) => {
                console.log(`       ${idx + 1}. ${img.alt}`);
              });
            } else {
              console.log(`     No images found for this activity`);
            }
          });
      }
    });
    console.log('');
  }
}

// Also search all activities for Pinspired
console.log('🔍 Searching all activities for Pinspired...\n');
const { data: allPinspired } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%pinspired%');

if (allPinspired && allPinspired.length > 0) {
  console.log(`Found ${allPinspired.length} Pinspired activities in activities table:`);
  for (const act of allPinspired) {
    console.log(`\n   - ${act.name} (ID: ${act.id})`);

    const { data: images } = await supabase
      .from('wanderlog_images')
      .select('url, alt')
      .eq('activity_id', act.id);

    console.log(`     Images: ${images?.length || 0}`);
    if (images && images.length > 0) {
      images.forEach((img, idx) => {
        console.log(`       ${idx + 1}. ${img.alt}`);
      });
    }
  }
} else {
  console.log('No Pinspired activities found in activities table');
}
