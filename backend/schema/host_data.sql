CREATE TABLE IF NOT EXISTS host_expenses (
  id SERIAL PRIMARY KEY,
  host_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  type VARCHAR(100) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  property VARCHAR(255) NOT NULL DEFAULT '',
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  category VARCHAR(120) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_host_expenses_host_user_id ON host_expenses(host_user_id);
CREATE INDEX IF NOT EXISTS idx_host_expenses_expense_date ON host_expenses(expense_date DESC);

-- Sample host expenses removed - manage through application
