import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch trip data from wanderlog_trips table
    const { data: trip, error: tripError } = await supabase
      .from("wanderlog_trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (tripError) {
      console.error("Error fetching trip:", tripError);
      return NextResponse.json(
        { error: "Trip not found", details: tripError.message },
        { status: 404 }
      );
    }

    // Extract data from metadata
    const metadata = trip.metadata as any || {};

    // Transform to expected format
    const tripData = {
      id: trip.id,
      title: trip.trip_title || metadata.title || "Untitled Trip",
      creator: metadata.creator,
      start_date: trip.trip_dates?.split(" - ")[0] || metadata.start_date,
      end_date: trip.trip_dates?.split(" - ")[1] || metadata.end_date,
      header_images: metadata.headerImages || metadata.header_images || metadata.images || [],
      notes: metadata.notes || metadata.description || null,
      wanderlog_url: trip.source_url,
      hotels: metadata.hotels || [],
      flights: metadata.flights || [],
      activities: metadata.activities || metadata.locations || [],
      dailySchedule: metadata.dailySchedule || metadata.itinerary || metadata.daily_itinerary || [],
      images: metadata.images || [],
      carRentals: metadata.carRentals || metadata.car_rentals || [],
    };

    return NextResponse.json(tripData, { status: 200 });
  } catch (error) {
    console.error("Error in trip API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
