import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: trip, error } = await supabase
      .from("wanderlog_trips")
      .select("id, trip_title, metadata")
      .eq("id", "e438f9ac-0a38-4f7e-82e0-e1296b233d03")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const metadata = trip.metadata as any;

    return NextResponse.json({
      trip_id: trip.id,
      title: trip.trip_title,
      images_field_type: Array.isArray(metadata?.images) ? 'array' : typeof metadata?.images,
      images_length: Array.isArray(metadata?.images) ? metadata.images.length : 'N/A',
      images_sample: Array.isArray(metadata?.images) ? metadata.images.slice(0, 2) : metadata?.images,
      all_metadata_keys: Object.keys(metadata || {}),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
