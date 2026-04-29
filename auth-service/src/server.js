const { login } = require('./handlers/login');
const { register } = require('./handlers/register');
const { validateToken } = require('./handlers/validate');
const { permissions } = require('./permissions');
const { createToken } = require('./handlers/token');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto-contracts/proto/auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const authProto = grpc.loadPackageDefinition(packageDefinition).proto.auth;

const server = new grpc.Server();
server.addService(authProto.AuthService.service, { loginUser: login, registerUser: register, validateToken, createToken });

const PORT = process.env.PORT || 50054;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Server binding error:', err);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
    server.start();
});

