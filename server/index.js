import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import filesRoutes from './routes/files.js';
import keysRoutes from './routes/keys.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/keys', keysRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

async function start() {
  let retries = 5;
  while (retries > 0) {
    try {
      await connectDB();
      break;
    } catch (err) {
      retries--;
      console.error(`MongoDB connection failed (${retries} retries left):`, err.message);
      if (retries === 0) { process.exit(1); }
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, 'localhost', () => console.log(`API server on port ${PORT}`));
}

start();
