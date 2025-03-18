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

// @desc    Get all goals for current user
// @route   GET /api/goals
// @access  Private
const getAllGoals = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY target_date',
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(new ApiError('Error fetching goals', 500));
  }
};

// @desc    Get goal by ID
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return next(new ApiError('Goal not found', 404));
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(new ApiError('Error fetching goal', 500));
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, target_amount, current_amount, target_date } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO goals (name, target_amount, current_amount, target_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, target_amount, current_amount || 0, target_date, req.user.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(new ApiError('Error creating goal', 500));
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, target_amount, current_amount, target_date } = req.body;

  try {
    // Check if goal exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return next(new ApiError('Goal not found or not authorized', 404));
    }
    
    // Update goal
    const result = await pool.query(
      'UPDATE goals SET name = $1, target_amount = $2, current_amount = $3, target_date = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, target_amount, current_amount, target_date, req.params.id, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(new ApiError('Error updating goal', 500));
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    // Check if goal exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return next(new ApiError('Goal not found or not authorized', 404));
    }
    
    // Delete goal
    await pool.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    res.json({ message: 'Goal removed' });
  } catch (err) {
    next(new ApiError('Error deleting goal', 500));
  }
};

// @desc    Update goal progress
// @route   PATCH /api/goals/:id/progress
// @access  Private
const updateGoalProgress = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { current_amount } = req.body;

  try {
    // Check if goal exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return next(new ApiError('Goal not found or not authorized', 404));
    }
    
    // Update goal progress
    const result = await pool.query(
      'UPDATE goals SET current_amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [current_amount, req.params.id, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(new ApiError('Error updating goal progress', 500));
  }
};

// @desc    Get goal progress summary
// @route   GET /api/goals/progress-summary
// @access  Private
const getGoalProgressSummary = async (req, res, next) => {
  try {
    // Get summary of all goals progress
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_goals,
        SUM(CASE WHEN current_amount >= target_amount THEN 1 ELSE 0 END) as completed_goals,
        SUM(current_amount) as total_saved,
        SUM(target_amount) as total_target,
        CASE 
          WHEN SUM(target_amount) > 0 
          THEN ROUND((SUM(current_amount) / SUM(target_amount)) * 100, 2)
          ELSE 0
        END as overall_progress
      FROM goals
      WHERE user_id = $1
    `, [req.user.id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    next(new ApiError('Error fetching goal progress summary', 500));
  }
};

export {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalProgressSummary
};
