import dayjs from 'dayjs';
import Analytics from '../models/Analytics.js';
import Consultation from '../models/Consultation.js';
import Patient from '../models/Patient.js';
import { getAverageConsultationMinutes } from './predictionService.js';
import { CONFIG } from '../config/constants.js';

export function todayKey() {
  return dayjs().format('YYYY-MM-DD');
}

export async function calculateAnalytics() {
  const start = dayjs().startOf('day').toDate();
  const end = dayjs().endOf('day').toDate();
  const dateKey = todayKey();

  const [patientsServed, waitingPatients, oldestWaiting, averageConsultationMinutes] = await Promise.all([
    Consultation.countDocuments({ endedAt: { $gte: start, $lte: end } }),
    Patient.countDocuments({ status: 'waiting' }),
    Patient.findOne({ status: 'waiting' }).sort({ createdAt: 1 }).lean(),
    getAverageConsultationMinutes()
  ]);

  const longestWaitMinutes = oldestWaiting
    ? Math.max(0, dayjs().diff(dayjs(oldestWaiting.createdAt), 'minute'))
    : 0;

  let queueHealth = 'calm';
  if (
    waitingPatients >= CONFIG.QUEUE_HEALTH.critical.patients ||
    longestWaitMinutes >= CONFIG.QUEUE_HEALTH.critical.minutes
  ) {
    queueHealth = 'critical';
  } else if (
    waitingPatients >= CONFIG.QUEUE_HEALTH.busy.patients ||
    longestWaitMinutes >= CONFIG.QUEUE_HEALTH.busy.minutes
  ) {
    queueHealth = 'busy';
  } else if (
    waitingPatients >= CONFIG.QUEUE_HEALTH.steady.patients ||
    longestWaitMinutes >= CONFIG.QUEUE_HEALTH.steady.minutes
  ) {
    queueHealth = 'steady';
  }

  const waitPenalty = Math.min(
    CONFIG.EFFICIENCY.maxWaitPenalty,
    Math.floor(longestWaitMinutes / 2)
  );
  const queuePenalty = Math.min(CONFIG.EFFICIENCY.maxQueuePenalty, waitingPatients * 2);
  const speedBonus =
    averageConsultationMinutes <= CONFIG.EFFICIENCY.speedThreshold
      ? CONFIG.EFFICIENCY.speedBonus
      : 0;
  const efficiencyScore = Math.max(0, Math.min(100, 100 - waitPenalty - queuePenalty + speedBonus));

  return Analytics.findOneAndUpdate(
    { dateKey },
    { patientsServed, averageConsultationMinutes, longestWaitMinutes, queueHealth, efficiencyScore },
    { new: true, upsert: true }
  ).lean();
}
