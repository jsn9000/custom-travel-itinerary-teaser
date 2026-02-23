import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Fetch ALL daily schedules including duplicates
const { data: allSchedules, error } = await supabase
  .from('wanderlog_daily_schedules')
  .select('id, day_number, created_at, items')
  .eq('trip_id', tripId)
  .order('day_number', { ascending: true });

if (error) {
  console.error('Error fetching schedules:', error);
  process.exit(1);
}

console.log(`Total schedule records: ${allSchedules.length}\n`);

// Group by day number
const dayGroups = {};
allSchedules.forEach(schedule => {
  if (!dayGroups[schedule.day_number]) {
    dayGroups[schedule.day_number] = [];
  }
  dayGroups[schedule.day_number].push(schedule);
});

// Show duplicates
for (let dayNum = 1; dayNum <= 10; dayNum++) {
  const records = dayGroups[dayNum] || [];
  console.log(`Day ${dayNum}: ${records.length} record(s)`);
  records.forEach((record, idx) => {
    const itemCount = record.items ? record.items.length : 0;
    console.log(`  Record ${idx + 1}: ${itemCount} items, created: ${record.created_at}, id: ${record.id}`);
  });
  console.log('');
}
