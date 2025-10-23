// Quick script to fetch images from Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchImages() {
  const { data, error } = await supabase
    .from('images')
    .select('url, context, position')
    .limit(10);

  if (error) {
    console.error('Error fetching images:', error);
    return;
  }

  console.log('Found', data.length, 'images in Supabase:\n');
  data.forEach((img, idx) => {
    console.log(`${idx + 1}. ${img.url}`);
    console.log(`   Context: ${img.context || 'N/A'}`);
    console.log(`   Position: ${img.position}\n`);
  });
}

fetchImages();
