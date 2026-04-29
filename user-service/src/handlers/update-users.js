const pool = require('../db');

async function updateUsers(call, callback) {
    const { user_id, email, name } = call.request;
    try {
        const result = await pool.query(
            'UPDATE users SET email = $1, name = $2 WHERE id = $3',
            [email, name, user_id]
        );
        if (result.rowCount === 0) {
            return callback({ code: 404, message: 'User not found' });
        }
        console.log('User updated successfully:', user_id);
        callback(null, { success: true, message: 'User updated successfully' });
    }
    catch (error) {
        console.error('Error updating user:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    updateUsers
};