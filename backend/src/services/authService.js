import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { AppError } from '../utils/errors.js';
import { CONFIG } from '../config/constants.js';
import { getEnv } from '../config/env.js';

const JWT_EXPIRY = getEnv('JWT_EXPIRY');

function getJwtSecret() {
  return getEnv('JWT_SECRET');
}

export async function hashPassword(password) {
  return bcryptjs.hash(password, CONFIG.AUTH.bcryptRounds);
}

export async function comparePassword(password, hash) {
  return bcryptjs.compare(password, hash);
}

export function generateToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}

export function extractToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid authorization header', 401);
  }
  return authHeader.substring(7);
}
