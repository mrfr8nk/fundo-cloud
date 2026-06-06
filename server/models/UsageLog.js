import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, enum: ['upload', 'download', 'delete', 'api_upload', 'api_files'], required: true },
  bytes: { type: Number, default: 0 },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
  apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', default: null },
}, { timestamps: true });

export default mongoose.model('UsageLog', usageLogSchema);
