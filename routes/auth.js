import express from 'express';
const router = express.Router();
import { check } from 'express-validator';
import auth from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.registerUser
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.loginUser
);

// @route   GET api/auth
// @desc    Get current user
// @access  Private
router.get('/', auth, authController.getCurrentUser);

export default router;
