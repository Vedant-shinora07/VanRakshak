-- ─────────────────────────────────────────────────────────────────────────────
-- VanRakshak — Migration 001: Users Table
-- Stores all system users: harvesters, depot managers, traders, buyers, admins.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  phone        VARCHAR(15)  UNIQUE NOT NULL,
  pin_hash     VARCHAR(255) NOT NULL,
  role         ENUM('harvester','depot_manager','trader','end_buyer','admin') NOT NULL,
  name         VARCHAR(100) NOT NULL,
  language     ENUM('en','gu') DEFAULT 'gu',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
