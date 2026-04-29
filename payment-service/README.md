# payment-service

Handles payment creation and refunds via gRPC.

## gRPC Server

**Port:** `50055`

### Methods

| Method | Request | Response | Description |
|--------|---------|----------|-------------|
| `CreatePayment` | `{rental_id, user_id, amount, currency}` | `{payment}` | Create a payment record |
| `GetPayment` | `{payment_id}` | `{payment}` | Get payment details |
| `RefundPayment` | `{payment_id, reason}` | `{success}` | Refund a payment |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `50055` | gRPC server port |
| `DB_URL` | — | PostgreSQL connection string |
| `NODE_ENV` | `development` | Runtime environment |
| `DB_POOL_MAX` | `10` | Max DB pool connections |
| `DB_IDLE_TIMEOUT_MS` | `30000` | Pool idle timeout (ms) |
| `DB_CONNECTION_TIMEOUT_MS` | `2000` | Pool connection timeout (ms) |

## Database

**Database:** `payment_service_db`

| Table | Key Columns |
|-------|-------------|
| `payments` | `id` (UUID), `rental_id`, `user_id`, `amount` (> 0), `currency` (default `USD`), `status` (`pending`/`completed`/`refunded`/`failed`) |
| `refunds` | `id` (UUID), `payment_id` (FK), `reason` (text) |

Indexes on `rental_id`, `user_id`, and `status`.

## Tech Stack

- Node.js, gRPC (`@grpc/grpc-js`)
- PostgreSQL (`pg`)

## Running Locally

```bash
npm install
PORT=50055 DB_URL=postgresql://postgres:password@localhost:5432/payment_service_db node src/server.js
```
