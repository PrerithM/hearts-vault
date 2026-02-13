-- Hearts Vault Database Schema (D1 / SQLite)
-- Version: 1.0
-- Date: 2026-02-13

-- ===================================================================
-- Table: submissions
-- Purpose: Store all user submissions with full metadata
-- ===================================================================

CREATE TABLE IF NOT EXISTS submissions (
  -- Primary identification
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,

  -- User data
  user_name TEXT NOT NULL,
  crush_name TEXT NOT NULL,
  result TEXT NOT NULL,

  -- Client metadata
  device TEXT,
  screen TEXT,
  language TEXT,
  browser TEXT,
  os TEXT,

  -- Network metadata (privacy-preserving)
  country TEXT,
  city TEXT,
  ip_hash TEXT,

  -- Session metadata
  session_id TEXT,
  referrer TEXT,
  page TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON submissions(timestamp);
CREATE INDEX IF NOT EXISTS idx_result ON submissions(result);
CREATE INDEX IF NOT EXISTS idx_country ON submissions(country);

-- ===================================================================
-- Table: stats
-- Purpose: Track global application statistics
-- ===================================================================

CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value INTEGER
);

-- Seed initial statistics
INSERT OR IGNORE INTO stats (key, value)
VALUES
  ('totalVisits', 0),
  ('totalSubmissions', 0);
