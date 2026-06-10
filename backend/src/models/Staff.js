import mongoose from 'mongoose';
import { hashPassword } from '../services/authService.js';

const staffSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['receptionist', 'doctor', 'admin'],
      default: 'receptionist',
      index: true
    },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

staffSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    this.passwordHash = await hashPassword(this.passwordHash);
    next();
  } catch (error) {
    next(error);
  }
});

staffSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('Staff', staffSchema);
