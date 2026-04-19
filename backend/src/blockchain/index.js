// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Blockchain Module Barrel Export
// Single import point for the simulated blockchain engine.
//
// Usage:
//   import { addBlock, verifyChain, registerPermit } from './blockchain/index.js'
// ─────────────────────────────────────────────────────────────────────────────

export { addBlock, getChain, getLastBlock } from './chainEngine.js';
export { verifyChain, verifyBatchesForPermit } from './chainVerifier.js';
export { registerPermit, isPermitValid, getPermit, revokePermit } from './permitRegistry.js';

// ✓ FILE COMPLETE: index.js
