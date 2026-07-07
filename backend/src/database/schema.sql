CREATE TABLE IF NOT EXISTS effects (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generations (
  id CHAR(36) PRIMARY KEY,
  effect_id VARCHAR(80) NOT NULL,
  effect_name VARCHAR(120) NOT NULL,
  input_image_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  provider VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_generations_created_at (created_at),
  INDEX idx_generations_effect_id (effect_id)
);
