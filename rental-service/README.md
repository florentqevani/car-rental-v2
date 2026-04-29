# rental-service

Manages car rental bookings via gRPC, with a RabbitMQ-backed queue fallback for high-availability reservation processing.

## gRPC Server

**Port:** `50052`

### Methods

| Method | Request | Response | Description |
|--------|---------|----------|-------------|
| `CreateRental` | `{user_id, car_id, start_date, end_date}` | `{rental_id, success}` | Book a car |
| `GetRental` | `{rental_id}` | `{rental}` | Get a booking |
| `GetRentalsByUser` | `{user_id}` | `{rentals[]}` | All bookings for a user |
| `GetBookedDates` | `{car_id}` | `{dates[]}` | Blocked date ranges for a car |
| `ListRentals` | `{}` | `{rentals[]}` | All bookings (admin) |
| `UpdateRental` | `{rental_id, start_date, end_date}` | `{rental}` | Modify dates |
| `DeleteRental` | `{rental_id}` | `{success}` | Cancel a booking |
| `GetQueuedReservation` | `{queue_id}` | `{status, rental_id}` | Poll a queued booking |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `50052` | gRPC server port |
| `DB_URL` | — | PostgreSQL connection string |
| `RABBITMQ_URL` | — | RabbitMQ AMQP URL |

## Database

**Database:** `rental_service_db`

| Table | Key Columns |
|-------|-------------|
| `rentals` | `id` (UUID), `user_id`, `car_id`, `start_date`, `end_date` |
| `queued_reservations` | `id`, `user_id`, `car_id`, `start_date`, `end_date`, `status` (`pending`/`confirmed`/`rejected`), `rental_id` |

Indexes on `user_id` and `car_id`.

## Queue Fallback

- Listens to RabbitMQ queue `reservation.create`
- Prefetch = 1 (FIFO processing)
- When a reservation is processed from the queue, `queued_reservations.status` is updated
- Clients poll `GetQueuedReservation` with the `queue_id` returned at booking time

## Tech Stack

- Node.js, gRPC (`@grpc/grpc-js`)
- PostgreSQL (`pg`)
- RabbitMQ (`amqplib`)

## Running Locally

```bash
npm install
PORT=50052 DB_URL=postgresql://postgres:password@localhost:5432/rental_service_db RABBITMQ_URL=amqp://admin:admin@localhost:5672 node src/server.js
```
