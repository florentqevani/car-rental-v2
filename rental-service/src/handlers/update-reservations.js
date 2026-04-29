const pool = require('../db');

async function updateRental(call, callback) {
    const { rental_id, start_date, end_date } = call.request;
    try {
        const result = await pool.query(
            'UPDATE rentals SET start_date = $1, end_date = $2 WHERE id = $3',
            [start_date, end_date, rental_id]
        );
        if (result.rowCount === 0) {
            return callback({ code: 404, message: 'Rental not found' });
        }
        console.log('Rental updated successfully with id:', rental_id);
        callback(null, { success: true, message: 'Rental updated successfully' });
    }
    catch (error) {
        console.error('Error updating rental:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    updateRental
};