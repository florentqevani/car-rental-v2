const pool = require('../db');

async function getRental(call, callback) {
    const { rental_id } = call.request;
    try {
        const result = await pool.query('SELECT * FROM rentals WHERE id = $1', [rental_id]);
        const rental = result.rows[0];
        if (!rental) {
            return callback({ code: 404, message: 'Rental not found' });
        }
        console.log('Rental fetched successfully for rental_id:', rental_id);
        callback(null, {
            rental_id: rental.id,
            user_id: rental.user_id,
            car_id: rental.car_id,
            start_date: String(rental.start_date),
            end_date: String(rental.end_date)
        });
    }
    catch (error) {
        console.error('Error fetching rental:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    getRental
};