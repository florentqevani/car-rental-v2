const express = require('express');
const { randomUUID } = require('crypto');
const clients = require('../grpc-clients');
const { call, grpcStatus } = require('../grpc-call');
const { authenticate, requireAdmin } = require('../middleware/auth');
const mq = require('../mq');

const router = express.Router();

function mapRental(r) {
    return {
        id: r.rental_id,
        car_id: r.car_id,
        user_id: r.user_id,
        pickup_date: r.start_date,
        return_date: r.end_date,
        start_date: r.start_date,
        end_date: r.end_date,
    };
}

// GET /api/reservations/booked/:carId — public: blocked dates
router.get('/booked/:carId', async (req, res) => {
    try {
        const result = await call(clients.rental, 'getBookedDates', { car_id: req.params.carId });
        res.json(result.dates || []);
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// GET /api/reservations/mine — authenticated user's own reservations
router.get('/mine', authenticate, async (req, res) => {
    try {
        const result = await call(clients.rental, 'getRentalsByUser', { user_id: req.user.user_id });
        const rentals = result.rentals || [];

        const uniqueCarIds = [...new Set(rentals.map(r => r.car_id))];
        const cars = await Promise.all(
            uniqueCarIds.map(id => call(clients.car, 'getCar', { car_id: id }).catch(() => ({ car_id: id })))
        );
        const carMap = Object.fromEntries(cars.map(c => [String(c.car_id), c]));

        res.json(rentals.map(r => ({
            ...mapRental(r),
            car_name: carMap[String(r.car_id)]
                ? `${carMap[String(r.car_id)].make || ''} ${carMap[String(r.car_id)].model || ''}`.trim()
                : r.car_id,
            car_image_url: carMap[String(r.car_id)]?.image_url || '',
        })));
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// GET /api/reservations  — admin: all reservations (enriched with car name + user email)
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await call(clients.rental, 'listRentals', {});
        const rentals = result.rentals || [];

        // Fetch unique cars and users in parallel
        const uniqueCarIds = [...new Set(rentals.map(r => r.car_id))];
        const uniqueUserIds = [...new Set(rentals.map(r => r.user_id))];

        const [cars, users] = await Promise.all([
            Promise.all(uniqueCarIds.map(id => call(clients.car, 'getCar', { car_id: id }).catch(() => ({ car_id: id, name: id })))),
            Promise.all(uniqueUserIds.map(id => call(clients.user, 'getUser', { user_id: id }).catch(() => ({ user_id: id, email: id })))),
        ]);

        const carMap = Object.fromEntries(cars.map(c => [String(c.car_id), c.make && c.model ? `${c.make} ${c.model}` : String(c.car_id)]));
        const userMap = Object.fromEntries(users.map(u => [String(u.user_id), u.email || String(u.user_id)]));

        res.json(rentals.map(r => ({
            ...mapRental(r),
            car_name: carMap[String(r.car_id)] || r.car_id,
            user_email: userMap[String(r.user_id)] || r.user_id,
        })));
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// GET /api/reservations/queued/:queueId — poll status of a queued reservation
router.get('/queued/:queueId', authenticate, async (req, res) => {
    try {
        const result = await call(clients.rental, 'getQueuedReservation', { queue_id: req.params.queueId });
        res.json(result);
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// GET /api/reservations/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const result = await call(clients.rental, 'getRental', { rental_id: req.params.id });
        res.json(mapRental(result));
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// POST /api/reservations
router.post('/', authenticate, async (req, res) => {
    const payload = {
        user_id: req.user.user_id,
        car_id: req.body.car_id,
        start_date: req.body.pickup_date || req.body.start_date,
        end_date: req.body.return_date || req.body.end_date,
    };
    try {
        const result = await call(clients.rental, 'createRental', payload);
        res.status(201).json({ id: result.rental_id, success: result.success });
    } catch (err) {
        // gRPC UNAVAILABLE (14) — rental-service is down; queue the reservation
        if (err.code === 14) {
            try {
                const queue_id = randomUUID();
                await mq.publish({ ...payload, queue_id, queued_at: new Date().toISOString() });
                return res.status(202).json({
                    queued: true,
                    queue_id,
                    message: 'The reservation service is temporarily unavailable. Your reservation has been queued and will be confirmed automatically once the service is back online.',
                });
            } catch (mqErr) {
                console.error('[reservations] MQ publish failed:', mqErr.message);
                return res.status(503).json({ error: 'Reservation service unavailable. Please try again later.' });
            }
        }
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// DELETE /api/reservations/:id  — user cancel
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const result = await call(clients.rental, 'deleteRental', { rental_id: req.params.id });
        res.json(result);
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// DELETE /api/reservations/admin/:id  — admin cancel
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await call(clients.rental, 'deleteRental', { rental_id: req.params.id });
        res.json(result);
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

module.exports = router;
