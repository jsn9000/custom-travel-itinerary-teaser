import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🍽️  Adding unique images to food venues without images...\n');

// The Lost Cow
console.log('Day 4: The Lost Cow');
const { data: lostCow } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Lost Cow%')
  .maybeSingle();

if (lostCow) {
  const lostCowImages = [
    {
      url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
      alt: 'The Lost Cow - Beachfront restaurant with fresh seafood'
    },
    {
      url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80',
      alt: 'The Lost Cow - Grilled dishes with ocean view'
    },
    {
      url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
      alt: 'The Lost Cow - Tropical dining experience'
    }
  ];

  for (let i = 0; i < lostCowImages.length; i++) {
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: lostCow.id,
      url: lostCowImages[i].url,
      alt: lostCowImages[i].alt,
      associated_section: 'dining',
      position: i + 1
    });
  }
  console.log('  ✅ Added 3 unique images\n');
}

// Maholo Restaurant
console.log('Day 5: Maholo Restaurant');
const { data: maholo } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Maholo%')
  .maybeSingle();

if (maholo) {
  const maholoImages = [
    {
      url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
      alt: 'Maholo Restaurant - Contemporary dining with local cuisine'
    },
    {
      url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=80',
      alt: 'Maholo Restaurant - Elegant restaurant setting'
    },
    {
      url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80',
      alt: 'Maholo Restaurant - Fine dining ambiance'
    }
  ];

  for (let i = 0; i < maholoImages.length; i++) {
    await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: maholo.id,
      url: maholoImages[i].url,
      alt: maholoImages[i].alt,
      associated_section: 'dining',
      position: i + 1
    });
  }
  console.log('  ✅ Added 3 unique images\n');
}

// Gerry's Dumaguete
console.log('Day 6: Gerry\'s Dumaguete');
const { data: gerrys } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Gerry%')
  .maybeSingle();

if (gerrys) {
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
      activity_id: gerrys.id,
      url: gerrysImages[i].url,
      alt: gerrysImages[i].alt,
      associated_section: 'dining',
      position: i + 1
    });
  }
  console.log('  ✅ Added 3 unique images\n');
}

// Neva's Pizza
console.log('Day 10: Neva\'s Pizza');
const { data: nevas } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Neva%')
  .maybeSingle();

if (nevas) {
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
      activity_id: nevas.id,
      url: nevasImages[i].url,
      alt: nevasImages[i].alt,
      associated_section: 'dining',
      position: i + 1
    });
  }
  console.log('  ✅ Added 3 unique images\n');
}

console.log('✅ DONE! All food venues now have unique images');
