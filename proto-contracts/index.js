const path = require('path');

module.exports = {
    auth: {
        protoPath: path.join(__dirname, 'proto/auth.proto'),
        packageName: 'auth',
        serviceName: 'AuthService',
    },
    car: {
        protoPath: path.join(__dirname, 'proto/car.proto'),
        packageName: 'car',
        serviceName: 'CarService',
    },
    rental: {
        protoPath: path.join(__dirname, 'proto/rental.proto'),
        packageName: 'rental',
        serviceName: 'RentalService',
    },
    user: {
        protoPath: path.join(__dirname, 'proto/user.proto'),
        packageName: 'user',
        serviceName: 'UserService',
    },
    payment: {
        protoPath: path.join(__dirname, 'proto/payment.proto'),
        packageName: 'payment',
        serviceName: 'PaymentService',
    },
};