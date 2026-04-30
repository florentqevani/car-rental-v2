# Payment Integration — RaiAccept (Raiffeisen Bank)

This document explains how the payment flow works end-to-end: which services are involved, how they connect, and what happens at each step.

---

## Architecture Overview

```
Browser (React)
    │
    │  HTTP/REST  (/api/payments/*)
    ▼
web-bff  (Express, port 4000)
    │
    ├──► raiaccept.js ──► RaiAccept API (https://trapi.raiaccept.com)
    │                          │
    │                     Amazon Cognito (https://authenticate.raiaccept.com)
    │                          │
    │                     Hosted payment form (https://payment.raiaccept.com)
    │
    ├──► rental-service  (gRPC, port 52)  ──► Postgres (rental_service_db)
    │         │
    │         └── (if unavailable) ──► RabbitMQ queue
    │
    └──► payment-service (gRPC, port 55)  ──► Postgres (payment_service_db)
```

---

## Services Involved

| Service | Role |
|---|---|
| **web-frontend** | React app — checkout page, payment iframe, confirmation page |
| **web-bff** | Backend-for-frontend — exposes `/api/payments/*`, orchestrates everything |
| **raiaccept.js** | RaiAccept API client inside web-bff |
| **RaiAccept** | External payment gateway (Raiffeisen Bank) |
| **rental-service** | Creates the rental record after confirmed payment |
| **payment-service** | Stores the internal payment record (amount, currency, rental link) |
| **RabbitMQ** | Fallback queue when rental-service is temporarily unavailable |

---

## Payment Flow — Step by Step

### Step 1 — User reaches Checkout

The user selects a car and dates. The `Checkout.jsx` page shows a summary and a **Pay Now** button powered by `PaymentCard.jsx`. No payment details are entered here — the actual card form is hosted by RaiAccept.

---

### Step 2 — Initiate Payment (`POST /api/payments/initiate`)

**Frontend → web-bff**

```json
POST /api/payments/initiate
Authorization: Bearer <JWT>

{
  "car_id": "abc123",
  "pickup_date": "2025-06-01",
  "return_date": "2025-06-05",
  "amount": 320.00,
  "currency": "EUR"
}
```

**web-bff does three things:**

1. **Authenticate with RaiAccept** via Amazon Cognito (`USER_PASSWORD_AUTH` flow):
   - URL: `https://authenticate.raiaccept.com`
   - ClientId: `kr2gs4117arvbnaperqff5dml` (static for all merchants)
   - Credentials: `RAIACCEPT_USERNAME` / `RAIACCEPT_PASSWORD` from env
   - Returns: `IdToken` (JWT used as Bearer token for all API calls)

