const pool = require('../db');
const grpc = require('@grpc/grpc-js');

async function createPayment(call, callback) {
    const { rental_id, user_id, amount, currency } = call.request;

    if (!rental_id || !user_id || !amount || !currency) {
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: 'rental_id, user_id, amount, and currency are required',
        });
    }
    if (amount <= 0) {
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: 'amount must be greater than zero',
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO payments (rental_id, user_id, amount, currency, status)
             VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
            [rental_id, user_id, amount, currency]
        );
        const payment_id = result.rows[0].id;
        console.log('Payment created:', payment_id);
        callback(null, {
            payment_id,
            status: 'pending',
            success: true,
            message: 'Payment created successfully',
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
}

module.exports = { createPayment };
