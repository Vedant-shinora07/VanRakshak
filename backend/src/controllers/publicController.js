// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Public Controller
// Unauthenticated endpoints for provenance, QR, verification, and permit audit.
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../models/db.js';
import { getFullProvenance } from '../services/custodyService.js';
import { resolveQR } from '../services/qrService.js';
import { verifyChain, verifyBatchesForPermit } from '../blockchain/index.js';

/**
 * GET /api/public/batch/:batchId/provenance
 */
export async function provenance(req, res) {
  const data = await getFullProvenance(req.params.batchId);
  if (!data.batch && data.events.length === 0) {
    return res.status(404).json({ error: 'Batch not found.' });
  }
  res.json(data);
}

/**
 * GET /api/public/qr/:qrHash
 */
export async function qrLookup(req, res) {
  const data = await resolveQR(req.params.qrHash);
  res.json(data);
}

/**
 * GET /api/public/verify/:batchId
 */
export async function verify(req, res) {
  const result = await verifyChain(req.params.batchId);
  res.json(result);
}

/**
 * GET /api/public/permit/:permitNumber/audit
 */
export async function permitAudit(req, res) {
  const { permitNumber } = req.params;
  const batches = await query(
    `SELECT pb.*, p.permit_number, p.block_name, h.name AS harvester_name
     FROM product_batches pb
     JOIN permits p ON pb.permit_id = p.id
     JOIN users h ON pb.harvester_id = h.id
     WHERE p.permit_number = ?
     ORDER BY pb.created_at DESC`,
    [permitNumber],
  );
  const verification = await verifyBatchesForPermit(permitNumber);
  res.json({ batches, verification });
}

// ✓ FILE COMPLETE: controllers/publicController.js
