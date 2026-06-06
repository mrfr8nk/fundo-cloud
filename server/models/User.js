import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  storageLimitBytes: { type: Number, default: 5 * 1024 * 1024 * 1024 }, // 5 GB
  bandwidthLimitBytes: { type: Number, default: 50 * 1024 * 1024 * 1024 }, // 50 GB
}, { timestamps: true });

export default mongoose.model('User', userSchema);
