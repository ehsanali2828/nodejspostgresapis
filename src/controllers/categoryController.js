const db = require('../config/db');

// GET /api/categories
const getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/categories/:id
const getOne = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (!result.rows.length)
      return res.status(404).json({ message: 'Category not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/categories  (admin only)
const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });

    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ message: 'Category name already exists.' });
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/categories/:id  (admin only)
const update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE categories SET
         name        = COALESCE($1, name),
         description = COALESCE($2, description),
         updated_at  = NOW()
       WHERE id = $3 RETURNING *`,
      [name || null, description || null, req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: 'Category not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/categories/:id  (admin only)
const remove = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length)
      return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
