/**
 * API route to fetch PDF processing results
 * Returns extracted text, images, and trip information for a processed PDF
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function GET(
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

    // Fetch PDF file information
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

    // Fetch text content
    const { data: textContent, error: textError } = await supabase
      .from("pdf_text_content")
      .select("*")
      .eq("pdf_file_id", pdfId)
      .order("page_number", { ascending: true });

    if (textError) {
      console.error("Error fetching text content:", textError);
    }

    // Fetch images
    const { data: images, error: imagesError } = await supabase
      .from("pdf_images")
      .select("*")
      .eq("pdf_file_id", pdfId)
      .order("page_number", { ascending: true })
      .order("image_index", { ascending: true });

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
    } else {
      console.log(`📊 Found ${images?.length || 0} images for PDF ${pdfId}`);
      if (images && images.length > 0) {
        console.log("🖼️ Image details:", images.map(img => ({
          id: img.id,
          page: img.page_number,
          index: img.image_index,
          format: img.image_format,
          width: img.width,
          height: img.height,
          dataLength: img.image_data?.length || 0
        })));
      }
    }

    // Fetch trip information
    const { data: tripInfo, error: tripError } = await supabase
      .from("pdf_trip_info")
      .select("*")
      .eq("pdf_file_id", pdfId)
      .single();

    if (tripError && tripError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error fetching trip info:", tripError);
    }

    return NextResponse.json({
      success: true,
      data: {
        pdfFile,
        textContent: textContent || [],
        images: images || [],
        tripInfo: tripInfo || null,
      },
    });

  } catch (error) {
    console.error("Error fetching PDF results:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
