require('dotenv').config();

const config = {
    // server
    port: process.env.PORT || 50055,
    nodeEnv: process.env.NODE_ENV || 'development',

    // database
    dbUrl: process.env.DB_URL || 'postgresql://postgres:password@localhost:5432/payment_service_db',
    dbPoolMax: parseInt(process.env.DB_POOL_MAX) || 10,
    dbIdleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
    dbConnectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS) || 2000,
};

module.exports = config;
