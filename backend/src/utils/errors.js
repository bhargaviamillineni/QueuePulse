import logger from './logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Unexpected server error';

  // Log the error
  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.path}] ${statusCode} - ${message}`, {
      stack: error.stack,
      requestId: req.headers['x-request-id'],
      ip: req.ip
    });
  } else {
    logger.warn(`[${req.method} ${req.path}] ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}
