const jwt = require('jsonwebtoken');
const config = require('../config');
const { permissionsForRole } = require('../permissions');

function createToken(call, callback) {
    const { user_id, role } = call.request;
    if (!user_id || !role) {
        return callback({ code: 400, message: 'Missing user_id or role' });
    }
    const tokenPayload = {
        user_id,
        permissions: permissionsForRole(role)
    };
    try {
        const token = jwt.sign(tokenPayload, config.jwtSecret);
        console.log('Token created successfully for user_id:', user_id);
        callback(null, { token, success: true, message: 'Token created successfully' });
    }
    catch (error) {
        console.error('Token creation error:', error);
        callback({ code: 500, message: 'Token creation failed' });
    }
}

module.exports = {
    createToken
};