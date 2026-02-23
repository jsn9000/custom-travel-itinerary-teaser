import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔍 Searching for Kabutongan Falls...\n');

// Search for Kabutongan Falls in activities
const { data: kabutongan, error } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .ilike('name', '%Kabutongan%');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

if (kabutongan && kabutongan.length > 0) {
  console.log(`Found ${kabutongan.length} Kabutongan Falls activity/activities:`);
  kabutongan.forEach((activity, i) => {
    console.log(`\n  ${i + 1}. ${activity.name}`);
    console.log(`     ID: ${activity.id}`);
    console.log(`     Created: ${activity.created_at}`);
  });

  // Delete all Kabutongan Falls activities
  console.log('\n🗑️  DELETING all Kabutongan Falls activities...');
  const { error: deleteError } = await supabase
    .from('wanderlog_activities')
    .delete()
    .eq('trip_id', tripId)
    .ilike('name', '%Kabutongan%');

  if (deleteError) {
    console.error('Delete error:', deleteError);
  } else {
    console.log('✅ All Kabutongan Falls activities deleted');
  }
} else {
  console.log('No Kabutongan Falls activities found in the database');
}

// Check ALL Day 2 related data
console.log('\n📅 Verifying Day 2 schedule...');
const { data: allDay2 } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId)
  .eq('day_number', 2);

console.log(`\nFound ${allDay2?.length || 0} Day 2 schedule record(s)`);
allDay2?.forEach((record, i) => {
  console.log(`\nRecord ${i + 1}:`);
  console.log(`  ID: ${record.id}`);
  console.log(`  Items: ${record.items.length}`);
  record.items.forEach((item, j) => {
    console.log(`    ${j + 1}. ${item.name}`);
  });
});

console.log('\n✅ DONE');
