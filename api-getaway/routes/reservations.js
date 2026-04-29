const { Router } = require('express');
const clients = require('../grpc-client');
const { grpcCall, grpcErrorToHttp } = require('../utils/promise-wraper');
const { authenticate } = require('../middleware/jwt-validator');

const router = Router();

// POST /api/rentals
router.post('/', authenticate, async (req, res) => {
    const { user_id, car_id, start_date, end_date } = req.body;
    if (!user_id || !car_id || !start_date || !end_date)
        return res.status(400).json({ error: 'user_id, car_id, start_date and end_date are required' });
    try {
        const result = await grpcCall(clients.rental, 'createRental', { user_id, car_id, start_date, end_date });
        res.status(201).json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// GET /api/rentals/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const result = await grpcCall(clients.rental, 'getRental', { rental_id: req.params.id });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// PUT /api/rentals/:id
router.put('/:id', authenticate, async (req, res) => {
    const { start_date, end_date } = req.body;
    try {
        const result = await grpcCall(clients.rental, 'updateRental', { rental_id: req.params.id, start_date, end_date });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// DELETE /api/rentals/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const result = await grpcCall(clients.rental, 'deleteRental', { rental_id: req.params.id });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

module.exports = router;
