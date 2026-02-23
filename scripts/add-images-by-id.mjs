import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🍽️  Adding unique images to food venues by ID...\n');

// Maholo Restaurant - Day 5
console.log('Day 5: Maholo Restaurant');
const maholoId = 'a4665691-032c-495c-ad01-94c565507a9e';

const maholoImages = [
  {
    url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    alt: 'Maholo Restaurant - Contemporary dining with local cuisine'
  },
  {
    url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80',
    alt: 'Maholo Restaurant - Fine dining ambiance'
  },
  {
    url: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?w=800&q=80',
    alt: 'Maholo Restaurant - Elegant restaurant setting'
  }
];

for (let i = 0; i < maholoImages.length; i++) {
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: maholoId,
    url: maholoImages[i].url,
    alt: maholoImages[i].alt,
    associated_section: 'dining',
    position: i + 1
  });
}
console.log('  ✅ Added 3 unique images\n');

// Gerry's Dumaguete - Day 6
console.log('Day 6: Gerry\'s Dumaguete');
const gerrysId = 'e1614c95-9b3e-415b-9494-1299db5317c8';

const gerrysImages = [
  {
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    alt: 'Gerry\'s Dumaguete - Popular local dining spot'
  },
  {
    url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
    alt: 'Gerry\'s Dumaguete - Casual restaurant with local flavors'
  },
  {
    url: 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=800&q=80',
    alt: 'Gerry\'s Dumaguete - Welcoming dining atmosphere'
  }
];

for (let i = 0; i < gerrysImages.length; i++) {
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: gerrysId,
    url: gerrysImages[i].url,
    alt: gerrysImages[i].alt,
    associated_section: 'dining',
    position: i + 1
  });
}
console.log('  ✅ Added 3 unique images\n');

// Neva's Pizza - Day 10
console.log('Day 10: Neva\'s Pizza');
const nevasId = 'be7c2886-b4d0-4670-93fc-2089279db49d';

const nevasImages = [
  {
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    alt: 'Neva\'s Pizza - Artisan pizza with fresh ingredients'
  },
  {
    url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80',
    alt: 'Neva\'s Pizza - Wood-fired pizza perfection'
  },
  {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    alt: 'Neva\'s Pizza - Delicious Italian-style pizza'
  }
];

for (let i = 0; i < nevasImages.length; i++) {
  await supabase.from('wanderlog_images').insert({
    trip_id: tripId,
    activity_id: nevasId,
    url: nevasImages[i].url,
    alt: nevasImages[i].alt,
    associated_section: 'dining',
    position: i + 1
  });
}
console.log('  ✅ Added 3 unique images\n');

console.log('✅ DONE! All food venues now have unique images');
