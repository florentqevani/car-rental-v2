const pool = require('../db');

async function deleteRental(call, callback) {
    const { rental_id } = call.request;
    try {
        const result = await pool.query('DELETE FROM rentals WHERE id = $1 RETURNING *', [rental_id]);
        if (result.rowCount === 0) {
            return callback({ code: 404, message: 'Rental not found' });
        }
        console.log('Rental deleted successfully with id:', rental_id);
        callback(null, { success: true, message: 'Rental deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting rental:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    deleteRental
};