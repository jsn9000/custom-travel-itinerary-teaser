/**
 * API Route: List Wanderlog PDFs
 * GET /api/pdfs/list
 */

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStorageService } from '@/lib/supabase';
import type { PDFListResponse } from '@/types/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destination = searchParams.get('destination');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const limit = searchParams.get('limit');

    const storageService = new SupabaseStorageService();
    const pdfs = await storageService.listPDFs({
      destination: destination || undefined,
      status: status || undefined,
      user_id: userId || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json<PDFListResponse>({
      success: true,
      data: pdfs,
    });
  } catch (error) {
    console.error('PDF list API error:', error);
    return NextResponse.json<PDFListResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list PDFs',
      },
      { status: 500 }
    );
  }
}
