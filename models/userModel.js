// MODEL — responsible for ALL database interactions
// Controllers never write SQL directly; they ask the model
const pool = require('../db');

const UserModel = {

  // Find a user by their email address
  // Used in both login (check credentials) and signup (check duplicates)
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0]; // returns undefined if not found
  },

  // Insert a new user and return their id, name, email
  // We never return the password — even the hashed one
  async create(name, email, hashedPassword) {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    return result.rows[0];
  }
};

module.exports = UserModel;