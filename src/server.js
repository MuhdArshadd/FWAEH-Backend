const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 
require('dotenv').config();
require('./config/db');

const app = express();

// --- Middleware ---
app.use(cors()); // Allow requests from your React frontend
app.use(express.json()); // Parse incoming JSON payloads
app.use(morgan('dev')); 

// --- Routes ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running beautifully' });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});