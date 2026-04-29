const express = require('express');
const path = require('path');
const multer = require('multer');
const clients = require('../grpc-clients');
const { call, grpcStatus } = require('../grpc-call');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer — save uploaded images to /app/web-bff/uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    },
});

function mapCar(c) {
    return {
        id: c.car_id,
        make: c.make,
        model: c.model,
        year: c.year,
        price: c.price_per_day,
        name: `${c.make} ${c.model} (${c.year})`,
        image_url: c.image_url || '',
    };
}

// GET /api/cars
router.get('/', async (req, res) => {
    try {
        const result = await call(clients.car, 'listCars', {});
        res.json((result.cars || []).map(mapCar));
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// GET /api/cars/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await call(clients.car, 'getCar', { car_id: req.params.id });
        res.json(mapCar(result));
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// POST /api/cars  — admin only, accepts multipart/form-data or JSON
router.post('/', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || '');
        const result = await call(clients.car, 'createCar', {
            make: req.body.make,
            model: req.body.model,
            year: parseInt(req.body.year),
            price_per_day: parseFloat(req.body.price || req.body.price_per_day) || 0,
            image_url,
        });
        res.status(201).json({ id: result.car_id, success: result.success });
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// PUT /api/cars/:id  — admin only, accepts multipart/form-data or JSON
router.put('/:id', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || '');
        const result = await call(clients.car, 'updateCar', {
            car_id: req.params.id,
            make: req.body.make,
            model: req.body.model,
            year: parseInt(req.body.year),
            price_per_day: parseFloat(req.body.price || req.body.price_per_day) || 0,
            image_url,
        });
        res.json(result);
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

// DELETE /api/cars/:id  — admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await call(clients.car, 'deleteCar', { car_id: req.params.id });
        res.json(result);
    } catch (err) {
        res.status(grpcStatus(err)).json({ error: err.message });
    }
});

module.exports = router;
