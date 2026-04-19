// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Permit Registry
// Manages forest product permits with fake blockchain registration hashes.
// Permits control who is allowed to harvest / transport / trade.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { query } from '../models/db.js';

/**
 * Compute the SHA-256 hex digest of a string.
 * @param {string} str - Input string to hash.
 * @returns {string} 64-char lowercase hex digest.
 */
const sha256hex = (str) => crypto.createHash('sha256').update(str).digest('hex');

/**
 * Register a new permit in the system.
 *
 * Generates a fake blockchain transaction hash for the registration event:
 *   "0x" + sha256(permitNumber + issuedToUserId + Date.now())
 *
 * @param {Object} permitData - Permit details.
 * @param {string} permitData.permitNumber - Unique permit identifier (e.g. "TP-2026-0042").
 * @param {string} permitData.blockName - Forest block / division name.
 * @param {number} permitData.issuedToUserId - User ID of the permit holder.
 * @param {string} permitData.productType - Product type: 'tendu_leaves', 'timber', 'bamboo', 'medicinal_herbs'.
 * @param {number} permitData.licensedQuantityKg - Maximum allowed quantity in kg.
 * @param {string} permitData.issueDate - ISO date string (YYYY-MM-DD).
 * @param {string} permitData.expiryDate - ISO date string (YYYY-MM-DD).
 * @returns {Promise<{registrationHash: string, permitNumber: string}>}
 */
export async function registerPermit(permitData) {
  const {
    permitNumber,
    blockName,
    issuedToUserId,
    productType,
    licensedQuantityKg,
    issueDate,
    expiryDate,
  } = permitData;

  // 1. Generate a fake blockchain registration hash.
  const registrationHash =
    '0x' + sha256hex(permitNumber + issuedToUserId + Date.now());

  // 2. Insert the permit row.
  await query(
    `INSERT INTO permits
       (permit_number, block_name, issued_to_user_id, product_type,
        licensed_quantity_kg, issue_date, expiry_date, blockchain_tx_hash, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      permitNumber,
      blockName,
      issuedToUserId,
      productType,
      licensedQuantityKg,
      issueDate,
      expiryDate,
      registrationHash,
    ]
  );

  // 3. Return the registration receipt.
  return {
    registrationHash,
    permitNumber,
  };
}

/**
 * Check whether a permit is currently valid.
 *
 * A permit is considered valid when:
 *   - `is_active = 1` (has not been revoked)
 *   - `expiry_date` is in the future
 *
 * @param {string} permitNumber - The permit number to check.
 * @returns {Promise<boolean>} `true` if the permit is valid and active.
 */
export async function isPermitValid(permitNumber) {
  const rows = await query(
    `SELECT id FROM permits
     WHERE permit_number = ? AND is_active = 1 AND expiry_date > CURDATE()`,
    [permitNumber]
  );
  return Boolean(rows.length);
}

/**
 * Retrieve full permit details including the name of the user it was issued to.
 *
 * @param {string} permitNumber - The permit number to look up.
 * @returns {Promise<Object|null>} The permit row with `issued_to_name` joined
 *   from the users table, or `null` if not found.
 */
export async function getPermit(permitNumber) {
  const [row] = await query(
    `SELECT permits.*, users.name AS issued_to_name
     FROM permits
     JOIN users ON permits.issued_to_user_id = users.id
     WHERE permits.permit_number = ?`,
    [permitNumber]
  );
  return row ?? null;
}

/**
 * Revoke a permit by setting its `is_active` flag to 0.
 *
 * Once revoked, the permit will fail all future {@link isPermitValid} checks.
 *
 * @param {string} permitNumber - The permit number to revoke.
 * @returns {Promise<{success: boolean}>}
 */
export async function revokePermit(permitNumber) {
  await query(
    `UPDATE permits SET is_active = 0 WHERE permit_number = ?`,
    [permitNumber]
  );
  return { success: true };
}

// ✓ FILE COMPLETE: permitRegistry.js
