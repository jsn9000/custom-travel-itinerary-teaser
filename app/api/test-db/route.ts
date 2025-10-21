/**
 * API route to test database connection and table existence
 * Use this to debug database issues
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("wanderlog_trips")
      .select("id")
      .limit(1);

    if (connectionError) {
      console.error("Connection test error:", connectionError);
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionError.message,
        code: connectionError.code,
      });
    }

    // Test pdf_files table existence
    const { data: pdfTableTest, error: pdfTableError } = await supabase
      .from("pdf_files")
      .select("id")
      .limit(1);

    if (pdfTableError) {
      return NextResponse.json({
        success: false,
        error: "PDF tables not found",
        details: pdfTableError.message,
        code: pdfTableError.code,
        suggestion: "Please run the migration: supabase/migrations/002_pdf_processing.sql",
      });
    }

    // Test other PDF tables
    const tables = ["pdf_text_content", "pdf_images", "pdf_trip_info"];
    const tableStatus = {};

    for (const table of tables) {
      const { error } = await supabase.from(table).select("id").limit(1);
      tableStatus[table] = error ? { exists: false, error: error.message } : { exists: true };
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      tables: {
        wanderlog_trips: { exists: true },
        pdf_files: { exists: true },
        ...tableStatus,
      },
    });

  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
