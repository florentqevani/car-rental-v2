const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const config = require('./config');
const { createPayment } = require('./handlers/create-payment');
const { getPayment } = require('./handlers/get-payment');
const { refundPayment } = require('./handlers/refund-payment');

const PROTO_PATH = path.join(__dirname, '../../proto-contracts/proto/payment.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const paymentProto = grpc.loadPackageDefinition(packageDefinition).proto.payment;

const server = new grpc.Server({
    'grpc.max_receive_message_length': 1024 * 1024 * 4,  // 4MB
    'grpc.max_send_message_length': 1024 * 1024 * 4,
    'grpc.keepalive_time_ms': 30000,
    'grpc.keepalive_timeout_ms': 5000,
});

server.addService(paymentProto.PaymentService.service, {
    createPayment,
    getPayment,
    refundPayment,
});

server.bindAsync(
    `0.0.0.0:${config.port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Error starting gRPC server:', err);
            process.exit(1);
        }
        console.log(`Payment gRPC server running on port ${port} [${config.nodeEnv}]`);
        server.start();
    }
);

function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down gRPC server...`);
    server.tryShutdown((err) => {
        if (err) {
            console.error('Error during graceful shutdown:', err);
            process.exit(1);
        }
        console.log('Server shut down gracefully');
        process.exit(0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
