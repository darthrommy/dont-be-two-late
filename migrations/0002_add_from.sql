-- Migration number: 0002 	 2026-01-07T13:12:19.198Z
ALTER TABLE checking
ADD COLUMN from_lat REAL;

ALTER TABLE checking
ADD COLUMN from_lon REAL;