import express from 'express';
const router = express.Router();
import { check } from 'express-validator';
import auth from '../middleware/auth.js';
import * as expenseController from '../controllers/expenseController.js';

// @route   GET api/expenses
// @desc    Get all expenses for current user
// @access  Private
router.get('/', auth, expenseController.getAllExpenses);

// @route   GET api/expenses/summary
// @desc    Get expense summary by category
// @access  Private
router.get('/summary', auth, expenseController.getExpenseSummary);

// @route   GET api/expenses/:id
// @desc    Get expense by ID
// @access  Private
router.get('/:id', auth, expenseController.getExpenseById);

// @route   POST api/expenses
// @desc    Create a new expense
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('amount', 'Amount is required and must be a number').isNumeric(),
      check('description', 'Description is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('category_id', 'Category ID is required').not().isEmpty()
    ]
  ],
  expenseController.createExpense
);

// @route   PUT api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('amount', 'Amount is required and must be a number').isNumeric(),
      check('description', 'Description is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('category_id', 'Category ID is required').not().isEmpty()
    ]
  ],
  expenseController.updateExpense
);

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, expenseController.deleteExpense);

export default router;
