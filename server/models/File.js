import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  r2Key: { type: String, required: true },
  sizeBytes: { type: Number, default: 0 },
  mimeType: { type: String, default: 'application/octet-stream' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  favorite: { type: Boolean, default: false },
  folder: { type: String, default: '/' },
  shortSlug: { type: String, default: () => nanoid(8), unique: true },
  tags: { type: [String], default: [] },
  downloadCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('File', fileSchema);
