/**
 * Supabase Integration
 * Public exports for Supabase functionality
 */

export { supabase, createServerSupabaseClient } from './client';
export { SupabaseStorageService } from './storage';
export type {
  Database,
  WanderlogPDF,
  WanderlogPDFInsert,
  WanderlogPDFUpdate,
  PDFUploadResponse,
  PDFListResponse,
} from '@/types/supabase';
