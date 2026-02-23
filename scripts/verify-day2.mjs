import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Fetch Day 2 schedule
const { data: day2, error } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 2)
  .single();

if (error) {
  console.error('Error fetching Day 2:', error);
  process.exit(1);
}

console.log('Day 2 Current Data:');
console.log('Number of items:', day2.items.length);
console.log('\nItems:');
day2.items.forEach((item, idx) => {
  console.log(`${idx + 1}. ${item.name} (${item.type})`);
});

// Now ensure it only has Oslob
console.log('\n---\nUpdating Day 2 to only have Oslob Whale Shark Watching...\n');

// Get Oslob activity ID
const { data: oslob, error: oslobError } = await supabase
  .from('wanderlog_activities')
  .select('id, name, description')
  .eq('trip_id', tripId)
  .eq('name', 'Oslob Whale Shark Watching')
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (oslobError) {
  console.error('Error finding Oslob activity:', oslobError);
  process.exit(1);
}

const updatedItems = [
  {
    id: oslob.id,
    name: oslob.name,
    type: 'activity',
    description: oslob.description
  }
];

// Update Day 2
const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: updatedItems })
  .eq('trip_id', tripId)
  .eq('day_number', 2);

if (updateError) {
  console.error('Error updating Day 2:', updateError);
  process.exit(1);
}

console.log('✅ Day 2 updated successfully!');
console.log('Day 2 now has only: Oslob Whale Shark Watching');
