// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Depot Controller
// Handles receiving batches at the depot, dispatching (with anomaly checks),
// and listing volume-anomaly flags.
// ─────────────────────────────────────────────────────────────────────────────

import { body, validationResult } from 'express-validator';
import { query } from '../models/db.js';
import { recordCustodyEvent } from '../services/custodyService.js';
import { checkAndFlagAnomaly } from '../services/volumeService.js';

// ── Validation chains ───────────────────────────────────────────────────────

/** Validators for POST /api/depot/receive */
export const receiveValidation = [
  body('batchId').trim().notEmpty().withMessage('Batch ID is required.'),
  body('quantityKg').isFloat({ gt: 0 }).withMessage('Quantity must be > 0 kg.'),
  body('location').optional().trim(),
];

/** Validators for POST /api/depot/dispatch */
export const dispatchValidation = [
  body('batchId').trim().notEmpty().withMessage('Batch ID is required.'),
  body('quantityKg').isFloat({ gt: 0 }).withMessage('Quantity must be > 0 kg.'),
  body('location').optional().trim(),
  body('force').optional().isBoolean(),
];

// ── Handlers ────────────────────────────────────────────────────────────────

/**
 * Receive a batch at the depot.
 *
 * POST /api/depot/receive
 */
export async function receive(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { batchId, quantityKg, location } = req.body;

  const custodyResult = await recordCustodyEvent(req.user.userId, {
    batchId,
    eventType: 'received',
    quantityKg,
    location: location ?? null,
    notes: null,
  });

  await query(
    `UPDATE product_batches SET status = 'at_depot' WHERE batch_id = ?`,
    [batchId],
  );

  res.json({ txHash: custodyResult.txHash, blockHash: custodyResult.blockHash });
}

/**
 * Dispatch a batch from the depot.
 *
 * Runs the volume-anomaly detector first. If an anomaly is detected:
 *   - Without `force: true` → returns 409 with the anomaly details.
 *   - With `force: true` → records an ANOMALY_FLAG event on the chain,
 *     then proceeds with the dispatch.
 *
 * POST /api/depot/dispatch
 */
export async function dispatch(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { batchId, quantityKg, location, force = false } = req.body;

  // ── Anomaly check ──────────────────────────────────────────────────────
  const anomaly = await checkAndFlagAnomaly(batchId, req.user.userId, quantityKg);

  if (anomaly.flagged && force !== true) {
    return res.status(409).json({
      error: 'Volume anomaly detected. Use force=true to override.',
      flagged: true,
      totalReceived: anomaly.totalReceived,
      totalDispatched: anomaly.totalDispatched,
    });
  }

  if (anomaly.flagged && force === true) {
    // Record the anomaly on the chain for immutable audit.
    await recordCustodyEvent(req.user.userId, {
      batchId,
      eventType: 'ANOMALY_FLAG',
      quantityKg,
      location: location ?? null,
      notes: `Force-dispatched despite anomaly. Received: ${anomaly.totalReceived}kg, dispatching total: ${anomaly.totalDispatched}kg.`,
    });
  }

  // ── Dispatch ───────────────────────────────────────────────────────────
  const custodyResult = await recordCustodyEvent(req.user.userId, {
    batchId,
    eventType: 'dispatched',
    quantityKg,
    location: location ?? null,
    notes: null,
  });

  await query(
    `UPDATE product_batches SET status = 'dispatched' WHERE batch_id = ?`,
    [batchId],
  );

  res.json({
    txHash: custodyResult.txHash,
    blockHash: custodyResult.blockHash,
    flagged: anomaly.flagged,
  });
}

/**
 * List volume-anomaly flags visible to this depot manager (or all flags for admin).
 *
 * GET /api/depot/flags
 */
export async function flags(req, res) {
  let rows;

  if (req.user.role === 'admin') {
    rows = await query(
      `SELECT vf.*, pb.product_type, pb.batch_id, u.name AS flagged_by_name
       FROM volume_flags vf
       JOIN product_batches pb ON vf.batch_id = pb.batch_id
       JOIN users u ON vf.flagged_by_user_id = u.id
       ORDER BY vf.created_at DESC`,
    );
  } else {
    rows = await query(
      `SELECT vf.*, pb.product_type, pb.batch_id, u.name AS flagged_by_name
       FROM volume_flags vf
       JOIN product_batches pb ON vf.batch_id = pb.batch_id
       JOIN users u ON vf.flagged_by_user_id = u.id
       WHERE vf.flagged_by_user_id = ?
       ORDER BY vf.created_at DESC`,
      [req.user.userId],
    );
  }

  res.json({ flags: rows });
}

// ✓ FILE COMPLETE: controllers/depotController.js
