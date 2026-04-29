function call(client, method, request) {
    return new Promise((resolve, reject) => {
        client[method](request, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

const GRPC_TO_HTTP = {
    0: 200, 1: 499, 2: 500, 3: 400, 4: 504, 5: 404,
    6: 409, 7: 403, 8: 429, 9: 412, 10: 409, 11: 400,
    12: 501, 13: 500, 14: 503, 15: 500, 16: 401,
};

function grpcStatus(err) {
    return GRPC_TO_HTTP[err.code] || 500;
}

module.exports = { call, grpcStatus };
