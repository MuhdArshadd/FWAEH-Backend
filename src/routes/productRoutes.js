const express = require('express');
const router = express.Router();
const { getProducts } = require('../controllers/productController');
const productController = require('../controllers/productController');

// GET /api/products
router.get('/', getProducts);
router.post('/checkout', productController.checkout);

module.exports = router;