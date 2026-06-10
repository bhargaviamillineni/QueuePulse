import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true, index: true },
    patientsServed: { type: Number, default: 0 },
    averageConsultationMinutes: { type: Number, default: 0 },
    longestWaitMinutes: { type: Number, default: 0 },
    queueHealth: { type: String, enum: ['calm', 'steady', 'busy', 'critical'], default: 'calm' },
    efficiencyScore: { type: Number, default: 100 }
  },
  { timestamps: true }
);

export default mongoose.model('Analytics', analyticsSchema);
