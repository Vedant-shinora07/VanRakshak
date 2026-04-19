-- ─────────────────────────────────────────────────────────────────────────────
-- VanRakshak — Migration 002: Permits Table
-- Forest transit/harvest permits issued by the Forest Department.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permits (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  permit_number         VARCHAR(50)  UNIQUE NOT NULL,
  block_name            VARCHAR(100) NOT NULL,
  issued_to_user_id     INT          NOT NULL,
  product_type          ENUM('tendu_leaves','timber','bamboo','medicinal_herbs') NOT NULL,
  licensed_quantity_kg  DECIMAL(10,2) NOT NULL,
  issue_date            DATE NOT NULL,
  expiry_date           DATE NOT NULL,
  is_active             BOOLEAN DEFAULT TRUE,
  blockchain_tx_hash    VARCHAR(66),
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issued_to_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
