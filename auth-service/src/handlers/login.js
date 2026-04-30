const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const { permissionsForRole } = require('../permissions');

async function login(call, callback) {
    const { email, password } = call.request;
    try {
        // Check if user exists
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows;
        if (user.length === 0) {
            return callback({
                code: 16,  // UNAUTHENTICATED
                message: 'Invalid username or password'
            });
        }
        // Compare the password
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return callback({
                code: 16,  // UNAUTHENTICATED
                message: 'Invalid username or password'
            });
        }
        // Generate a JWT token
        const role = user[0].role || 'user';
        const userId = user[0].id;
        const token = jwt.sign(
            { user_id: userId, name: user[0].name, email: user[0].email, role, permissions: permissionsForRole(role) },
            config.jwtSecret,
            { expiresIn: '24h' }
        );
        callback(null, {
            token,
            user_id: String(userId),
            name: user[0].name,
            email: user[0].email,
            role,
            success: true,
            permissions: permissionsForRole(role),
        });
    }
    catch (error) {
        console.error('Error during login:', error);
        callback({
            code: 13,  // INTERNAL
            message: 'Internal server error'
        });
    }
}

module.exports = {
    login
};