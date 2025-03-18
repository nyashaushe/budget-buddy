import pkg from 'pg';
const { Pool } = pkg;
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/errorHandler.js';

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// @desc    Get all expenses for current user
// @route   GET /api/expenses
// @access  Private
const getAllExpenses = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT e.*, c.name as category_name, c.color as category_color FROM expenses e ' +
      'LEFT JOIN categories c ON e.category_id = c.id ' +
      'WHERE e.user_id = $1 ' +
      'ORDER BY e.date DESC',
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(new ApiError('Error fetching expenses', 500));
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT e.*, c.name as category_name, c.color as category_color FROM expenses e ' +
      'LEFT JOIN categories c ON e.category_id = c.id ' +
      'WHERE e.id = $1 AND e.user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return next(new ApiError('Expense not found', 404));
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(new ApiError('Error fetching expense', 500));
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, description, date, category_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO expenses (amount, description, date, category_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [amount, description, date, category_id, req.user.id]
    );
    
    // Get category details
    const categoryResult = await pool.query(
      'SELECT name, color FROM categories WHERE id = $1',
      [category_id]
    );
    
    const expense = result.rows[0];
    if (categoryResult.rows.length > 0) {
      expense.category_name = categoryResult.rows[0].name;
      expense.category_color = categoryResult.rows[0].color;
    }
    
    res.status(201).json(expense);
  } catch (err) {
    next(new ApiError('Error creating expense', 500));
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, description, date, category_id } = req.body;

  try {
    // Check if expense exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return next(new ApiError('Expense not found or not authorized', 404));
    }
    
    // Update expense
    const result = await pool.query(
      'UPDATE expenses SET amount = $1, description = $2, date = $3, category_id = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [amount, description, date, category_id, req.params.id, req.user.id]
    );
    
    // Get category details
    const categoryResult = await pool.query(
      'SELECT name, color FROM categories WHERE id = $1',
      [category_id]
    );
    
    const expense = result.rows[0];
    if (categoryResult.rows.length > 0) {
      expense.category_name = categoryResult.rows[0].name;
      expense.category_color = categoryResult.rows[0].color;
    }
    
    res.json(expense);
  } catch (err) {
    next(new ApiError('Error updating expense', 500));
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    // Check if expense exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return next(new ApiError('Expense not found or not authorized', 404));
    }
    
    // Delete expense
    await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    res.json({ message: 'Expense removed' });
  } catch (err) {
    next(new ApiError('Error deleting expense', 500));
  }
};

// @desc    Get expense summary by category
// @route   GET /api/expenses/summary
// @access  Private
const getExpenseSummary = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT c.id, c.name, c.color, SUM(e.amount) as total ' +
      'FROM expenses e ' +
      'JOIN categories c ON e.category_id = c.id ' +
      'WHERE e.user_id = $1 ' +
      'GROUP BY c.id, c.name, c.color ' +
      'ORDER BY total DESC',
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(new ApiError('Error fetching expense summary', 500));
  }
};

export {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
};
