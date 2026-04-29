# auth-service

Handles user registration, login, token issuance, and token validation via gRPC.

## gRPC Server

**Port:** `50054`

### Methods

| Method | Request | Response | Description |
|--------|---------|----------|-------------|
| `RegisterUser` | `{name, email, password}` | `{token, user}` | Register a new user |
| `LoginUser` | `{email, password}` | `{token, user}` | Authenticate and issue JWT |
| `ValidateToken` | `{token}` | `{valid, user_id, role}` | Verify a JWT |
| `CreateToken` | `{user_id, role}` | `{token}` | Issue a new JWT for a user |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `50054` | gRPC server port |
| `AUTHDB_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | `supersecretjwt_change_me` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | `1h` | JWT expiry duration |

## Database

**Database:** `user_service_db`

| Table | Key Columns |
|-------|-------------|
| `users` | `id` (UUID), `name`, `email` (unique), `password` (bcrypt), `role` (`user`/`admin`) |

### Default Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@gmail.com` |
| Password | `admin#1` |

## Tech Stack

- Node.js, gRPC (`@grpc/grpc-js`)
- PostgreSQL (`pg`)
- `bcrypt`, `jsonwebtoken`

## Running Locally

```bash
npm install
PORT=50054 AUTHDB_URL=postgresql://postgres:password@localhost:5432/user_service_db JWT_SECRET=mysecret node src/server.js
```
