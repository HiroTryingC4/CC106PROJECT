CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT '',
  company VARCHAR(255) DEFAULT '',
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'guest',
  verification_status VARCHAR(50) NOT NULL DEFAULT 'not_required',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'communication_admin', 'host', 'guest')),
  CONSTRAINT users_verification_status_check CHECK (
    verification_status IN ('verified', 'not_submitted', 'not_required', 'pending')
  )
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS host_verifications (
  id SERIAL PRIMARY KEY,
  host_user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  business_address TEXT NOT NULL,
  id_type VARCHAR(100) NOT NULL,
  id_number VARCHAR(100) NOT NULL,
  tax_id VARCHAR(100) DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  rejection_reason TEXT DEFAULT '',
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT host_verifications_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_host_verifications_status ON host_verifications (status);
CREATE INDEX IF NOT EXISTS idx_host_verifications_host_user_id ON host_verifications (host_user_id);

INSERT INTO users (
  first_name,
  last_name,
  email,
  phone,
  company,
  password_hash,
  role,
  verification_status
)
VALUES
  ('Admin', 'User', 'admin@smartstay.com', '', '', '$2a$10$zMYzZMgMLwpkULlXaoVDau9CYgd/c4PiX8YOjz4AMaiwfsm.t/GkS', 'admin', 'verified'),
  ('Communication', 'Admin', 'comadmin@smartstay.com', '', '', '$2a$10$3tyOE5SwPGxMKFtaDuhPreFeDEnBbIcVJjRgJL8WE2CSGXbLtXz26', 'communication_admin', 'verified'),
  ('John', 'Host', 'host@smartstay.com', '', 'Host Properties LLC', '$2a$10$RHV7dO.FrPTSgx6sdT.hA.dOJQ9f3dGq7xRqIXRHwnNYJmMAbDtIW', 'host', 'verified'),
  ('Sarah', 'NewHost', 'newhost@smartstay.com', '', '', '$2a$10$wcWn1YxEcHJuOnSa2LIlDugbETSpjSYde1ITq7dfu5AAiSzSKLPeu', 'host', 'not_submitted'),
  ('Jane', 'Guest', 'guest@smartstay.com', '', '', '$2a$10$Rh4a43hm0NKet3MbfwWrxum4OqOBNdzoK3rXd4UTQ..y2s8TnQNzi', 'guest', 'not_required')
ON CONFLICT (email) DO NOTHING;
