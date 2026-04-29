const pool = require('../db');

async function getCar(call, callback) {
    const { car_id } = call.request;
    try {
        const result = await pool.query('SELECT * FROM cars WHERE id = $1', [car_id]);
        const car = result.rows[0];
        if (!car) {
            return callback({ code: 404, message: 'Car not found' });
        }
        console.log('Car fetched successfully for car_id:', car_id);
        callback(null, { car_id: car.id, make: car.make, model: car.model, year: car.year, price_per_day: parseFloat(car.price_per_day) || 0, image_url: car.image_url || '' });
    }
    catch (error) {
        console.error('Error fetching car:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = {
    getCar
};