const { Router } = require('express');
const clients = require('../grpc-client');
const { grpcCall, grpcErrorToHttp } = require('../utils/promise-wraper');
const { authLimiter } = require('../middleware/rate-limiter');

const router = Router();

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'email and password are required' });
    try {
        const result = await grpcCall(clients.auth, 'loginUser', { email, password });
        res.json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'name, email and password are required' });
    try {
        const result = await grpcCall(clients.auth, 'registerUser', { name, email, password });
        res.status(201).json(result);
    } catch (err) {
        const { status, message } = grpcErrorToHttp(err);
        res.status(status).json({ error: message });
    }
});

module.exports = router;
