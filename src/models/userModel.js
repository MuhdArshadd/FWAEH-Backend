const pool = require('../config/db');

const UserModel = {
  // 1. Create a new user (Registration)
  createUser: async (firstName, lastName, email, hashedPassword) => {
    // We use $1, $2, etc., to prevent SQL Injection attacks
    const query = `
      INSERT INTO users (first_name, last_name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, first_name, last_name, email, role, created_at;
    `;
    const values = [firstName, lastName, email, hashedPassword];
    
    // Run the query and return the newly created row
    const result = await pool.query(query, values);
    return result.rows[0]; 
  },

  // 2. Find a user by their email (Used for checking duplicates in Register, and verifying in Login)
  findByEmail: async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0]; // Returns the user object, or undefined if no user is found
  },

  // 3. Find a user by their ID (Useful later for profile pages and JWT verification)
  findById: async (userId) => {
    const query = `
      SELECT user_id, first_name, last_name, email, role, created_at 
      FROM users 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
};

module.exports = UserModel;