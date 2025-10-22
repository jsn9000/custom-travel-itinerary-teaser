-- Wanderlog Trip Data Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trips table (main trip information)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  creator TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  views INTEGER,
  publication_date DATE,
  wanderlog_url TEXT NOT NULL UNIQUE,
  header_images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip notes table
CREATE TABLE IF NOT EXISTS trip_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flights table
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  airline TEXT NOT NULL,
  flight_code TEXT,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAD',
  baggage_options TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT,
  amenities TEXT[] DEFAULT '{}',
  rating DECIMAL(3, 2),
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAD',
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car rentals table
CREATE TABLE IF NOT EXISTS car_rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  vehicle_type TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'CAD',
  discount_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  address TEXT,
  hours TEXT,
  rating DECIMAL(3, 2),
  contact TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily schedule table
CREATE TABLE IF NOT EXISTS daily_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, day_number)
);

-- Images table (with associations to activities and sections)
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  associated_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  associated_section TEXT, -- 'header', 'notes', 'flight', 'hotel', 'activity', etc.
  context TEXT, -- alt text, caption, or description
  position INTEGER, -- order/position of image
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trip_notes_trip_id ON trip_notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_flights_trip_id ON flights(trip_id);
CREATE INDEX IF NOT EXISTS idx_hotels_trip_id ON hotels(trip_id);
CREATE INDEX IF NOT EXISTS idx_car_rentals_trip_id ON car_rentals(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_daily_schedule_trip_id ON daily_schedule(trip_id);
CREATE INDEX IF NOT EXISTS idx_images_trip_id ON images(trip_id);
CREATE INDEX IF NOT EXISTS idx_images_activity_id ON images(associated_activity_id);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - customize based on your needs)
CREATE POLICY "Allow all operations on trips" ON trips FOR ALL USING (true);
CREATE POLICY "Allow all operations on trip_notes" ON trip_notes FOR ALL USING (true);
CREATE POLICY "Allow all operations on flights" ON flights FOR ALL USING (true);
CREATE POLICY "Allow all operations on hotels" ON hotels FOR ALL USING (true);
CREATE POLICY "Allow all operations on car_rentals" ON car_rentals FOR ALL USING (true);
CREATE POLICY "Allow all operations on activities" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all operations on daily_schedule" ON daily_schedule FOR ALL USING (true);
CREATE POLICY "Allow all operations on images" ON images FOR ALL USING (true);
