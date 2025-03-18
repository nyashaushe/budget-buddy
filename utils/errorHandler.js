/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handling middleware for express
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error:', {
    name: err.name,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Handle database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      status: 'error',
      msg: 'Database connection error. Please try again later.',
      code: err.code
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      msg: 'Validation failed',
      details: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      msg: 'Authentication failed',
      details: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token'
    });
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      msg: 'File upload failed',
      details: err.message
    });
  }

  // Handle API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      msg: err.message,
      details: err.details
    });
  }

  // Handle syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      msg: 'Invalid JSON',
      details: 'The request body contains invalid JSON'
    });
  }

  // For other errors, return 500 with a generic message
  res.status(500).json({
    status: 'error',
    msg: 'Server error. Please try again later.',
    code: process.env.NODE_ENV === 'development' ? err.code : undefined
  });
};

/**
 * Async error handler wrapper
 */
export const catchAsync = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found error handler
 */
export const notFound = (req, res) => {
  res.status(404).json({
    status: 'error',
    msg: 'Resource not found',
    path: req.originalUrl
  });
};
