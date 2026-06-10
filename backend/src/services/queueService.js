import dayjs from 'dayjs';
import Patient from '../models/Patient.js';
import Consultation from '../models/Consultation.js';
import { getAverageConsultationMinutes, estimateWaitForPosition } from './predictionService.js';
import { CONFIG } from '../config/constants.js';

export async function buildQueueState() {
  const todayStart = dayjs().startOf('day').toDate();

  const [waiting, current, pendingApprovals, averageMinutes, patientsServedToday, consultationSampleSize] = await Promise.all([
    Patient.find({ status: 'waiting' }).sort({ emergency: -1, createdAt: 1 }).lean(),
    Patient.findOne({ status: 'serving' }).sort({ calledAt: -1 }).lean(),
    Patient.find({ status: 'pending_approval' }).sort({ createdAt: 1 }).lean(),
    getAverageConsultationMinutes(),
    // Real count of patients completed today
    Patient.countDocuments({ status: 'completed', completedAt: { $gte: todayStart } }),
    // How many real sessions the average is based on
    Consultation.countDocuments()
  ]);

  const waitingWithEta = waiting.map((patient, index) => ({
    ...patient,
    patientsAhead: index,
    // Real estimated wait: position × average from actual consultations
    estimatedWaitMinutes: estimateWaitForPosition(index + (current ? 1 : 0), averageMinutes),
    waitedMinutes: Math.max(0, dayjs().diff(dayjs(patient.createdAt), 'minute'))
  }));

  return {
    current,
    waiting: waitingWithEta,
    pendingApprovals,
    averageConsultationMinutes: averageMinutes,
    // consultationSampleSize: how many real sessions built this average (0 = using default)
    consultationSampleSize: Math.min(consultationSampleSize, CONFIG.CONSULTATION.historySize),
    // ISO timestamp of when current patient was called — enables live timer on both screens
    consultationStartedAt: current?.calledAt ? new Date(current.calledAt).toISOString() : null,
    // Real count from DB — not a counter variable
    patientsServedToday,
    generatedAt: new Date().toISOString()
  };
}

export function patientView(queueState, tokenNumber) {
  const token = Number(tokenNumber);
  const patient = queueState.waiting.find((item) => item.tokenNumber === token);
  const isCurrent = queueState.current?.tokenNumber === token;

  return {
    tokenNumber: token,
    patient,
    isCurrent,
    patientsAhead: isCurrent ? 0 : patient?.patientsAhead ?? null,
    estimatedWaitMinutes: isCurrent ? 0 : patient?.estimatedWaitMinutes ?? null
  };
}

