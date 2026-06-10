import Staff from '../models/Staff.js';
import { comparePassword, generateToken } from '../services/authService.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function staffLogin(req, res) {
  const { email, password } = req.validatedBody;

  const staff = await Staff.findOne({ email, isActive: true });
  if (!staff) {
    logger.warn(`Login attempt with non-existent email: ${email}`);
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, staff.passwordHash);
  if (!isPasswordValid) {
    logger.warn(`Failed login attempt for staff: ${email}`);
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({
    id: staff._id,
    email: staff.email,
    name: staff.name,
    role: staff.role
  });

  logger.info(`Staff logged in: ${staff.email} (${staff.role})`);

  res.json({
    token,
    staff: staff.toPublic()
  });
}

export async function staffRegister(req, res) {
  const { email, password, name, role } = req.validatedBody;

  const existingStaff = await Staff.findOne({ email });
  if (existingStaff) {
    throw new AppError('Email already registered', 409);
  }

  const staff = await Staff.create({
    email,
    passwordHash: password,
    name,
    role
  });

  logger.info(`New staff registered: ${email} (${role})`);

  const token = generateToken({
    id: staff._id,
    email: staff.email,
    name: staff.name,
    role: staff.role
  });

  res.status(201).json({
    token,
    staff: staff.toPublic()
  });
}

export async function getCurrentStaff(req, res) {
  const staff = await Staff.findById(req.user.id).select('-passwordHash');
  if (!staff) {
    throw new AppError('Staff not found', 404);
  }
  res.json(staff);
}
