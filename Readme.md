# VanRakshak — Tamper-Proof Forest Product Chain-of-Custody

VanRakshak is an end-to-end decentralized application combining a robust Express/MySQL backend with a fake blockchain engine simulating a chain-of-custody. It tracks the harvesting, processing, transporting, and delivery of forest products, ensuring verifiable provenance and immediate detection of volume anomalies to combat illegal logging and smuggling.

## How the Fake Blockchain Works
Instead of using a real EVM chain, this project implements a simulated blockchain engine in Node.js. 
Every custody handoff creates one block. 
`blockHash = sha256(previousBlockHash + JSON.stringify(eventPayload) + timestamp)`. 
The first block of any batch uses `previousBlockHash = "0000000000000000"`.
Records in the `custody_events` table are append-only. 
Chain integrity can be verified via the `/api/public/verify/:batchId` endpoint, which recomputes hashes down the chain to check for tampering.

## Prerequisites
Node.js 18+, MySQL 8+

## Setup — Step by Step
1. Clone repo
2. Create MySQL database: `CREATE DATABASE vanrakshak;`
3. `cd backend && npm install`
4. `cp .env.example .env` → fill in DB credentials + JWT_SECRET
5. `node run_migrations.js`
6. `node seed.js`
7. `npm run dev`  (starts on port 5000)
8. `cd ../frontend && npm install`
9. Create `.env` with `VITE_API_URL=http://localhost:5000/api`
10. `npm run dev`  (starts on port 5173)

## Demo Login Credentials (PIN: 1234 for all)
| Role          | Phone       | Name           |
|---------------|-------------|----------------|
| Admin         | 9000000001  | Forest Dept Admin |
| Harvester     | 9000000002  | Ramesh Patel   |
| Harvester     | 9000000003  | Sunita Bai     |
| Depot Manager | 9000000004  | Arjun Depot    |
| Trader        | 9000000005  | Mehul Trader   |
| End Buyer     | 9000000006  | Kavita Buyer   |

## Demo Walkthrough
Step-by-step for each role:
- **Harvester**: login as Ramesh → submit harvest form → see QR code → simulate offline (toggle Network off in DevTools) → submit another harvest → toggle back online → watch auto-sync
- **Depot**: login as Arjun → receive Batch 2 (200kg) → try to dispatch 250kg → see anomaly alert → force dispatch → see ANOMALY_FLAG in custody chain
- **Trader**: login as Mehul → add transport doc → mark delivered
- **Buyer**: go to /scan → enter batch ID → see full provenance in Gujarati → click "Verify Blockchain" → see chain integrity result

## API Base URL
`http://localhost:5000/api`
