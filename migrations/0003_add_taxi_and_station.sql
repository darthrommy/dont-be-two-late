-- Migration number: 0003    Add taxi fare and station name columns

ALTER TABLE checking ADD COLUMN taxi_fare INTEGER;
ALTER TABLE checking ADD COLUMN station_name TEXT;
