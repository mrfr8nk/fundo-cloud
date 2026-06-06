import { Router } from 'express';
import UsageLog from '../models/UsageLog.js';
import File from '../models/File.js';
import ApiKey from '../models/ApiKey.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const logs = await UsageLog.find({ userId: req.user._id, createdAt: { $gte: since } }).lean();

    const dayMap = new Map();
    const actMap = new Map();
    for (const log of logs) {
      const day = new Date(log.createdAt).toISOString().slice(0, 10);
      const cur = dayMap.get(day) ?? { requests: 0, bytes: 0 };
      cur.requests++; cur.bytes += Number(log.bytes || 0);
      dayMap.set(day, cur);
      actMap.set(log.action, (actMap.get(log.action) ?? 0) + 1);
    }

    const byDay = Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, v]) => ({ day: day.slice(5), ...v }));
    const byAction = Array.from(actMap.entries()).map(([action, count]) => ({ action, count }));

    res.json({ byDay, byAction });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const uid = req.user._id;
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const [files, keys, requests] = await Promise.all([
      File.find({ userId: uid }).select('sizeBytes').lean(),
      ApiKey.countDocuments({ userId: uid, revokedAt: null }),
      UsageLog.countDocuments({ userId: uid, createdAt: { $gte: since } }),
    ]);
    const storage = files.reduce((s, f) => s + (f.sizeBytes || 0), 0);
    res.json({
      files: files.length, storage, keys, requests,
      quota: req.user.storageLimitBytes,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
