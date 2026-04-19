// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Chain Verifier
// Walks the hash chain of a batch and detects tampering by recomputing
// every block hash from its stored payload and checking link continuity.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { query } from '../models/db.js';
import { getChain } from './chainEngine.js';

/**
 * Compute the SHA-256 hex digest of a string.
 * @param {string} str - Input string to hash.
 * @returns {string} 64-char lowercase hex digest.
 */
const sha256hex = (str) => crypto.createHash('sha256').update(str).digest('hex');

// ── Genesis constant ────────────────────────────────────────────────────────
const GENESIS_PREVIOUS_HASH = '0000000000000000';

/**
 * Verify the integrity of the entire custody chain for a batch.
 *
 * For every block the verifier:
 *   1. Parses the stored `payload_json`.
 *   2. Recomputes `sha256(previous_block_hash + payload_json)` and compares
 *      it to the stored `block_hash`.
 *   3. Checks that `previous_block_hash` correctly points to the preceding
 *      block's `block_hash` (or to the genesis constant for the first block).
 *
 * @param {number|string} batchId - The batch whose chain should be verified.
 * @returns {Promise<{
 *   isValid: boolean,
 *   totalBlocks: number,
 *   tamperedAt: number|null,
 *   blocks: Array<{
 *     id: number,
 *     eventType: string,
 *     blockHash: string,
 *     hashMatch: boolean,
 *     chainMatch: boolean,
 *     blockValid: boolean,
 *     timestamp: Date|string
 *   }>,
 *   reason?: string
 * }>}
 */
export async function verifyChain(batchId) {
  // 1. Fetch all blocks in chronological order.
  const blocks = await getChain(batchId);

  // 2. Empty chain → invalid (nothing to verify).
  if (blocks.length === 0) {
    return {
      isValid: false,
      totalBlocks: 0,
      tamperedAt: null,
      blocks: [],
      reason: 'No blocks found',
    };
  }

  // 3. Walk every block and verify.
  const results = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // a. Parse the canonical payload that was hashed when the block was created.
    const payloadRaw = block.payload_json;
    const payload = typeof payloadRaw === 'string' ? payloadRaw : JSON.stringify(payloadRaw);

    // b. Recompute the block hash from stored previous_block_hash + payload.
    const recomputedHash = sha256hex(block.previous_block_hash + payload);

    // c. Does the recomputed hash match the stored block_hash?
    const hashMatch = recomputedHash === block.block_hash;

    // d. Does the chain link hold?
    //    - Genesis block must point to "0000000000000000".
    //    - Every subsequent block must point to the preceding block's hash.
    const chainMatch =
      i === 0
        ? block.previous_block_hash === GENESIS_PREVIOUS_HASH
        : block.previous_block_hash === blocks[i - 1].block_hash;

    // e. Block is valid only if BOTH checks pass.
    const blockValid = hashMatch && chainMatch;

    // f. Collect per-block result.
    results.push({
      id: block.id,
      eventType: block.event_type,
      blockHash: block.block_hash,
      hashMatch,
      chainMatch,
      blockValid,
      timestamp: block.timestamp,
    });
  }

  // 5. Overall validity.
  const isValid = results.every((r) => r.blockValid);

  // 6. Identify the first tampered block (if any).
  const tamperedAt = results.find((r) => !r.blockValid)?.id ?? null;

  // 7. Return the full verification report.
  return {
    isValid,
    totalBlocks: blocks.length,
    tamperedAt,
    blocks: results,
  };
}

/**
 * Verify all batches associated with a given permit number.
 *
 * Finds every distinct batch_id that references the permit, then runs
 * {@link verifyChain} on each one.
 *
 * @param {string} permitNumber - The permit whose batches should be verified.
 * @returns {Promise<{
 *   permitNumber: string,
 *   batches: Array<{ batchId: number|string } & Awaited<ReturnType<typeof verifyChain>>>
 * }>}
 */
export async function verifyBatchesForPermit(permitNumber) {
  // 1. Find all distinct batches that reference this permit.
  const rows = await query(
    `SELECT DISTINCT batch_id FROM custody_events WHERE permit_number = ?`,
    [permitNumber]
  );

  // 2. Verify each batch.
  const batches = [];
  for (const row of rows) {
    const verifyResult = await verifyChain(row.batch_id);
    batches.push({ batchId: row.batch_id, ...verifyResult });
  }

  // 3. Return aggregated results.
  return {
    permitNumber,
    batches,
  };
}

// ✓ FILE COMPLETE: chainVerifier.js
