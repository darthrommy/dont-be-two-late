-- Migration number: 0001 	 2026-01-07T11:49:50.611Z
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS session;

DROP TABLE IF EXISTS checking;

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
  operator_id TEXT NOT NULL,
  departure_time INTEGER NOT NULL,
  fare INTEGER NOT NULL
) strict;

CREATE INDEX idx_checking_session_id ON checking (session_id);
