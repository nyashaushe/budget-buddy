import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: { message: 'No token, authorization denied', status: 401 } });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Token is not valid', status: 401 } });
  }
};

export default auth;
