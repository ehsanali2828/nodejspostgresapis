const db = require('../config/db');

// GET /api/orders  (admin sees all; customers see own)
const getAll = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const values  = isAdmin ? [] : [req.user.id];
    const where   = isAdmin ? '' : 'WHERE o.user_id = $1';

    const result = await db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${where}
       ORDER BY o.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/orders/:id
const getOne = async (req, res) => {
  try {
    const orderResult = await db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (!orderResult.rows.length)
      return res.status(404).json({ message: 'Order not found.' });

    const order = orderResult.rows[0];

    // Customers can only see their own orders
    if (req.user.role !== 'admin' && order.user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden.' });

    const itemsResult = await db.query(
      `SELECT oi.*, p.name AS product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );
    order.items = itemsResult.rows;
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/orders
const create = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { items, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'items array is required.' });

    await client.query('BEGIN');

    // Validate products and compute total
    let totalAmount = 0;
    const enrichedItems = [];
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1)
        throw { status: 400, message: 'Each item needs product_id and quantity >= 1.' };

      const prod = await client.query(
        'SELECT id, price, stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      if (!prod.rows.length)
        throw { status: 404, message: `Product ${item.product_id} not found.` };

      const product = prod.rows[0];
      if (product.stock < item.quantity)
        throw { status: 400, message: `Insufficient stock for product ${item.product_id}.` };

      totalAmount += product.price * item.quantity;
      enrichedItems.push({ ...item, unit_price: product.price });
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, notes)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, totalAmount.toFixed(2), notes || null]
    );
    const order = orderResult.rows[0];

    // Insert items and decrement stock
    for (const item of enrichedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)',
        [order.id, item.product_id, item.quantity, item.unit_price]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order placed successfully.', order });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

// PATCH /api/orders/:id/status  (admin only)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending','confirmed','shipped','delivered','cancelled'];
    if (!status || !valid.includes(status))
      return res.status(400).json({ message: `status must be one of: ${valid.join(', ')}.` });

    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: 'Order not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/orders/stats  (admin only)
const getStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)                                         AS total_orders,
        SUM(total_amount)                                AS total_revenue,
        AVG(total_amount)                                AS avg_order_value,
        COUNT(*) FILTER (WHERE status = 'pending')       AS pending,
        COUNT(*) FILTER (WHERE status = 'confirmed')     AS confirmed,
        COUNT(*) FILTER (WHERE status = 'shipped')       AS shipped,
        COUNT(*) FILTER (WHERE status = 'delivered')     AS delivered,
        COUNT(*) FILTER (WHERE status = 'cancelled')     AS cancelled
      FROM orders
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAll, getOne, create, updateStatus, getStats };
