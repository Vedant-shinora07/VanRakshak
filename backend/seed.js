// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Database Seeder
// Populates the database with demo users, permits, batches, and custody events.
// All custody events are created via chainEngine.addBlock so hashes are real.
//
// Usage:  node seed.js
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from './src/models/db.js';
import { addBlock } from './src/blockchain/chainEngine.js';
import pool from './src/models/db.js';

const PIN = '1234';
const SALT_ROUNDS = 12;

async function seed() {
  console.log('🌲 VanRakshak — Seeding database...\n');

  // ── 1. Hash the PIN once (same for all demo users) ────────────────────
  const pinHash = await bcrypt.hash(PIN, SALT_ROUNDS);

  // ── 2. Insert Users ───────────────────────────────────────────────────
  console.log('  ── Users ──');

  const users = [
    { phone: '9000000001', role: 'admin',         name: 'Forest Dept Admin' },
    { phone: '9000000002', role: 'harvester',     name: 'Ramesh Patel' },
    { phone: '9000000003', role: 'harvester',     name: 'Sunita Bai' },
    { phone: '9000000004', role: 'depot_manager', name: 'Arjun Depot' },
    { phone: '9000000005', role: 'trader',        name: 'Mehul Trader' },
    { phone: '9000000006', role: 'end_buyer',     name: 'Kavita Buyer' },
  ];

  const userIds = {};

  for (const u of users) {
    const result = await query(
      `INSERT INTO users (phone, pin_hash, role, name, language) VALUES (?, ?, ?, ?, 'en')`,
      [u.phone, pinHash, u.role, u.name],
    );
    userIds[u.name] = result.insertId;
    console.log(`    ✓ ${u.name} (${u.role}) → id ${result.insertId}`);
  }

  // ── 3. Insert Permits ─────────────────────────────────────────────────
  console.log('\n  ── Permits ──');

  const permits = [
    {
      permitNumber: 'PERMIT-GJ-2024-001',
      blockName: 'Dandeli Block A',
      issuedToUserId: userIds['Ramesh Patel'],
      productType: 'tendu_leaves',
      licensedQuantityKg: 500,
      issueDate: '2024-01-01',
      expiryDate: '2027-12-31',
    },
    {
      permitNumber: 'PERMIT-GJ-2024-002',
      blockName: 'Vansda Block B',
      issuedToUserId: userIds['Sunita Bai'],
      productType: 'bamboo',
      licensedQuantityKg: 800,
      issueDate: '2024-01-01',
      expiryDate: '2027-12-31',
    },
    {
      permitNumber: 'PERMIT-GJ-2024-003',
      blockName: 'Gir Block C',
      issuedToUserId: userIds['Ramesh Patel'],
      productType: 'timber',
      licensedQuantityKg: 1200,
      issueDate: '2024-01-01',
      expiryDate: '2027-12-31',
    },
  ];

  const permitIds = {};

  for (const p of permits) {
    const result = await query(
      `INSERT INTO permits
         (permit_number, block_name, issued_to_user_id, product_type,
          licensed_quantity_kg, issue_date, expiry_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [p.permitNumber, p.blockName, p.issuedToUserId, p.productType,
       p.licensedQuantityKg, p.issueDate, p.expiryDate],
    );
    permitIds[p.permitNumber] = result.insertId;
    console.log(`    ✓ ${p.permitNumber} → ${p.productType} (${p.licensedQuantityKg}kg)`);
  }

  // ── 4. Batch 1: Tendu Leaves — Full lifecycle (harvested → delivered) ─
  console.log('\n  ── Batch 1: Tendu Leaves (full lifecycle) ──');

  const batch1Id = uuidv4();

  await query(
    `INSERT INTO product_batches
       (batch_id, permit_id, harvester_id, product_type, quantity_kg,
        harvest_date, status)
     VALUES (?, ?, ?, 'tendu_leaves', 120, '2024-06-15', 'harvested')`,
    [batch1Id, permitIds['PERMIT-GJ-2024-001'], userIds['Ramesh Patel']],
  );
  console.log(`    ✓ Created batch ${batch1Id}`);

  // Event 1: Harvested
  const evt1 = await addBlock(batch1Id, {
    eventType: 'harvested',
    actorUserId: userIds['Ramesh Patel'],
    quantityKg: 120,
    permitNumber: 'PERMIT-GJ-2024-001',
    location: 'Dandeli Forest, Gujarat',
    notes: null,
  });
  console.log(`    ✓ harvested  → blockHash: ${evt1.blockHash.slice(0, 16)}…`);

  // Event 2: Received at depot
  const evt2 = await addBlock(batch1Id, {
    eventType: 'received',
    actorUserId: userIds['Arjun Depot'],
    quantityKg: 120,
    permitNumber: 'PERMIT-GJ-2024-001',
    location: 'Vadodara Depot',
    notes: null,
  });
  console.log(`    ✓ received   → blockHash: ${evt2.blockHash.slice(0, 16)}…`);

  // Event 3: Dispatched from depot
  const evt3 = await addBlock(batch1Id, {
    eventType: 'dispatched',
    actorUserId: userIds['Arjun Depot'],
    quantityKg: 120,
    permitNumber: 'PERMIT-GJ-2024-001',
    location: 'Vadodara Depot',
    notes: null,
  });
  console.log(`    ✓ dispatched → blockHash: ${evt3.blockHash.slice(0, 16)}…`);

  // Event 4: Transported
  const evt4 = await addBlock(batch1Id, {
    eventType: 'transported',
    actorUserId: userIds['Mehul Trader'],
    quantityKg: 120,
    permitNumber: 'PERMIT-GJ-2024-001',
    location: 'NH48 Highway',
    notes: null,
  });
  console.log(`    ✓ transported → blockHash: ${evt4.blockHash.slice(0, 16)}…`);

  // Event 5: Delivered
  const evt5 = await addBlock(batch1Id, {
    eventType: 'delivered',
    actorUserId: userIds['Kavita Buyer'],
    quantityKg: 120,
    permitNumber: 'PERMIT-GJ-2024-001',
    location: 'Surat Export Hub',
    notes: null,
  });
  console.log(`    ✓ delivered  → blockHash: ${evt5.blockHash.slice(0, 16)}…`);

  // Update batch status to delivered.
  await query(
    `UPDATE product_batches SET status = 'delivered' WHERE batch_id = ?`,
    [batch1Id],
  );

  // ── 5. Batch 2: Bamboo — With anomaly ────────────────────────────────
  console.log('\n  ── Batch 2: Bamboo (with volume anomaly) ──');

  const batch2Id = uuidv4();

  await query(
    `INSERT INTO product_batches
       (batch_id, permit_id, harvester_id, product_type, quantity_kg,
        harvest_date, status)
     VALUES (?, ?, ?, 'bamboo', 200, '2024-07-01', 'harvested')`,
    [batch2Id, permitIds['PERMIT-GJ-2024-002'], userIds['Sunita Bai']],
  );
  console.log(`    ✓ Created batch ${batch2Id}`);

  // Event 1: Harvested
  const evt6 = await addBlock(batch2Id, {
    eventType: 'harvested',
    actorUserId: userIds['Sunita Bai'],
    quantityKg: 200,
    permitNumber: 'PERMIT-GJ-2024-002',
    location: 'Vansda Forest, Gujarat',
    notes: null,
  });
  console.log(`    ✓ harvested  → blockHash: ${evt6.blockHash.slice(0, 16)}…`);

  // Event 2: Received at depot
  const evt7 = await addBlock(batch2Id, {
    eventType: 'received',
    actorUserId: userIds['Arjun Depot'],
    quantityKg: 200,
    permitNumber: 'PERMIT-GJ-2024-002',
    location: 'Vadodara Depot',
    notes: null,
  });
  console.log(`    ✓ received   → blockHash: ${evt7.blockHash.slice(0, 16)}…`);

  // Event 3: Dispatched 250kg (ANOMALY — exceeds 200kg received)
  //   Insert the volume flag first.
  await query(
    `INSERT INTO volume_flags
       (batch_id, flagged_by_user_id, total_received_kg, total_dispatched_kg, notes)
     VALUES (?, ?, 200, 250, ?)`,
    [
      batch2Id,
      userIds['Arjun Depot'],
      'Anomaly: dispatching 250kg exceeds received 200kg.',
    ],
  );
  console.log('    ⚠  Volume flag inserted (250kg > 200kg received)');

  //   Record the ANOMALY_FLAG custody event.
  const evt8 = await addBlock(batch2Id, {
    eventType: 'ANOMALY_FLAG',
    actorUserId: userIds['Arjun Depot'],
    quantityKg: 250,
    permitNumber: 'PERMIT-GJ-2024-002',
    location: 'Vadodara Depot',
    notes: 'Force-dispatched despite anomaly. Received: 200kg, dispatching total: 250kg.',
  });
  console.log(`    ✓ ANOMALY_FLAG → blockHash: ${evt8.blockHash.slice(0, 16)}…`);

  //   Then the actual dispatch event.
  const evt9 = await addBlock(batch2Id, {
    eventType: 'dispatched',
    actorUserId: userIds['Arjun Depot'],
    quantityKg: 250,
    permitNumber: 'PERMIT-GJ-2024-002',
    location: 'Vadodara Depot',
    notes: null,
  });
  console.log(`    ✓ dispatched → blockHash: ${evt9.blockHash.slice(0, 16)}…`);

  // Update batch status to dispatched.
  await query(
    `UPDATE product_batches SET status = 'dispatched' WHERE batch_id = ?`,
    [batch2Id],
  );

  // ── Done ──────────────────────────────────────────────────────────────
  console.log('\n✓ Seed complete.');
  console.log(`  Batch 1 (delivered):  ${batch1Id}`);
  console.log(`  Batch 2 (dispatched): ${batch2Id}`);
  console.log('\n  Login with any phone (9000000001–06), PIN: 1234');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

// ✓ FILE COMPLETE: seed.js
