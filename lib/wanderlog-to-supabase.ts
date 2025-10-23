import { supabase } from './supabase';
import type { ScrapedWanderlogData } from '@/types/wanderlog';

/**
 * Stores scraped Wanderlog data into Supabase using structured tables
 * Returns the created trip ID
 */
export async function storeWanderlogDataInSupabase(
  data: ScrapedWanderlogData
): Promise<string> {
  console.log(`💾 Starting Supabase storage for: ${data.title}`);

  try {
    // 1. Insert main trip record into wanderlog_trips table
    const { data: trip, error: tripError } = await supabase
      .from('wanderlog_trips')
      .insert({
        wanderlog_url: data.wanderlogUrl,
        title: data.title,
        creator: data.creator,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        views: data.views,
        publication_date: data.publicationDate,
        notes: data.notes,
        scraped_at: data.scrapedAt,
      })
      .select()
      .single();

    if (tripError) {
      throw new Error(`Failed to insert trip: ${tripError.message}`);
    }

    const tripId = trip.id;
    console.log(`✅ Trip saved to database with ID: ${tripId}`);

    // 2. Insert flights
    if (data.flights && data.flights.length > 0) {
      const flightsToInsert = data.flights.map((flight) => ({
        trip_id: tripId,
        airline: flight.airline,
        departure_airport: flight.departureAirport,
        arrival_airport: flight.arrivalAirport,
        departure_time: flight.departureTime,
        arrival_time: flight.arrivalTime,
        price: flight.price,
        currency: flight.currency,
        baggage_options: flight.baggageOptions,
      }));

      const { error: flightsError } = await supabase
        .from('wanderlog_flights')
        .insert(flightsToInsert);

      if (flightsError) {
        console.warn(`⚠️  Failed to insert flights: ${flightsError.message}`);
      } else {
        console.log(`✅ Inserted ${data.flights.length} flights`);
      }
    }

    // 3. Insert hotels
    if (data.hotels && data.hotels.length > 0) {
      const hotelsToInsert = data.hotels.map((hotel) => ({
        trip_id: tripId,
        name: hotel.name,
        address: hotel.address,
        room_type: hotel.roomType,
        price: hotel.price,
        currency: hotel.currency,
        rating: hotel.rating,
        amenities: hotel.amenities,
      }));

      const { error: hotelsError } = await supabase
        .from('wanderlog_hotels')
        .insert(hotelsToInsert);

      if (hotelsError) {
        console.warn(`⚠️  Failed to insert hotels: ${hotelsError.message}`);
      } else {
        console.log(`✅ Inserted ${data.hotels.length} hotels`);
      }
    }

    // 4. Insert car rentals
    if (data.carRentals && data.carRentals.length > 0) {
      const carRentalsToInsert = data.carRentals.map((carRental) => ({
        trip_id: tripId,
        company: carRental.company,
        vehicle_type: carRental.vehicleType,
        pickup_location: carRental.pickupLocation,
        dropoff_location: carRental.dropoffLocation,
        price: carRental.price,
        currency: carRental.currency,
      }));

      const { error: carRentalsError } = await supabase
        .from('wanderlog_car_rentals')
        .insert(carRentalsToInsert);

      if (carRentalsError) {
        console.warn(`⚠️  Failed to insert car rentals: ${carRentalsError.message}`);
      } else {
        console.log(`✅ Inserted ${data.carRentals.length} car rentals`);
      }
    }

    // 5. Insert activities (store activity IDs for image association)
    const activityIdMap = new Map<string, string>();

    if (data.activities && data.activities.length > 0) {
      for (const activity of data.activities) {
        const { data: activityRecord, error: activityError } = await supabase
          .from('wanderlog_activities')
          .insert({
            trip_id: tripId,
            name: activity.name,
            description: activity.description,
            hours: activity.hours,
            rating: activity.rating,
            address: activity.address,
            contact: activity.contact,
          })
          .select()
          .single();

        if (activityError) {
          console.warn(`⚠️  Failed to insert activity: ${activityError.message}`);
        } else {
          activityIdMap.set(activity.id, activityRecord.id);
        }
      }

      console.log(`✅ Inserted ${activityIdMap.size} activities`);
    }

    // 6. Insert images
    if (data.images && data.images.length > 0) {
      const imagesToInsert = data.images.map((image) => ({
        trip_id: tripId,
        activity_id: image.associatedActivityId
          ? activityIdMap.get(image.associatedActivityId) || null
          : null,
        url: image.url,
        alt: image.alt,
        caption: image.caption,
        position: image.position,
        associated_section: image.associatedSection,
      }));

      const { error: imagesError } = await supabase
        .from('wanderlog_images')
        .insert(imagesToInsert);

      if (imagesError) {
        console.warn(`⚠️  Failed to insert images: ${imagesError.message}`);
      } else {
        console.log(`✅ Inserted ${data.images.length} images`);
      }
    }

    // 7. Insert daily schedules
    if (data.dailySchedule && data.dailySchedule.length > 0) {
      const schedulesToInsert = data.dailySchedule.map((day) => ({
        trip_id: tripId,
        day_number: day.dayNumber,
        date: day.date,
        items: day.items,
      }));

      const { error: schedulesError } = await supabase
        .from('wanderlog_daily_schedules')
        .insert(schedulesToInsert);

      if (schedulesError) {
        console.warn(`⚠️  Failed to insert daily schedules: ${schedulesError.message}`);
      } else {
        console.log(`✅ Inserted ${data.dailySchedule.length} daily schedules`);
      }
    }

    console.log('🎉 All data successfully stored in Supabase!');
    return tripId;
  } catch (error) {
    console.error('❌ Error storing data in Supabase:', error);
    throw error;
  }
}

/**
 * Check if a trip already exists in the database
 */
export async function tripExists(wanderlogUrl: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('wanderlog_trips')
    .select('id')
    .eq('wanderlog_url', wanderlogUrl)
    .single();

  return !error && !!data;
}

/**
 * Get trip by Wanderlog URL
 */
export async function getTripByUrl(wanderlogUrl: string) {
  const { data, error } = await supabase
    .from('wanderlog_trips')
    .select('*')
    .eq('wanderlog_url', wanderlogUrl)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Delete trip and all related data by Wanderlog URL
 * Cascading deletes will handle related records automatically
 */
export async function deleteTripByUrl(wanderlogUrl: string): Promise<boolean> {
  try {
    console.log(`🗑️  Deleting existing trip for URL: ${wanderlogUrl}`);

    // Get the trip ID first
    const trip = await getTripByUrl(wanderlogUrl);
    if (!trip) {
      console.log('ℹ️  No existing trip found to delete');
      return false;
    }

    const tripId = trip.id;

    // Delete the trip (CASCADE will automatically delete all related records)
    const { error } = await supabase
      .from('wanderlog_trips')
      .delete()
      .eq('id', tripId);

    if (error) {
      console.error(`❌ Failed to delete trip: ${error.message}`);
      return false;
    }

    console.log(`✅ Successfully deleted trip ${tripId} and all related data`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting trip:', error);
    return false;
  }
}
