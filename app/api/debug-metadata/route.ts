import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: trips, error } = await supabase
      .from("wanderlog_trips")
      .select("id, trip_title, source_url, metadata")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Show metadata structure
    const debug = trips?.map(trip => ({
      id: trip.id,
      title: trip.trip_title,
      source_url: trip.source_url,
      metadata_keys: trip.metadata ? Object.keys(trip.metadata) : [],
      has_activities: !!(trip.metadata as any)?.activities,
      activities_count: ((trip.metadata as any)?.activities || []).length,
      has_header_images: !!(trip.metadata as any)?.header_images,
      header_images_count: ((trip.metadata as any)?.header_images || []).length,
    }));

    return NextResponse.json({ trips: debug }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
