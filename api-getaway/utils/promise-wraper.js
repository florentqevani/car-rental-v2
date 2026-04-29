// Promisify a gRPC unary call
function grpcCall(client, method, request) {
    return new Promise((resolve, reject) => {
        client[method](request, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

// Map gRPC error codes to HTTP status codes
function grpcErrorToHttp(err) {
    const codeMap = {
        1: 500, // CANCELLED
        2: 500, // UNKNOWN
        3: 400, // INVALID_ARGUMENT
        4: 504, // DEADLINE_EXCEEDED
        5: 404, // NOT_FOUND
        6: 409, // ALREADY_EXISTS
        7: 403, // PERMISSION_DENIED
        8: 429, // RESOURCE_EXHAUSTED
        9: 409, // FAILED_PRECONDITION
        10: 409, // ABORTED
        13: 500, // INTERNAL
        14: 503, // UNAVAILABLE
        16: 401, // UNAUTHENTICATED
    };
    const status = codeMap[err.code] || 500;
    return { status, message: err.details || err.message || 'Internal server error' };
}

module.exports = { grpcCall, grpcErrorToHttp };
