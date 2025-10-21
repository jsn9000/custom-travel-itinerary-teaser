/**
 * Supabase Storage Service for Wanderlog PDFs
 */

import { createServerSupabaseClient } from './client';
import type { WanderlogPDFInsert, WanderlogPDF } from '@/types/supabase';

const STORAGE_BUCKET = 'wanderlog-pdfs';

export class SupabaseStorageService {
  private supabase;

  constructor() {
    this.supabase = createServerSupabaseClient();
  }

  /**
   * Upload a PDF file to Supabase Storage
   */
  async uploadPDF(
    file: File | Buffer,
    fileName: string,
    metadata?: {
      trip_title?: string;
      trip_dates?: string;
      destination?: string;
      user_id?: string;
    }
  ): Promise<{ id: string; file_path: string; file_size: number }> {
    try {
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${timestamp}_${sanitizedFileName}`;

      // Upload to storage
      let fileData: ArrayBuffer | Buffer;
      let fileSize: number;

      if (Buffer.isBuffer(file)) {
        fileData = file;
        fileSize = file.length;
      } else {
        // file is File type
        fileData = await (file as File).arrayBuffer();
        fileSize = (file as File).size;
      }

      const { data: storageData, error: storageError } = await this.supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, fileData, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      // Insert metadata into database
      const pdfMetadata: WanderlogPDFInsert = {
        file_name: fileName,
        file_path: storageData.path,
        file_size: fileSize,
        mime_type: 'application/pdf',
        trip_title: metadata?.trip_title || null,
        trip_dates: metadata?.trip_dates || null,
        destination: metadata?.destination || null,
        user_id: metadata?.user_id || null,
        status: 'uploaded',
      };

      const { data: dbData, error: dbError } = await this.supabase
        .from('wanderlog_pdfs')
        .insert(pdfMetadata as any)
        .select()
        .single();

      if (dbError) {
        // Cleanup: Delete uploaded file if database insert fails
        await this.supabase.storage.from(STORAGE_BUCKET).remove([storageData.path]);
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      return {
        id: (dbData as any).id,
        file_path: storageData.path,
        file_size: fileSize,
      };
    } catch (error) {
      console.error('PDF upload error:', error);
      throw error;
    }
  }

  /**
   * Get a public URL for a PDF file
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * Download a PDF file as a buffer
   */
  async downloadPDF(filePath: string): Promise<Buffer> {
    try {
      const { data, error } = await this.supabase.storage
        .from(STORAGE_BUCKET)
        .download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('PDF download error:', error);
      throw error;
    }
  }

  /**
   * List all PDFs with optional filtering
   */
  async listPDFs(filters?: {
    destination?: string;
    status?: string;
    user_id?: string;
    limit?: number;
  }): Promise<WanderlogPDF[]> {
    try {
      let query = this.supabase
        .from('wanderlog_pdfs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.destination) {
        query = query.eq('destination', filters.destination);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`List PDFs failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('List PDFs error:', error);
      throw error;
    }
  }

  /**
   * Get a single PDF by ID
   */
  async getPDFById(id: string): Promise<WanderlogPDF | null> {
    try {
      const { data, error } = await this.supabase
        .from('wanderlog_pdfs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Get PDF failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Get PDF error:', error);
      throw error;
    }
  }

  /**
   * Update PDF metadata
   */
  async updatePDFMetadata(
    id: string,
    updates: {
      trip_title?: string;
      trip_dates?: string;
      destination?: string;
      status?: 'uploaded' | 'processing' | 'processed' | 'error';
      metadata?: Record<string, any>;
    }
  ): Promise<WanderlogPDF> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (this.supabase
        .from('wanderlog_pdfs') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Update metadata failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Update PDF metadata error:', error);
      throw error;
    }
  }

  /**
   * Delete a PDF (both storage and database record)
   */
  async deletePDF(id: string): Promise<void> {
    try {
      // Get file path first
      const pdf = await this.getPDFById(id);
      if (!pdf) {
        throw new Error('PDF not found');
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from(STORAGE_BUCKET)
        .remove([pdf.file_path]);

      if (storageError) {
        console.error('Storage deletion warning:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('wanderlog_pdfs')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }
    } catch (error) {
      console.error('Delete PDF error:', error);
      throw error;
    }
  }
}
