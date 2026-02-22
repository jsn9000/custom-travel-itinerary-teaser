import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Update trip dates to October 4-14, 2026
const { data, error } = await supabase
  .from('wanderlog_trips')
  .update({
    start_date: '2026-10-04',
    end_date: '2026-10-14'
  })
  .eq('id', tripId)
  .select();

if (error) {
  console.error('Error updating trip dates:', error);
  process.exit(1);
}

console.log('✅ Trip dates updated successfully!');
console.log('New dates: October 4, 2026 - October 14, 2026');
