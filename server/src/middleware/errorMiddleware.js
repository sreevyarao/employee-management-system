import { sendResponse } from '../utils/apiResponse.js';

// Not Found Middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized Error Middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ${err.path || 'ObjectId'} value`;
  }

  // Handle Mongoose Duplicate Key Error
  // Special case: active assignment uniqueness = 409 Conflict
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    if (field === 'employee') {
      // Partial index on active assignments fired — this is the race-condition guard
      statusCode = 409;
      message = 'This employee already has an active project assignment';
    } else {
      statusCode = 400;
      message = `Duplicate value entered for ${field}. Must be unique`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  return sendResponse(res, statusCode, false, message);
};
