// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Trader Controller
// Handles transport leg recording, delivery confirmation, and batch listing
// for traders.
// ─────────────────────────────────────────────────────────────────────────────

import { body, validationResult } from 'express-validator';
import { query } from '../models/db.js';
import { recordCustodyEvent } from '../services/custodyService.js';

// ── Validation chains ───────────────────────────────────────────────────────

/** Validators for POST /api/trader/transport */
export const transportValidation = [
  body('batchId').trim().notEmpty().withMessage('Batch ID is required.'),
  body('transportDocHash').optional().trim(),
  body('location').optional().trim(),
  body('notes').optional().trim(),
];

/** Validators for POST /api/trader/deliver */
export const deliverValidation = [
  body('batchId').trim().notEmpty().withMessage('Batch ID is required.'),
  body('location').optional().trim(),
];

// ── Handlers ────────────────────────────────────────────────────────────────

/**
 * Record a transport handoff for a batch.
 *
 * POST /api/trader/transport
 */
export async function transport(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { batchId, transportDocHash, location, notes } = req.body;

  const custodyResult = await recordCustodyEvent(req.user.userId, {
    batchId,
    eventType: 'transported',
    quantityKg: 0, // quantity unchanged during transport
    location: location ?? null,
    notes: [notes, transportDocHash ? `docHash:${transportDocHash}` : null]
      .filter(Boolean)
      .join(' | ') || null,
  });

  await query(
    `UPDATE product_batches SET status = 'in_transit' WHERE batch_id = ?`,
    [batchId],
  );

  res.json({ txHash: custodyResult.txHash, blockHash: custodyResult.blockHash });
}

/**
 * Mark a batch as delivered.
 *
 * POST /api/trader/deliver
 */
export async function deliver(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { batchId, location } = req.body;

  const custodyResult = await recordCustodyEvent(req.user.userId, {
    batchId,
    eventType: 'delivered',
    quantityKg: 0,
    location: location ?? null,
    notes: null,
  });

  await query(
    `UPDATE product_batches SET status = 'delivered' WHERE batch_id = ?`,
    [batchId],
  );

  res.json({ txHash: custodyResult.txHash, blockHash: custodyResult.blockHash });
}

/**
 * List batches relevant to this trader (dispatched or in_transit).
 *
 * GET /api/trader/batches
 */
export async function batches(req, res) {
  const rows = await query(
    `SELECT DISTINCT pb.*, p.permit_number, u.name AS harvester_name
     FROM product_batches pb
     JOIN permits p ON pb.permit_id = p.id
     JOIN users u ON pb.harvester_id = u.id
     WHERE pb.status IN ('at_depot', 'dispatched', 'in_transit', 'delivered')
     ORDER BY pb.created_at DESC`,
  );

  res.json({ batches: rows });
}

// ✓ FILE COMPLETE: controllers/traderController.js
