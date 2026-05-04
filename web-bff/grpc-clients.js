const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const config = require('./config');

const PROTO_BASE = path.join(__dirname, '../proto-contracts/proto');

function loadProto(filename) {
    return protoLoader.loadSync(path.join(PROTO_BASE, filename), {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });
}

const authDef = grpc.loadPackageDefinition(loadProto('auth.proto')).proto.auth;
const userDef = grpc.loadPackageDefinition(loadProto('user.proto')).proto.user;
const carDef = grpc.loadPackageDefinition(loadProto('car.proto')).proto.car;
const rentalDef = grpc.loadPackageDefinition(loadProto('rental.proto')).proto.rental;

const creds = grpc.credentials.createInsecure();

const clients = {
    auth: new authDef.AuthService(config.services.auth, creds),
    user: new userDef.UserService(config.services.user, creds),
    car: new carDef.CarService(config.services.car, creds),
    rental: new rentalDef.RentalService(config.services.rental, creds),
};

module.exports = clients;
