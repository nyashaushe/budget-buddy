import express from 'express';
const router = express.Router();
import { check } from 'express-validator';
import auth from '../middleware/auth.js';
import * as budgetController from '../controllers/budgetController.js';

// @route   GET api/budgets
// @desc    Get all budgets for current user
// @access  Private
router.get('/', auth, budgetController.getAllBudgets);

// @route   GET api/budgets/vs-actual
// @desc    Get budget vs actual spending
// @access  Private
router.get('/vs-actual', auth, budgetController.getBudgetVsActual);

// @route   GET api/budgets/:id
// @desc    Get budget by ID
// @access  Private
router.get('/:id', auth, budgetController.getBudgetById);

// @route   POST api/budgets
// @desc    Create a new budget
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('amount', 'Amount is required and must be a number').isNumeric(),
      check('month', 'Month is required').not().isEmpty(),
      check('category_id', 'Category ID is required').not().isEmpty()
    ]
  ],
  budgetController.createBudget
);

// @route   PUT api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('amount', 'Amount is required and must be a number').isNumeric(),
      check('month', 'Month is required').not().isEmpty(),
      check('category_id', 'Category ID is required').not().isEmpty()
    ]
  ],
  budgetController.updateBudget
);

// @route   DELETE api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, budgetController.deleteBudget);

export default router;
