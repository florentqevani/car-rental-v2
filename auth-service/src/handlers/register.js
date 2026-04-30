const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const { permissionsForRole } = require('../permissions');

async function register(call, callback) {
    const { name, email, password } = call.request;
    const role = 'user';
    try {
        // Check if user already exists
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const existingUser = result.rows;
        if (existingUser.length > 0) {
            return callback({
                code: 6,  // ALREADY_EXISTS
                message: 'Email already registered'
            });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert the new user into the database and get the id
        const insertResult = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hashedPassword, role]
        );
        const userId = insertResult.rows[0].id;
        // Generate a JWT token
        const token = jwt.sign(
            { user_id: userId, name, email, role, permissions: permissionsForRole(role) },
            config.jwtSecret,
            { expiresIn: '24h' }
        );
        callback(null, {
            token,
            user_id: String(userId),
            name,
            email,
            role,
            success: true,
            permissions: permissionsForRole(role),
        });
    }
    catch (error) {
        console.error('Error during registration:', error);
        callback({
            code: 13,  // INTERNAL
            message: 'Internal server error'
        });
    }

}

module.exports = {
    register
};
