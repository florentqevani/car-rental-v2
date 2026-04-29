const { getCar } = require('./handlers/get-car');
const { listCars } = require('./handlers/list-cars');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { updateCar } = require('./handlers/update-car');
const { deleteCar } = require('./handlers/delete-car');

const PROTO_PATH = path.join(__dirname, '../../proto-contracts/proto/car.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const carProto = grpc.loadPackageDefinition(packageDefinition).proto.car;

async function createCar(call, callback) {
    const pool = require('./db');
    const { make, model, year, price_per_day, image_url } = call.request;
    try {
        const result = await pool.query(
            'INSERT INTO cars (make, model, year, price_per_day, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [make, model, year, price_per_day || 0, image_url || '']
        );
        callback(null, { car_id: result.rows[0].id, success: true, message: 'Car created' });
    } catch (error) {
        console.error('Error creating car:', error);
        callback({ code: 500, message: 'Internal server error' });
    }
}

const server = new grpc.Server();
server.addService(carProto.CarService.service, { listCars, getCar, createCar, updateCar, deleteCar });

const PORT = process.env.PORT || 50053;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Error starting gRPC server:', err);
        return;
    }
    console.log(`gRPC server running on port ${port}`);
    server.start();
});