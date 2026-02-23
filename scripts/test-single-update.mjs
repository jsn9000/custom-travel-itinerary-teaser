import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';
const day1RecordId = '3a004910-05c4-4044-bf06-fca36187f39b';

console.log('Testing update on Day 1 record...\n');

// First, read the current data
console.log('1. Reading current data:');
const { data: before, error: readError } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('id', day1RecordId)
  .single();

if (readError) {
  console.error('Read error:', readError);
  process.exit(1);
}

console.log(`   Current items count: ${before.items.length}`);
console.log(`   Day number: ${before.day_number}`);

// Try a simple update
console.log('\n2. Attempting update...');
const testItems = [
  { id: 'test-1', name: 'Test Activity 1', type: 'activity', description: 'Test desc 1' },
  { id: 'test-2', name: 'Test Activity 2', type: 'activity', description: 'Test desc 2' }
];

const { data: updateData, error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: testItems })
  .eq('id', day1RecordId)
  .select();

if (updateError) {
  console.error('   ❌ Update error:', updateError);
  console.error('   Error code:', updateError.code);
  console.error('   Error message:', updateError.message);
  console.error('   Error details:', updateError.details);
  console.error('   Error hint:', updateError.hint);
} else {
  console.log('   ✅ Update returned success');
  console.log('   Returned data:', updateData);
}

// Read again to verify
console.log('\n3. Reading data after update:');
const { data: after, error: verifyError } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('id', day1RecordId)
  .single();

if (verifyError) {
  console.error('Verify error:', verifyError);
} else {
  console.log(`   Items count after update: ${after.items.length}`);
  console.log(`   Items:`, JSON.stringify(after.items, null, 2));
}
