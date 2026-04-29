require('dotenv').config();

module.exports = {
    port: parseInt(process.env.PORT) || 4000,
    jwtSecret: process.env.JWT_SECRET || 'your_super_secret_key_change_in_production',
    services: {
        auth: process.env.AUTH_SERVICE_URL || 'localhost:50054',
        user: process.env.USER_SERVICE_URL || 'localhost:50051',
        car: process.env.CAR_SERVICE_URL || 'localhost:50053',
        rental: process.env.RENTAL_SERVICE_URL || 'localhost:50052',
        payment: process.env.PAYMENT_SERVICE_URL || 'localhost:50055',
    },
};
