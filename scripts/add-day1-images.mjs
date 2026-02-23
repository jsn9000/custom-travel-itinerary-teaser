import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🖼️  Adding Day 1 images from Wanderlog...\n');

// Image data from Wanderlog
const imageData = [
  // LIKEALOCALRESTAURANT images
  {
    activityName: 'LIKEALOCALRESTAURANT',
    activityId: 'fcfbc479-bf85-424a-9107-0ae51db6ab98',
    images: [
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSz-TXXmW7Lql6miUmq_wiWxGLU3T1IqMHFhpPFwxW7qBfx56fowfOTJHpZ_WAIWA718OBD62xZ6KvI5c9qZiX9Sx2p-Oms1vtp1rIM_ilMwmyGKSfMauJZF9CWN1ulJbN3Q5ZAXE-IHqkLU',
        alt: 'LIKEALOCALRESTAURANT - Filipino dining interior',
        associated_section: 'dining'
      },
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSymEHfZKtkJYGA1v6NvP1hLDT2fCANkTs_mkIAniLyDj4jt3VZN094lFKZESepUu5c_PO2qkwY2wMOEtBpqrk8hAb_q4nS4JRV_2_O2w4YXuaeZ86c47gkld99efzEorrxQdicE7FLgT5MT',
        alt: 'LIKEALOCALRESTAURANT - Restaurant atmosphere',
        associated_section: 'dining'
      },
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSziYb0Bo_isqiRm2pFN2AXMxaIPHGFAbY0TwmODwNlATabTYXQPRkdI3rQ8wOByoQP4ksV7r7dlliC8mU5JeSaQYd34nyyrGsgarhXYcBm1sxSSeGOPhbicmJQ2qINQMY0xvWuBtBtWKIB8',
        alt: 'LIKEALOCALRESTAURANT - Dining space',
        associated_section: 'dining'
      }
    ]
  },
  // Cebu Taoist Temple images
  {
    activityName: 'Cebu Taoist Temple',
    activityId: '40489ff6-d830-44b6-a4cd-657382c1a90f',
    images: [
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweoNeh9HgZdzCFXvqH26a9abI8Z-IyA6xsYK52sQXqKf9ciQi-fbLfaIpCeZNtfHN03HzBI34i752gnYu83h05v4U7kqJuRggdUSlGW5cdhYpM_WzjSEA2vaHqZwDSvHxwR0H6Lw',
        alt: 'Cebu Taoist Temple - Exterior view',
        associated_section: 'activity'
      },
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweoyYGI1gl0IdJmzLZ29xV7h_R78_x-WtYe9RRmbBzO9EYURy1QirU8CBIdKMKCXa-kzTpy6qn8VaHyPF-FLS_ShirKOFbrpC2bPiyeF4Z5gWCc5PGQdEIqCZlaPwlhV7etiQHf89g',
        alt: 'Cebu Taoist Temple - Architecture details',
        associated_section: 'activity'
      },
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwequUIPYRbpALZeRCc4AxeSza1spnOu-q6QRybTLkSCPKKETfBs5RmiXcPdYn7_kU88KQlNmI9CcnhdqySpjsZ5hKxgdne05LDE75SLpc9KiHEhTS9pj4-sRoFAq3c4nSEL9ZK1i7w',
        alt: 'Cebu Taoist Temple - Temple grounds',
        associated_section: 'activity'
      }
    ]
  },
  // Temple of Leah images - using Unsplash placeholders since Wanderlog images are keyed
  {
    activityName: 'Temple of Leah',
    activityId: '18126422-203a-4ae5-aa9f-a2018a766172',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
        alt: 'Temple of Leah - Grand Roman-inspired temple',
        associated_section: 'activity'
      },
      {
        url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
        alt: 'Temple of Leah - Panoramic view from highlands',
        associated_section: 'activity'
      },
      {
        url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
        alt: 'Temple of Leah - Architectural columns and details',
        associated_section: 'activity'
      }
    ]
  }
];

let totalAdded = 0;

for (const activity of imageData) {
  console.log(`\n📸 Adding images for ${activity.activityName}...`);

  for (let i = 0; i < activity.images.length; i++) {
    const img = activity.images[i];

    const { error } = await supabase
      .from('wanderlog_images')
      .insert({
        trip_id: tripId,
        activity_id: activity.activityId,
        url: img.url,
        alt: img.alt,
        associated_section: img.associated_section,
        position: i + 1
      });

    if (error) {
      console.error(`  ❌ Error adding image ${i + 1}:`, error.message);
    } else {
      console.log(`  ✅ Added image ${i + 1}: ${img.alt}`);
      totalAdded++;
    }
  }
}

console.log(`\n✅ Successfully added ${totalAdded} images!`);

// Also update restaurant details with correct info from Wanderlog
console.log('\n🔧 Updating restaurant details from Wanderlog...');

const { error: updateError } = await supabase
  .from('wanderlog_activities')
  .update({
    rating: 4.8,
    contact: '+63 952 481 2054',
    address: 'Philippines, Cebu, Lapu-Lapu'
  })
  .eq('id', 'fcfbc479-bf85-424a-9107-0ae51db6ab98');

if (updateError) {
  console.error('❌ Error updating restaurant:', updateError);
} else {
  console.log('✅ Restaurant details updated with Wanderlog data');
}
