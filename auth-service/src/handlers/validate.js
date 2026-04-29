const config = require('../config');
const jwt = require('jsonwebtoken');

function validateToken(call, callback) {
    const { token } = call.request;
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        callback(null, {
            valid: true,
            user_id: decoded.user_id ? String(decoded.user_id) : '',
            role: decoded.role || '',
            permissions: decoded.permissions || [],
        });
    }
    catch (error) {
        console.error('Token validation error:', error);
        callback(null, { valid: false, permissions: [] });
    }
}

module.exports = {
    validateToken
};