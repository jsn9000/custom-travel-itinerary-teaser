import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

console.log('🔄 Setting Day 4 to Alona Beach and Luna Tiger Spa...\n');

// Find existing Alona Beach and Luna Tiger Spa activities
const { data: alona } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Alona Beach')
  .order('created_at', { ascending: false })
  .limit(1);

const { data: spa } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId)
  .eq('name', 'Luna Tiger Spa and Massage')
  .order('created_at', { ascending: false })
  .limit(1);

if (!alona || alona.length === 0) {
  console.error('❌ Alona Beach not found');
  process.exit(1);
}

if (!spa || spa.length === 0) {
  console.error('❌ Luna Tiger Spa not found');
  process.exit(1);
}

const alonaBeach = alona[0];
const lunaTiger = spa[0];

console.log(`✅ Found: ${alonaBeach.name} (ID: ${alonaBeach.id})`);
console.log(`✅ Found: ${lunaTiger.name} (ID: ${lunaTiger.id})`);

// Update Day 4 schedule
console.log('\n📅 Updating Day 4 with Alona Beach and Luna Tiger Spa...');

const day4Items = [
  {
    id: alonaBeach.id,
    name: alonaBeach.name,
    type: 'activity',
    description: alonaBeach.description
  },
  {
    id: lunaTiger.id,
    name: lunaTiger.name,
    type: 'activity',
    description: lunaTiger.description
  }
];

const { error: updateError } = await supabase
  .from('wanderlog_daily_schedules')
  .update({ items: day4Items })
  .eq('trip_id', tripId)
  .eq('day_number', 4);

if (updateError) {
  console.error('❌ Error:', updateError);
  process.exit(1);
}

console.log('✅ Day 4 updated successfully!\n');

// Check images
const { data: alonaImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('activity_id', alonaBeach.id);

const { data: spaImages } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('activity_id', lunaTiger.id);

console.log('📸 Image status:');
console.log(`  Alona Beach: ${alonaImages?.length || 0} images`);
console.log(`  Luna Tiger Spa: ${spaImages?.length || 0} images`);

console.log('\n📋 Day 4 Final State:');
console.log('  Activities:');
console.log(`    1. ${alonaBeach.name}`);
console.log(`    2. ${lunaTiger.name}`);
console.log('  Dining: None');
