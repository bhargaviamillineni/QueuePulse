import Consultation from '../models/Consultation.js';
import { CONFIG } from '../config/constants.js';

export async function getAverageConsultationMinutes() {
  const recent = await Consultation.find()
    .sort({ endedAt: -1 })
    .limit(CONFIG.CONSULTATION.historySize)
    .select('durationMinutes')
    .lean();

  if (!recent.length) {
    return CONFIG.AUTH.defaultExpiryMinutes;
  }

  const total = recent.reduce((sum, item) => sum + item.durationMinutes, 0);
  return Math.max(1, Math.round(total / recent.length));
}

export function estimateWaitForPosition(position, averageMinutes) {
  return Math.max(0, position * averageMinutes);
}
