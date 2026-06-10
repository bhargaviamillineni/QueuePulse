import mongoose from 'mongoose';
import { CONFIG } from '../config/constants.js';

const patientSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, minlength: CONFIG.VALIDATION.name.min, maxlength: CONFIG.VALIDATION.name.max },
    phone: { type: String, trim: true, maxlength: CONFIG.VALIDATION.phone.max },
    age: { type: Number, min: CONFIG.VALIDATION.age.min, max: CONFIG.VALIDATION.age.max },
    reason: { type: String, trim: true, maxlength: CONFIG.VALIDATION.reason.max },
    emergency: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['pending_approval', 'waiting', 'serving', 'completed', 'cancelled'],
      default: 'waiting',
      index: true
    },
    source: { type: String, enum: ['reception', 'qr'], default: 'reception' },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    calledAt: Date,
    calledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null }
  },
  { timestamps: true }
);

patientSchema.index({ status: 1, emergency: -1, createdAt: 1 });

export default mongoose.model('Patient', patientSchema);
