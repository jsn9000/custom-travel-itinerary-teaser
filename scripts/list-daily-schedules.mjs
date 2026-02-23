import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Fetch all daily schedules for this trip
const { data: schedules, error } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .order('day_number', { ascending: true });

if (error) {
  console.error('Error fetching schedules:', error);
  process.exit(1);
}

// Display each day
for (let i = 1; i <= 10; i++) {
  const daySchedule = schedules.find(s => s.day_number === i);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`DAY ${i}`);
  console.log('='.repeat(60));

  if (!daySchedule || !daySchedule.items || daySchedule.items.length === 0) {
    console.log('❌ No activities or dining found');
    continue;
  }

  const activities = daySchedule.items.filter(item => item.type === 'activity');
  const food = daySchedule.items.filter(item => item.type === 'food');

  console.log('\n🎯 ACTIVITIES:');
  if (activities.length === 0) {
    console.log('   None');
  } else {
    activities.forEach((activity, idx) => {
      console.log(`   ${idx + 1}. ${activity.name}`);
    });
  }

  console.log('\n🍽️  FOOD:');
  if (food.length === 0) {
    console.log('   None');
  } else {
    food.forEach((restaurant, idx) => {
      console.log(`   ${idx + 1}. ${restaurant.name}`);
    });
  }
}

console.log(`\n${'='.repeat(60)}\n`);
