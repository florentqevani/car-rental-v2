const pool = require('../db');

async function getUsers(call, callback) {
    const { user_id } = call.request;
    try {
        const result = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [user_id]);
        const user = result.rows[0];
        if (!user) {
            return callback({ code: 404, message: 'User not found' });
        }
        console.log('User fetched successfully:', user_id);
        callback(null, { user_id: user.id, email: user.email, name: user.name, role: user.role || 'user' });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    getUsers
};