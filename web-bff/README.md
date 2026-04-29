# web-bff

Backend-for-Frontend (BFF) HTTP server that sits between the React frontend and the gRPC microservices. It also handles file uploads and publishes to RabbitMQ when the rental service is unavailable.

## HTTP Server

**Port:** `4000`

## REST Routes

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/login` | — | Login, returns `{accessToken, refreshToken, user}` |
| `POST` | `/register` | — | Register, returns `{accessToken, refreshToken, user}` |
| `POST` | `/logout` | — | Stateless JWT logout |
| `POST` | `/refresh` | — | Refresh token |
| `GET` | `/me` | Required | Current user profile |
| `PUT` | `/me` | Required | Update current user profile |

### Cars — `/api/cars`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | — | List all cars |
| `GET` | `/:id` | — | Get a car |
| `POST` | `/` | Admin | Create car (`multipart/form-data`, optional image) |
| `PUT` | `/:id` | Admin | Update car (`multipart/form-data`, optional image) |
| `DELETE` | `/:id` | Admin | Delete car |

### Reservations — `/api/reservations`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/booked/:carId` | — | Booked date ranges for a car |
| `GET` | `/mine` | Required | Current user's reservations (enriched with car name + image) |
| `GET` | `/` | Admin | All reservations (enriched with car name + user email) |
| `GET` | `/queued/:queueId` | — | Poll a queued reservation status |
| `GET` | `/:id` | Required | Get a reservation |
| `POST` | `/` | Required | Create reservation; queues to RabbitMQ if rental-service is down |
| `DELETE` | `/:id` | Required | Cancel reservation |
| `DELETE` | `/admin/:id` | Admin | Admin cancel |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Admin | List all users |
| `GET` | `/:id` | Required | Get user |
| `PUT` | `/:id` | Required | Update user |
| `DELETE` | `/:id` | Admin | Delete user |

### Static

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/uploads/*` | Serve uploaded car images |

## File Uploads

- **Engine:** Multer
- **Max size:** 5 MB
- **Allowed types:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- **Storage path:** `/app/web-bff/uploads` (Docker volume `uploads_data`)
- **URL format:** `/uploads/{timestamp}-{random}.{ext}`

## RabbitMQ Queue Fallback

When the rental-service returns gRPC status `14` (UNAVAILABLE), the BFF:
1. Publishes the reservation to queue `reservation.create`
2. Returns `HTTP 202` with `{queued: true, queue_id}`
3. The client polls `GET /api/reservations/queued/:queueId` until confirmed or rejected

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | HTTP server port |
| `JWT_SECRET` | — | JWT verification secret |
| `CORS_ORIGIN` | `http://localhost:3000,...` | Allowed CORS origins |
| `AUTH_SERVICE_URL` | `auth-service:50054` | Auth gRPC address |
| `USER_SERVICE_URL` | `user-service:50051` | User gRPC address |
| `CAR_SERVICE_URL` | `car-service:50053` | Car gRPC address |
| `RENTAL_SERVICE_URL` | `rental-service:50052` | Rental gRPC address |
| `PAYMENT_SERVICE_URL` | `payment-service:50055` | Payment gRPC address |
| `RABBITMQ_URL` | `amqp://admin:admin@rabbitmq:5672` | RabbitMQ AMQP URL |

## Tech Stack

- Node.js, Express
- gRPC (`@grpc/grpc-js`)
- Multer (file uploads)
- RabbitMQ (`amqplib`)
- `helmet`, `cors`, `jsonwebtoken`

## Running Locally

```bash
npm install
PORT=4000 JWT_SECRET=mysecret AUTH_SERVICE_URL=localhost:50054 \
  CAR_SERVICE_URL=localhost:50053 RENTAL_SERVICE_URL=localhost:50052 \
  RABBITMQ_URL=amqp://admin:admin@localhost:5672 node server.js
```
