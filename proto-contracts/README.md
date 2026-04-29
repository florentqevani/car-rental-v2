# proto-contracts

Shared gRPC Protocol Buffer definitions used by all services.

## Overview

This package contains `.proto` files that define the gRPC service contracts between microservices, and an `index.js` registry that loads them using `@grpc/proto-loader`.

## Contents

| File | Service Contract |
|------|-----------------|
| `proto/auth.proto` | Authentication — register, login, validate token, create token |
| `proto/car.proto` | Car catalog — CRUD operations |
| `proto/payment.proto` | Payments — create, get, refund |
| `proto/rental.proto` | Rentals — create, get, list, update, delete, queue |
| `proto/user.proto` | Users — CRUD operations |

## Usage

```js
const protos = require('proto-contracts');
// protos.auth, protos.car, protos.payment, protos.rental, protos.user
```

## Dependencies

- `@grpc/grpc-js`
- `@grpc/proto-loader`
