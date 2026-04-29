const { createUsers } = require('./handlers/create-user');
const { getUsers } = require('./handlers/get-users');
const { updateUsers } = require('./handlers/update-users');
const { deleteUsers } = require('./handlers/delete-users');
const { listUsers } = require('./handlers/list-users');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const config = require('./config');


const PROTO_PATH = path.join(__dirname, '../../proto-contracts/proto/user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const userProto = grpc.loadPackageDefinition(packageDefinition).proto.user;

const server = new grpc.Server();
server.addService(userProto.UserService.service, { listUsers, createUser: createUsers, getUser: getUsers, updateUser: updateUsers, deleteUser: deleteUsers });

server.bindAsync(`0.0.0.0:${config.port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Error starting gRPC server:', err);
        return;
    }
    console.log(`gRPC server running at http://0.0.0.0:${port}`);
    server.start();
});