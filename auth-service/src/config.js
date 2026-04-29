require('dotenv').config();

const config = {
    //database configuration
    authdbUrl: process.env.AUTHDB_URL || 'postgresql://postgres:password@localhost:5432/user_service_db',

    // server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',


    //jwt configuration
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};

module.exports = config;