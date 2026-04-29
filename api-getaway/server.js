const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const { limiter } = require('./middleware/rate-limiter');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const carRoutes = require('./routes/cars');
const rentalRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payment');
const healthRoutes = require('./routes/health');

const app = express();

// Security headers
app.use(helmet());
app.use(cors());
app.disable('x-powered-by');

// Body parsing
app.use(express.json());

// Global rate limiter
app.use(limiter);

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(config.port, () => {
    console.log(`API Gateway running on port ${config.port} [${config.nodeEnv}]`);
});

function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down...`);
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
