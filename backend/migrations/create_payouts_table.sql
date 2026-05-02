-- Migration: Create payouts table
-- Tracks host payout requests and admin approval

CREATE TABLE IF NOT EXISTS payouts (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payout_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
  notes TEXT DEFAULT '',
  -- Admin approval fields
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  rejection_reason TEXT DEFAULT '',
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  CONSTRAINT payouts_status_check CHECK (status IN ('pending', 'approved', 'completed', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_payouts_host_id ON payouts(host_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_approved_by ON payouts(approved_by);
