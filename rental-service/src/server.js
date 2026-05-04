const { getRental } = require('./handlers/get-reservations');
const { createRental } = require('./handlers/create-rental');
const { updateRental } = require('./handlers/update-reservations');
const { deleteRental } = require('./handlers/delete-reservations');
const { getRentalsByUser } = require('./handlers/get-rentals-by-user');
const { getBookedDates } = require('./handlers/get-booked-dates');
const { listRentals } = require('./handlers/list-rentals');
const { getQueuedReservation } = require('./handlers/get-queued-reservation');
const { getQueuedReservationsByUser } = require('./handlers/get-queued-reservations-by-user');
const { startConsumer } = require('./mq-consumer');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const config = require('./config');

const PROTO_PATH = path.join(__dirname, '../../proto-contracts/proto/rental.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const rentalProto = grpc.loadPackageDefinition(packageDefinition).proto.rental;
const server = new grpc.Server();
server.addService(rentalProto.RentalService.service, {
    getRental, createRental, updateRental, deleteRental,
    getRentalsByUser, getBookedDates, listRentals, getQueuedReservation, getQueuedReservationsByUser,
});

server.bindAsync(`0.0.0.0:${config.port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Error starting gRPC server:', err);
        return;
    }
    console.log(`gRPC server running on port ${port}`);
    server.start();
    startConsumer(); // Begin consuming queued reservations from RabbitMQ
});
