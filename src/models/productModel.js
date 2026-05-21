const pool = require('../config/db');

const getAllProducts = async () => {
    // Write your raw SQL query
    const query = 'SELECT * FROM products;';
    
    // Execute the query using the connection pool
    const result = await pool.query(query);
    
    // The pg library returns the actual data inside a 'rows' array
    return result.rows; 
};

// You can easily add more specific queries later
const getProductsByCategory = async (category) => {
    const query = 'SELECT * FROM products WHERE category = $1;';
    const result = await pool.query(query, [category]);
    return result.rows;
};

module.exports = {
    getAllProducts,
    getProductsByCategory
};