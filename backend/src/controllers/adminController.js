// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Admin Controller
// Permit management, user listing, flag review, and permit-based auditing.
// ─────────────────────────────────────────────────────────────────────────────

import { body, validationResult } from 'express-validator';
import { query } from '../models/db.js';
import { registerPermit } from '../blockchain/index.js';

/** Validators for POST /api/admin/permits */
export const permitValidation = [
  body('permitNumber').trim().notEmpty().withMessage('Permit number required.'),
  body('blockName').trim().notEmpty().withMessage('Block name required.'),
  body('issuedToUserId').isInt({ gt: 0 }).withMessage('Valid user ID required.'),
  body('productType')
    .isIn(['tendu_leaves', 'timber', 'bamboo', 'medicinal_herbs'])
    .withMessage('Invalid product type.'),
  body('licensedQuantityKg').isFloat({ gt: 0 }).withMessage('Quantity must be > 0.'),
  body('issueDate').isISO8601().withMessage('Valid issue date required.'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date required.'),
];

/**
 * POST /api/admin/permits — Register a new permit.
 */
export async function createPermit(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const result = await registerPermit(req.body);
  res.status(201).json(result);
}

/**
 * GET /api/admin/users — List all users.
 */
export async function listUsers(req, res) {
  const users = await query(
    `SELECT id, phone, role, name, language, created_at FROM users ORDER BY id ASC`,
  );
  res.json({ users });
}

/**
 * GET /api/admin/flags — List all volume-anomaly flags.
 */
export async function listFlags(req, res) {
  const rows = await query(
    `SELECT vf.*, pb.product_type, u.name AS flagged_by_name
     FROM volume_flags vf
     JOIN product_batches pb ON vf.batch_id = pb.batch_id
     JOIN users u ON vf.flagged_by_user_id = u.id
     ORDER BY vf.created_at DESC`,
  );
  res.json({ flags: rows });
}

/**
 * GET /api/admin/audit?permitNumber=... — Audit batches for a permit.
 */
export async function audit(req, res) {
  const permitNumber = req.query.permitNumber?.trim();
  if (!permitNumber) {
    return res.status(400).json({ error: 'permitNumber query param required.' });
  }
  const { verifyBatchesForPermit } = await import('../blockchain/index.js');
  const result = await verifyBatchesForPermit(permitNumber);
  res.json(result);
}

// ✓ FILE COMPLETE: controllers/adminController.js
