CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS cars (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    make          VARCHAR(100)  NOT NULL,
    model         VARCHAR(100)  NOT NULL,
    year          INT           NOT NULL,
    price_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
    image_url     TEXT          NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_make  ON cars (make);
CREATE INDEX IF NOT EXISTS idx_cars_model ON cars (model);
