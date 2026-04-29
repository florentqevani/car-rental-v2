CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    TEXT         NOT NULL,
    role        VARCHAR(50)  NOT NULL DEFAULT 'user',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Default admin account (password: admin#1)
-- Hash generated with bcrypt cost=10 using node:20-alpine
INSERT INTO users (name, email, password, role)
VALUES ('admin', 'admin@gmail.com', '$2b$10$NKemU9zlX/8FEZ0Aey8AxeVXJFhm8d0qW2c72zh63Iuh7/Gvy2eNa', 'admin')
ON CONFLICT (email) DO NOTHING;
