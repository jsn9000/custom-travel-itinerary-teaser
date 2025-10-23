/**
 * Supabase Database Types
 * Generated types for database schema
 */

export interface Database {
  public: {
    Tables: {
      // Web-scraped trips table
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
      trip_status: 'scraped' | 'processing' | 'ready' | 'error';
    };
  };
}

/**
 * Trip Metadata Type (Web Scraping)
 */
export type WanderlogTrip = Database['public']['Tables']['wanderlog_trips']['Row'];
export type WanderlogTripInsert = Database['public']['Tables']['wanderlog_trips']['Insert'];
export type WanderlogTripUpdate = Database['public']['Tables']['wanderlog_trips']['Update'];
