import { verifyToken, extractToken } from '../services/authService.js';
import Staff from '../models/Staff.js';
import { AppError } from './errors.js';

export function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req.headers.authorization);
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles) {
  return (_req, _res, next) => {
    if (!_req.user) {
      return next(new AppError('User not authenticated', 401));
    }
    if (!roles.includes(_req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}

export async function requireAdminUnlessFirstStaff(req, _res, next) {
  try {
    const staffCount = await Staff.estimatedDocumentCount();
    if (staffCount === 0) {
      return next();
    }

    requireAuth(req, _res, (authError) => {
      if (authError) {
        return next(authError);
      }

      return requireRole('admin')(req, _res, next);
    });
  } catch (error) {
    next(error);
  }
}
