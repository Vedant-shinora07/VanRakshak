// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Harvest Controller
// Handles harvest entry (online + offline), listing a harvester's batches,
// and triggering offline queue sync.
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { query } from '../models/db.js';
import { isPermitValid } from '../blockchain/index.js';
import { recordCustodyEvent } from '../services/custodyService.js';
import { generateQR } from '../services/qrService.js';
import { syncOfflineQueue } from '../services/syncService.js';

// ── Validation chains ───────────────────────────────────────────────────────

/** Validators for POST /api/harvest/entry */
export const entryValidation = [
  body('permitNumber').trim().notEmpty().withMessage('Permit number is required.'),
  body('productType')
    .isIn(['tendu_leaves', 'timber', 'bamboo', 'medicinal_herbs'])
    .withMessage('Invalid product type.'),
  body('quantityKg').isFloat({ gt: 0 }).withMessage('Quantity must be > 0 kg.'),
  body('gpsLat').optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }),
  body('gpsLng').optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }),
  body('harvestDate').isISO8601().withMessage('Valid harvest date required (YYYY-MM-DD).'),
  body('isOffline').optional({ checkFalsy: true }).isBoolean(),
];

// ── Handlers ────────────────────────────────────────────────────────────────

/**
 * Submit a new harvest entry.
 *
 * If `isOffline === true`, the entry is stored in the offline_queue for later
 * sync instead of being processed immediately.
 *
 * POST /api/harvest/entry
 */
export async function createEntry(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.userId;
  const {
    permitNumber,
    productType,
    quantityKg,
    gpsLat,
    gpsLng,
    harvestDate,
    isOffline = false,
  } = req.body;

  // ── Permit check ────────────────────────────────────────────────────────
  const validPermit = await isPermitValid(permitNumber);
  if (!validPermit) {
    return res.status(400).json({ error: 'Permit is invalid or expired.' });
  }

  // ── Offline mode: queue and return ──────────────────────────────────────
  if (isOffline) {
    const localId = uuidv4();

    await query(
      `INSERT INTO offline_queue
         (id, user_id, operation_type, payload_json, status)
       VALUES (?, ?, 'harvest_entry', ?, 'pending')`,
      [localId, userId, JSON.stringify(req.body)],
    );

    return res.status(202).json({ queued: true, localId });
  }

  // ── Online mode: process immediately ───────────────────────────────────

  // Look up the permit row ID.
  const [permit] = await query(
    `SELECT id FROM permits WHERE permit_number = ?`,
    [permitNumber],
  );
  if (!permit) {
    return res.status(400).json({ error: 'Permit number not found in database.' });
  }

  // Create the batch.
  const batchId = uuidv4();
  const location = gpsLat && gpsLng ? `${gpsLat},${gpsLng}` : null;

  await query(
    `INSERT INTO product_batches
       (batch_id, permit_id, harvester_id, product_type, quantity_kg,
        gps_lat, gps_lng, harvest_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'harvested')`,
    [batchId, permit.id, userId, productType, quantityKg, gpsLat ?? null, gpsLng ?? null, harvestDate],
  );

  // Record the custody event on the chain.
  const custodyResult = await recordCustodyEvent(userId, {
    batchId,
    eventType: 'harvested',
    quantityKg,
    permitNumber,
    location,
    notes: null,
  });

  // Generate QR code hash.
  const qr = await generateQR(batchId, permitNumber);

  res.status(201).json({
    batchId,
    txHash: custodyResult.txHash,
    blockHash: custodyResult.blockHash,
    qrHash: qr.qrHash,
    publicUrl: qr.publicUrl,
  });
}

/**
 * List all batches for the authenticated harvester.
 *
 * GET /api/harvest/my-batches
 */
export async function myBatches(req, res) {
  const batches = await query(
    `SELECT pb.*, p.permit_number, p.block_name, u.name AS harvester_name
     FROM product_batches pb
     JOIN permits p ON pb.permit_id = p.id
     JOIN users u ON pb.harvester_id = u.id
     WHERE pb.harvester_id = ?
     ORDER BY pb.created_at DESC`,
    [req.user.userId],
  );

  res.json({ batches });
}

/**
 * Trigger offline queue sync for the authenticated user.
 *
 * POST /api/harvest/sync
 */
export async function sync(req, res) {
  const result = await syncOfflineQueue(req.user.userId);
  res.json(result);
}

// ✓ FILE COMPLETE: controllers/harvestController.js
