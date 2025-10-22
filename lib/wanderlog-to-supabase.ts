import { supabase } from './supabase';
import type { ScrapedWanderlogData } from '@/types/wanderlog';

/**
 * Stores scraped Wanderlog data into Supabase
 * Returns the created trip ID
 */
export async function storeWanderlogDataInSupabase(
  data: ScrapedWanderlogData
): Promise<string> {
  console.log(`💾 Starting Supabase storage for: ${data.title}`);

  try {
    // 1. Insert main trip record
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        title: data.title,
        creator: data.creator || null,
        start_date: parseDate(data.startDate),
        end_date: parseDate(data.endDate),
        views: data.views || null,
        publication_date: data.publicationDate
          ? parseDate(data.publicationDate)
          : null,
        wanderlog_url: data.wanderlogUrl,
        header_images: data.headerImages,
      })
      .select()
      .single();

    if (tripError) {
      throw new Error(`Failed to insert trip: ${tripError.message}`);
    }

    const tripId = trip.id;
    console.log(`✅ Trip created with ID: ${tripId}`);

    // 2. Insert notes if present
    if (data.notes) {
      const { error: notesError } = await supabase.from('trip_notes').insert({
        trip_id: tripId,
        notes: data.notes,
      });

      if (notesError) {
        console.warn(`⚠️  Failed to insert notes: ${notesError.message}`);
      } else {
        console.log('✅ Notes inserted');
      }
    }

    // 3. Insert flights
    if (data.flights.length > 0) {
      const flightsToInsert = data.flights.map((flight) => ({
        trip_id: tripId,
        airline: flight.airline,
        flight_code: flight.flightCode || null,
        departure_airport: flight.departureAirport,
        arrival_airport: flight.arrivalAirport,
        departure_time: flight.departureTime,
        arrival_time: flight.arrivalTime,
        price: flight.price,
        currency: flight.currency,
        baggage_options: flight.baggageOptions || null,
      }));

      const { error: flightsError } = await supabase
        .from('flights')
        .insert(flightsToInsert);

      if (flightsError) {
        console.warn(`⚠️  Failed to insert flights: ${flightsError.message}`);
      } else {
        console.log(`✅ ${data.flights.length} flights inserted`);
      }
    }

    // 4. Insert hotels
    if (data.hotels.length > 0) {
      const hotelsToInsert = data.hotels.map((hotel) => ({
        trip_id: tripId,
        name: hotel.name,
        room_type: hotel.roomType || null,
        amenities: hotel.amenities,
        rating: hotel.rating || null,
        price: hotel.price,
        currency: hotel.currency,
        address: hotel.address || null,
      }));

      const { error: hotelsError } = await supabase
        .from('hotels')
        .insert(hotelsToInsert);

      if (hotelsError) {
        console.warn(`⚠️  Failed to insert hotels: ${hotelsError.message}`);
      } else {
        console.log(`✅ ${data.hotels.length} hotels inserted`);
      }
    }

    // 5. Insert car rentals
    if (data.carRentals.length > 0) {
      const carRentalsToInsert = data.carRentals.map((rental) => ({
        trip_id: tripId,
        company: rental.company,
        vehicle_type: rental.vehicleType || null,
        pickup_location: rental.pickupLocation || null,
        dropoff_location: rental.dropoffLocation || null,
        price: rental.price || null,
        currency: rental.currency || null,
        discount_info: rental.discountInfo || null,
      }));

      const { error: carRentalsError } = await supabase
        .from('car_rentals')
        .insert(carRentalsToInsert);

      if (carRentalsError) {
        console.warn(
          `⚠️  Failed to insert car rentals: ${carRentalsError.message}`
        );
      } else {
        console.log(`✅ ${data.carRentals.length} car rentals inserted`);
      }
    }

    // 6. Insert activities and get their IDs for image association
    const activityIdMap = new Map<string, string>(); // old ID -> new DB ID

    if (data.activities.length > 0) {
      const activitiesToInsert = data.activities.map((activity) => ({
        trip_id: tripId,
        name: activity.name,
        description: activity.description || null,
        location: activity.location || null,
        address: activity.address || null,
        hours: activity.hours || null,
        rating: activity.rating || null,
        contact: activity.contact || null,
        category: activity.category || null,
      }));

      const { data: insertedActivities, error: activitiesError } =
        await supabase.from('activities').insert(activitiesToInsert).select();

      if (activitiesError) {
        console.warn(
          `⚠️  Failed to insert activities: ${activitiesError.message}`
        );
      } else {
        console.log(`✅ ${data.activities.length} activities inserted`);

        // Map old IDs to new database IDs
        data.activities.forEach((activity, index) => {
          if (insertedActivities && insertedActivities[index]) {
            activityIdMap.set(activity.id, insertedActivities[index].id);
          }
        });
      }
    }

    // 7. Insert daily schedule
    if (data.dailySchedule.length > 0) {
      const scheduleToInsert = data.dailySchedule.map((day) => ({
        trip_id: tripId,
        day_number: day.dayNumber,
        date: day.date,
        items: day.items,
      }));

      const { error: scheduleError } = await supabase
        .from('daily_schedule')
        .insert(scheduleToInsert);

      if (scheduleError) {
        console.warn(
          `⚠️  Failed to insert daily schedule: ${scheduleError.message}`
        );
      } else {
        console.log(`✅ ${data.dailySchedule.length} days of schedule inserted`);
      }
    }

    // 8. Insert images with proper associations
    if (data.images.length > 0) {
      const imagesToInsert = data.images.map((image) => ({
        trip_id: tripId,
        url: image.url,
        associated_activity_id: image.associatedActivityId
          ? activityIdMap.get(image.associatedActivityId) || null
          : null,
        associated_section: image.associatedSection || null,
        context: image.caption || image.alt || null,
        position: image.position,
      }));

      const { error: imagesError } = await supabase
        .from('images')
        .insert(imagesToInsert);

      if (imagesError) {
        console.warn(`⚠️  Failed to insert images: ${imagesError.message}`);
      } else {
        console.log(`✅ ${data.images.length} images inserted`);
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
 * Helper function to parse dates
 * Converts various date formats to ISO date string
 */
function parseDate(dateString: string | undefined): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }

  // Try to parse common formats
  // "Sun 7/13" format
  const shortDateMatch = dateString.match(/(\d+)\/(\d+)/);
  if (shortDateMatch) {
    const month = parseInt(shortDateMatch[1]);
    const day = parseInt(shortDateMatch[2]);
    const year = new Date().getFullYear();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  // Try standard date parsing
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Fallback to current date
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a trip already exists in the database
 */
export async function tripExists(wanderlogUrl: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('trips')
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
    .from('trips')
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

    // Delete all related data (cascading deletes should handle this if FK constraints are set up)
    // But we'll be explicit to ensure cleanup
    await supabase.from('trip_notes').delete().eq('trip_id', tripId);
    await supabase.from('flights').delete().eq('trip_id', tripId);
    await supabase.from('hotels').delete().eq('trip_id', tripId);
    await supabase.from('car_rentals').delete().eq('trip_id', tripId);
    await supabase.from('activities').delete().eq('trip_id', tripId);
    await supabase.from('daily_schedule').delete().eq('trip_id', tripId);
    await supabase.from('images').delete().eq('trip_id', tripId);

    // Finally delete the trip itself
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) {
      console.error(`❌ Failed to delete trip: ${error.message}`);
      return false;
    }

    console.log(`✅ Successfully deleted trip ${tripId}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting trip:', error);
    return false;
  }
}
