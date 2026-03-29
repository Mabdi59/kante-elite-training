# Kante Elite Training

Kante Elite Training is a booking platform for youth soccer training in Columbus, Ohio.

## Architecture

```text
/
|- frontend/  React + Vite + Tailwind CSS + TypeScript
|- backend/   Java 17 + Spring Boot 3 + PostgreSQL + Flyway
```

## Current Booking Mode

The app is currently set up for direct bookings without Stripe checkout.

- The frontend creates bookings with `POST /api/bookings`
- The success page loads confirmations with `GET /api/bookings/{id}`
- Stripe endpoints still exist for future use, but they are not required for the active booking flow

## Tech Stack

Frontend:
- React 18
- Vite 5
- TypeScript
- Tailwind CSS 3
- React Router 6
- Axios

Backend:
- Java 17
- Spring Boot 3.2
- Spring Data JPA
- PostgreSQL
- Flyway
- Spring Mail
- Thymeleaf
- Stripe Java SDK for future payment work
- Lombok

## Local Development

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE kante_elite;"
```

### 2. Run the backend

PowerShell example:

```powershell
cd backend
$env:DB_URL="jdbc:postgresql://localhost:5432/kante_elite"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
$env:APP_EMAIL_ENABLED="false"
mvn spring-boot:run
```

Backend default URL:

```text
http://localhost:8080
```

### 3. Run the frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:8080`.

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |

### Optional app settings

| Variable | Description |
|----------|-------------|
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin. Defaults to `http://localhost:5173` |
| `FRONTEND_URL` | Frontend base URL for redirects and links |
| `APP_EMAIL_ENABLED` | Set to `true` to send emails |
| `APP_EMAIL_FROM` | Sender email address |
| `APP_EMAIL_ADMIN` | Admin inbox for contact notifications |

### Optional email settings

These are only needed when `APP_EMAIL_ENABLED=true`.

| Variable | Description |
|----------|-------------|
| `SPRING_MAIL_HOST` | SMTP host |
| `SPRING_MAIL_PORT` | SMTP port |
| `SPRING_MAIL_USERNAME` | SMTP username |
| `SPRING_MAIL_PASSWORD` | SMTP password |

### Optional Stripe settings

These are only needed when you intentionally turn payment work back on.

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

## API Reference

### Programs

```text
GET  /api/programs
GET  /api/programs/{id}
GET  /api/programs/slug/{slug}
```

### Events

```text
GET  /api/events
GET  /api/events/{id}
```

### Availability

```text
GET  /api/availability?programId=&date=
```

### Bookings

```text
POST /api/bookings
GET  /api/bookings/{id}
GET  /api/bookings/confirm?sessionId=
```

### Payments

```text
POST /api/payments/checkout
POST /api/payments/webhook
```

These endpoints are kept for future Stripe work and are not part of the active booking flow today.

### Testimonials

```text
GET  /api/testimonials
GET  /api/testimonials/featured
```

### Contact

```text
POST /api/contact
```

## Booking Flow

### Current flow

```text
1. User selects a program, date, time, and player details
2. Frontend posts to /api/bookings
3. Backend stores a confirmed booking with paymentStatus=PENDING
4. Frontend navigates to /book/success?booking_id=...
5. Backend sends a confirmation email if email is enabled
```

### Future payment flow

Stripe endpoints are still present if you want to restore hosted checkout later.

## Deployment

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
mvn package -DskipTests
java -jar target/kante-elite-training-1.0.0.jar
```

## Database Migrations

| Migration | Content |
|-----------|---------|
| `V1` | Create programs table |
| `V2` | Create events table |
| `V3` | Create bookings table and indexes |
| `V4` | Create testimonials table |
| `V5` | Create contact messages table |
| `V6` | Seed programs, events, and testimonials |
