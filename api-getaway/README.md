# api-gateway

REST API gateway that translates HTTP requests into gRPC calls to backend services. Includes JWT validation, rate limiting, and CORS/security headers.

## HTTP Server

**Port:** `3001` (host) → `3000` (container)

## REST Routes

### Auth — `/api/auth` (rate-limited: 20 req / 15 min)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | — | Login |
| `POST` | `/api/auth/register` | — | Register |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users/:id` | Required | Get user |
| `PUT` | `/api/users/:id` | Required | Update user |
| `DELETE` | `/api/users/:id` | Required | Delete user |

### Cars — `/api/cars`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/cars/:id` | Required | Get car |
| `POST` | `/api/cars` | `cars:write` | Create car |
| `PUT` | `/api/cars/:id` | `cars:write` | Update car |
| `DELETE` | `/api/cars/:id` | `cars:delete` | Delete car |

### Rentals — `/api/rentals`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/rentals` | Required | Create rental |
| `GET` | `/api/rentals/:id` | Required | Get rental |
| `PUT` | `/api/rentals/:id` | Required | Update rental |
| `DELETE` | `/api/rentals/:id` | Required | Cancel rental |

### Payments — `/api/payments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/payments` | Required | Create payment |
| `GET` | `/api/payments/:id` | Required | Get payment |
| `POST` | `/api/payments/:id/refund` | Required | Refund payment |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `NODE_ENV` | `development` | Runtime environment |
| `AUTH_SERVICE_URL` | `auth-service:50054` | Auth gRPC address |
| `USER_SERVICE_URL` | `user-service:50051` | User gRPC address |
| `CAR_SERVICE_URL` | `car-service:50053` | Car gRPC address |
| `RENTAL_SERVICE_URL` | `rental-service:50052` | Rental gRPC address |
| `PAYMENT_SERVICE_URL` | `payment-service:50055` | Payment gRPC address |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

## Middleware

- **Helmet** — Security headers
- **CORS** — Cross-origin resource sharing
- **JWT Validator** — `authenticate` and `requirePermission` on protected routes
- **Rate Limiter** — Global: 100 req/15 min; Auth routes: 20 req/15 min

## Tech Stack

- Node.js, Express
- gRPC (`@grpc/grpc-js`)
- `helmet`, `cors`, `express-rate-limit`

## Running Locally

```bash
npm install
PORT=3000 AUTH_SERVICE_URL=localhost:50054 USER_SERVICE_URL=localhost:50051 \
  CAR_SERVICE_URL=localhost:50053 RENTAL_SERVICE_URL=localhost:50052 \
  PAYMENT_SERVICE_URL=localhost:50055 node server.js
```
