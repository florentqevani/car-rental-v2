# Car Rental Platform

A full-stack car rental application built with a microservices architecture. Services communicate over gRPC, the frontend talks to a BFF over REST, and RabbitMQ provides resilience for the reservation flow.

## Architecture

```
Browser
  │
  ▼
web-frontend (React + nginx :80)
  │  REST /api/*
  ▼
web-bff (Express :4000)
  │  gRPC
  ├──► auth-service   :50054
  ├──► user-service   :50051
  ├──► car-service    :50053
  ├──► rental-service :50052 ──► RabbitMQ (fallback queue)
  └──► payment-service :50055
           │
           ▼
       PostgreSQL :5432
```

A second, independent `api-gateway` (Express :3001) exposes the same gRPC services over REST for direct API consumers or third-party integrations.

## Services

| Service | Port | README | Description |
|---------|------|--------|-------------|
| [web-frontend](web-frontend/) | `80` | [README](web-frontend/README.md) | React SPA served by nginx |
| [web-bff](web-bff/) | `4000` | [README](web-bff/README.md) | BFF for the frontend |
| [api-gateway](api-getaway/) | `3001` | [README](api-getaway/README.md) | General-purpose REST → gRPC gateway |
| [auth-service](auth-service/) | `50054` (gRPC) | [README](auth-service/README.md) | Registration, login, JWT |
| [user-service](user-service/) | `50051` (gRPC) | [README](user-service/README.md) | User CRUD |
| [car-service](car-service/) | `50053` (gRPC) | [README](car-service/README.md) | Car catalog |
| [rental-service](rental-service/) | `50052` (gRPC) | [README](rental-service/README.md) | Reservations + queue fallback |
| [payment-service](payment-service/) | `50055` (gRPC) | [README](payment-service/README.md) | Payments and refunds |
| [proto-contracts](proto-contracts/) | — | [README](proto-contracts/README.md) | Shared `.proto` definitions |

## Quickstart

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Start everything

```bash
docker compose up --build -d
```

| URL | Service |
|-----|---------|
| http://localhost | Web app (frontend) |
| http://localhost:4000 | Web BFF |
| http://localhost:3001 | API Gateway |
| http://localhost:15672 | RabbitMQ Management UI (`admin` / `admin`) |

### Stop

```bash
docker compose down
```

### Stop and remove volumes (wipe database)

```bash
docker compose down -v
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gmail.com` | `admin#1` |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| BFF / Gateway | Node.js, Express |
| Service-to-service | gRPC (`@grpc/grpc-js`) |
| Database | PostgreSQL 16 |
| Message broker | RabbitMQ 3 |
| Auth | JWT (HS256), bcrypt |
| Container | Docker, Docker Compose |
| Web server | nginx |

## Databases

All services share a single PostgreSQL instance with separate databases:

| Database | Used by |
|----------|---------|
| `user_service_db` | auth-service, user-service |
| `car_service_db` | car-service |
| `rental_service_db` | rental-service |
| `payment_service_db` | payment-service |

Schemas are initialised automatically on first run from the SQL files in `docker/postgres/`.

## Authentication

1. Call `POST /api/auth/login` (web-bff) or `POST /api/auth/login` (api-gateway).
2. Receive `accessToken` (JWT).
3. Include `Authorization: Bearer <token>` on all protected requests.

Token expiry: **1 hour** (auth-service) / **7 days** (other services).

## Reservation Queue Fallback

If the rental-service is unavailable when a reservation is made, the web-bff publishes the request to RabbitMQ queue `reservation.create` and returns:

```json
{ "queued": true, "queue_id": "<uuid>" }
```

Poll `GET /api/reservations/queued/:queue_id` until `status` is `confirmed` or `rejected`.

## File Uploads

Car images are uploaded via `multipart/form-data` to the web-bff and stored in a Docker volume (`uploads_data`). They are served at `/uploads/<filename>`.

## Environment Variables

Copy and customise the relevant variables for each service. The most important ones to change in production:

| Variable | Where | Description |
|----------|-------|-------------|
| `JWT_SECRET` | all services | Must be a strong, shared secret |
| `POSTGRES_PASSWORD` | docker-compose | PostgreSQL password |
| `RABBITMQ_DEFAULT_PASS` | docker-compose | RabbitMQ password |

## Project Structure

```
car-rental-v2/
├── docker-compose.yml
├── docker/postgres/          # DB init SQL scripts
├── proto-contracts/          # Shared .proto files
├── auth-service/
├── user-service/
├── car-service/
├── rental-service/
├── payment-service/
├── api-getaway/              # REST → gRPC API gateway
├── web-bff/                  # BFF for the frontend
└── web-frontend/             # React SPA
```
