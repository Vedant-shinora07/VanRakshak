// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Custody Service
// Records custody handoff events on the simulated blockchain and retrieves
// full provenance chains for any batch.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { addBlock } from '../blockchain/index.js';
import { query } from '../models/db.js';

/**
 * Create a deterministic digital signature for a custody event.
 *
 * This replaces real wallet-based signing. The signature is:
 *   sha256(userId + ":" + batchId + ":" + eventType + ":" + timestamp + ":" + JWT_SECRET)
 *
 * @param {number}  userId    - Actor performing the event.
 * @param {string}  batchId   - Batch identifier.
 * @param {string}  eventType - Event type label.
 * @param {number}  timestamp - Unix-ms timestamp.
 * @returns {string} 64-char hex signature.
 */
function makeSignature(userId, batchId, eventType, timestamp) {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${batchId}:${eventType}:${timestamp}:${process.env.JWT_SECRET}`)
    .digest('hex');
}

/**
 * Record a custody handoff event.
 *
 * 1. Appends a new block to the batch's chain via the blockchain engine.
 * 2. Computes a digital signature (fake — no wallet needed).
 * 3. Stores the signature on the block row for audit purposes.
 *
 * @param {number} userId - ID of the user performing the action.
 * @param {Object} eventPayload
 * @param {string} eventPayload.batchId       - Batch identifier.
 * @param {string} eventPayload.eventType     - E.g. 'harvested', 'received', 'dispatched', 'transported', 'delivered', 'ANOMALY_FLAG'.
 * @param {number} eventPayload.quantityKg    - Quantity in kg.
 * @param {string} [eventPayload.permitNumber] - Transit / harvest permit number.
 * @param {string} [eventPayload.location]     - GPS coords or place name.
 * @param {string} [eventPayload.notes]        - Free-text notes.
 * @param {number} [eventPayload.authorityUserId] - Supervising authority (if any).
 * @returns {Promise<{txHash: string, blockHash: string, signature: string}>}
 */
export async function recordCustodyEvent(userId, eventPayload) {
  const timestamp = Date.now();

  // 1. Compute the digital signature.
  const signature = makeSignature(
    userId,
    eventPayload.batchId,
    eventPayload.eventType,
    timestamp,
  );

  // 2. Append the block to the chain.
  const result = await addBlock(eventPayload.batchId, {
    eventType: eventPayload.eventType,
    actorUserId: userId,
    quantityKg: eventPayload.quantityKg,
    permitNumber: eventPayload.permitNumber ?? null,
    location: eventPayload.location ?? null,
    notes: eventPayload.notes ?? null,
  });

  // 3. Store the digital signature on the newly-created block row.
  await query(
    `UPDATE custody_events SET digital_signature = ?, authority_user_id = ?
     WHERE id = ?`,
    [signature, eventPayload.authorityUserId ?? null, result.blockNumber],
  );

  return {
    txHash: result.txHash,
    blockHash: result.blockHash,
    signature,
  };
}

/**
 * Retrieve the full provenance of a batch: the batch metadata plus every
 * custody event with actor and authority names resolved.
 *
 * @param {string} batchId - Batch identifier.
 * @returns {Promise<{batch: Object|null, events: Array<Object>}>}
 */
export async function getFullProvenance(batchId) {
  // 1. Custody events with actor + authority names.
  const events = await query(
    `SELECT ce.*,
            actor.name  AS actor_name,
            actor.role  AS actor_role,
            auth.name   AS authority_name
     FROM custody_events ce
     LEFT JOIN users actor ON ce.actor_user_id   = actor.id
     LEFT JOIN users auth  ON ce.authority_user_id = auth.id
     WHERE ce.batch_id = ?
     ORDER BY ce.id ASC`,
    [batchId],
  );

  // 2. Batch metadata with permit and harvester info.
  const [batch] = await query(
    `SELECT pb.*,
            p.permit_number,
            p.block_name,
            h.name AS harvester_name
     FROM product_batches pb
     JOIN permits p  ON pb.permit_id    = p.id
     JOIN users   h  ON pb.harvester_id = h.id
     WHERE pb.batch_id = ?`,
    [batchId],
  );

  return {
    batch: batch ?? null,
    events,
  };
}

// ✓ FILE COMPLETE: services/custodyService.js
