require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const mq = require('./mq');

const authRoutes = require('./routes/auth');
const carsRoutes = require('./routes/cars');
const reservationsRoutes = require('./routes/reservations');
const usersRoutes = require('./routes/users');
const paymentsRoutes = require('./routes/payments');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());

// Ensure uploads directory exists and serve it as static
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'web-bff', port: config.port }));

app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(config.port, () => {
    console.log(`web-bff listening on port ${config.port}`);
    mq.connect(); // Start RabbitMQ connection in background (non-blocking)
});

process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
});

module.exports = app;
