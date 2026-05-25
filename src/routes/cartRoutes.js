const express = require('express');
const router = express.Router();
const { getCart, addToCart, syncCart, removeFromCart } = require('../controllers/cartController');
const protect = require('../middleware/authMiddleware'); // Your JWT gatekeeper

// All cart routes require the user to be logged in!
router.use(protect);

router.get('/', getCart);             // Fetch DB cart
router.post('/', addToCart);          // Add 1 item
router.post('/sync', syncCart);       // Merge guest cart
router.delete('/:cartItemId', removeFromCart); // Remove item

module.exports = router;