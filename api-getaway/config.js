require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    services: {
        auth:    process.env.AUTH_SERVICE_URL    || 'localhost:50054',
        user:    process.env.USER_SERVICE_URL    || 'localhost:50051',
        car:     process.env.CAR_SERVICE_URL     || 'localhost:50053',
        rental:  process.env.RENTAL_SERVICE_URL  || 'localhost:50052',
        payment: process.env.PAYMENT_SERVICE_URL || 'localhost:50055',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max:      parseInt(process.env.RATE_LIMIT_MAX)       || 100,
    },
};

module.exports = config;
