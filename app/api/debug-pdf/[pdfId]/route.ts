/**
 * Debug endpoint to check what's in the PDF tables
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pdfId: string }> }
) {
  try {
    const { pdfId } = await params;
    const supabase = createServerSupabaseClient();

    // Get PDF file
    const { data: pdfFile } = await supabase
      .from("pdf_files")
      .select("*")
      .eq("id", pdfId)
      .single();

    // Get trip info
    const { data: tripInfo } = await supabase
      .from("pdf_trip_info")
      .select("*")
      .eq("pdf_file_id", pdfId)
      .single();

    // Get images
    const { data: images } = await supabase
      .from("pdf_images")
      .select("id, page_number, image_index, image_format, width, height")
      .eq("pdf_file_id", pdfId);

    // Get text content
    const { data: textContent } = await supabase
      .from("pdf_text_content")
      .select("id, page_number, extraction_method, confidence_score")
      .eq("pdf_file_id", pdfId);

    return NextResponse.json({
      pdfFile: {
        ...pdfFile,
        file_path: pdfFile?.file_path ? '[REDACTED]' : null,
      },
      tripInfo,
      imageCount: images?.length || 0,
      images: images || [],
      textContentCount: textContent?.length || 0,
      textContent: textContent || [],
    }, { status: 200 });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to debug PDF data" },
      { status: 500 }
    );
  }
}
