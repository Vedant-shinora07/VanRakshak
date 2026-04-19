// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Auth Controller
// Handles user registration, login (phone + PIN), and "me" profile fetch.
// ─────────────────────────────────────────────────────────────────────────────

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../models/db.js';

// ── Validation chains ───────────────────────────────────────────────────────

/** Validators for POST /api/auth/register */
export const registerValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone number required.'),
  body('pin').isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits.'),
  body('role')
    .isIn(['harvester', 'depot_manager', 'trader', 'end_buyer', 'admin'])
    .withMessage('Invalid role.'),
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('language').optional().isIn(['en', 'hi', 'gu']).withMessage('Unsupported language.'),
];

/** Validators for POST /api/auth/login */
export const loginValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone number required.'),
  body('pin').notEmpty().withMessage('PIN is required.'),
];

// ── Handlers ────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * Requires a `registrationCode` in the body to prevent open abuse.
 * In production this would be a proper invite system; for the hackathon
 * demo, the code is simply "VANRAKSHAK2026".
 *
 * POST /api/auth/register
 */
export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone, pin, role, name, language = 'en', registrationCode } = req.body;

  // Simple abuse prevention — not a security boundary.
  if (role === 'admin' && registrationCode !== 'VANRAKSHAK2026') {
    return res.status(403).json({ error: 'Invalid admin registration code.' });
  }

  // Check if the phone is already registered.
  const [existing] = await query(
    `SELECT id FROM users WHERE phone = ?`,
    [phone],
  );
  if (existing) {
    return res.status(409).json({ error: 'Phone number already registered.' });
  }

  // Hash the PIN.
  const pinHash = await bcrypt.hash(pin, 12);

  // Insert the user.
  const result = await query(
    `INSERT INTO users (phone, pin_hash, role, name, language) VALUES (?, ?, ?, ?, ?)`,
    [phone, pinHash, role, name, language],
  );

  res.status(201).json({
    userId: result.insertId,
    name,
    role,
  });
}

/**
 * Authenticate via phone + PIN and return a JWT.
 *
 * POST /api/auth/login
 */
export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone, pin } = req.body;

  const [user] = await query(
    `SELECT id, phone, pin_hash, role, name, language FROM users WHERE phone = ?`,
    [phone],
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid phone number or PIN.' });
  }

  const pinMatch = await bcrypt.compare(pin, user.pin_hash);
  if (!pinMatch) {
    return res.status(401).json({ error: 'Invalid phone number or PIN.' });
  }

  // Sign a JWT.
  const token = jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' },
  );

  res.json({
    token,
    user: {
      userId: user.id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      language: user.language,
    },
  });
}

/**
 * Return the currently authenticated user's profile.
 *
 * GET /api/auth/me
 */
export async function me(req, res) {
  const [user] = await query(
    `SELECT id, phone, role, name, language, created_at FROM users WHERE id = ?`,
    [req.user.userId],
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user });
}

// ✓ FILE COMPLETE: controllers/authController.js
