// REPOSITORY — the single source of truth for user database operations
// If tomorrow you switch from PostgreSQL to MongoDB, you only change this file
// Controllers and models stay untouched
const pool = require('../db');

const userRepository = {

  // Get one user by email — used for login and duplicate checks
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Get one user by ID — useful for protected routes later
  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Save a new user to the database
  async create(name, email, hashedPassword) {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    return result.rows[0];
  },

  // Delete a user by ID — e.g. for account deletion
  async deleteById(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
};

module.exports = userRepository;