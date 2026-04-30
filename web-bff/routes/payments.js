'use strict';

const express = require('express');
const { randomUUID } = require('crypto');
const clients = require('../grpc-clients');
const { call, grpcStatus } = require('../grpc-call');
const rai = require('../raiaccept');
const { authenticate } = require('../middleware/auth');
const mq = require('../mq');
const config = require('../config');

const router = express.Router();

// Statuses that mean the consumer was charged successfully
const PAID_STATUSES = new Set(['SUCCESS', 'PAID']);

// RaiAccept only allows Unicode letters, space, ` ' . - in name fields
function sanitizeName(str) {
    return (str || '').replace(/[^\p{L}`' .-]/gu, '').trim() || 'Guest';
}

// ─── POST /api/payments/initiate ─────────────────────────────────────────────
// Authenticates with RaiAccept, creates an order + payment session,
// and returns the hosted payment form URL to the frontend.
router.post('/initiate', authenticate, async (req, res) => {
    const { car_id, pickup_date, return_date, amount, currency = 'EUR' } = req.body;

    if (!car_id || !pickup_date || !return_date || !amount) {
        return res.status(400).json({
            error: 'car_id, pickup_date, return_date, and amount are required',
        });
    }

    try {
        const token = await rai.authenticate();
        const merchantOrderReference = randomUUID();

        const appUrl = config.raiaccept.appUrl;
        const webhookUrl = config.raiaccept.webhookUrl;

        const orderPayload = {
            merchantOrderReference,
            amount,
            currency,
            description: `Car rental (${pickup_date} → ${return_date})`,
            successUrl: `${appUrl}/confirmation/pending`,
            failUrl: `${appUrl}/checkout/${car_id}?pickup=${pickup_date}&return=${return_date}&error=payment_failed`,
            cancelUrl: `${appUrl}/checkout/${car_id}?pickup=${pickup_date}&return=${return_date}`,
            notificationUrl: `${webhookUrl}/api/payments/webhook`,
            consumer: {
                email: req.user.email || '',
                firstName: sanitizeName((req.user.name || '').split(' ')[0]),
                lastName: sanitizeName((req.user.name || '').split(' ').slice(1).join(' ')),
            },
        };

        const order = await rai.createOrderEntry(token, orderPayload);
        const orderIdentification = order.orderIdentification;

        const session = await rai.createPaymentSession(token, orderIdentification, orderPayload);

        res.json({
            paymentFormUrl: session.paymentRedirectURL,
            raiOrderId: orderIdentification,
        });
    } catch (err) {
        console.error('[payments/initiate]', err.message);
        res.status(502).json({ error: 'Could not initiate payment. Please try again.' });
    }
});

// ─── POST /api/payments/confirm ──────────────────────────────────────────────
// Called after the RaiAccept iframe reports success via postMessage.
// Verifies the payment with RaiAccept, then creates the rental + payment record.
router.post('/confirm', authenticate, async (req, res) => {
    const { raiOrderId, car_id, pickup_date, return_date, amount, currency = 'EUR' } = req.body;

    if (!raiOrderId || !car_id || !pickup_date || !return_date || !amount) {
        return res.status(400).json({
            error: 'raiOrderId, car_id, pickup_date, return_date, and amount are required',
        });
    }

    try {
        // 1. Verify payment status with RaiAccept
        const token = await rai.authenticate();
        const orderDetails = await rai.getOrderDetails(token, raiOrderId);

        if (!PAID_STATUSES.has(orderDetails.status)) {
            return res.status(402).json({
                error: `Payment not confirmed. RaiAccept order status: ${orderDetails.status}`,
            });
        }

        // 2. Create rental (with MQ fallback if rental-service is down)
        const rentalPayload = {
            user_id: req.user.user_id,
            car_id,
            start_date: pickup_date,
            end_date: return_date,
        };

        let rental = null;
        let queued = false;
        let queueId = null;

        try {
            rental = await call(clients.rental, 'createRental', rentalPayload);
        } catch (rentalErr) {
            if (rentalErr.code === 14) {
                // gRPC UNAVAILABLE — queue the reservation
                queueId = randomUUID();
                await mq.publish({ ...rentalPayload, queue_id: queueId, queued_at: new Date().toISOString() });
                queued = true;
            } else {
                throw rentalErr;
            }
        }

        // 3. Record payment in the payment-service DB
        const rentalId = queued ? queueId : rental.rental_id;
        try {
            await call(clients.payment, 'createPayment', {
                rental_id: rentalId,
                user_id: req.user.user_id,
                amount: parseFloat(amount),
                currency,
            });
        } catch (payErr) {
            // Non-fatal — rental was created successfully; log and continue
            console.error('[payments/confirm] payment record failed:', payErr.message);
        }

        // 4. Respond
        if (queued) {
            return res.status(202).json({
                queued: true,
                queue_id: queueId,
                message: 'Your reservation has been queued and will be confirmed once the service is back online.',
            });
        }

        res.status(201).json({ id: rental.rental_id });
    } catch (err) {
        console.error('[payments/confirm]', err.message);
        res.status(502).json({ error: err.message });
    }
});

// ─── POST /api/payments/webhook ──────────────────────────────────────────────
// RaiAccept notification endpoint. Responds 200 immediately (idempotent).
// The frontend postMessage flow is the primary confirmation path; this is a
// server-side fallback for retries.
router.post('/webhook', (req, res) => {
    console.log('[payments/webhook] notification received:', JSON.stringify(req.body));
    res.sendStatus(200);
});

module.exports = router;
