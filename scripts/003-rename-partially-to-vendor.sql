-- Migration: rename status 'partially-supported' to 'vendor-supported'
-- Run this against your Aurora PostgreSQL cluster

BEGIN;

-- 1. Drop the old CHECK constraint
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_status_check;

-- 2. Update existing rows
UPDATE services
SET status = 'vendor-supported'
WHERE status = 'partially-supported';

-- 3. Re-add the CHECK constraint with the new value
ALTER TABLE services
  ADD CONSTRAINT services_status_check
  CHECK (status IN ('fully-supported', 'vendor-supported', 'not-supported', 'under-review'));

COMMIT;

-- Verify the change
SELECT status, COUNT(*) FROM services GROUP BY status ORDER BY status;
