// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Harvest Routes
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import {
  createEntry, entryValidation,
  myBatches,
  sync,
} from '../controllers/harvestController.js';

const router = Router();

router.post('/entry', authMiddleware, requireRole('harvester'), entryValidation, createEntry);
router.get('/my-batches', authMiddleware, requireRole('harvester'), myBatches);
router.post('/sync', authMiddleware, sync);

export default router;

// ✓ FILE COMPLETE: routes/harvestRoutes.js
