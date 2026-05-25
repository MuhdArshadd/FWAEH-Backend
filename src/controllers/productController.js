const Product = require('../models/productModel');

const getProducts = async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const checkout = async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  try {
    // Import your database connection (adjust this depending on if you use 'pg' pool or Supabase JS client)
    const db = require('../config/db'); 

    // Loop through every item in the user's cart
    for (const item of cartItems) {
      // 1. Fetch the current stock for this specific item
      // NOTE: Adjust this query syntax to match exactly how you wrote your GET products query!
      const currentItem = await db.query(
        'SELECT stock_quantity FROM products WHERE product_id = $1',
        [item.product_id]
      );

      const currentStock = currentItem.rows[0].stock_quantity;

      // 2. Calculate the new stock (prevent it from going below 0)
      const newStock = Math.max(0, currentStock - item.quantity);

      // 3. Update the database with the new stock number
      await db.query(
        'UPDATE products SET stock_quantity = $1 WHERE product_id = $2',
        [newStock, item.product_id]
      );
    }

    res.status(200).json({ success: true, message: "Checkout successful and inventory updated!" });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ success: false, message: "Server error during checkout" });
  }
};

module.exports = {
    getProducts,
    checkout
};