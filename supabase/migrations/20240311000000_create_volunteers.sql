
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

-- Create function to find nearby volunteers
CREATE OR REPLACE FUNCTION public.find_nearby_volunteers(
    report_latitude double precision,
    report_longitude double precision,
    required_skills text[],
    max_distance_km integer DEFAULT 10
)
RETURNS TABLE(
    volunteer_id uuid,
    distance_meters double precision,
    skill_match_percentage double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH volunteer_distances AS (
        SELECT 
            v.id as volunteer_id,
            ST_Distance(
                v.location::geography,
                ST_SetSRID(ST_MakePoint(report_longitude, report_latitude), 4326)::geography
            ) as distance_meters,
            v.skills as skills,
            ARRAY(
                SELECT UNNEST(v.skills)
                INTERSECT
                SELECT UNNEST(required_skills)
            ) as matching_skills
        FROM volunteers v
        WHERE v.availability = 'available'
        AND ST_DWithin(
            v.location::geography,
            ST_SetSRID(ST_MakePoint(report_longitude, report_latitude), 4326)::geography,
            max_distance_km * 1000
        )
    )
    SELECT 
        vd.volunteer_id,
        vd.distance_meters,
        CASE 
            WHEN array_length(required_skills, 1) IS NULL THEN 100.0
            ELSE (array_length(vd.matching_skills, 1)::FLOAT / array_length(required_skills, 1)::FLOAT * 100.0)
        END as skill_match_percentage
    FROM volunteer_distances vd
    WHERE array_length(vd.matching_skills, 1) > 0 OR array_length(required_skills, 1) IS NULL
    ORDER BY 
        skill_match_percentage DESC,
        distance_meters ASC;
END;
$$;
