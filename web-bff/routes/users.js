const express = require('express');
const clients = require('../grpc-clients');
const { call, grpcStatus } = require('../grpc-call');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users  — admin only
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await call(clients.user, 'listUsers', {});
        res.json((result.users || []).map((u) => ({
            id: u.user_id,
            full_name: u.name,
            email: u.email,
            role: u.role,
            created_at: u.created_at,
        })));
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const result = await call(clients.user, 'getUser', { user_id: req.params.id });
        res.json({ id: result.user_id, full_name: result.name, email: result.email, role: result.role });
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// PUT /api/users/:id
router.put('/:id', authenticate, async (req, res) => {
    try {
        await call(clients.user, 'updateUser', {
            user_id: req.params.id,
            email: req.body.email,
            name: req.body.full_name || req.body.name,
        });
        res.json({ success: true });
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// DELETE /api/users/:id — also cancels all reservations for the user
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        // Fetch all rentals for this user and cancel them
        const rentalsResult = await call(clients.rental, 'getRentalsByUser', { user_id: req.params.id }).catch(() => ({ rentals: [] }));
        const rentals = rentalsResult.rentals || [];
        await Promise.all(rentals.map(r => call(clients.rental, 'deleteRental', { rental_id: r.rental_id }).catch(() => { })));

        const result = await call(clients.user, 'deleteUser', { user_id: req.params.id });
        res.json(result);
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

module.exports = router;
