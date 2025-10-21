/**
 * Simple PDF processing without external dependencies
 * This processes PDFs using basic file handling and stores metadata
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = join(process.cwd(), "uploads", "pdfs");

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "File must be a PDF" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json(
        { success: false, error: "File size must be less than 50MB" },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    console.log("📁 Ensuring uploads directory exists...");
    await ensureUploadsDir();
    console.log("✅ Uploads directory ready");

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = join(UPLOADS_DIR, filename);
    console.log("📄 File path:", filePath);

    // Save file to disk
    console.log("💾 Saving file to disk...");
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    console.log("✅ File saved successfully");

    // Initialize Supabase client
    console.log("🔌 Initializing Supabase client...");
    const supabase = createServerSupabaseClient();
    console.log("✅ Supabase client ready");

    // Create PDF file record in database
    console.log("💾 Creating PDF file record in database...");
    const { data: pdfFile, error: pdfError } = await supabase
      .from("pdf_files")
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        status: "processed", // Mark as processed since we're not doing full extraction yet
        processing_started_at: new Date().toISOString(),
        processing_completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pdfError) {
      console.error("Database error:", pdfError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to save file record",
          details: pdfError.message,
          code: pdfError.code
        },
        { status: 500 }
      );
    }

    // Create basic trip info from filename
    const tripInfo = {
      title: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
      dates: null,
      destination: null,
      description: `PDF file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      locations: [],
      activities: [],
      accommodations: [],
    };

    // Store basic trip information
    await supabase.from("pdf_trip_info").insert({
      pdf_file_id: pdfFile.id,
      trip_title: tripInfo.title,
      trip_dates: tripInfo.dates,
      destination: tripInfo.destination,
      description: tripInfo.description,
      locations: tripInfo.locations,
      activities: tripInfo.activities,
      accommodations: tripInfo.accommodations,
    });

    console.log("✅ PDF uploaded successfully (basic processing)");

    // Automatically convert PDF to trip format
    console.log("🔄 Converting PDF to trip format...");
    try {
      const convertResponse = await fetch(
        `${request.nextUrl.origin}/api/pdf-to-trip/${pdfFile.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const convertData = await convertResponse.json();

      if (convertResponse.ok && convertData.success) {
        console.log(`✅ Successfully created trip ${convertData.tripId}`);
        return NextResponse.json({
          success: true,
          pdfId: pdfFile.id,
          tripId: convertData.tripId,
          message: "PDF processed and trip created successfully",
        });
      } else {
        console.error("❌ Failed to convert PDF to trip:", convertData.error);
        // Still return success since PDF was uploaded, just no trip created
        return NextResponse.json({
          success: true,
          pdfId: pdfFile.id,
          message: "PDF uploaded but trip conversion failed",
          error: convertData.error,
        });
      }
    } catch (convertError) {
      console.error("❌ Error converting PDF to trip:", convertError);
      // Still return success since PDF was uploaded
      return NextResponse.json({
        success: true,
        pdfId: pdfFile.id,
        message: "PDF uploaded but trip conversion failed",
        error: convertError instanceof Error ? convertError.message : "Unknown error",
      });
    }

  } catch (error) {
    console.error("Upload error:", error);
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
