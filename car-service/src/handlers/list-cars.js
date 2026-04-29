const pool = require('../db');

async function listCars(call, callback) {
    try {
        const result = await pool.query(
            'SELECT id, make, model, year, price_per_day, image_url FROM cars ORDER BY make, model'
        );
        const cars = result.rows.map((car) => ({
            car_id: car.id,
            make: car.make,
            model: car.model,
            year: car.year,
            price_per_day: parseFloat(car.price_per_day) || 0,
            image_url: car.image_url || '',
        }));
        callback(null, { cars });
    } catch (error) {
        console.error('Error listing cars:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = { listCars };
