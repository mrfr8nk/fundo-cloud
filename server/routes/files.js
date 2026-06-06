import { Router } from 'express';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import File from '../models/File.js';
import UsageLog from '../models/UsageLog.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function getR2Client() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) return null;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
}

// GET /api/files
router.get('/', async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(500).lean();
    res.json(files.map(f => ({
      id: f._id, name: f.name, r2_key: f.r2Key, size_bytes: f.sizeBytes,
      mime_type: f.mimeType, visibility: f.visibility, favorite: f.favorite,
      folder: f.folder, short_slug: f.shortSlug, tags: f.tags, created_at: f.createdAt,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/files/presign  — get a presigned PUT URL for R2 upload
router.post('/presign', async (req, res) => {
  try {
    const r2 = getR2Client();
    if (!r2) return res.status(503).json({ error: 'R2 storage not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET in Secrets.' });

    const { filename, mime, size } = req.body;
    if (!filename || !size) return res.status(400).json({ error: 'filename and size required' });

    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const r2Key = `uploads/${req.user._id}/${crypto.randomUUID()}${ext}`;

    // Create a placeholder file record
    const file = await File.create({
      userId: req.user._id,
      name: filename,
      r2Key,
      sizeBytes: size,
      mimeType: mime || 'application/octet-stream',
      visibility: 'public',
    });

    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: r2Key,
      ContentType: mime || 'application/octet-stream',
      ContentLength: size,
    });

    const url = await getSignedUrl(r2, cmd, { expiresIn: 900 });
    res.json({ url, fileId: file._id, r2Key });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/files/confirm — mark upload complete
router.post('/confirm', async (req, res) => {
  try {
    const { fileId } = req.body;
    const file = await File.findOneAndUpdate(
      { _id: fileId, userId: req.user._id },
      {},
      { new: true }
    );
    if (!file) return res.status(404).json({ error: 'File not found' });
    await UsageLog.create({ userId: req.user._id, action: 'upload', bytes: file.sizeBytes, fileId: file._id });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/files/:id
router.patch('/:id', async (req, res) => {
  try {
    const { name, folder, visibility, favorite } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (folder !== undefined) update.folder = folder;
    if (visibility !== undefined) update.visibility = visibility;
    if (favorite !== undefined) update.favorite = favorite;

    const file = await File.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, update, { new: true });
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/files/:id
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });
    if (!file) return res.status(404).json({ error: 'File not found' });

    // Delete from R2 if configured
    const r2 = getR2Client();
    if (r2 && process.env.R2_BUCKET) {
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: file.r2Key }));
      } catch (e) { console.warn('R2 delete warn:', e.message); }
    }

    await file.deleteOne();
    await UsageLog.create({ userId: req.user._id, action: 'delete', fileId: file._id });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
