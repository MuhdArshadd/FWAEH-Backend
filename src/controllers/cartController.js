const pool = require('../config/db');

// @desc    Get user's database cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Join cart_items with products to get product details (name, price, image)
    const query = `
      SELECT c.cart_item_id, c.quantity, p.product_id, p.name, p.price, p.image, p.stock_quantity 
      FROM cart_items c 
      JOIN products p ON c.product_id = p.product_id 
      WHERE c.user_id = $1
      ORDER BY c.added_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// @desc    Add item to database cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Because we have UNIQUE(user_id, product_id) in SQL, we can use ON CONFLICT
    // If it exists, add the new quantity to the old quantity. If not, insert it.
    const query = `
      INSERT INTO cart_items (user_id, product_id, quantity) 
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, added_at = NOW()
      RETURNING *;
    `;
    
    const result = await pool.query(query, [userId, productId, quantity || 1]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// @desc    Sync/Merge Local Storage Cart to Database on Login
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { localCartItems } = req.body; // Array of { productId, quantity }

    if (!localCartItems || localCartItems.length === 0) {
      return res.status(200).json({ message: 'No local items to sync' });
    }

    // Loop through guest items and upsert them into the database
    for (let item of localCartItems) {
      await pool.query(`
        INSERT INTO cart_items (user_id, product_id, quantity) 
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, product_id) 
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity;
      `, [userId, item.productId, item.quantity]);
    }

    res.status(200).json({ message: 'Cart synced successfully' });
  } catch (error) {
    console.error("Sync Cart Error:", error);
    res.status(500).json({ message: 'Server error syncing cart' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:cartItemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    await pool.query('DELETE FROM cart_items WHERE cart_item_id = $1 AND user_id = $2', [cartItemId, userId]);
    
    res.status(200).json({ message: 'Item removed' });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({ message: 'Server error removing item' });
  }
};

module.exports = { getCart, addToCart, syncCart, removeFromCart };