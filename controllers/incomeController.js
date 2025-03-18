import { validationResult } from 'express-validator';
import * as Income from '../models/Income.js';
import { ApiError } from '../utils/errorHandler.js';
import { catchAsync } from '../utils/errorHandler.js';

// Get all income for a user
const getIncome = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const income = await Income.findAllByUser(req.user.id);
  res.json({
    status: 'success',
    data: income
  });
});

// Add new income
const addIncome = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const newIncome = await Income.create(req.user.id, req.body);
  res.status(201).json({
    status: 'success',
    data: newIncome
  });
});

// Update income
const updateIncome = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const updatedIncome = await Income.update(
    req.params.id,
    req.user.id,
    req.body
  );
  res.json({
    status: 'success',
    data: updatedIncome
  });
});

// Delete income
const deleteIncome = catchAsync(async (req, res) => {
  const result = await Income.delete(req.params.id, req.user.id);
  res.json({
    status: 'success',
    data: result
  });
});

export {
  getIncome,
  addIncome,
  updateIncome,
  deleteIncome
};
