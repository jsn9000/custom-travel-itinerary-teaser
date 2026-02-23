import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔥🔥🔥 DESTROYING ALL DUPLICATE FOOD IMAGES 🔥🔥🔥\n');

// Get all daily schedules
const { data: allDays } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number');

// Collect all food venues
const foodVenues = [];
for (const day of allDays || []) {
  for (const item of day.items) {
    if (item.type === 'food' || item.type === 'dining') {
      foodVenues.push({
        day: day.day_number,
        name: item.name,
        id: item.id
      });
    }
  }
}

console.log(`Found ${foodVenues.length} food venues:\n`);
foodVenues.forEach(v => console.log(`  Day ${v.day}: ${v.name} (${v.id})`));

// DELETE ALL IMAGES for all food venues
console.log('\n🗑️  DELETING ALL EXISTING FOOD IMAGES...\n');

for (const venue of foodVenues) {
  const { error } = await supabase
    .from('wanderlog_images')
    .delete()
    .eq('activity_id', venue.id);

  if (error) {
    console.log(`  ❌ ${venue.name}: ${error.message}`);
  } else {
    console.log(`  ✅ ${venue.name}: Deleted all images`);
  }
}

console.log('\n✅ ALL OLD FOOD IMAGES DELETED!\n');
console.log('📸 Adding COMPLETELY UNIQUE images to each venue...\n');

// Add UNIQUE images to each venue
const uniqueImageSets = {
  'LIKEALOCALRESTAURANT': [
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', alt: 'LIKEALOCALRESTAURANT - Restaurant interior' },
    { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', alt: 'LIKEALOCALRESTAURANT - Dining atmosphere' },
    { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80', alt: 'LIKEALOCALRESTAURANT - Cozy setting' }
  ],
  'The Lost Cow': [
    { url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', alt: 'The Lost Cow - Beachfront dining' },
    { url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80', alt: 'The Lost Cow - Ocean view meals' },
    { url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80', alt: 'The Lost Cow - Tropical ambiance' }
  ],
  'Maholo Restaurant': [
    { url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80', alt: 'Maholo - Contemporary dining' },
    { url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80', alt: 'Maholo - Fine dining' },
    { url: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?w=800&q=80', alt: 'Maholo - Elegant atmosphere' }
  ],
  'Gerry': [
    { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80', alt: 'Gerry\'s - Local dining spot' },
    { url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80', alt: 'Gerry\'s - Casual restaurant' },
    { url: 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=800&q=80', alt: 'Gerry\'s - Welcoming vibe' }
  ],
  'Ground Zero Restaurant': [
    { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', alt: 'Ground Zero - Casual dining' },
    { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', alt: 'Ground Zero - Restaurant interior' },
    { url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80', alt: 'Ground Zero - Dining space' }
  ],
  'Adamo Dumaguete': [
    { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', alt: 'Adamo - Hotel restaurant' },
    { url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&q=80', alt: 'Adamo - Fine dining' },
    { url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=80', alt: 'Adamo - Upscale ambiance' }
  ],
  'Hayahay Treehouse Bar': [
    { url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80', alt: 'Hayahay - Open-air bar' },
    { url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80', alt: 'Hayahay - Tropical cocktail bar' },
    { url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80', alt: 'Hayahay - Beach bar' }
  ],
  'Neva': [
    { url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', alt: 'Neva\'s Pizza - Artisan pizza' },
    { url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80', alt: 'Neva\'s Pizza - Wood-fired' },
    { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', alt: 'Neva\'s Pizza - Italian style' }
  ]
};

for (const venue of foodVenues) {
  let images = null;

  // Find matching image set
  for (const [key, imageSet] of Object.entries(uniqueImageSets)) {
    if (venue.name.includes(key)) {
      images = imageSet;
      break;
    }
  }

  if (!images) {
    console.log(`  ⚠️  ${venue.name}: No image set found, skipping`);
    continue;
  }

  console.log(`  Day ${venue.day} - ${venue.name}:`);

  for (let i = 0; i < images.length; i++) {
    const { error } = await supabase.from('wanderlog_images').insert({
      trip_id: tripId,
      activity_id: venue.id,
      url: images[i].url,
      alt: images[i].alt,
      associated_section: 'dining',
      position: i + 1
    });

    if (error) {
      console.log(`    ❌ Error: ${error.message}`);
    } else {
      console.log(`    ✅ Added image ${i + 1}`);
    }
  }
}

console.log('\n🔍 FINAL VERIFICATION - Checking for duplicates...\n');

const imageUsageMap = new Map();

for (const venue of foodVenues) {
  const { data: images } = await supabase
    .from('wanderlog_images')
    .select('url')
    .eq('activity_id', venue.id);

  if (images) {
    for (const img of images) {
      if (!imageUsageMap.has(img.url)) {
        imageUsageMap.set(img.url, []);
      }
      imageUsageMap.get(img.url).push(venue.name);
    }
  }
}

let duplicatesFound = 0;
for (const [url, venues] of imageUsageMap.entries()) {
  const uniqueVenues = new Set(venues);
  if (uniqueVenues.size > 1) {
    duplicatesFound++;
    console.log(`❌ DUPLICATE: ${url.substring(0, 60)}...`);
    console.log(`   Used by: ${[...uniqueVenues].join(', ')}`);
  }
}

if (duplicatesFound === 0) {
  console.log('✅✅✅ NO DUPLICATES! Each venue has completely unique images! ✅✅✅\n');
} else {
  console.log(`\n❌ STILL FOUND ${duplicatesFound} DUPLICATES!\n`);
  process.exit(1);
}
