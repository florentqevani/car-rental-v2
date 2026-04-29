const bcrypt = require('bcrypt');
const pool = require('../db');

async function createUsers(call, callback) {
    const { email, password, name } = call.request;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPassword, name]
        );
        const user_id = result.rows[0].id;
        console.log('User created successfully:', user_id);
        callback(null, { user_id, success: true, message: 'User created successfully' });
    }
    catch (error) {
        console.error('Error creating user:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    createUsers
};
