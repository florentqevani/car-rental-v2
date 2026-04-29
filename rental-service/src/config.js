require('dotenv').config();

const config = {
    //server
    port: process.env.PORT || 50052,

    //database
    dbUrl: process.env.DB_URL || 'postgresql://postgres:password@localhost:5432/rental_service_db',

    //jwt
    jwtSecret: process.env.JWT_SECRET,

    // message broker
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
};

module.exports = config;