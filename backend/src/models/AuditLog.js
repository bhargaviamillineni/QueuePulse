import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    tokenNumber: Number,
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
