const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // In production, you might need SSL configuration depending on your provider
  // ssl: {
  //   rejectUnauthorized: false 
  // }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
