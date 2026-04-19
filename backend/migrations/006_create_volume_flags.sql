-- ─────────────────────────────────────────────────────────────────────────────
-- VanRakshak — Migration 006: Volume Flags Table
-- Records detected volume anomalies where dispatched kg > received kg.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS volume_flags (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  batch_id              VARCHAR(36)   NOT NULL,
  flagged_by_user_id    INT           NOT NULL,
  total_received_kg     DECIMAL(10,2) NOT NULL,
  total_dispatched_kg   DECIMAL(10,2) NOT NULL,
  notes                 TEXT,
  status                ENUM('open','resolved') DEFAULT 'open',
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at           DATETIME,
  FOREIGN KEY (batch_id)            REFERENCES product_batches(batch_id),
  FOREIGN KEY (flagged_by_user_id)  REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
