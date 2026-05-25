const pool = require('../config/db');

const getUserDashboard = async (req, res) => {
  try {
    // req.user.id is attached by your authMiddleware (protect)
    const userId = req.user.id;

    // Use Promise.all to fetch all data in parallel for speed
    const [profile, wishlists, orders, cart] = await Promise.all([
      
      // 1. Fetch Profile
      pool.query(
        'SELECT first_name, last_name, email, role FROM users WHERE user_id = $1', 
        [userId]
      ),
      
      // 2. Fetch Wishlist (Joined with products)
      pool.query(`
        SELECT p.product_id, p.name, p.price, p.image 
        FROM wishlists w 
        JOIN products p ON w.product_id = p.product_id 
        WHERE w.user_id = $1`, 
        [userId]
      ),
      
      // 3. Fetch Order History (Joined with order_products and products)
      // We use json_agg to group all products for a single order into one array
      pool.query(`
        SELECT o.order_id, o.order_date, o.total_amount, o.delivery_status,
               json_agg(json_build_object(
                 'name', p.name, 
                 'quantity', op.total_quantity, 
                 'price', op.total_price
               )) as items
        FROM orders o
        JOIN order_products op ON o.order_id = op.order_id
        JOIN products p ON op.product_id = p.product_id
        WHERE o.user_id = $1
        GROUP BY o.order_id
        ORDER BY o.order_date DESC`, 
        [userId]
      ),

      // 4. Fetch Cart Items (Joined with products)
      pool.query(`
        SELECT c.cart_item_id, c.quantity, p.product_id, p.name, p.price, p.image 
        FROM cart_items c 
        JOIN products p ON c.product_id = p.product_id 
        WHERE c.user_id = $1`, 
        [userId]
      )
    ]);

    // Send the aggregated object back to the frontend
    res.json({
      profile: profile.rows[0],
      wishlist: wishlists.rows,
      orders: orders.rows,
      cart: cart.rows
    });

  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
};

module.exports = { getUserDashboard };