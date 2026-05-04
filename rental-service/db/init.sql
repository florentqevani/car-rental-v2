CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE DATABASE rental_service_db;
\c rental_service_db;
CREATE TABLE IF NOT EXISTS rentals (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL,
    car_id     UUID         NOT NULL,
    start_date DATE         NOT NULL,
    end_date   DATE         NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dates CHECK (end_date >= start_date),
    CONSTRAINT no_overlapping_rentals EXCLUDE USING GIST (
        car_id WITH =,
        daterange(start_date, end_date, '[)') WITH &&
    )
);

CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON rentals (user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_car_id  ON rentals (car_id);
