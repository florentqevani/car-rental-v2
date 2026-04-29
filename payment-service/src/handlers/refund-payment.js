const pool = require('../db');
const grpc = require('@grpc/grpc-js');

async function refundPayment(call, callback) {
    const { payment_id, reason } = call.request;

    if (!payment_id) {
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: 'payment_id is required',
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Lock the row to prevent double-refund race conditions
        const paymentResult = await client.query(
            'SELECT id, status FROM payments WHERE id = $1 FOR UPDATE',
            [payment_id]
        );
        const payment = paymentResult.rows[0];

        if (!payment) {
            await client.query('ROLLBACK');
            return callback({ code: grpc.status.NOT_FOUND, message: 'Payment not found' });
        }

        if (payment.status === 'refunded') {
            await client.query('ROLLBACK');
            return callback({
                code: grpc.status.FAILED_PRECONDITION,
                message: 'Payment has already been refunded',
            });
        }

        if (payment.status !== 'completed') {
            await client.query('ROLLBACK');
            return callback({
                code: grpc.status.FAILED_PRECONDITION,
                message: `Cannot refund a payment with status '${payment.status}'`,
            });
        }

        await client.query(
            'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
            ['refunded', payment_id]
        );

        const refundResult = await client.query(
            'INSERT INTO refunds (payment_id, reason) VALUES ($1, $2) RETURNING id',
            [payment_id, reason || null]
        );

        await client.query('COMMIT');

        const refund_id = refundResult.rows[0].id;
        console.log('Payment refunded:', payment_id, '-> refund:', refund_id);
        callback(null, {
            refund_id,
            success: true,
            message: 'Payment refunded successfully',
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error refunding payment:', error);
        callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    } finally {
        client.release();
    }
}

module.exports = { refundPayment };
