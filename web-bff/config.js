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
    raiaccept: {
        // RaiAccept sandbox credentials — generate in the Merchant portal (Sandbox tab)
        username: process.env.RAIACCEPT_USERNAME || 'your-sandbox-username',
        password: process.env.RAIACCEPT_PASSWORD || 'your-sandbox-password',
        // Public URL of this app (used to build redirect/cancel URLs sent to RaiAccept)
        appUrl: process.env.RAIACCEPT_APP_URL || 'http://localhost',
        // Public URL of web-bff (used to build the notification webhook URL)
        webhookUrl: process.env.RAIACCEPT_WEBHOOK_URL || 'http://localhost:4000',
    },
};
