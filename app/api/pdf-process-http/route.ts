/**
 * PDF processing using pdf-parse library
 * Extracts text directly from PDFs without external server
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { writeFile, mkdir, readFile } from "fs/promises";
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

    console.log(`📄 Processing PDF: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // Ensure uploads directory exists
    await ensureUploadsDir();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = join(UPLOADS_DIR, filename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log(`💾 Saved PDF to: ${filePath}`);

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();

    // Create PDF file record in database
    const { data: pdfFile, error: pdfError } = await supabase
      .from("pdf_files")
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        status: "processing",
        processing_started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pdfError) {
      console.error("❌ Database error:", pdfError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save file record",
          details: pdfError.message,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Created PDF record with ID: ${pdfFile.id}`);

    try {
      // Parse PDF using pdf-parse (dynamic import for ESM compatibility)
      console.log("📖 Extracting text from PDF...");
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const pdfData = await pdfParse(buffer);

      console.log(`📊 PDF Info:
  - Pages: ${pdfData.numpages}
  - Text Length: ${pdfData.text.length} characters
  - Metadata: ${JSON.stringify(pdfData.info)}`);

      // Store text content (simulate page-by-page for compatibility)
      // pdf-parse gives us all text at once, so we'll split it
      const textPerPage = Math.ceil(pdfData.text.length / pdfData.numpages);
      const textInserts = [];

      for (let i = 0; i < pdfData.numpages; i++) {
        const start = i * textPerPage;
        const end = Math.min((i + 1) * textPerPage, pdfData.text.length);
        const pageText = pdfData.text.substring(start, end);

        if (pageText.trim()) {
          textInserts.push({
            pdf_file_id: pdfFile.id,
            page_number: i + 1,
            text_content: pageText,
            extraction_method: "pdf-parse",
          });
        }
      }

      console.log(`💾 Storing text content for ${textInserts.length} pages...`);
      if (textInserts.length > 0) {
        await supabase.from("pdf_text_content").insert(textInserts);
        console.log("✅ Text content stored");
      }

      // Note: pdf-parse doesn't extract images, so we'll skip image extraction
      // This is fine for Wanderlog PDFs where text is the main content
      console.log("⚠️ Image extraction not supported with pdf-parse (text-only extraction)");

      // Analyze extracted text for trip information
      console.log("🤖 Analyzing trip information...");
      const tripInfo = await extractTripInformation(pdfData.text);

      console.log(`📋 Extracted trip info:
  - Title: ${tripInfo.title}
  - Destination: ${tripInfo.destination}
  - Dates: ${tripInfo.dates}
  - Locations: ${tripInfo.locations.length}
  - Activities: ${tripInfo.activities.length}`);

      // Store trip information
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

      // Update PDF file status to completed
      await supabase
        .from("pdf_files")
        .update({
          status: "processed",
          processing_completed_at: new Date().toISOString(),
        })
        .eq("id", pdfFile.id);

      console.log("✅ PDF processing completed successfully");

      // Convert PDF data to trip format
      console.log("🔄 Converting PDF to trip format...");
      const convertResponse = await fetch(
        `${request.nextUrl.origin}/api/pdf-to-trip/${pdfFile.id}`,
        { method: 'POST' }
      );

      const convertData = await convertResponse.json();

      if (!convertResponse.ok || !convertData.success) {
        throw new Error(convertData.error || convertData.details || "Failed to convert PDF to trip format");
      }

      if (!convertData.tripId) {
        throw new Error("No trip ID returned from conversion");
      }

      console.log("✅ Trip created successfully with ID:", convertData.tripId);

      return NextResponse.json({
        success: true,
        pdfId: pdfFile.id,
        tripId: convertData.tripId,
        message: "PDF processed and trip created successfully",
        stats: {
          textPages: pdfData.numpages,
          textLength: pdfData.text.length,
          locationsFound: tripInfo.locations.length,
          activitiesFound: tripInfo.activities.length,
        },
      });

    } catch (processingError) {
      console.error("❌ PDF processing error:", processingError);

      // Update status to error
      await supabase
        .from("pdf_files")
        .update({
          status: "error",
          processing_error: processingError instanceof Error ? processingError.message : "Unknown error",
        })
        .eq("id", pdfFile.id);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to process PDF",
          details: processingError instanceof Error ? processingError.message : "Unknown error"
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Upload error:", error);
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

/**
 * Extract trip information from text using pattern matching
 */
async function extractTripInformation(text: string) {
  console.log("🔍 Extracting trip information from text...");

  // Extract title - look for common trip patterns
  let title = "Travel Trip";
  const titlePatterns = [
    /Trip to ([A-Z][a-z\s]+)/i,
    /([A-Z][a-z\s]+) Trip/i,
    /Visiting ([A-Z][a-z\s]+)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      title = match[0].substring(0, 100);
      break;
    }
  }

  // Extract destination
  let destination = "Unknown Destination";
  const destPatterns = [
    /Trip to ([A-Z][a-z\s]+)/i,
    /destination[:\s]+([A-Z][a-z\s]+)/i,
    /traveling to ([A-Z][a-z\s]+)/i,
  ];

  for (const pattern of destPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      destination = match[1].trim();
      break;
    }
  }

  // Extract dates - look for date patterns
  const datePattern = /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(?:st|nd|rd|th)?,?\s+\d{4}/gi;
  const dateMatches = text.match(datePattern) || [];
  let dates = "Dates not specified";

  if (dateMatches.length >= 2) {
    dates = `${dateMatches[0]} - ${dateMatches[dateMatches.length - 1]}`;
  } else if (dateMatches.length === 1) {
    dates = dateMatches[0];
  }

  // Extract locations - look for capitalized place names
  const locationPattern = /(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:\n|$)/gm;
  const locationMatches = [...text.matchAll(locationPattern)];
  const locations = locationMatches
    .map(match => ({ name: match[1].trim(), type: 'destination' }))
    .filter(loc => loc.name.length > 2 && loc.name.length < 50)
    .filter((loc, idx, arr) => arr.findIndex(l => l.name === loc.name) === idx) // Unique
    .slice(0, 20); // Limit to 20

  // Extract activities - look for activity keywords
  const activityKeywords = ['visit', 'explore', 'tour', 'see', 'enjoy', 'experience'];
  const activities: string[] = [];

  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (activityKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
      if (trimmed.length > 10 && trimmed.length < 200) {
        activities.push(trimmed);
        if (activities.length >= 20) break; // Limit to 20
      }
    }
  }

  // Extract accommodations - look for hotel keywords
  const hotelKeywords = ['hotel', 'inn', 'resort', 'lodge', 'accommodation'];
  const accommodations: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (hotelKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
      if (trimmed.length > 5 && trimmed.length < 150) {
        accommodations.push(trimmed);
        if (accommodations.length >= 10) break; // Limit to 10
      }
    }
  }

  // Extract description - first paragraph or relevant section
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  const description = paragraphs.length > 0
    ? paragraphs[0].substring(0, 500).trim()
    : `A ${dates} trip to ${destination}`;

  console.log(`✅ Extraction complete:
  - Title: ${title}
  - Destination: ${destination}
  - Dates: ${dates}
  - Locations: ${locations.length}
  - Activities: ${activities.length}
  - Accommodations: ${accommodations.length}`);

  return {
    title,
    dates,
    destination,
    description,
    locations,
    activities,
    accommodations,
  };
}
