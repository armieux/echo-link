
-- Enable PostGIS extension for geographical data
CREATE EXTENSION IF NOT EXISTS postgis;

-- First create the enum type for volunteer status
CREATE TYPE volunteer_status AS ENUM ('available', 'busy', 'offline');

-- Create the volunteers table with PostGIS geography type for location
CREATE TABLE IF NOT EXISTS public.volunteers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    location geography(Point, 4326) NOT NULL,
    rating numeric DEFAULT 5.0,
    skills text[] NOT NULL DEFAULT '{}'::text[],
    availability volunteer_status NOT NULL DEFAULT 'offline',
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read volunteer info
CREATE POLICY "Allow authenticated users to read volunteer info"
ON public.volunteers
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow users to manage their own volunteer profile
CREATE POLICY "Users can manage own volunteer profile"
ON public.volunteers
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create spatial index for location queries
CREATE INDEX IF NOT EXISTS volunteers_location_idx ON public.volunteers USING GIST (location);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS volunteers_user_id_idx ON public.volunteers(user_id);
CREATE INDEX IF NOT EXISTS volunteers_availability_idx ON public.volunteers(availability);
