/**
 * API Route: Upload Wanderlog PDF
 * POST /api/pdfs/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStorageService } from '@/lib/supabase';
import type { PDFUploadResponse } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tripTitle = formData.get('trip_title') as string | null;
    const tripDates = formData.get('trip_dates') as string | null;
    const destination = formData.get('destination') as string | null;
    const userId = formData.get('user_id') as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json<PDFUploadResponse>(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json<PDFUploadResponse>(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json<PDFUploadResponse>(
        { success: false, error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Upload to Supabase
    const storageService = new SupabaseStorageService();
    const result = await storageService.uploadPDF(file, file.name, {
      trip_title: tripTitle || undefined,
      trip_dates: tripDates || undefined,
      destination: destination || undefined,
      user_id: userId || undefined,
    });

    // Get public URL
    const publicUrl = storageService.getPublicUrl(result.file_path);

    return NextResponse.json<PDFUploadResponse>({
      success: true,
      data: {
        id: result.id,
        file_name: file.name,
        file_path: result.file_path,
        file_size: result.file_size,
        public_url: publicUrl,
      },
    });
  } catch (error) {
    console.error('PDF upload API error:', error);
    return NextResponse.json<PDFUploadResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}
