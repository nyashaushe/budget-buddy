import pkg from 'pg';
const { Pool } = pkg;
import { validationResult } from 'express-validator';

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// @desc    Get all categories for current user
// @route   GET /api/categories
// @access  Private
const getAllCategories = async (req, res) => {
  try {
    console.log('getAllCategories called');
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', msg: 'Error fetching categories', details: err });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', msg: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', msg: 'Error fetching category', details: err });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, color } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *',
      [name, color]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', msg: 'Error creating category', details: err });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, color } = req.body;

  try {
    // Check if category exists
    const checkResult = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [req.params.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', msg: 'Category not found' });
    }
    
    // Update category
    const result = await pool.query(
      'UPDATE categories SET name = $1, color = $2 WHERE id = $3 RETURNING *',
      [name, color, req.params.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', msg: 'Error updating category', details: err });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    // Check if category exists
    const checkResult = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [req.params.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', msg: 'Category not found' });
    }
    
    // Delete category
    await pool.query(
      'DELETE FROM categories WHERE id = $1',
      [req.params.id]
    );
    
    res.json({ message: 'Category removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', msg: 'Error deleting category', details: err });
  }
};

// @desc    Get categories with expense totals
// @route   GET /api/categories/with-totals
// @access  Private
const getCategoriesWithTotals = async (req, res) => {
  try {
    // Query to get categories with their total expenses
    const result = await pool.query(`
      SELECT c.id, c.name, c.color, COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', msg: 'Error fetching categories with totals', details: err });
  }
};

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithTotals
};
