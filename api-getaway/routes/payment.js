const { Router } = require('express');
const clients = require('../grpc-client');
const { grpcCall, grpcErrorToHttp } = require('../utils/promise-wraper');
const { authenticate } = require('../middleware/jwt-validator');

const router = Router();

// POST /api/payments
router.post('/', authenticate, async (req, res) => {
    const { rental_id, user_id, amount, currency } = req.body;
    if (!rental_id || !user_id || !amount || !currency)
        return res.status(400).json({ error: 'rental_id, user_id, amount and currency are required' });
    try {
        const result = await grpcCall(clients.payment, 'createPayment', { rental_id, user_id, amount, currency });
        res.status(201).json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// GET /api/payments/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const result = await grpcCall(clients.payment, 'getPayment', { payment_id: req.params.id });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// POST /api/payments/:id/refund
router.post('/:id/refund', authenticate, async (req, res) => {
    const { reason } = req.body;
    try {
        const result = await grpcCall(clients.payment, 'refundPayment', { payment_id: req.params.id, reason });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

module.exports = router;
