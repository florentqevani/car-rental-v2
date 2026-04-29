const pool = require('../db');

async function getBookedDates(call, callback) {
    const { car_id } = call.request;
    try {
        const result = await pool.query(
            "SELECT start_date, end_date FROM rentals WHERE car_id = $1 AND end_date >= NOW()::date",
            [car_id]
        );
        const dates = [];
        for (const row of result.rows) {
            const start = new Date(row.start_date);
            const end = new Date(row.end_date);
            const d = new Date(start);
            while (d < end) {
                dates.push(d.toISOString().split('T')[0]);
                d.setDate(d.getDate() + 1);
            }
        }
        callback(null, { dates });
    } catch (error) {
        console.error('Error fetching booked dates:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

module.exports = { getBookedDates };
