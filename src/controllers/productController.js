const db = require('../config/db');

// GET /api/products?category=&search=&page=&limit=
const getAll = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = [];
    let values = [];
    let idx = 1;

    if (category) {
      conditions.push(`p.category_id = $${idx++}`);
      values.push(category);
    }
    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await db.query(
      `SELECT COUNT(*) FROM products p ${where}`, values
    );
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit), offset);
    const result = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.id
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    res.json({
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/products/:id
const getOne = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: 'Product not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/products  (admin only)
const create = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;
    if (!name || price === undefined)
      return res.status(400).json({ message: 'name and price are required.' });

    const result = await db.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description || null, price, stock || 0, category_id || null, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/products/:id  (admin only)
const update = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;
    const result = await db.query(
      `UPDATE products SET
         name        = COALESCE($1, name),
         description = COALESCE($2, description),
         price       = COALESCE($3, price),
         stock       = COALESCE($4, stock),
         category_id = COALESCE($5, category_id),
         image_url   = COALESCE($6, image_url),
         updated_at  = NOW()
       WHERE id = $7 RETURNING *`,
      [name||null, description||null, price||null, stock||null, category_id||null, image_url||null, req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: 'Product not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/products/:id  (admin only)
const remove = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length)
      return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
