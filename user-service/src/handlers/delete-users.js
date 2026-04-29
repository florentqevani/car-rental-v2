const pool = require('../db');

async function deleteUsers(call, callback) {
    const { user_id } = call.request;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [user_id]);
        if (result.rowCount === 0) {
            return callback({ code: 404, message: 'User not found' });
        }
        console.log('User deleted successfully with id:', user_id);
        callback(null, { success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    deleteUsers
};