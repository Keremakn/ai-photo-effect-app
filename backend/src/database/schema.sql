CREATE TABLE IF NOT EXISTS effects (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  tags VARCHAR(255) NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_effects_category (category)
);

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
);

CREATE TABLE IF NOT EXISTS generations (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  effect_id VARCHAR(80) NOT NULL,
  effect_name VARCHAR(120) NOT NULL,
  prompt_version_id CHAR(36) NULL,
  prompt_text TEXT NULL,
  input_image_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  provider VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_generations_created_at (created_at),
  INDEX idx_generations_effect_id (effect_id),
  INDEX idx_generations_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS effect_prompt_versions (
  id CHAR(36) PRIMARY KEY,
  effect_id VARCHAR(80) NOT NULL,
  prompt TEXT NOT NULL,
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_effect_prompt_versions_effect_id (effect_id),
  INDEX idx_effect_prompt_versions_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS favorite_effects (
  user_id CHAR(36) NOT NULL,
  effect_id VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, effect_id),
  INDEX idx_favorite_effects_effect_id (effect_id)
);

CREATE TABLE IF NOT EXISTS favorite_generations (
  user_id CHAR(36) NOT NULL,
  generation_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, generation_id),
  INDEX idx_favorite_generations_generation_id (generation_id)
);

CREATE TABLE IF NOT EXISTS user_role_history (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  previous_role VARCHAR(50) NOT NULL,
  next_role VARCHAR(50) NOT NULL,
  changed_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_role_history_user_id (user_id),
  INDEX idx_user_role_history_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS admins (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
