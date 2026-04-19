-- ─────────────────────────────────────────────────────────────────────────────
-- VanRakshak — Migration 004: Custody Events Table (THE FAKE BLOCKCHAIN)
--
-- Every row is ONE BLOCK in the simulated blockchain.
-- block_hash and previous_block_hash link blocks into an immutable chain.
--
-- CRITICAL: This table is APPEND-ONLY.
-- Never grant UPDATE or DELETE privileges on this table in production.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS custody_events (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  batch_id             VARCHAR(36)  NOT NULL,
  event_type           ENUM('harvested','received','dispatched','transported','delivered','ANOMALY_FLAG') NOT NULL,
  actor_user_id        INT          NOT NULL,
  authority_user_id    INT,
  quantity_kg          DECIMAL(10,2),
  location             VARCHAR(255),
  permit_number        VARCHAR(50),
  transport_doc_hash   VARCHAR(64),
  notes                TEXT,
  digital_signature    VARCHAR(64),
  is_verified          BOOLEAN DEFAULT FALSE,

  -- ── Blockchain fields ─────────────────────────────────────────────────
  block_hash           VARCHAR(64)  NOT NULL,
  previous_block_hash  VARCHAR(64)  NOT NULL,
  payload_json         TEXT         NOT NULL,
  blockchain_tx_hash   VARCHAR(66)  NOT NULL,

  timestamp            DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (batch_id)       REFERENCES product_batches(batch_id),
  FOREIGN KEY (actor_user_id)  REFERENCES users(id),

  INDEX idx_custody_batch  (batch_id),
  INDEX idx_custody_permit (permit_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
