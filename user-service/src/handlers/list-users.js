const pool = require('../db');

async function listUsers(call, callback) {
    try {
        const result = await pool.query(
            "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC"
        );
        const users = result.rows.map((u) => ({
            user_id: u.id,
            email: u.email,
            name: u.name,
            role: u.role || 'user',
            created_at: u.created_at ? u.created_at.toISOString() : '',
        }));
        callback(null, { users });
    } catch (error) {
        console.error('Error listing users:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = { listUsers };
