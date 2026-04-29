const pool = require('../db');

async function createRental(call, callback) {
    const { user_id, car_id, start_date, end_date } = call.request;
    try {
        const result = await pool.query(
            'INSERT INTO rentals (user_id, car_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING id',
            [user_id, car_id, start_date, end_date]
        );
        const rental_id = result.rows[0].id;
        console.log('Rental created successfully with id:', rental_id);
        callback(null, { rental_id, success: true, message: 'Rental created successfully' });
    }
    catch (error) {
        console.error('Error creating rental:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    createRental
};
