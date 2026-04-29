const express = require('express');
const clients = require('../grpc-clients');
const { call, grpcStatus } = require('../grpc-call');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const result = await call(clients.auth, 'loginUser', {
            email: req.body.email,
            password: req.body.password,
        });
        if (!result.token) {
            return res.status(401).json({ error: result.message || 'Login failed' });
        }
        res.json({
            accessToken: result.token,
            refreshToken: result.token, // single JWT architecture — same token used for refresh
            user: {
                id: result.user_id,
                name: result.name,
                email: result.email,
                role: result.role,
            },
        });
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const result = await call(clients.auth, 'registerUser', {
            email: req.body.email,
            password: req.body.password,
            name: req.body.full_name || req.body.name,
        });
        if (!result.token) {
            return res.status(400).json({ error: result.message || 'Registration failed' });
        }
        res.status(201).json({
            accessToken: result.token,
            refreshToken: result.token,
            user: {
                id: result.user_id,
                name: result.name,
                email: result.email,
                role: result.role,
            },
        });
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // JWT is stateless — just confirm
    res.json({ success: true });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    const token = req.body.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });
    try {
        const result = await call(clients.auth, 'validateToken', { token });
        if (!result.valid) return res.status(401).json({ error: 'Invalid token' });
        // Re-issue via createToken
        const newToken = await call(clients.auth, 'createToken', {
            user_id: result.user_id,
            role: result.role,
        });
        res.json({ accessToken: newToken.token, refreshToken: newToken.token });
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// GET /api/auth/me  — returns current user from token
router.get('/me', async (req, res) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const validated = await call(clients.auth, 'validateToken', { token });
        if (!validated.valid) return res.status(401).json({ error: 'Invalid token' });

        const user = await call(clients.user, 'getUser', { user_id: validated.user_id });
        res.json({
            id: user.user_id,
            name: user.name,
            full_name: user.name,
            email: user.email,
            role: user.role || validated.role,
            has_password: true,
        });
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// PUT /api/auth/me  — update own profile
router.put('/me', async (req, res) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const validated = await call(clients.auth, 'validateToken', { token });
        if (!validated.valid) return res.status(401).json({ error: 'Invalid token' });

        await call(clients.user, 'updateUser', {
            user_id: validated.user_id,
            email: req.body.email,
            name: req.body.full_name || req.body.name,
        });
        const updated = await call(clients.user, 'getUser', { user_id: validated.user_id });
        res.json({
            id: updated.user_id,
            name: updated.name,
            full_name: updated.name,
            email: updated.email,
            role: updated.role || validated.role,
        });
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

module.exports = router;
