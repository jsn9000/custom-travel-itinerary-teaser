import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TRIP_ID = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

async function checkTripStructure() {
  console.log('🔍 Checking trip structure...\n');

  try {
    const { data, error } = await supabase
      .from('wanderlog_trips')
      .select('*')
      .eq('id', TRIP_ID)
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('All columns:');
    Object.keys(data).forEach(key => {
      console.log(`\n${key}:`, typeof data[key] === 'object' ? JSON.stringify(data[key], null, 2) : data[key]);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTripStructure();
