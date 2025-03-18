import express from 'express';
const router = express.Router();
import { check } from 'express-validator';
import * as categoryController from '../controllers/categoryController.js';

// @route   GET api/categories
// @desc    Get all categories for current user
// @access  Public
router.get('/', (req, res) => {
    categoryController.getAllCategories(req, res);
});

// @route   GET api/categories/with-totals
// @desc    Get categories with expense totals
// @access  Public
router.get('/with-totals', (req, res) => {
    categoryController.getCategoriesWithTotals(req, res);
});

// @route   GET api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', (req, res) => {
    categoryController.getCategoryById(req, res);
});

// @route   POST api/categories
// @desc    Create a new category
// @access  Public
router.post(
  '/',
  [
    [
      check('name', 'Name is required').not().isEmpty(),
      check('color', 'Color is required').not().isEmpty()
    ]
  ],
  (req, res) => {
    categoryController.createCategory(req, res);
  }
);

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Public
router.put(
  '/:id',
  [
    [
      check('name', 'Name is required').not().isEmpty(),
      check('color', 'Color is required').not().isEmpty()
    ]
  ],
  (req, res) => {
    categoryController.updateCategory(req, res);
  }
);

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Public
router.delete('/:id', (req, res) => {
    categoryController.deleteCategory(req, res);
});

import { pool } from '../config/db.js';

// @route   GET api/categories/health
// @desc    Check database health
// @access  Public
router.get('/health', async (req, res) => {
  try {
    console.log('Health check called');
    const result = await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', message: 'Database is healthy' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Health check failed', error: error.message });
  }
});

export default router;
