const { Router } = require('express');
const clients = require('../grpc-client');
const { grpcCall, grpcErrorToHttp } = require('../utils/promise-wraper');
const { authenticate } = require('../middleware/jwt-validator');

const router = Router();

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const result = await grpcCall(clients.user, 'getUser', { user_id: req.params.id });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// PUT /api/users/:id
router.put('/:id', authenticate, async (req, res) => {
    const { email, name } = req.body;
    try {
        const result = await grpcCall(clients.user, 'updateUser', { user_id: req.params.id, email, name });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const result = await grpcCall(clients.user, 'deleteUser', { user_id: req.params.id });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

module.exports = router;
