const bcrypt = require('bcryptjs');

const DEFAULT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const mapUserRow = (row) => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone || '',
  company: row.company || '',
  passwordHash: row.password_hash,
  role: row.role,
  verificationStatus: row.verification_status,
  createdAt: row.created_at || null
});

const createUserRepository = (pool) => {
  if (!pool) {
    throw new Error('A PostgreSQL pool is required to use the user repository');
  }

  const findUserByEmail = async (email) => {
    const result = await pool.query(
      `
        SELECT id, first_name, last_name, email, phone, company, password_hash, role, verification_status, created_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  };

  const findUserById = async (id) => {
    const result = await pool.query(
      `
        SELECT id, first_name, last_name, email, phone, company, password_hash, role, verification_status, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  };

  const createUser = async ({ firstName, lastName, email, phone = '', company = '', password, role = 'guest', verificationStatus = 'not_required' }) => {
    const passwordHash = await bcrypt.hash(password, DEFAULT_SALT_ROUNDS);

    const result = await pool.query(
      `
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, first_name, last_name, email, phone, company, password_hash, role, verification_status, created_at
      `,
      [firstName, lastName, email, phone, company, passwordHash, role, verificationStatus]
    );

    return mapUserRow(result.rows[0]);
  };

  const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    return passwordMatches ? user : null;
  };

  return {
    findUserByEmail,
    findUserById,
    createUser,
    authenticateUser
  };
};

module.exports = {
  createUserRepository
};
