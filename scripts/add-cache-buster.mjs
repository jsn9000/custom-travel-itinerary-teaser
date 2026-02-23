import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔄 Adding cache-busting timestamps to images...\n');

const taoistTempleId = '40489ff6-d830-44b6-a4cd-657382c1a90f';
const oslobId = '9dd86c1e-e5b0-405c-872d-9769edb30991';

// Get images
const { data: images } = await supabase
  .from('wanderlog_images')
  .select('*')
  .in('activity_id', [taoistTempleId, oslobId]);

console.log(`Found ${images?.length || 0} images to update\n`);

// Add timestamp to each
const timestamp = Date.now();

for (const img of images || []) {
  const newUrl = `${img.url}${img.url.includes('?') ? '&' : '?'}v=${timestamp}`;

  const { error } = await supabase
    .from('wanderlog_images')
    .update({ url: newUrl })
    .eq('id', img.id);

  if (error) {
    console.error(`❌ Error updating ${img.id}:`, error.message);
  } else {
    console.log(`✅ Updated: ${img.alt || 'image'}`);
  }
}

console.log('\n✅ All images updated with cache-busting timestamp');
