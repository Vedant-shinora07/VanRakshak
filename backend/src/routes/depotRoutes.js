// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Depot Routes
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import {
  receive, receiveValidation,
  dispatch, dispatchValidation,
  flags,
} from '../controllers/depotController.js';

const router = Router();

router.post('/receive', authMiddleware, requireRole('depot_manager'), receiveValidation, receive);
router.post('/dispatch', authMiddleware, requireRole('depot_manager'), dispatchValidation, dispatch);
router.get('/flags', authMiddleware, requireRole('depot_manager', 'admin'), flags);

export default router;

// ✓ FILE COMPLETE: routes/depotRoutes.js
