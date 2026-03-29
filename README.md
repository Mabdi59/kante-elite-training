# Kante Elite Training

**Columbus, Ohio's premier youth soccer development and booking platform.**

---

## Architecture

```
/
├── frontend/     React + Vite + Tailwind CSS + TypeScript
└── backend/      Java 17 + Spring Boot 3 + PostgreSQL + Flyway + Stripe
```

---

## Tech Stack

**Frontend:** React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · React Router 6 · Axios

**Backend:** Java 17 · Spring Boot 3.2 · Spring Data JPA · PostgreSQL · Flyway · Stripe Java SDK · Spring Mail · Thymeleaf · Lombok

---

## Local Development

### Prerequisites
Java 17+, Maven 3.8+, Node.js 18+, PostgreSQL 14+

### 1. Database
```bash
psql -U postgres -c "CREATE DATABASE kante_elite;"
```

### 2. Backend
```bash
cd backend
export DB_URL=jdbc:postgresql://localhost:5432/kante_elite
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export EMAIL_ENABLED=false
mvn spring-boot:run
# → http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:8080` automatically.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | ✅ | PostgreSQL JDBC URL |
| `DB_USERNAME` | ✅ | DB username |
| `DB_PASSWORD` | ✅ | DB password |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | Webhook signing secret |
| `EMAIL_ENABLED` | No | `true` to enable emails |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | If email enabled | SMTP config |
| `EMAIL_FROM` | If email enabled | Sender address |
| `CORS_ALLOWED_ORIGINS` | No | Prod frontend origin |
| `FRONTEND_URL` | No | For Stripe success/cancel redirects |

---

## API Reference

```
GET  /api/programs                           All active programs
GET  /api/programs/{id}                      By ID
GET  /api/programs/slug/{slug}               By slug

GET  /api/events                             Upcoming events
GET  /api/events/{id}                        By ID

GET  /api/availability?programId=&date=      Available time slots

POST /api/bookings                           Create booking (no-payment path)
GET  /api/bookings/confirm?sessionId=        Retrieve booking by Stripe session

POST /api/payments/checkout                  Create Stripe Checkout Session → returns URL
POST /api/payments/webhook                   Stripe webhook handler

GET  /api/testimonials                       All testimonials
GET  /api/testimonials/featured              Featured only

POST /api/contact                            Contact form submission
```

---

## Booking Flow

```
1. User: picks program → date → time → fills player details
2. Frontend: POST /api/payments/checkout
3. Backend: creates Stripe Checkout Session, returns URL
4. User: redirected to Stripe-hosted checkout
5. Stripe: fires checkout.session.completed webhook → POST /api/payments/webhook
6. Backend: verifies signature → creates CONFIRMED booking in PostgreSQL → sends email
7. Stripe: redirects user to /book/success?session_id=...
8. Frontend: GET /api/bookings/confirm?sessionId=... → shows confirmation
```

**Double-booking prevention:** DB-level unique constraint on `(program_id, booking_date, booking_time)` + idempotency check via `stripe_session_id`.

---

## Deployment

### Frontend
```bash
cd frontend && npm run build
# Serve dist/ via nginx / Vercel / Netlify
```

### Backend
```bash
cd backend && mvn package -DskipTests
java -jar target/kante-elite-training-1.0.0.jar
```

---

## Database Migrations (Flyway)

| Migration | Content |
|-----------|---------|
| V1 | programs table |
| V2 | events table |
| V3 | bookings table (unique constraint) |
| V4 | testimonials table |
| V5 | contact_messages table |
| V6 | Seed data: 5 programs, 4 events, 6 testimonials |
