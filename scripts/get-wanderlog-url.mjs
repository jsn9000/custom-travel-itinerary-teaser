import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

const { data: trip, error } = await supabase
  .from('wanderlog_trips')
  .select('source_url, destination')
  .eq('id', tripId)
  .single();

if (error) {
  console.error('Error fetching trip:', error);
  process.exit(1);
}

console.log('Wanderlog URL:', trip.source_url);
console.log('Destination:', trip.destination);
