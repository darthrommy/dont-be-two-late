-- Migration number: 0006 	 2026-01-10T10:03:57.253Z
DROP TABLE IF EXISTS checking;

DROP TABLE IF EXISTS session;

CREATE TABLE fcm_token (token TEXT PRIMARY KEY) strict;

CREATE TABLE destination (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  token TEXT NOT NULL REFERENCES fcm_token (token) ON DELETE CASCADE,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL
) strict;

CREATE INDEX idx_destination_token ON destination (token);

CREATE TABLE estimation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  destination_id TEXT NOT NULL REFERENCES destination (id) ON DELETE CASCADE,
  station_id TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  leave_time TEXT NOT NULL,
  origin_latitude REAL NOT NULL,
  origin_longitude REAL NOT NULL,
  fare INTEGER NOT NULL,
  taxi_fare INTEGER NOT NULL
) strict;

CREATE TABLE message_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  token TEXT NOT NULL REFERENCES fcm_token (token),
  estimation_id TEXT NOT NULL REFERENCES estimation (id) ON DELETE CASCADE,
  scheduled_at TEXT NOT NULL,
  sent_at TEXT DEFAULT NULL,
  canceled_at TEXT DEFAULT NULL
) strict;