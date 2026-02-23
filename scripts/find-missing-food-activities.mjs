import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Finding food activity IDs from schedule...\n');

// Get all daily schedules
const { data: allDays } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number');

const foodVenues = ['Maholo Restaurant', 'Gerry', 'Neva'];

for (const day of allDays || []) {
  for (const item of day.items) {
    if (item.type === 'food' || item.type === 'dining') {
      for (const venueName of foodVenues) {
        if (item.name?.includes(venueName)) {
          console.log(`Day ${day.day_number}: ${item.name}`);
          console.log(`   ID: ${item.id}`);
          console.log(`   Type: ${item.type}`);

          // Check if this activity exists in activities table
          const { data: activity } = await supabase
            .from('wanderlog_activities')
            .select('*')
            .eq('id', item.id)
            .maybeSingle();

          if (activity) {
            console.log(`   ✅ Exists in activities table`);

            // Check images
            const { data: images } = await supabase
              .from('wanderlog_images')
              .select('*')
              .eq('activity_id', item.id);

            console.log(`   Images: ${images?.length || 0}`);
          } else {
            console.log(`   ❌ NOT in activities table - need to create it`);
          }
          console.log('');
        }
      }
    }
  }
}
