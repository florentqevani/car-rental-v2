const pool = require('../db');

async function updateCar(call, callback) {
    const { car_id, make, model, year, price_per_day, image_url } = call.request;
    try {
        const fields = ['make=$1', 'model=$2', 'year=$3', 'price_per_day=$4', 'updated_at=NOW()'];
        const values = [make, model, year, price_per_day || 0];
        if (image_url) {
            fields.push(`image_url=$${values.length + 1}`);
            values.push(image_url);
        }
        values.push(car_id);
        const result = await pool.query(
            `UPDATE cars SET ${fields.join(', ')} WHERE id=$${values.length}`,
            values
        );
        if (result.rowCount === 0) {
            return callback({ code: 404, message: 'Car not found' });
        }
        console.log('Car updated successfully with id:', car_id);
        callback(null, { success: true, message: 'Car updated successfully' });
    }
    catch (error) {
        console.error('Error updating car:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    updateCar
};