import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for database operations
 */

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Database Types
 * These should match your Supabase table schemas
 */

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string;
          title: string;
          creator: string | null;
          start_date: string;
          end_date: string;
          views: number | null;
          publication_date: string | null;
          wanderlog_url: string;
          header_images: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['trips']['Insert']>;
      };
      trip_notes: {
        Row: {
          id: string;
          trip_id: string;
          notes: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trip_notes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['trip_notes']['Insert']>;
      };
      flights: {
        Row: {
          id: string;
          trip_id: string;
          airline: string;
          flight_code: string | null;
          departure_airport: string;
          arrival_airport: string;
          departure_time: string;
          arrival_time: string;
          price: number;
          currency: string;
          baggage_options: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['flights']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['flights']['Insert']>;
      };
      hotels: {
        Row: {
          id: string;
          trip_id: string;
          name: string;
          room_type: string | null;
          amenities: string[];
          rating: number | null;
          price: number;
          currency: string;
          address: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hotels']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hotels']['Insert']>;
      };
      car_rentals: {
        Row: {
          id: string;
          trip_id: string;
          company: string;
          vehicle_type: string | null;
          pickup_location: string | null;
          dropoff_location: string | null;
          price: number | null;
          currency: string | null;
          discount_info: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['car_rentals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['car_rentals']['Insert']>;
      };
      activities: {
        Row: {
          id: string;
          trip_id: string;
          name: string;
          description: string | null;
          location: string | null;
          address: string | null;
          hours: string | null;
          rating: number | null;
          contact: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activities']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['activities']['Insert']>;
      };
      daily_schedule: {
        Row: {
          id: string;
          trip_id: string;
          day_number: number;
          date: string;
          items: any; // JSON field for daily activities
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_schedule']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_schedule']['Insert']>;
      };
      images: {
        Row: {
          id: string;
          trip_id: string;
          url: string;
          associated_activity_id: string | null;
          associated_section: string | null;
          context: string | null;
          position: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['images']['Insert']>;
      };
    };
  };
};
