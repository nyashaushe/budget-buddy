import express from 'express';
const router = express.Router();
import { check } from 'express-validator';
import auth from '../middleware/auth.js';
import * as goalController from '../controllers/goalController.js';

// @route   GET api/goals
// @desc    Get all goals for current user
// @access  Private
router.get('/', auth, goalController.getAllGoals);

// @route   GET api/goals/progress-summary
// @desc    Get goal progress summary
// @access  Private
router.get('/progress-summary', auth, goalController.getGoalProgressSummary);

// @route   GET api/goals/:id
// @desc    Get goal by ID
// @access  Private
router.get('/:id', auth, goalController.getGoalById);

// @route   POST api/goals
// @desc    Create a new goal
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('target_amount', 'Target amount is required and must be a number').isNumeric(),
      check('target_date', 'Target date is required').not().isEmpty()
    ]
  ],
  goalController.createGoal
);

// @route   PUT api/goals/:id
// @desc    Update a goal
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('target_amount', 'Target amount is required and must be a number').isNumeric(),
      check('target_date', 'Target date is required').not().isEmpty()
    ]
  ],
  goalController.updateGoal
);

// @route   DELETE api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete('/:id', auth, goalController.deleteGoal);

// @route   PATCH api/goals/:id/progress
// @desc    Update goal progress
// @access  Private
router.patch(
  '/:id/progress',
  [
    auth,
    [
      check('current_amount', 'Current amount is required and must be a number').isNumeric()
    ]
  ],
  goalController.updateGoalProgress
);

export default router;
