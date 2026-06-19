// We use the 'pg' package to talk to PostgreSQL (Neon is PostgreSQL under the hood)
const { Pool } = require('pg');
require('dotenv').config();

// Pool manages multiple database connections efficiently
// Instead of opening/closing a connection per query, it reuses them
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Neon requires SSL — this tells pg to use SSL but not verify the certificate
  ssl: { rejectUnauthorized: false }
});

// We export the pool so other files can run queries using pool.query()
module.exports = pool;