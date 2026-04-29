# car-service

Manages the car catalog via gRPC (list, get, create, update, delete).

## gRPC Server

**Port:** `50053`

### Methods

| Method | Request | Response | Description |
|--------|---------|----------|-------------|
| `ListCars` | `{}` | `{cars[]}` | List all cars |
| `GetCar` | `{car_id}` | `{car}` | Get a car by ID |
| `CreateCar` | `{make, model, year, price_per_day, image_url}` | `{car}` | Add a new car |
| `UpdateCar` | `{car_id, make, model, year, price_per_day, image_url}` | `{car}` | Update car details |
| `DeleteCar` | `{car_id}` | `{success}` | Remove a car |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `50053` | gRPC server port |
| `DB_URL` | — | PostgreSQL connection string |

## Database

**Database:** `car_service_db`

| Table | Key Columns |
|-------|-------------|
| `cars` | `id` (UUID), `make`, `model`, `year`, `price_per_day` (numeric), `image_url` (text) |

Indexes on `make` and `model`.

## Tech Stack

- Node.js, gRPC (`@grpc/grpc-js`)
- PostgreSQL (`pg`)

## Running Locally

```bash
npm install
PORT=50053 DB_URL=postgresql://postgres:password@localhost:5432/car_service_db node src/server.js
```
