const pool = require('../db');

async function getQueuedReservationsByUser(call, callback) {
    const { user_id } = call.request;
    try {
        const result = await pool.query(
            `SELECT id, car_id, start_date, end_date, status, rejection_reason, queued_at
             FROM queued_reservations
             WHERE user_id = $1 AND status IN ('pending', 'rejected')
             ORDER BY queued_at DESC`,
            [user_id]
        );
        const reservations = result.rows.map((r) => ({
            queue_id: r.id,
            car_id: r.car_id,
            start_date: String(r.start_date).split('T')[0],
            end_date: String(r.end_date).split('T')[0],
            status: r.status,
            rejection_reason: r.rejection_reason || '',
            queued_at: r.queued_at ? r.queued_at.toISOString() : '',
        }));
        callback(null, { reservations });
    } catch (err) {
        console.error('Error fetching queued reservations by user:', err);
        callback({ code: 13, message: err.message });
    }
}

module.exports = { getQueuedReservationsByUser };
