require('dotenv').config();

const config = {
    //server
    port: process.env.PORT || 50051,

    //database
    dbUrl: process.env.DB_URL || 'postgresql://postgres:password@localhost:5432/car_rental',

    //jwt
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
}

module.exports = config;