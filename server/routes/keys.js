import { Router } from 'express';
import crypto from 'crypto';
import ApiKey from '../models/ApiKey.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/keys
router.get('/', async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(keys.map(k => ({
      id: k._id, name: k.name, key_prefix: k.keyPrefix,
      last_used_at: k.lastUsedAt, revoked_at: k.revokedAt, created_at: k.createdAt,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/keys — generate a new key
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name required' });

    const raw = 'fundo_live_' + crypto.randomBytes(24).toString('hex');
    const keyHash = crypto.createHash('sha256').update(raw).digest('hex');
    const keyPrefix = raw.slice(0, 20);

    const key = await ApiKey.create({ userId: req.user._id, name, keyPrefix, keyHash });
    res.json({
      key: raw, // shown once only
      id: key._id, name: key.name, key_prefix: keyPrefix,
      created_at: key.createdAt,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/keys/:id — revoke
router.delete('/:id', async (req, res) => {
  try {
    const key = await ApiKey.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { revokedAt: new Date() },
      { new: true }
    );
    if (!key) return res.status(404).json({ error: 'Key not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
