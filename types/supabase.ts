/**
 * Supabase Database Types
 * Generated types for database schema
 */

export interface Database {
  public: {
    Tables: {
      // Legacy table (still using for now until migration)
      wanderlog_pdfs: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          trip_title: string | null;
          trip_dates: string | null;
          destination: string | null;
          status: 'uploaded' | 'processing' | 'processed' | 'error';
          metadata: Record<string, any> | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          file_name: string;
          file_path: string;
          file_size?: number;
          mime_type?: string;
          trip_title?: string | null;
          trip_dates?: string | null;
          destination?: string | null;
          status?: 'uploaded' | 'processing' | 'processed' | 'error';
          metadata?: Record<string, any> | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          trip_title?: string | null;
          trip_dates?: string | null;
          destination?: string | null;
          status?: 'uploaded' | 'processing' | 'processed' | 'error';
          metadata?: Record<string, any> | null;
          user_id?: string | null;
        };
      };
      // New table for web-scraped trips
      wanderlog_trips: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          source_url: string;
          source_type: string;
          trip_title: string | null;
          trip_dates: string | null;
          destination: string | null;
          status: 'scraped' | 'processing' | 'ready' | 'error';
          metadata: Record<string, any> | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          source_url: string;
          source_type?: string;
          trip_title?: string | null;
          trip_dates?: string | null;
          destination?: string | null;
          status?: 'scraped' | 'processing' | 'ready' | 'error';
          metadata?: Record<string, any> | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          source_url?: string;
          source_type?: string;
          trip_title?: string | null;
          trip_dates?: string | null;
          destination?: string | null;
          status?: 'scraped' | 'processing' | 'ready' | 'error';
          metadata?: Record<string, any> | null;
          user_id?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      pdf_status: 'uploaded' | 'processing' | 'processed' | 'error';
      trip_status: 'scraped' | 'processing' | 'ready' | 'error';
    };
  };
}

/**
 * PDF Metadata Type (Legacy)
 */
export type WanderlogPDF = Database['public']['Tables']['wanderlog_pdfs']['Row'];
export type WanderlogPDFInsert = Database['public']['Tables']['wanderlog_pdfs']['Insert'];
export type WanderlogPDFUpdate = Database['public']['Tables']['wanderlog_pdfs']['Update'];

/**
 * Trip Metadata Type (Web Scraping)
 */
export type WanderlogTrip = Database['public']['Tables']['wanderlog_trips']['Row'];
export type WanderlogTripInsert = Database['public']['Tables']['wanderlog_trips']['Insert'];
export type WanderlogTripUpdate = Database['public']['Tables']['wanderlog_trips']['Update'];

/**
 * PDF Upload Response
 */
export interface PDFUploadResponse {
  success: boolean;
  data?: {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    public_url?: string;
  };
  error?: string;
}

/**
 * PDF List Response
 */
export interface PDFListResponse {
  success: boolean;
  data?: WanderlogPDF[];
  error?: string;
}
