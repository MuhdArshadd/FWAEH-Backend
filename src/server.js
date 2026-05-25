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

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/user', userRoutes);


// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running beautifully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});