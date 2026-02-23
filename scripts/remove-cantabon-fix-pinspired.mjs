import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🗑️  Removing Cantabon Cave from all days...\n');

// Get all days
const { data: schedules } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number');

// Remove Cantabon Cave from all days
for (const day of schedules || []) {
  const originalCount = day.items.length;
  const updatedItems = day.items.filter(item =>
    !item.name?.toLowerCase().includes('cantabon')
  );

  if (updatedItems.length < originalCount) {
    console.log(`Day ${day.day_number}: Removing ${originalCount - updatedItems.length} Cantabon Cave item(s)`);

    const { error } = await supabase
      .from('wanderlog_daily_schedules')
      .update({ items: updatedItems })
      .eq('trip_id', tripId)
      .eq('day_number', day.day_number);

    if (error) {
      console.error(`❌ Error updating Day ${day.day_number}: ${error.message}`);
    } else {
      console.log(`✅ Day ${day.day_number} updated (${updatedItems.length} items remaining)`);
    }
  }
}

console.log('\n📸 Updating Pinspired Art Souvenirs images...\n');

// Find Pinspired activity
const { data: pinspiredActivity } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%pinspired%')
  .maybeSingle();

if (pinspiredActivity) {
  console.log(`Found: ${pinspiredActivity.name} (ID: ${pinspiredActivity.id})`);

  // Delete old images
  await supabase.from('wanderlog_images').delete().eq('activity_id', pinspiredActivity.id);
  console.log('  ✅ Deleted old images');

  // Add new art gallery/souvenir shop images
  const newImages = [
    {
      url: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800&q=80',
      alt: 'Colorful art gallery with local artwork and souvenirs'
    },
    {
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
      alt: 'Handcrafted souvenirs and local artisan products'
    },
    {
      url: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&q=80',
      alt: 'Art studio with unique handmade gifts and crafts'
    }
  ];

  for (let i = 0; i < newImages.length; i++) {
    const img = newImages[i];
    const { error } = await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: pinspiredActivity.id,
      url: img.url,
      alt: img.alt,
      associated_section: 'activity',
      position: i + 1
    });

    if (error) {
      console.error(`  ❌ Error adding image: ${error.message}`);
    } else {
      console.log(`  ✅ ${img.alt}`);
    }
  }
}

console.log('\n✅ DONE! Cantabon Cave removed and Pinspired images updated');
