const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Helper function to generate a JWT token
const generateToken = require('../utils/generateToken');

const authController = {
  // ----------------------------------------
  // 1. REGISTER A NEW USER
  // ----------------------------------------
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // 1. Basic validation
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }

      // 2. Check if user already exists
      const userExists = await UserModel.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // 3. Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Create the user in the database
      const newUser = await UserModel.createUser(firstName, lastName, email, hashedPassword);

      // 5. Send success response with token
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.user_id,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          email: newUser.email,
          role: newUser.role
        },
        token: generateToken(newUser.user_id),
      });

    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  // ----------------------------------------
  // 2. LOGIN EXISTING USER
  // ----------------------------------------
  login: async (req, res) => {
    try {
      console.log("1. Login request received!");
      const { email, password } = req.body;

      // 1. Validate request
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      // 2. Find user by email
      console.log("2. Searching database for email:", email);
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // 3. Check if password matches
      console.log("3. Database search finished. User found?", !!user);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("4. Password check finished! Match?", isMatch);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // 4. Send success response with token
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role
        },
        token: generateToken(user.user_id),
      });

    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
};

module.exports = authController;