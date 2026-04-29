const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const config = require('./config');

const PROTO_BASE = path.join(__dirname, '../proto-contracts/proto');
const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

function loadProto(file) {
    const def = protoLoader.loadSync(path.join(PROTO_BASE, file), loaderOptions);
    return grpc.loadPackageDefinition(def);
}

const authPkg = loadProto('auth.proto').proto.auth;
const userPkg = loadProto('user.proto').proto.user;
const carPkg = loadProto('car.proto').proto.car;
const rentalPkg = loadProto('rental.proto').proto.rental;
const paymentPkg = loadProto('payment.proto').proto.payment;

const creds = grpc.credentials.createInsecure();
const channelOpts = {
    'grpc.keepalive_time_ms': 30000,
    'grpc.keepalive_timeout_ms': 5000,
    'grpc.keepalive_permit_without_calls': 1,
};

const clients = {
    auth: new authPkg.AuthService(config.services.auth, creds, channelOpts),
    user: new userPkg.UserService(config.services.user, creds, channelOpts),
    car: new carPkg.CarService(config.services.car, creds, channelOpts),
    rental: new rentalPkg.RentalService(config.services.rental, creds, channelOpts),
    payment: new paymentPkg.PaymentService(config.services.payment, creds, channelOpts),
};

module.exports = clients;
