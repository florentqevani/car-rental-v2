const pool = require('../db');

async function getQueuedReservation(call, callback) {
    const { queue_id } = call.request;
    try {
        const result = await pool.query(
            `SELECT id, status, rejection_reason, rental_id
             FROM queued_reservations
             WHERE id = $1`,
            [queue_id]
        );

        if (result.rows.length === 0) {
            return callback({ code: 5, message: 'Queued reservation not found' });
        }

        const row = result.rows[0];
        callback(null, {
            queue_id: row.id,
            status: row.status,
            rejection_reason: row.rejection_reason || '',
            rental_id: row.rental_id ? String(row.rental_id) : '',
        });
    } catch (err) {
        callback({ code: 13, message: err.message });
    }
}

module.exports = { getQueuedReservation };
