// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Volume Anomaly Detection Service
// Compares dispatched quantities against received quantities for a batch.
// Flags over-dispatching as a potential volume anomaly (illegal extraction).
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../models/db.js';

/**
 * Check whether dispatching `newDispatchKg` from the depot would cause the
 * total dispatched quantity to exceed the total received quantity for a batch.
 *
 * If an anomaly is detected, a row is inserted into the `volume_flags` table
 * for audit and admin review.
 *
 * @param {string} batchId          - Batch identifier.
 * @param {number} depotManagerId   - ID of the depot manager attempting dispatch.
 * @param {number} newDispatchKg    - Kg about to be dispatched.
 * @returns {Promise<{flagged: boolean, totalReceived?: number, totalDispatched?: number}>}
 */
export async function checkAndFlagAnomaly(batchId, depotManagerId, newDispatchKg) {
  // 1. Total kg received at depot for this batch.
  const [receivedRow] = await query(
    `SELECT COALESCE(SUM(quantity_kg), 0) AS total
     FROM custody_events
     WHERE batch_id = ? AND event_type = 'received'`,
    [batchId],
  );
  const totalReceived = Number(receivedRow.total);

  // 2. Total kg already dispatched from depot for this batch.
  const [dispatchedRow] = await query(
    `SELECT COALESCE(SUM(quantity_kg), 0) AS total
     FROM custody_events
     WHERE batch_id = ? AND event_type = 'dispatched'`,
    [batchId],
  );
  const alreadyDispatched = Number(dispatchedRow.total);

  // 3. Would this new dispatch exceed what was received?
  const totalDispatched = alreadyDispatched + Number(newDispatchKg);

  if (totalDispatched > totalReceived) {
    // Insert a volume flag for audit trail.
    await query(
      `INSERT INTO volume_flags
         (batch_id, flagged_by_user_id, total_received_kg, total_dispatched_kg, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        batchId,
        depotManagerId,
        totalReceived,
        totalDispatched,
        `Anomaly: dispatching ${newDispatchKg}kg would exceed received ${totalReceived}kg (already dispatched ${alreadyDispatched}kg).`,
      ],
    );

    return { flagged: true, totalReceived, totalDispatched };
  }

  return { flagged: false };
}

// ✓ FILE COMPLETE: services/volumeService.js
