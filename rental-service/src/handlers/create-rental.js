const pool = require('../db');

async function createRental(call, callback) {
    const { user_id, car_id, start_date, end_date } = call.request;
    try {
        const conflict = await pool.query(
            `SELECT 1 FROM rentals
             WHERE car_id = $1
               AND NOT (end_date <= $2 OR start_date >= $3)
             LIMIT 1`,
            [car_id, start_date, end_date]
        );
        if (conflict.rows.length > 0) {
            return callback({ code: 9, message: 'Car is already booked for the selected dates.' });
        }

        const result = await pool.query(
            'INSERT INTO rentals (user_id, car_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING id',
            [user_id, car_id, start_date, end_date]
        );
        const rental_id = result.rows[0].id;
        console.log('Rental created successfully with id:', rental_id);
        callback(null, { rental_id, success: true, message: 'Rental created successfully' });
    }
    catch (error) {
        // PostgreSQL exclusion constraint violation (23P01) — catch any race condition
        if (error.code === '23P01' || error.code === '23505') {
            return callback({ code: 9, message: 'Car is already booked for the selected dates.' });
        }
        console.error('Error creating rental:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    createRental
};
