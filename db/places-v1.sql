-- Run with psql as the database operator after reviewing the source scope and grants.
-- Create the runtime password separately through the secret provisioning workflow.
\set ON_ERROR_STOP on
BEGIN;

CREATE ROLE atlas_view_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE atlas_runtime LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE atlas_runtime SET statement_timeout = '3s';
ALTER ROLE atlas_runtime SET default_transaction_read_only = on;

GRANT CONNECT ON DATABASE :"DBNAME" TO atlas_runtime;
GRANT USAGE ON SCHEMA ingest TO atlas_view_owner;
GRANT SELECT (source_id, external_id, name, category, locality, source_url, updated_at)
    ON ingest.places TO atlas_view_owner;

CREATE SCHEMA atlas_public AUTHORIZATION atlas_view_owner;
SET LOCAL ROLE atlas_view_owner;

CREATE VIEW atlas_public.places_v1 WITH (security_barrier = true) AS
SELECT
    place.source_id,
    place.external_id,
    NULLIF(regexp_replace(place.name, '^[[:space:]]+|[[:space:]]+$', '', 'g'), '') AS name,
    mapped.category,
    NULLIF(regexp_replace(place.locality, '^[[:space:]]+|[[:space:]]+$', '', 'g'), '') AS locality,
    CASE WHEN place.source_url = 'https://www.openstreetmap.org/' || place.external_id
         THEN place.source_url END AS source_url,
    CASE WHEN isfinite(place.updated_at) THEN place.updated_at END AS updated_at
FROM ingest.places AS place
CROSS JOIN LATERAL (
    SELECT CASE
        WHEN place.category IN (
            'attraction', 'cave_entrance', 'city', 'glacier', 'hamlet', 'hot_spring',
            'information', 'marketplace', 'peak', 'picnic_site', 'saddle', 'spring',
            'town', 'village', 'viewpoint', 'water', 'waterfall'
        ) THEN 'destination'
        WHEN place.category IN (
            'alpine_hut', 'apartment', 'camp_site', 'caravan_site', 'chalet', 'guest_house',
            'hostel', 'hotel', 'motel', 'resort'
        ) THEN 'accommodation'
        WHEN place.category IN (
            'bakery', 'bar', 'biergarten', 'cafe', 'fast_food', 'food_court', 'ice_cream',
            'pub', 'restaurant'
        ) THEN 'food'
        WHEN place.category IN (
            'archaeological_site', 'castle', 'city_gate', 'fort', 'gallery', 'heritage',
            'memorial', 'monastery', 'monument', 'museum', 'place_of_worship', 'ruins',
            'temple', 'wayside_shrine'
        ) THEN 'heritage'
        WHEN place.category IN (
            'garden', 'national_park', 'nature_reserve', 'park', 'protected_area',
            'theme_park', 'water_park', 'zoo'
        ) THEN 'park'
        WHEN place.category IN (
            'aerodrome', 'bicycle_rental', 'boat_rental', 'bus_route', 'bus_station',
            'bus_stop', 'cable_car_station', 'car_rental', 'ferry_route', 'ferry_terminal',
            'rail_station', 'rail_stop', 'taxi'
        ) THEN 'transport'
        WHEN place.category IN ('bicycle_route', 'foot_route', 'hiking_route') THEN 'trail'
    END AS category
) AS mapped
WHERE place.source_id IN (
    'osm-annapurna', 'osm-bandipur', 'osm-bardiya', 'osm-chitwan-sauraha',
    'osm-everest', 'osm-ilam', 'osm-janakpur', 'osm-kathmandu-valley',
    'osm-langtang', 'osm-lumbini', 'osm-mustang', 'osm-nepal', 'osm-nepal-routes',
    'osm-pokhara', 'osm-rara'
)
AND place.external_id COLLATE "C" ~ '^(node|way|relation)/[1-9][0-9]{0,19}$'
AND mapped.category IS NOT NULL;

REVOKE ALL ON SCHEMA atlas_public FROM PUBLIC;
REVOKE ALL ON atlas_public.places_v1 FROM PUBLIC;
GRANT USAGE ON SCHEMA atlas_public TO atlas_runtime;
GRANT SELECT ON atlas_public.places_v1 TO atlas_runtime;
RESET ROLE;

DO $$
BEGIN
    IF has_database_privilege('atlas_runtime', current_database(), 'CREATE, TEMPORARY') THEN
        RAISE EXCEPTION 'Remove effective CREATE and TEMPORARY access from atlas_runtime before installing the public projection';
    END IF;
    IF has_schema_privilege('atlas_runtime', 'ingest', 'USAGE') OR EXISTS (
        SELECT 1 FROM pg_namespace
        WHERE has_schema_privilege('atlas_runtime', oid, 'CREATE')
    ) THEN
        RAISE EXCEPTION 'atlas_runtime must have no ingest schema access or schema creation privileges';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_class AS relation
        JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
        WHERE namespace.nspname NOT IN ('pg_catalog', 'information_schema')
          AND namespace.nspname NOT LIKE 'pg_toast%'
          AND relation.relkind IN ('r', 'p', 'v', 'm', 'f')
          AND relation.oid <> 'atlas_public.places_v1'::regclass
          AND has_any_column_privilege('atlas_runtime', relation.oid, 'SELECT, INSERT, UPDATE, REFERENCES')
    ) THEN
        RAISE EXCEPTION 'atlas_runtime has access to application relations outside the public projection';
    END IF;
    IF has_table_privilege('atlas_runtime', 'atlas_public.places_v1',
        'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER') THEN
        RAISE EXCEPTION 'atlas_runtime has unexpected privileges on the public projection';
    END IF;
END
$$;

COMMIT;
