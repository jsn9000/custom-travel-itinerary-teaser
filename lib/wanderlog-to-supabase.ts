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
    // 1. Insert main trip record into wanderlog_trips table
    const { data: trip, error: tripError} = await supabase
      .from('wanderlog_trips')
      .insert({
        source_url: data.wanderlogUrl,
        source_type: 'web_scrape',
        trip_title: data.title,
        trip_dates: data.startDate && data.endDate
          ? `${data.startDate} - ${data.endDate}`
          : null,
        destination: data.creator || null,
        status: 'ready',
        metadata: {
          title: data.title,
          creator: data.creator,
          startDate: data.startDate,
          endDate: data.endDate,
          views: data.views,
          publicationDate: data.publicationDate,
          wanderlogUrl: data.wanderlogUrl,
          headerImages: data.headerImages,
          notes: data.notes,
          flights: data.flights,
          hotels: data.hotels,
          carRentals: data.carRentals,
          activities: data.activities,
          dailySchedule: data.dailySchedule,
          images: data.images,
          scrapedAt: data.scrapedAt,
          imageAssociationStats: data.imageAssociationStats,
        },
        user_id: null,
      })
      .select()
      .single();

    if (tripError) {
      throw new Error(`Failed to insert trip: ${tripError.message}`);
    }

    const tripId = trip.id;
    console.log(`✅ Trip saved to database with ID: ${tripId}`);
    console.log('🎉 All data successfully stored in wanderlog_trips table!');
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
  // "Sunday, July 13th" format - add current year
  const longDateMatch = dateString.match(/(\w+),\s+(\w+)\s+(\d+)(?:st|nd|rd|th)?/);
  if (longDateMatch) {
    const monthName = longDateMatch[2];
    const day = parseInt(longDateMatch[3]);
    let year = new Date().getFullYear();

    // Parse month name to number
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames.findIndex(m => m === monthName) + 1;

    if (month > 0) {
      // Create a date with current year
      const testDate = new Date(year, month - 1, day);
      const today = new Date();

      // If the date is more than 6 months in the past, assume it's next year
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (testDate < sixMonthsAgo) {
        year += 1;
      }

      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  // "Sun 7/13" or "Fri 6/27" format
  const shortDateMatch = dateString.match(/\w+\s+(\d+)\/(\d+)/);
  if (shortDateMatch) {
    const month = parseInt(shortDateMatch[1]);
    const day = parseInt(shortDateMatch[2]);
    let year = new Date().getFullYear();

    // Create a date with current year
    const testDate = new Date(year, month - 1, day);
    const today = new Date();

    // If the date is more than 6 months in the past, assume it's next year
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (testDate < sixMonthsAgo) {
      year += 1;
    }

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
    .from('wanderlog_trips')
    .select('id')
    .eq('source_url', wanderlogUrl)
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
    .eq('source_url', wanderlogUrl)
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

    // Delete the trip from wanderlog_trips (all data is in metadata)
    const { error } = await supabase
      .from('wanderlog_trips')
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
