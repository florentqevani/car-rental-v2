#!/bin/bash
set -e

# Create all service databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE user_service_db;
    CREATE DATABASE car_service_db;
    CREATE DATABASE rental_service_db;
EOSQL

# Initialize each database schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "user_service_db" \
    -f /docker-entrypoint-initdb.d/auth-user.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "car_service_db" \
    -f /docker-entrypoint-initdb.d/car.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "rental_service_db" \
    -f /docker-entrypoint-initdb.d/rental.sql
