const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');   // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating tokens
const pool = require('./db');         // Our database connection
require('dotenv').config();

// ─────────────────────────────────────────
// POST /auth/signup
// ─────────────────────────────────────────
router.post('/signup', async (req, res) => {
  // 1. Pull name, email, password from the request body
  const { name, email, password } = req.body;

  // 2. Basic validation — make sure all fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // 3. Check if the email already exists in the database
    //    We use parameterized queries ($1, $2...) to prevent SQL injection
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // 4. Hash the password before storing it
    //    bcrypt.hash(password, saltRounds)
    //    saltRounds = 10 means bcrypt runs 2^10 = 1024 hashing rounds
    //    Never store plain-text passwords!
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Insert the new user into the database
    //    RETURNING * gives us back the inserted row immediately
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const newUser = result.rows[0];

    // 6. Generate a JWT token
    //    jwt.sign(payload, secret, options)
    //    The payload is data we embed in the token (userId is enough)
    //    expiresIn: '7d' means the token expires after 7 days
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 7. Return the token and basic user info
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: newUser
    });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
});


// ─────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Find the user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // 2. If no user found, return a generic "Invalid credentials" message
    //    Never say "email not found" — that leaks information to attackers
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 3. Compare the submitted password with the stored hash
    //    bcrypt.compare() hashes the input and checks if it matches the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Generate a JWT token (same as signup)
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Return token and user info (excluding password)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;