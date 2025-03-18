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

// @desc    Get all budgets for current user
// @route   GET /api/budgets
// @access  Private
const getAllBudgets = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT b.*, c.name as category_name, c.color as category_color FROM budgets b ' +
      'LEFT JOIN categories c ON b.category_id = c.id ' +
      'WHERE b.user_id = $1 ' +
      'ORDER BY b.month DESC, c.name ASC',
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(new ApiError('Error fetching budgets', 500));
  }
};

// @desc    Get budget by ID
// @route   GET /api/budgets/:id
// @access  Private
const getBudgetById = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT b.*, c.name as category_name, c.color as category_color FROM budgets b ' +
      'LEFT JOIN categories c ON b.category_id = c.id ' +
      'WHERE b.id = $1 AND b.user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return next(new ApiError('Budget not found', 404));
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(new ApiError('Error fetching budget', 500));
  }
};

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, month, category_id } = req.body;

  try {
    // Check if budget already exists for this month and category
    const existingBudget = await pool.query(
      'SELECT * FROM budgets WHERE month = $1 AND category_id = $2 AND user_id = $3',
      [month, category_id, req.user.id]
    );
    
    if (existingBudget.rows.length > 0) {
      return next(new ApiError('Budget already exists for this month and category', 400));
    }
    
    const result = await pool.query(
      'INSERT INTO budgets (amount, month, category_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [amount, month, category_id, req.user.id]
    );
    
    // Get category details
    const categoryResult = await pool.query(
      'SELECT name, color FROM categories WHERE id = $1',
      [category_id]
    );
    
    const budget = result.rows[0];
    if (categoryResult.rows.length > 0) {
      budget.category_name = categoryResult.rows[0].name;
      budget.category_color = categoryResult.rows[0].color;
    }
    
    res.status(201).json(budget);
  } catch (err) {
    next(new ApiError('Error creating budget', 500));
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, month, category_id } = req.body;

  try {
    // Check if budget exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM budgets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return next(new ApiError('Budget not found or not authorized', 404));
    }
    
    // Check if updating would create a duplicate
    if (month !== checkResult.rows[0].month || category_id !== checkResult.rows[0].category_id) {
      const existingBudget = await pool.query(
        'SELECT * FROM budgets WHERE month = $1 AND category_id = $2 AND user_id = $3 AND id != $4',
        [month, category_id, req.user.id, req.params.id]
      );
      
      if (existingBudget.rows.length > 0) {
        return next(new ApiError('Budget already exists for this month and category', 400));
      }
    }
    
    // Update budget
    const result = await pool.query(
      'UPDATE budgets SET amount = $1, month = $2, category_id = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [amount, month, category_id, req.params.id, req.user.id]
    );
    
    // Get category details
    const categoryResult = await pool.query(
      'SELECT name, color FROM categories WHERE id = $1',
      [category_id]
    );
    
    const budget = result.rows[0];
    if (categoryResult.rows.length > 0) {
      budget.category_name = categoryResult.rows[0].name;
      budget.category_color = categoryResult.rows[0].color;
    }
    
    res.json(budget);
  } catch (err) {
    next(new ApiError('Error updating budget', 500));
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    // Check if budget exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM budgets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return next(new ApiError('Budget not found or not authorized', 404));
    }
    
    // Delete budget
    await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    res.json({ message: 'Budget removed' });
  } catch (err) {
    next(new ApiError('Error deleting budget', 500));
  }
};

// @desc    Get budget vs actual spending
// @route   GET /api/budgets/vs-actual
// @access  Private
const getBudgetVsActual = async (req, res, next) => {
  try {
    const { month } = req.query;
    
    if (!month) {
      return next(new ApiError('Month parameter is required', 400));
    }
    
    // Get budgets for the month
    const budgetsResult = await pool.query(
      'SELECT b.category_id, c.name as category_name, c.color as category_color, b.amount as budget ' +
      'FROM budgets b ' +
      'JOIN categories c ON b.category_id = c.id ' +
      'WHERE b.month = $1 AND b.user_id = $2',
      [month, req.user.id]
    );
    
    // Get actual spending for the month
    const startDate = new Date(month + '-01');
    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of the month
    
    const spendingResult = await pool.query(
      'SELECT e.category_id, SUM(e.amount) as actual ' +
      'FROM expenses e ' +
      'WHERE e.date >= $1 AND e.date <= $2 AND e.user_id = $3 ' +
      'GROUP BY e.category_id',
      [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], req.user.id]
    );
    
    // Combine budget and actual data
    const budgetVsActual = budgetsResult.rows.map(budget => {
      const spending = spendingResult.rows.find(s => s.category_id === budget.category_id);
      return {
        category_id: budget.category_id,
        category_name: budget.category_name,
        category_color: budget.category_color,
        budget: parseFloat(budget.budget),
        actual: spending ? parseFloat(spending.actual) : 0,
        remaining: parseFloat(budget.budget) - (spending ? parseFloat(spending.actual) : 0)
      };
    });
    
    res.json(budgetVsActual);
  } catch (err) {
    next(new ApiError('Error fetching budget vs actual data', 500));
  }
};

export {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetVsActual
};
