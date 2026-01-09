-- Migration number: 0005 	 2026-01-09T15:48:03.981Z
DROP TABLE IF EXISTS checking;

DROP TABLE IF EXISTS session;

CREATE TABLE session (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  dest_lat REAL NOT NULL,
  dest_lon REAL NOT NULL
) strict;

CREATE TABLE checking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  session_id TEXT NOT NULL REFERENCES session (id) ON DELETE CASCADE,
  station_id TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  leave_time TEXT NOT NULL,
  fare INTEGER NOT NULL,
  from_lat REAL NOT NULL,
  from_lon REAL NOT NULL,
  taxi_fare INTEGER NOT NULL
) strict;