2. **Create an Order Entry** (`POST https://trapi.raiaccept.com/orders`):
   - Sends invoice (amount, currency, items), redirect URLs, consumer info, `paymentMethodPreference: "CARD"`
   - Returns: `orderIdentification` (RaiAccept's order ID)

3. **Create a Payment Session** (`POST https://trapi.raiaccept.com/orders/{id}/checkout`):
   - Same invoice/urls payload
   - Returns: `paymentRedirectURL` — the hosted payment form URL

**Response to frontend:**
```json
{
  "paymentFormUrl": "https://payment.raiaccept.com/checkout?token=...",
  "raiOrderId": "RAI-ORDER-UUID"
}
```

---

### Step 3 — Hosted Payment Form (iframe)

The frontend appends `&mode=frameless` to `paymentFormUrl` and renders it in a fullscreen iframe overlay. The user enters their card details directly on RaiAccept's servers — no card data touches the app.

**Test cards (sandbox):**
| Card | Result |
|---|---|
| `4999 9999 9999 0011` | Success (no 3DS) |
| `4999 9999 9999 0029` | Declined |

When the user completes (or cancels), the iframe posts a message to the parent window:

```js
// Success
{ name: "orderResult", payload: { status: "success", orderIdentification: "RAI-ORDER-UUID" } }

// Cancel / failure
{ name: "orderResult", payload: { status: "cancel" | "failure", ... } }
```

The frontend validates `event.origin === "https://payment.raiaccept.com"` before acting on the message.

---

### Step 4 — Confirm Payment (`POST /api/payments/confirm`)

On a `success` postMessage, the frontend calls:

```json
POST /api/payments/confirm
Authorization: Bearer <JWT>

{
  "raiOrderId": "RAI-ORDER-UUID",
  "car_id": "abc123",
  "pickup_date": "2025-06-01",
  "return_date": "2025-06-05",
  "amount": 320.00,
  "currency": "EUR"
}
```

**web-bff does four things:**

1. **Re-authenticates** with RaiAccept and **fetches order details** (`GET /orders/{id}`) to verify the payment actually succeeded server-side. Accepted statuses: `SUCCESS`, `PAID`.

2. **Creates the rental** via gRPC call to `rental-service`:
   ```
   createRental({ user_id, car_id, start_date, end_date })
   ```
   Returns `rental_id`.

3. **Fallback to RabbitMQ** — if `rental-service` returns gRPC status `14 (UNAVAILABLE)`, the reservation is published to the RabbitMQ queue with a generated `queue_id`. The rental service will consume and process it when it comes back online.

4. **Records the payment** via gRPC call to `payment-service`:
   ```
   createPayment({ rental_id, user_id, amount, currency })
   ```
   This is non-fatal — if it fails, the rental is still valid.

**Response:**

Normal:
```json
HTTP 201
{ "id": "rental-uuid" }
```

Queued (rental-service was down):
```json
HTTP 202
{ "queued": true, "queue_id": "uuid", "message": "..." }
```

---

### Step 5 — Confirmation Page

- `HTTP 201` → frontend navigates to `/confirmation/{rental_id}`
- `HTTP 202` → frontend navigates to `/confirmation/queued?qid={queue_id}`
- On cancel: iframe closes, user stays on checkout summary
- On failure: error is shown, user can retry

---

### Step 6 — RaiAccept Webhook (`POST /api/payments/webhook`)

RaiAccept can also notify the server asynchronously via webhook (server-to-server). The endpoint at `/api/payments/webhook` logs the notification and responds `200 OK`. The **primary confirmation path is the iframe postMessage** — the webhook is a server-side fallback for retries or status changes (e.g. chargebacks).

For webhooks to work in local dev, expose web-bff publicly:
```bash
ngrok http 4000
# then set RAIACCEPT_WEBHOOK_URL=https://<id>.ngrok.io in .env
```

---

## Environment Variables

All are set in `.env` (copy from `.env.example`):

| Variable | Description |
|---|---|
| `RAIACCEPT_USERNAME` | API username from https://portal.raiaccept.com/api-users |
| `RAIACCEPT_PASSWORD` | API password from https://portal.raiaccept.com/api-users |
| `RAIACCEPT_APP_URL` | Public URL of the frontend (used for success/fail/cancel redirect URLs sent to RaiAccept). Example: `http://localhost` |
| `RAIACCEPT_WEBHOOK_URL` | Public URL of web-bff (used for the notification webhook URL sent to RaiAccept). Example: `http://localhost:4000` |

---

## Key Files

| File | Purpose |
|---|---|
| `web-bff/raiaccept.js` | RaiAccept API client: `authenticate`, `createOrderEntry`, `createPaymentSession`, `getOrderDetails`, `issueRefund` |
| `web-bff/routes/payments.js` | Express routes: `/initiate`, `/confirm`, `/webhook` |
| `web-bff/config.js` | Reads `RAIACCEPT_*` env vars with fallback defaults |
| `web-frontend/src/pages/Checkout.jsx` | Checkout page: summary, pay button, iframe overlay, postMessage handler |
| `web-frontend/src/components/payment-card.jsx` | "Pay Now" button component shown on checkout |
| `payment-service/src/handlers/create-payment.js` | gRPC handler that inserts a payment record into Postgres |
| `rental-service/src/handlers/create-rental.js` | gRPC handler that inserts a rental record into Postgres |
| `rental-service/src/mq-consumer.js` | RabbitMQ consumer that processes queued rentals |

---

## RaiAccept API Reference

| Action | Method | URL |
|---|---|---|
| Authenticate | `POST` | `https://authenticate.raiaccept.com` |
| Create order | `POST` | `https://trapi.raiaccept.com/orders` |
| Create session | `POST` | `https://trapi.raiaccept.com/orders/{id}/checkout` |
| Get order | `GET` | `https://trapi.raiaccept.com/orders/{id}` |
| Refund | `POST` | `https://trapi.raiaccept.com/orders/{id}/transactions/{txId}/refund` |

Full docs: https://docs.raiaccept.com
