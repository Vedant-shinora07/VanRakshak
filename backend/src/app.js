// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Express Application Entry Point
// ─────────────────────────────────────────────────────────────────────────────

import 'express-async-errors';   // patches Express to forward async errors
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// ── Route modules ────────────────────────────────────────────────────────────
import authRoutes    from './routes/authRoutes.js';
import harvestRoutes from './routes/harvestRoutes.js';
import depotRoutes   from './routes/depotRoutes.js';
import traderRoutes  from './routes/traderRoutes.js';
import publicRoutes  from './routes/publicRoutes.js';
import adminRoutes   from './routes/adminRoutes.js';

const app = express();

// ── Global middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/harvest', harvestRoutes);
app.use('/api/depot',   depotRoutes);
app.use('/api/trader',  traderRoutes);
app.use('/api/public',  publicRoutes);
app.use('/api/admin',   adminRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('🔥 Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌲 VanRakshak backend running on port ${PORT}`);
});

export default app;

// ✓ FILE COMPLETE: app.js
