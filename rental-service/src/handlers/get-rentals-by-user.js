const pool = require('../db');

async function getRentalsByUser(call, callback) {
    const { user_id } = call.request;
    try {
        const result = await pool.query(
            'SELECT id, user_id, car_id, start_date, end_date FROM rentals WHERE user_id = $1 ORDER BY start_date DESC',
            [user_id]
        );
        const rentals = result.rows.map((r) => ({
            rental_id: r.id,
            user_id: r.user_id,
            car_id: r.car_id,
            start_date: String(r.start_date).split('T')[0],
            end_date: String(r.end_date).split('T')[0],
        }));
        callback(null, { rentals });
    } catch (error) {
        console.error('Error fetching rentals by user:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = { getRentalsByUser };
