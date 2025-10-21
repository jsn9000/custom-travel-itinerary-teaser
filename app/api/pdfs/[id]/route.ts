/**
 * API Route: Get/Update/Delete Wanderlog PDF by ID
 * GET /api/pdfs/[id] - Get PDF metadata
 * PATCH /api/pdfs/[id] - Update PDF metadata
 * DELETE /api/pdfs/[id] - Delete PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStorageService } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET - Retrieve PDF metadata by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const storageService = new SupabaseStorageService();
    const pdf = await storageService.getPDFById(id);

    if (!pdf) {
      return NextResponse.json(
        { success: false, error: 'PDF not found' },
        { status: 404 }
      );
    }

    // Add public URL
    const publicUrl = storageService.getPublicUrl(pdf.file_path);

    return NextResponse.json({
      success: true,
      data: {
        ...pdf,
        public_url: publicUrl,
      },
    });
  } catch (error) {
    console.error('Get PDF API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get PDF',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update PDF metadata
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const storageService = new SupabaseStorageService();
    const updatedPdf = await storageService.updatePDFMetadata(id, {
      trip_title: body.trip_title,
      trip_dates: body.trip_dates,
      destination: body.destination,
      status: body.status,
      metadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      data: updatedPdf,
    });
  } catch (error) {
    console.error('Update PDF API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update PDF',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete PDF
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const storageService = new SupabaseStorageService();
    await storageService.deletePDF(id);

    return NextResponse.json({
      success: true,
      message: 'PDF deleted successfully',
    });
  } catch (error) {
    console.error('Delete PDF API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete PDF',
      },
      { status: 500 }
    );
  }
}
