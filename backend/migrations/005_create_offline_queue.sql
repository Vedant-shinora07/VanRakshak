-- ─────────────────────────────────────────────────────────────────────────────
-- VanRakshak — Migration 005: Offline Queue Table
-- Stores harvest entries captured offline on mobile devices.
-- Entries are replayed when the device reconnects via POST /api/harvest/sync.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS offline_queue (
  id              VARCHAR(36)  PRIMARY KEY,
  user_id         INT          NOT NULL,
  operation_type  VARCHAR(50)  NOT NULL,
  payload_json    TEXT         NOT NULL,
  status          ENUM('pending','synced','failed') DEFAULT 'pending',
  retry_count     INT DEFAULT 0,
  error_message   TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced_at       DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
