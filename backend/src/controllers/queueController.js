import dayjs from 'dayjs';
import Consultation from '../models/Consultation.js';
import Patient from '../models/Patient.js';
import { broadcastQueueUpdate } from '../sockets/index.js';
import { writeAudit } from '../services/auditService.js';
import { calculateAnalytics } from '../services/analyticsService.js';
import { buildQueueState } from '../services/queueService.js';
import { nextTokenNumber } from '../services/tokenService.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function createPatient(req, res) {
  const input = req.validatedBody;
  const tokenNumber = await nextTokenNumber();
  const patient = await Patient.create({
    ...input,
    tokenNumber,
    status: 'waiting',
    source: 'reception',
    approvedAt: new Date(),
    approvedBy: req.user?.id
  });

  await writeAudit({
    action: input.emergency ? 'emergency_patient_added' : 'patient_added',
    patient: patient._id,
    tokenNumber,
    message: `${input.emergency ? 'Emergency' : 'Standard'} token ${tokenNumber} added by ${req.user?.name || 'reception'}`,
    metadata: { staffId: req.user?.id, staffName: req.user?.name }
  });

  logger.info(`Patient added: Token #${tokenNumber}, Emergency: ${input.emergency}`);
  await broadcastQueueUpdate();

  res.status(201).json(patient);
}

export async function selfRegister(req, res) {
  const input = req.validatedBody;
  const tokenNumber = await nextTokenNumber();
  const patient = await Patient.create({
    ...input,
    tokenNumber,
    status: 'pending_approval',
    source: 'qr'
  });

  await writeAudit({
    action: 'self_registration_submitted',
    patient: patient._id,
    tokenNumber,
    message: `QR registration submitted for token ${tokenNumber}`
  });

  logger.info(`Self-registration submitted: Token #${tokenNumber}`);
  await broadcastQueueUpdate();

  res.status(201).json(patient);
}

export async function approveRegistration(req, res) {
  const patient = await Patient.findById(req.params.id);
  if (!patient || patient.status !== 'pending_approval') {
    throw new AppError('Pending registration not found', 404);
  }

  patient.status = 'waiting';
  patient.approvedAt = new Date();
  patient.approvedBy = req.user?.id;
  await patient.save();

  await writeAudit({
    action: patient.emergency ? 'emergency_registration_approved' : 'registration_approved',
    patient: patient._id,
    tokenNumber: patient.tokenNumber,
    message: `QR registration approved for token ${patient.tokenNumber} by ${req.user?.name || 'reception'}`,
    metadata: { staffId: req.user?.id, staffName: req.user?.name }
  });

  logger.info(`Registration approved: Token #${patient.tokenNumber}`);
  await broadcastQueueUpdate();

  res.json(patient);
}

export async function getPendingRegistrations(_req, res) {
  const pending = await Patient.find({ status: 'pending_approval' }).sort({ createdAt: 1 }).lean();
  res.json(pending);
}

export async function getQueue(_req, res) {
  res.json(await buildQueueState());
}

export async function callNext(_req, res) {
  const active = await Patient.findOne({ status: 'serving' });
  if (active) {
    throw new AppError(`Token ${active.tokenNumber} is already being served`, 409);
  }

  const nextPatient = await Patient.findOneAndUpdate(
    { 
      status: 'waiting',
      lockedBy: null
    },
    {
      status: 'serving',
      calledAt: new Date(),
      calledBy: _req.user?.id,
      lockedBy: _req.user?.id
    },
    { 
      sort: { emergency: -1, createdAt: 1 },
      new: true
    }
  );

  if (!nextPatient) {
    throw new AppError('No waiting patients in queue', 404);
  }

  await writeAudit({
    action: 'token_called',
    patient: nextPatient._id,
    tokenNumber: nextPatient.tokenNumber,
    message: `Token ${nextPatient.tokenNumber} called by ${_req.user?.name || 'staff'}`,
    metadata: { staffId: _req.user?.id, staffName: _req.user?.name }
  });

  logger.info(`Token called: #${nextPatient.tokenNumber} by ${_req.user?.name}`);
  await broadcastQueueUpdate();

  res.json(nextPatient);
}

export async function completeConsultation(req, res) {
  const consultationMinutes = req.validatedBody?.consultationMinutes;
  
  const active = await Patient.findOne({ status: 'serving' }).sort({ calledAt: -1 });
  if (!active) {
    throw new AppError('No active consultation to complete', 404);
  }

  const manualMinutes = consultationMinutes ? Number(consultationMinutes) : null;
  const startedAt = active.calledAt || new Date();
  const actualMinutes = Math.max(1, dayjs().diff(dayjs(startedAt), 'minute'));
  const durationMinutes = manualMinutes && manualMinutes > 0 ? Math.round(manualMinutes) : actualMinutes;

  active.status = 'completed';
  active.completedAt = new Date();
  active.completedBy = req.user?.id;
  active.lockedBy = null;
  await active.save();

  const consultation = await Consultation.create({
    patient: active._id,
    tokenNumber: active.tokenNumber,
    startedAt,
    endedAt: active.completedAt,
    durationMinutes,
    manuallyAdjusted: Boolean(manualMinutes),
    completedBy: req.user?.id
  });

  await writeAudit({
    action: 'consultation_completed',
    patient: active._id,
    tokenNumber: active.tokenNumber,
    message: `Token ${active.tokenNumber} completed in ${durationMinutes} minutes by ${req.user?.name || 'staff'}`,
    metadata: { durationMinutes, manuallyAdjusted: Boolean(manualMinutes), staffId: req.user?.id, staffName: req.user?.name }
  });

  logger.info(`Consultation completed: Token #${active.tokenNumber}, Duration: ${durationMinutes}m`);
  await broadcastQueueUpdate();

  res.json({ patient: active, consultation });
}

export async function getAnalytics(_req, res) {
  res.json(await calculateAnalytics());
}
