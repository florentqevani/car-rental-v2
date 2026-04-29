const pool = require('../db');

async function deleteCar(call, callback) {
    const { car_id } = call.request;
    try {
        const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [car_id]);
        if (result.rowCount === 0) {
            return callback({ code: 404, message: 'Car not found' });
        }
        console.log('Car deleted successfully with id:', car_id);
        callback(null, { success: true, message: 'Car deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting car:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    deleteCar
};