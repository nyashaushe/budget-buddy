import express from 'express';
const router = express.Router();
import { check } from 'express-validator';
import auth from '../middleware/auth.js';
import * as incomeController from '../controllers/incomeController.js';

// @route   GET api/income
// @desc    Get all income for a user
// @access  Private
router.get('/', auth, incomeController.getIncome);

// @route   POST api/income
// @desc    Add a new income source
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('source', 'Income source is required').not().isEmpty(),
      check('amount', 'Amount is required and must be a number').isNumeric(),
      check('frequency', 'Frequency is required').not().isEmpty()
    ]
  ],
  incomeController.addIncome
);

// @route   PUT api/income/:id
// @desc    Update an income source
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('source', 'Income source is required').not().isEmpty(),
      check('amount', 'Amount is required and must be a number').isNumeric()
    ]
  ],
  incomeController.updateIncome
);

// @route   DELETE api/income/:id
// @desc    Delete an income source
// @access  Private
router.delete('/:id', auth, incomeController.deleteIncome);

export default router;
