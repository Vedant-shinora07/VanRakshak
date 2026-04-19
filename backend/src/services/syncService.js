// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Offline Sync Service
// Processes queued harvest entries that were created offline on the mobile
// client and stored in the offline_queue table.
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { query } from '../models/db.js';
import { isPermitValid } from '../blockchain/index.js';
import { recordCustodyEvent } from './custodyService.js';
import { generateQR } from './qrService.js';

/**
 * Process all pending offline queue entries for a given user.
 *
 * For each pending entry:
 *   - Parses the stored JSON payload.
 *   - Replays the original operation (currently only "harvest_entry" is supported).
 *   - Marks the queue entry as 'synced' on success or increments `retry_count`
 *     (and sets 'failed' after 3 attempts) on failure.
 *
 * @param {number} userId - The user whose queue should be drained.
 * @returns {Promise<{synced: number, failed: number, pending: number}>}
 */
export async function syncOfflineQueue(userId) {
  const entries = await query(
    `SELECT * FROM offline_queue
     WHERE user_id = ? AND status = 'pending'
     ORDER BY created_at ASC`,
    [userId],
  );

  let synced = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      const payload =
        typeof entry.payload_json === 'string'
          ? JSON.parse(entry.payload_json)
          : entry.payload_json;

      if (entry.operation_type === 'harvest_entry') {
        await replayHarvestEntry(userId, payload);
      } else {
        throw new Error(`Unknown operation_type: ${entry.operation_type}`);
      }

      // Mark as synced.
      await query(
        `UPDATE offline_queue SET status = 'synced', synced_at = NOW() WHERE id = ?`,
        [entry.id],
      );
      synced++;
    } catch (err) {
      const newRetryCount = (entry.retry_count || 0) + 1;
      const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';

      await query(
        `UPDATE offline_queue SET retry_count = ?, status = ?, error_message = ? WHERE id = ?`,
        [newRetryCount, newStatus, err.message, entry.id],
      );

      if (newStatus === 'failed') failed++;
    }
  }

  // Count remaining pending entries.
  const [pendingRow] = await query(
    `SELECT COUNT(*) AS total FROM offline_queue
     WHERE user_id = ? AND status = 'pending'`,
    [userId],
  );

  return {
    synced,
    failed,
    pending: Number(pendingRow.total),
  };
}

/**
 * Replay a single harvest_entry that was queued offline.
 *
 * Follows the same logic as the online harvest POST handler:
 * validate permit → create product_batches row → record custody event → generate QR.
 *
 * @param {number} userId  - Harvester user ID.
 * @param {Object} payload - The original request body that was captured offline.
 * @throws {Error} If the permit is invalid or the DB write fails.
 */
async function replayHarvestEntry(userId, payload) {
  const { permitNumber, productType, quantityKg, gpsLat, gpsLng, harvestDate } = payload;

  // Validate the permit.
  const validPermit = await isPermitValid(permitNumber);
  if (!validPermit) {
    throw new Error(`Permit ${permitNumber} is not valid or has expired.`);
  }

  // Look up the permit ID.
  const [permit] = await query(
    `SELECT id FROM permits WHERE permit_number = ?`,
    [permitNumber],
  );
  if (!permit) {
    throw new Error(`Permit ${permitNumber} not found in database.`);
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

  // Record the custody event.
  await recordCustodyEvent(userId, {
    batchId,
    eventType: 'harvested',
    quantityKg,
    permitNumber,
    location,
    notes: 'Synced from offline queue',
  });

  // Generate QR.
  await generateQR(batchId, permitNumber);
}

// ✓ FILE COMPLETE: services/syncService.js
