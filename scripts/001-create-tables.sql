-- Cloud Services Catalog Schema
-- Run this on your Aurora PostgreSQL cluster

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('AWS', 'Azure')),
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('fully-supported', 'vendor-supported', 'not-supported', 'under-review')),
  description TEXT NOT NULL,
  support_notes TEXT,
  limitations TEXT,
  support_contact VARCHAR(255),
  last_updated VARCHAR(100),
  updated_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
