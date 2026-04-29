# user-service

Manages user profiles via gRPC (list, get, create, update, delete).

## gRPC Server

**Port:** `50051`

### Methods

| Method | Request | Response | Description |
|--------|---------|----------|-------------|
| `ListUsers` | `{}` | `{users[]}` | List all users |
| `GetUser` | `{user_id}` | `{user}` | Get a user by ID |
| `CreateUser` | `{name, email, password, role}` | `{user}` | Create a user |
| `UpdateUser` | `{user_id, name, email, password}` | `{user}` | Update user fields |
| `DeleteUser` | `{user_id}` | `{success}` | Delete a user |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `50051` | gRPC server port |
| `DB_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | JWT secret (shared with auth-service) |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry |

## Database

**Database:** `user_service_db` (shared with auth-service)

| Table | Key Columns |
|-------|-------------|
| `users` | `id` (UUID), `name`, `email` (unique), `password` (bcrypt), `role` |

## Tech Stack

- Node.js, gRPC (`@grpc/grpc-js`)
- PostgreSQL (`pg`)
- `bcrypt`

## Running Locally

```bash
npm install
PORT=50051 DB_URL=postgresql://postgres:password@localhost:5432/user_service_db node src/server.js
```
