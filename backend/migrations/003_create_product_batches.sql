-- ─────────────────────────────────────────────────────────────────────────────
-- VanRakshak — Migration 003: Product Batches Table
-- Each row is one harvested batch of forest product, identified by a UUID.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_batches (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  batch_id            VARCHAR(36)  UNIQUE NOT NULL,
  permit_id           INT          NOT NULL,
  harvester_id        INT          NOT NULL,
  product_type        ENUM('tendu_leaves','timber','bamboo','medicinal_herbs') NOT NULL,
  quantity_kg         DECIMAL(10,2) NOT NULL,
  gps_lat             DECIMAL(10,7),
  gps_lng             DECIMAL(10,7),
  harvest_date        DATE NOT NULL,
  qr_code_hash        VARCHAR(64),
  blockchain_tx_hash  VARCHAR(66),
  status              ENUM('harvested','in_transit','at_depot','dispatched','delivered') DEFAULT 'harvested',
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_at           DATETIME,
  FOREIGN KEY (permit_id)    REFERENCES permits(id),
  FOREIGN KEY (harvester_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
