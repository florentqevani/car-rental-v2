# web-frontend

React SPA for the car rental platform. Built with Vite and served by nginx in production.

## Development

```bash
npm install
npm run dev        # Vite dev server on http://localhost:3000
```

The dev server proxies `/api` and `/uploads` requests to the web-bff at `http://localhost:4000`.

## Production Build

```bash
npm run build      # Output: dist/
npm run preview    # Preview the production build locally
```

In Docker the `dist/` folder is served by nginx on port `80`.

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `Home` | Browse available cars |
| `/cars/:id` | `CarDetails` | Car details and booking calendar |
| `/checkout` | `Checkout` | Booking summary, user info, and payment |
| `/confirmation` | `Confirmation` | Booking confirmed |
| `/reservations` | `MyReservations` | User's active reservations with car image and name |
| `/login` | — | Login modal |

## Key Components

| Component | Description |
|-----------|-------------|
| `AuthContext` | Global auth state (access token, user, login/logout) |
| `ProtectedRoute` | Redirects unauthenticated users |
| `LoginModal` | Login / register modal |
| `Layout` | App shell with navbar |
| `PaymentCard` | Payment method selector (Credit/Debit Card, PayPal, Apple Pay) used on Checkout |
| `api/client.js` | Axios instance with base URL and auth header |

## Environment

No build-time environment variables are required. All API calls go to `/api` (proxied in dev, same origin in production via nginx).

## Tech Stack

- React 18, React Router v6
- Vite
- nginx (production container)

## Docker

The Dockerfile builds the app with `npm run build` and serves it with nginx on port `80`.
