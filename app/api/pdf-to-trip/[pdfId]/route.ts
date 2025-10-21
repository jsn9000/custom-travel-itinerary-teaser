/**
 * API route to convert PDF processing results to trip format
 * Creates a trip record from PDF data
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pdfId: string }> }
) {
  try {
    const { pdfId } = await params;

    if (!pdfId) {
      return NextResponse.json(
        { success: false, error: "PDF ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Fetch PDF file and trip info
    const { data: pdfFile, error: pdfError } = await supabase
      .from("pdf_files")
      .select("*")
      .eq("id", pdfId)
      .single();

    if (pdfError || !pdfFile) {
      return NextResponse.json(
        { success: false, error: "PDF file not found" },
        { status: 404 }
      );
    }

    const { data: tripInfo, error: tripError } = await supabase
      .from("pdf_trip_info")
      .select("*")
      .eq("pdf_file_id", pdfId)
      .single();

    if (tripError && tripError.code !== 'PGRST116') {
      console.error("Error fetching trip info:", tripError);
    }

    // Fetch images from PDF
    console.log("🖼️ Fetching images for PDF:", pdfId);
    const { data: pdfImages, error: imagesError } = await supabase
      .from("pdf_images")
      .select("*")
      .eq("pdf_file_id", pdfId)
      .order("page_number", { ascending: true })
      .order("image_index", { ascending: true });

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
    } else {
      console.log(`📊 Found ${pdfImages?.length || 0} images for conversion`);
    }

    // Convert base64 images to data URLs
    const images = (pdfImages || [])
      .filter(img => img.image_data && img.image_format)
      .map(img => {
        const format = img.image_format || 'png';
        return `data:image/${format};base64,${img.image_data}`;
      });

    console.log(`✅ Converted ${images.length} images to data URLs`);

    // Transform locations to include imageUrl
    const rawLocations = tripInfo?.locations || [];
    const locations = rawLocations.map((loc: any, index: number) => ({
      name: typeof loc === 'string' ? loc : (loc.name || 'Unknown Location'),
      type: typeof loc === 'string' ? 'destination' : (loc.type || 'destination'),
      imageUrl: images[index] || images[0] || '',
    }));

    // Transform activities to itinerary format
    const rawActivities = tripInfo?.activities || [];
    const itinerary = rawActivities.length > 0
      ? rawActivities.map((activity: any, index: number) => ({
          day: `Day ${index + 1}`,
          activities: typeof activity === 'string' ? [activity] : [activity.name || 'Activity'],
        }))
      : [];

    // Transform accommodations to hotels format
    const rawAccommodations = tripInfo?.accommodations || [];
    const hotels = rawAccommodations.map((acc: any, index: number) => ({
      name: typeof acc === 'string' ? acc : (acc.name || 'Accommodation'),
      location: typeof acc === 'string' ? '' : (acc.location || ''),
      checkIn: typeof acc === 'string' ? '' : (acc.checkIn || ''),
      checkOut: typeof acc === 'string' ? '' : (acc.checkOut || ''),
      imageUrl: images[locations.length + index] || images[0] || '',
    }));

    // Create trip record in wanderlog_trips table
    const { data: trip, error: tripInsertError } = await supabase
      .from("wanderlog_trips")
      .insert({
        source_url: `pdf://${pdfFile.file_name}`,
        source_type: "pdf",
        trip_title: tripInfo?.trip_title || pdfFile.file_name.replace('.pdf', ''),
        trip_dates: tripInfo?.trip_dates || null,
        destination: tripInfo?.destination || 'Unknown Destination',
        status: "ready",
        metadata: {
          source: `PDF: ${pdfFile.file_name}`,
          description: tripInfo?.description || `Trip imported from ${pdfFile.file_name}`,
          locations,
          itinerary,
          images,
          hotels: hotels.length > 0 ? hotels : undefined,
          pdf_file_id: pdfId,
          file_name: pdfFile.file_name,
          file_size: pdfFile.file_size,
          processing_completed_at: pdfFile.processing_completed_at,
        },
      })
      .select()
      .single();

    if (tripInsertError) {
      console.error("Error creating trip:", tripInsertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create trip",
          details: tripInsertError.message
        },
        { status: 500 }
      );
    }

    console.log("✅ Trip created successfully:", trip.id);
    console.log(`📊 Trip metadata: ${locations.length} locations, ${images.length} images, ${itinerary.length} itinerary items, ${hotels.length} hotels`);

    return NextResponse.json({
      success: true,
      tripId: trip.id,
      message: "Trip created successfully from PDF",
      stats: {
        locations: locations.length,
        images: images.length,
        itinerary: itinerary.length,
        hotels: hotels.length,
      },
    });

  } catch (error) {
    console.error("Error converting PDF to trip:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}