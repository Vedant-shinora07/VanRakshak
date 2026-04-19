// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Admin Routes
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import {
  createPermit, permitValidation,
  listUsers,
  listFlags,
  audit,
} from '../controllers/adminController.js';

const router = Router();

router.post('/permits', authMiddleware, requireRole('admin'), permitValidation, createPermit);
router.get('/users', authMiddleware, requireRole('admin'), listUsers);
router.get('/flags', authMiddleware, requireRole('admin'), listFlags);
router.get('/audit', authMiddleware, requireRole('admin'), audit);

export default router;

// ✓ FILE COMPLETE: routes/adminRoutes.js
