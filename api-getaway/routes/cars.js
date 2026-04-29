const { Router } = require('express');
const clients = require('../grpc-client');
const { grpcCall, grpcErrorToHttp } = require('../utils/promise-wraper');
const { authenticate, requirePermission } = require('../middleware/jwt-validator');

const router = Router();

// GET /api/cars/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const result = await grpcCall(clients.car, 'getCar', { car_id: req.params.id });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// POST /api/cars (admin only)
router.post('/', authenticate, requirePermission('cars:write'), async (req, res) => {
    const { make, model, year } = req.body;
    if (!make || !model || !year)
        return res.status(400).json({ error: 'make, model and year are required' });
    try {
        const result = await grpcCall(clients.car, 'createCar', { make, model, year });
        res.status(201).json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// PUT /api/cars/:id (admin only)
router.put('/:id', authenticate, requirePermission('cars:write'), async (req, res) => {
    const { make, model, year } = req.body;
    try {
        const result = await grpcCall(clients.car, 'updateCar', { car_id: req.params.id, make, model, year });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// DELETE /api/cars/:id (admin only)
router.delete('/:id', authenticate, requirePermission('cars:delete'), async (req, res) => {
    try {
        const result = await grpcCall(clients.car, 'deleteCar', { car_id: req.params.id });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

module.exports = router;
