const amqp = require('amqplib');
const pool = require('./db');

const QUEUE = 'reservation.create';
const RETRY_DELAY_MS = 5000;

// Create the tracking table if it doesn't exist yet (idempotent migration)
async function ensureTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS queued_reservations (
            id            UUID        PRIMARY KEY,
            user_id       INTEGER     NOT NULL,
            car_id        INTEGER     NOT NULL,
            start_date    DATE        NOT NULL,
            end_date      DATE        NOT NULL,
            queued_at     TIMESTAMPTZ,
            status        VARCHAR(20) DEFAULT 'pending',
            rejection_reason TEXT,
            rental_id     INTEGER,
            processed_at  TIMESTAMPTZ
        )
    `);
}

async function startConsumer() {
    try {
        await ensureTable();

        const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672');
        const ch = await conn.createChannel();
        await ch.assertQueue(QUEUE, { durable: true });
        ch.prefetch(1); // FIFO: process one message at a time

        console.log('[MQ] Consumer ready — listening on queue:', QUEUE);

        conn.on('error', (err) => console.warn('[MQ] Connection error:', err.message));
        conn.on('close', () => {
            console.warn('[MQ] Connection closed — reconnecting in 5s...');
            setTimeout(startConsumer, RETRY_DELAY_MS);
        });

        ch.consume(QUEUE, async (msg) => {
            if (!msg) return;
            let data;
            try {
                data = JSON.parse(msg.content.toString());
            } catch {
                console.error('[MQ] Invalid message, discarding');
                ch.nack(msg, false, false);
                return;
            }

            const { queue_id, user_id, car_id, start_date, end_date, queued_at } = data;

            try {
                // Upsert the tracking row so it's queryable immediately
                await pool.query(
                    `INSERT INTO queued_reservations (id, user_id, car_id, start_date, end_date, queued_at, status)
                     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
                     ON CONFLICT (id) DO NOTHING`,
                    [queue_id, user_id, car_id, start_date, end_date, queued_at || new Date()]
                );

                // FIFO conflict check: earlier messages are already committed to `rentals`
                const conflict = await pool.query(
                    `SELECT 1 FROM rentals
                     WHERE car_id = $1
                       AND NOT (end_date <= $2 OR start_date >= $3)
                     LIMIT 1`,
                    [car_id, start_date, end_date]
                );

                if (conflict.rows.length > 0) {
                    await pool.query(
                        `UPDATE queued_reservations
                         SET status = 'rejected',
                             rejection_reason = $1,
                             processed_at = NOW()
                         WHERE id = $2`,
                        ['Car is already booked for the selected dates.', queue_id]
                    );
                    console.log('[MQ] Reservation rejected (conflict), queue_id:', queue_id, 'user:', user_id);
                } else {
                    let rental_id;
                    try {
                        const result = await pool.query(
                            `INSERT INTO rentals (user_id, car_id, start_date, end_date)
                             VALUES ($1, $2, $3, $4) RETURNING id`,
                            [user_id, car_id, start_date, end_date]
                        );
                        rental_id = result.rows[0].id;
                    } catch (insertErr) {
                        // PostgreSQL exclusion constraint violation (23P01) or unique violation (23505)
                        if (insertErr.code === '23P01' || insertErr.code === '23505') {
                            await pool.query(
                                `UPDATE queued_reservations
                                 SET status = 'rejected',
                                     rejection_reason = $1,
                                     processed_at = NOW()
                                 WHERE id = $2`,
                                ['Car is already booked for the selected dates.', queue_id]
                            );
                            console.log('[MQ] Reservation rejected (DB constraint), queue_id:', queue_id, 'user:', user_id);
                            ch.ack(msg);
                            return;
                        }
                        throw insertErr;
                    }

                    await pool.query(
                        `UPDATE queued_reservations
                         SET status = 'confirmed',
                             rental_id = $1,
                             processed_at = NOW()
                         WHERE id = $2`,
                        [rental_id, queue_id]
                    );
                    console.log('[MQ] Reservation confirmed, rental_id:', rental_id, 'user:', user_id);
                }

                ch.ack(msg);
            } catch (err) {
                console.error('[MQ] Failed to process:', err.message);
                ch.nack(msg, false, msg.fields.redelivered === false);
            }
        });
    } catch (err) {
        console.warn('[MQ] Cannot connect to RabbitMQ:', err.message, '— retrying in 5s');
        setTimeout(startConsumer, RETRY_DELAY_MS);
    }
}

module.exports = { startConsumer };
