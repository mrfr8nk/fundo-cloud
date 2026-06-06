import { Router } from 'express';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import User from '../models/User.js';
import File from '../models/File.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

function getR2Client() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) return null;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
}

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(users.map(u => ({ id: u._id, email: u.email, role: u.role, displayName: u.displayName, created_at: u.createdAt })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/files
router.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(files.map(f => ({
      id: f._id, name: f.name, size_bytes: f.sizeBytes,
      visibility: f.visibility, user_id: f.userId, created_at: f.createdAt,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/files/:id
router.delete('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const r2 = getR2Client();
    if (r2 && process.env.R2_BUCKET) {
      try { await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: file.r2Key })); }
      catch (e) { console.warn('R2 delete warn:', e.message); }
    }
    await file.deleteOne();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
