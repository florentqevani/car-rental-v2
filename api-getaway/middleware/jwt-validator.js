const clients = require('../grpc-client');
const { grpcCall } = require('../utils/promise-wraper');

async function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const result = await grpcCall(clients.auth, 'validateToken', { token });
        if (!result.valid) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = { permissions: result.permissions || [] };
        next();
    } catch (err) {
        console.error('Token validation error:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions.includes(permission)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

module.exports = { authenticate, requirePermission };
