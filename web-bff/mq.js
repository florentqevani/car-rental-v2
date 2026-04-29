const amqp = require('amqplib');

const QUEUE = 'reservation.create';
const RETRY_DELAY_MS = 5000;

let channel = null;
let connecting = false;

async function connect() {
    if (connecting) return;
    connecting = true;
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672');
        channel = await conn.createChannel();
        await channel.assertQueue(QUEUE, { durable: true });
        console.log('[MQ] Connected to RabbitMQ');
        conn.on('error', (err) => {
            console.warn('[MQ] Connection error:', err.message);
            channel = null;
        });
        conn.on('close', () => {
            console.warn('[MQ] Connection closed — reconnecting in 5s...');
            channel = null;
            connecting = false;
            setTimeout(connect, RETRY_DELAY_MS);
        });
    } catch (err) {
        console.warn('[MQ] Cannot connect to RabbitMQ:', err.message, '— retrying in 5s');
        channel = null;
        connecting = false;
        setTimeout(connect, RETRY_DELAY_MS);
    }
}

async function publish(data) {
    if (!channel) {
        // Try an immediate reconnect before giving up
        await connect();
        if (!channel) throw new Error('Message broker unavailable');
    }
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(data)), { persistent: true });
}

module.exports = { connect, publish, QUEUE };
