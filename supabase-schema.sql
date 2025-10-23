-- Wanderlog Scraper - Structured Tables Schema
-- Run this in Supabase SQL Editor for project: eaofdajkpqyddlbawdli

-- =====================================================
-- 1. TRIPS TABLE (Main table for trip metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wanderlog_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wanderlog_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  creator TEXT,
  start_date DATE,
  end_date DATE,
  views INTEGER,
  publication_date TEXT,
  notes TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trips_url ON public.wanderlog_trips(wanderlog_url);
CREATE INDEX idx_trips_created_at ON public.wanderlog_trips(created_at);

-- =====================================================
-- 2. FLIGHTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wanderlog_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.wanderlog_trips(id) ON DELETE CASCADE,
  airline TEXT NOT NULL,
  departure_airport TEXT,
  arrival_airport TEXT,
  departure_time TEXT,
  arrival_time TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'CAD',
  baggage_options TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flights_trip_id ON public.wanderlog_flights(trip_id);

-- =====================================================
-- 3. HOTELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wanderlog_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.wanderlog_trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  room_type TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'CAD',
  rating DECIMAL(2, 1),
  amenities TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hotels_trip_id ON public.wanderlog_hotels(trip_id);

-- =====================================================
-- 4. CAR RENTALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wanderlog_car_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.wanderlog_trips(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  vehicle_type TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'CAD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_car_rentals_trip_id ON public.wanderlog_car_rentals(trip_id);

-- =====================================================
-- 5. ACTIVITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wanderlog_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.wanderlog_trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  original_description TEXT,
  hours TEXT,
  rating DECIMAL(2, 1),
  address TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_trip_id ON public.wanderlog_activities(trip_id);
CREATE INDEX idx_activities_name ON public.wanderlog_activities(name);

-- =====================================================
-- 6. IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wanderlog_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.wanderlog_trips(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.wanderlog_activities(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  caption TEXT,
  position INTEGER DEFAULT 0,
  associated_section TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_trip_id ON public.wanderlog_images(trip_id);
CREATE INDEX idx_images_activity_id ON public.wanderlog_images(activity_id);
CREATE INDEX idx_images_section ON public.wanderlog_images(associated_section);

-- =====================================================
-- 7. DAILY SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wanderlog_daily_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.wanderlog_trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_schedules_trip_id ON public.wanderlog_daily_schedules(trip_id);
CREATE INDEX idx_daily_schedules_day_number ON public.wanderlog_daily_schedules(day_number);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE public.wanderlog_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderlog_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderlog_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderlog_car_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderlog_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderlog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderlog_daily_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.wanderlog_trips FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.wanderlog_flights FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.wanderlog_hotels FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.wanderlog_car_rentals FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.wanderlog_activities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.wanderlog_images FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.wanderlog_daily_schedules FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON public.wanderlog_trips FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.wanderlog_flights FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.wanderlog_hotels FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.wanderlog_car_rentals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.wanderlog_activities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.wanderlog_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON public.wanderlog_daily_schedules FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow anon insert" ON public.wanderlog_trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON public.wanderlog_flights FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON public.wanderlog_hotels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON public.wanderlog_car_rentals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON public.wanderlog_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON public.wanderlog_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON public.wanderlog_daily_schedules FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update" ON public.wanderlog_trips FOR UPDATE USING (true);
CREATE POLICY "Allow anon update" ON public.wanderlog_activities FOR UPDATE USING (true);

CREATE POLICY "Allow anon delete" ON public.wanderlog_trips FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON public.wanderlog_flights FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON public.wanderlog_hotels FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON public.wanderlog_car_rentals FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON public.wanderlog_activities FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON public.wanderlog_images FOR DELETE USING (true);
CREATE POLICY "Allow anon delete" ON public.wanderlog_daily_schedules FOR DELETE USING (true);

-- =====================================================
-- 9. UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wanderlog_trips_updated_at
  BEFORE UPDATE ON public.wanderlog_trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! After running, reload schema cache:
-- NOTIFY pgrst, 'reload schema';
-- =====================================================
