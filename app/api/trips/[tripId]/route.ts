import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/trips/[tripId]
 * Fetches complete trip data from structured Supabase tables
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    // 1. Fetch trip metadata
    const { data: trip, error: tripError } = await supabase
      .from('wanderlog_trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // 2. Fetch flights
    const { data: flights } = await supabase
      .from('wanderlog_flights')
      .select('*')
      .eq('trip_id', tripId);

    // 3. Fetch hotels
    const { data: hotels } = await supabase
      .from('wanderlog_hotels')
      .select('*')
      .eq('trip_id', tripId);

    // 4. Fetch car rentals
    const { data: carRentals } = await supabase
      .from('wanderlog_car_rentals')
      .select('*')
      .eq('trip_id', tripId);

    // 5. Fetch activities
    const { data: activities } = await supabase
      .from('wanderlog_activities')
      .select('*')
      .eq('trip_id', tripId);

    // 6. Fetch images
    const { data: images } = await supabase
      .from('wanderlog_images')
      .select('*')
      .eq('trip_id', tripId)
      .order('position', { ascending: true });

    // 7. Fetch daily schedules
    const { data: dailySchedule } = await supabase
      .from('wanderlog_daily_schedules')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true });

    // 8. Get header images (first 6 images with associated_section = 'header')
    const headerImages = images?.filter((img) => img.associated_section === 'header').slice(0, 6) || [];

    // 9. Associate images with activities
    const activitiesWithImages = activities?.map((activity) => ({
      ...activity,
      images: images?.filter((img) => img.activity_id === activity.id) || [],
    })) || [];

    // 10. Build response in format expected by teaser page
    const response = {
      id: trip.id,
      title: trip.title,
      startDate: trip.start_date,
      endDate: trip.end_date,
      notes: trip.notes,
      creator: trip.creator,
      wanderlogUrl: trip.wanderlog_url,
      headerImages: headerImages.map((img) => img.url),
      flights: flights?.map((f) => ({
        id: f.id,
        airline: f.airline,
        departureAirport: f.departure_airport,
        arrivalAirport: f.arrival_airport,
        departureTime: f.departure_time,
        arrivalTime: f.arrival_time,
        price: f.price,
        currency: f.currency,
        baggageOptions: f.baggage_options,
      })) || [],
      hotels: hotels?.map((h) => ({
        id: h.id,
        name: h.name,
        address: h.address,
        roomType: h.room_type,
        price: h.price,
        currency: h.currency,
        rating: h.rating,
        amenities: h.amenities,
        images: images?.filter((img) => img.associated_section === 'hotel').map((img) => img.url) || [],
      })) || [],
      carRentals: carRentals?.map((c) => ({
        id: c.id,
        company: c.company,
        vehicleType: c.vehicle_type,
        pickupLocation: c.pickup_location,
        dropoffLocation: c.dropoff_location,
        price: c.price,
        currency: c.currency,
      })) || [],
      activities: activitiesWithImages.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        hours: a.hours,
        rating: a.rating,
        address: a.address,
        contact: a.contact,
        images: a.images.map((img: any) => ({
          url: img.url,
          alt: img.alt,
          caption: img.caption,
        })),
      })),
      dailySchedule: dailySchedule?.map((day) => ({
        dayNumber: day.day_number,
        date: day.date,
        items: day.items,
      })) || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
