CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS payments (
    id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id  UUID           NOT NULL,
    user_id    UUID           NOT NULL,
    amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency   VARCHAR(3)     NOT NULL DEFAULT 'USD',
    status     VARCHAR(20)    NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payment_status CHECK (status IN ('pending', 'completed', 'refunded', 'failed'))
);

CREATE TABLE IF NOT EXISTS refunds (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID        NOT NULL REFERENCES payments (id),
    reason     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_rental_id ON payments (rental_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id   ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status    ON payments (status);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds (payment_id);
