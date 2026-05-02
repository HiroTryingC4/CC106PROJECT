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

INSERT INTO host_expenses (host_user_id, expense_date, type, description, property, amount, category, created_at)
SELECT
  3,
  '2024-03-24'::date,
  'Marketing expense',
  'Facebook ads',
  'Trial#1',
  2000,
  'Marketing Expenses',
  '2024-03-24T10:00:00.000Z'::timestamp
WHERE NOT EXISTS (
  SELECT 1
  FROM host_expenses
  WHERE host_user_id = 3
    AND expense_date = '2024-03-24'::date
    AND type = 'Marketing expense'
    AND description = 'Facebook ads'
    AND property = 'Trial#1'
    AND amount = 2000
    AND category = 'Marketing Expenses'
);
