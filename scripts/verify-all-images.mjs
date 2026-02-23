import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('✅ Verifying all activity images...\n');

// Check Day 1-4 activities
const checkActivities = [
  { name: 'Cebu Taoist Temple', id: '40489ff6-d830-44b6-a4cd-657382c1a90f', day: 1 },
  { name: 'Temple of Leah', id: '18126422-203a-4ae5-aa9f-a2018a766172', day: 1 },
  { name: 'Oslob Whale Shark Watching', id: 'bba5ee6b-4b26-42f8-922f-7b89afef27a7', day: 2 },
  { name: 'Kawasan Falls', id: '96d17381-b07c-4645-ab1e-ff909916fe42', day: 3 },
  { name: 'Alona Beach', id: 'a756ee83-5ce7-460b-a6cf-01c3567091c2', day: 4 },
  { name: 'Luna Tiger Spa and Massage', id: 'b2c1edf2-624b-4552-98cf-befd2fd88603', day: 4 }
];

for (const activity of checkActivities) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('activity_id', activity.id)
    .order('position');

  console.log(`Day ${activity.day}: ${activity.name}`);
  console.log(`  Images: ${images?.length || 0}`);

  if (images && images.length > 0) {
    images.forEach((img, idx) => {
      console.log(`    ${idx + 1}. ${img.alt}`);
    });
  } else {
    console.log(`    ⚠️  NO IMAGES - NEEDS IMAGES ADDED`);
  }
  console.log('');
}
