// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Trader Routes
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import {
  transport, transportValidation,
  deliver, deliverValidation,
  batches,
} from '../controllers/traderController.js';

const router = Router();

router.post('/transport', authMiddleware, requireRole('trader'), transportValidation, transport);
router.post('/deliver', authMiddleware, requireRole('trader'), deliverValidation, deliver);
router.get('/batches', authMiddleware, requireRole('trader'), batches);

export default router;

// ✓ FILE COMPLETE: routes/traderRoutes.js
