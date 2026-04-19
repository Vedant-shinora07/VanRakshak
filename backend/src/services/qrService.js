// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — QR Code Service
// Generates deterministic QR hashes for batches and resolves them back to
// full provenance data. The frontend can encode the publicUrl into an actual
// QR image using any client-side QR library.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { query } from '../models/db.js';
import { getFullProvenance } from './custodyService.js';

/**
 * Generate a unique QR hash for a batch and store it on the product_batches row.
 *
 * The hash is: sha256(batchId + permitNumber + Date.now())
 *
 * @param {string} batchId       - Batch identifier.
 * @param {string} permitNumber  - Permit number tied to this batch.
 * @returns {Promise<{qrHash: string, publicUrl: string}>}
 */
export async function generateQR(batchId, permitNumber) {
  const qrHash = crypto
    .createHash('sha256')
    .update(batchId + permitNumber + Date.now())
    .digest('hex');

  await query(
    `UPDATE product_batches SET qr_code_hash = ? WHERE batch_id = ?`,
    [qrHash, batchId],
  );

  return {
    qrHash,
    publicUrl: `/api/public/qr/${qrHash}`,
  };
}

/**
 * Resolve a QR hash to the full provenance of the corresponding batch.
 *
 * @param {string} qrHash - The hash that was encoded in the QR code.
 * @returns {Promise<{batch: Object, events: Array<Object>}>}
 * @throws {{ status: 404, message: string }} If the QR hash is not found.
 */
export async function resolveQR(qrHash) {
  const [row] = await query(
    `SELECT batch_id FROM product_batches WHERE qr_code_hash = ?`,
    [qrHash],
  );

  if (!row) {
    const err = new Error('QR code not found');
    err.status = 404;
    throw err;
  }

  return getFullProvenance(row.batch_id);
}

// ✓ FILE COMPLETE: services/qrService.js
