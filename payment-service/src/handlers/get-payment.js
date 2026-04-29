const pool = require('../db');
const grpc = require('@grpc/grpc-js');

async function getPayment(call, callback) {
    const { payment_id } = call.request;

    if (!payment_id) {
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: 'payment_id is required',
        });
    }

    try {
        const result = await pool.query(
            'SELECT id, rental_id, user_id, amount, currency, status, created_at FROM payments WHERE id = $1',
            [payment_id]
        );
        const payment = result.rows[0];

        if (!payment) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: 'Payment not found',
            });
        }

        console.log('Payment fetched:', payment_id);
        callback(null, {
            payment_id: payment.id,
            rental_id: payment.rental_id,
            user_id: payment.user_id,
            amount: parseFloat(payment.amount),
            currency: payment.currency,
            status: payment.status,
            created_at: payment.created_at.toISOString(),
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
}

module.exports = { getPayment };
