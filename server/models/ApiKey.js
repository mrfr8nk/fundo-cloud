import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  keyPrefix: { type: String, required: true },
  keyHash: { type: String, required: true },
  revokedAt: { type: Date, default: null },
  lastUsedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('ApiKey', apiKeySchema);
