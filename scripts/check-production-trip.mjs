import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tripId = '7317a480-7173-4a6e-ad9b-a5fb543b0f8b';

// Get trip data
const { data: trip, error: tripError } = await supabase
  .from('wanderlog_trips')
  .select('*')
  .eq('id', tripId)
  .maybeSingle();

if (tripError) {
  console.error('Error fetching trip:', tripError);
  process.exit(1);
}

if (!trip) {
  console.log('❌ Trip not found');
  process.exit(0);
}

console.log('=== TRIP DATA ===');
console.log('Title:', trip.title);
console.log('Dates:', trip.start_date, 'to', trip.end_date);
console.log('URL:', trip.wanderlog_url);

// Check for data in related tables
const { data: flights } = await supabase
  .from('wanderlog_flights')
  .select('*')
  .eq('trip_id', tripId);

const { data: hotels } = await supabase
  .from('wanderlog_hotels')
  .select('*')
  .eq('trip_id', tripId);

const { data: activities } = await supabase
  .from('wanderlog_activities')
  .select('*')
  .eq('trip_id', tripId);

const { data: images } = await supabase
  .from('wanderlog_images')
  .select('*')
  .eq('trip_id', tripId);

const { data: dailySchedule } = await supabase
  .from('wanderlog_daily_schedules')
  .select('*')
  .eq('trip_id', tripId);

console.log('\n=== RELATED DATA ===');
console.log('Flights:', flights?.length || 0);
console.log('Hotels:', hotels?.length || 0);
console.log('Activities:', activities?.length || 0);
console.log('Images:', images?.length || 0);
console.log('Daily Schedules:', dailySchedule?.length || 0);

// Check for potential issues
console.log('\n=== POTENTIAL ISSUES ===');

if (!images || images.length === 0) {
  console.log('⚠️  No images found - this might cause the teaser page to crash');
}

if (!dailySchedule || dailySchedule.length === 0) {
  console.log('⚠️  No daily schedule found');
}

if (dailySchedule && dailySchedule.length > 0) {
  dailySchedule.forEach((day, idx) => {
    if (!day.items || day.items.length === 0) {
      console.log(`⚠️  Day ${day.day_number} has no items`);
    }
    if (!Array.isArray(day.items)) {
      console.log(`⚠️  Day ${day.day_number} items is not an array:`, typeof day.items);
    }
  });
}

if (images && images.length > 0) {
  const headerImages = images.filter(img => img.associated_section === 'header');
  console.log(`ℹ️  Header images: ${headerImages.length}`);

  if (headerImages.length === 0) {
    console.log('⚠️  No header images found - teaser page might not display banner');
  }
}
