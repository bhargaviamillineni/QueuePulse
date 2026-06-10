import { Router } from 'express';
import {
  approveRegistration,
  callNext,
  completeConsultation,
  createPatient,
  getAnalytics,
  getPendingRegistrations,
  getQueue,
  selfRegister
} from '../controllers/queueController.js';
import { staffLogin, staffRegister, getCurrentStaff } from '../controllers/authController.js';
import { asyncHandler } from '../utils/errors.js';
import { requireAdminUnlessFirstStaff, requireAuth, requireRole } from '../utils/auth-middleware.js';
import {
  validateParams,
  validateRequest,
  patientValidationSchema,
  consultationMinutesSchema,
  staffLoginSchema,
  staffRegistrationSchema,
  mongoIdParamSchema
} from '../utils/validation.js';
import { patientRegistrationLimiter, authLimiter } from '../utils/rate-limiter.js';

const router = Router();

// Auth routes
router.post('/auth/register', authLimiter, validateRequest(staffRegistrationSchema), asyncHandler(requireAdminUnlessFirstStaff), asyncHandler(staffRegister));
router.post('/auth/login', authLimiter, validateRequest(staffLoginSchema), asyncHandler(staffLogin));
router.get('/auth/me', requireAuth, asyncHandler(getCurrentStaff));

// Queue management routes (protected)
router.post('/patient', requireAuth, requireRole('receptionist', 'admin'), validateRequest(patientValidationSchema), asyncHandler(createPatient));
router.get('/queue', asyncHandler(getQueue));
router.post('/call-next', requireAuth, requireRole('doctor', 'admin'), asyncHandler(callNext));
router.post('/complete-consultation', requireAuth, requireRole('doctor', 'admin'), validateRequest(consultationMinutesSchema), asyncHandler(completeConsultation));
router.get('/analytics', asyncHandler(getAnalytics));

// QR self-registration routes
router.post('/self-register', patientRegistrationLimiter, validateRequest(patientValidationSchema), asyncHandler(selfRegister));
router.get('/pending-registrations', requireAuth, requireRole('receptionist', 'admin'), asyncHandler(getPendingRegistrations));
router.post('/approve-registration/:id', requireAuth, requireRole('receptionist', 'admin'), validateParams(mongoIdParamSchema), asyncHandler(approveRegistration));

export default router;
