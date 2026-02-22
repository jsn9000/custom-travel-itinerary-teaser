import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// 1. Add Oslob Whale Shark Watching activity
console.log('\n🐋 Adding Oslob Whale Shark Watching activity...');
const oslobActivity = {
  trip_id: tripId,
  name: 'Oslob Whale Shark Watching',
  description: 'Experience swimming with gentle giants in their natural habitat. Oslob is world-famous for whale shark encounters where you can snorkel alongside these magnificent creatures in crystal-clear waters.',
  address: 'Oslob, Cebu, Philippines',
  rating: 4.8,
  hours: 'Best time: 6:00 AM - 12:00 PM',
  contact: null
};

const { data: activityData, error: activityError } = await supabase
  .from('wanderlog_activities')
  .insert(oslobActivity)
  .select()
  .single();

if (activityError) {
  console.error('❌ Error adding Oslob activity:', activityError);
  process.exit(1);
} else {
  console.log(`✅ Added activity: ${activityData.name} (ID: ${activityData.id})`);
}

// 2. Fetch current Day 2 schedule
console.log('\n📅 Fetching Day 2 schedule...');
const { data: day2Data, error: day2Error } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 2)
  .single();

if (day2Error) {
  console.error('❌ Error fetching Day 2:', day2Error);
  process.exit(1);
}

console.log('Current Day 2 items:', day2Data.items.length);

// 3. Update Day 2 with Oslob activity (replace all activities)
const updatedItems = [
  {
    id: activityData.id,
    name: activityData.name,
    type: 'activity',
    description: activityData.description
  }
];

console.log('\n🔄 Updating Day 2 with Oslob activity...');
const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({
    items: updatedItems
  })
  .eq('trip_id', tripId)
  .eq('day_number', 2);

if (updateError) {
  console.error('❌ Error updating Day 2:', updateError);
  process.exit(1);
}

console.log('✅ Day 2 updated successfully!');
console.log(`💡 Day 2 now shows: ${activityData.name}`);
