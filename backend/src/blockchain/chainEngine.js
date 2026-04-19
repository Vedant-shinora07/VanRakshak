// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Simulated Blockchain Chain Engine
// Append-only hash-chained custody blocks stored in MySQL.
// No real blockchain. Only node:crypto + mysql2.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { query } from '../models/db.js';

/**
 * Compute the SHA-256 hex digest of a string.
 * @param {string} str - Input string to hash.
 * @returns {string} 64-char lowercase hex digest.
 */
const sha256hex = (str) => crypto.createHash('sha256').update(str).digest('hex');

// ── Genesis constant ────────────────────────────────────────────────────────
const GENESIS_PREVIOUS_HASH = '0000000000000000';

/**
 * Append a new block to the custody chain for a given batch.
 *
 * Every custody handoff (harvest → depot → trader → buyer) creates one block.
 * The block's hash is computed as:
 *   sha256(previousBlockHash + JSON.stringify(payload))
 * where payload includes batchId, eventData fields, and a millisecond timestamp.
 *
 * A fake transaction hash that mimics an Ethereum tx hash is also generated:
 *   "0x" + sha256(blockHash + randomUUID())
 *
 * The row is INSERT-only — no UPDATE or DELETE is ever performed on
 * the custody_events table.
 *
 * @param {number|string} batchId - The batch this event belongs to.
 * @param {Object} eventData - Event details.
 * @param {string} eventData.eventType - E.g. 'HARVEST', 'DEPOT_RECEIVE', 'DISPATCH', 'DELIVERY'.
 * @param {number} eventData.actorUserId - ID of the user performing the action.
 * @param {number} eventData.quantityKg - Quantity in kilograms.
 * @param {string} [eventData.permitNumber] - Transit / harvest permit number.
 * @param {string} [eventData.location] - GPS or place name.
 * @param {string} [eventData.notes] - Free-text notes.
 * @returns {Promise<{txHash: string, blockHash: string, previousBlockHash: string, blockNumber: number}>}
 */
export async function addBlock(batchId, eventData) {
  // 1. Fetch the most recent block hash for this batch (if any).
  const [lastRow] = await query(
    `SELECT block_hash FROM custody_events
     WHERE batch_id = ? ORDER BY id DESC LIMIT 1`,
    [batchId]
  );

  // 2. Determine the previous block hash (genesis if first block).
  const previousBlockHash = lastRow?.block_hash ?? GENESIS_PREVIOUS_HASH;

  // 3. Current timestamp in milliseconds.
  const timestamp = Date.now();

  // 4. Build the canonical payload that gets hashed.
  const payload = {
    batchId,
    eventType: eventData.eventType,
    actorUserId: eventData.actorUserId,
    quantityKg: eventData.quantityKg,
    permitNumber: eventData.permitNumber ?? null,
    location: eventData.location ?? null,
    notes: eventData.notes ?? null,
    timestamp,
  };

  // 5. Compute the block hash: sha256(previousHash + payloadJSON).
  const payloadJSON = JSON.stringify(payload);
  const blockHash = sha256hex(previousBlockHash + payloadJSON);

  // 6. Generate a fake Ethereum-style transaction hash.
  const fakeTxHash = '0x' + sha256hex(blockHash + crypto.randomUUID());

  // 7. Insert the block as an append-only row.
  const result = await query(
    `INSERT INTO custody_events
       (batch_id, event_type, actor_user_id, quantity_kg, location, notes,
        permit_number, block_hash, previous_block_hash, blockchain_tx_hash,
        payload_json, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(? / 1000))`,
    [
      batchId,
      eventData.eventType,
      eventData.actorUserId,
      eventData.quantityKg,
      eventData.location ?? null,
      eventData.notes ?? null,
      eventData.permitNumber ?? null,
      blockHash,
      previousBlockHash,
      fakeTxHash,
      payloadJSON,
      timestamp,
    ]
  );

  // 8. Return the block receipt.
  return {
    txHash: fakeTxHash,
    blockHash,
    previousBlockHash,
    blockNumber: result.insertId,
  };
}

/**
 * Retrieve the entire custody chain for a batch, ordered chronologically.
 *
 * @param {number|string} batchId - The batch to look up.
 * @returns {Promise<Array<Object>>} Array of custody_events rows (oldest first).
 */
export async function getChain(batchId) {
  const rows = await query(
    `SELECT * FROM custody_events WHERE batch_id = ? ORDER BY id ASC`,
    [batchId]
  );
  return rows;
}

/**
 * Retrieve the most recent block for a batch.
 *
 * @param {number|string} batchId - The batch to look up.
 * @returns {Promise<Object|null>} The latest custody_events row, or null if none exist.
 */
export async function getLastBlock(batchId) {
  const [row] = await query(
    `SELECT * FROM custody_events WHERE batch_id = ? ORDER BY id DESC LIMIT 1`,
    [batchId]
  );
  return row ?? null;
}

// ✓ FILE COMPLETE: chainEngine.js
