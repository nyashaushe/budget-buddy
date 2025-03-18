const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const billController = require('../controllers/billController');

// @route   GET api/bills
// @desc    Get all bills for a user
// @access  Private
router.get('/', auth, billController.getAllBills);

// @route   GET api/bills/upcoming
// @desc    Get upcoming bills
// @access  Private
router.get('/upcoming', auth, billController.getUpcomingBills);

// @route   GET api/bills/overdue
// @desc    Get overdue bills
// @access  Private
router.get('/overdue', auth, billController.getOverdueBills);

// @route   GET api/bills/month/:year/:month
// @desc    Get bills for a specific month
// @access  Private
router.get('/month/:year/:month', auth, billController.getBillsByMonth);

// @route   GET api/bills/:id
// @desc    Get a single bill
// @access  Private
router.get('/:id', auth, billController.getBillById);

// @route   POST api/bills
// @desc    Create a new bill
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('amount', 'Amount is required').isNumeric(),
      check('due_date', 'Due date is required').isInt({ min: 1, max: 31 })
    ]
  ],
  billController.createBill
);

// @route   PUT api/bills/:id
// @desc    Update a bill
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('amount', 'Amount is required').isNumeric(),
      check('due_date', 'Due date is required').isInt({ min: 1, max: 31 })
    ]
  ],
  billController.updateBill
);

// @route   PUT api/bills/:id/toggle-paid
// @desc    Toggle bill paid status
// @access  Private
router.put(
  '/:id/toggle-paid',
  [
    auth,
    [
      check('is_paid', 'Paid status is required').isBoolean()
    ]
  ],
  billController.toggleBillPaid
);

// @route   DELETE api/bills/:id
// @desc    Delete a bill
// @access  Private
router.delete('/:id', auth, billController.deleteBill);

module.exports = router; 