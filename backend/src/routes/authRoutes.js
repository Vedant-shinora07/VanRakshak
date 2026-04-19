// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Auth Routes
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  register, registerValidation,
  login, loginValidation,
  me,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authMiddleware, me);

export default router;

// ✓ FILE COMPLETE: routes/authRoutes.js
