# Kante Elite Training

A full-stack multi-role tournament management platform for youth soccer in Columbus, Ohio. Built for tournament organizers, team captains, coaches, parents, and players.

---

## System Architecture

```text
/
├── frontend/   React 18 + Vite 5 + Tailwind CSS + TypeScript + React Router 6
└── backend/    Java 17 + Spring Boot 3.2 + PostgreSQL + Flyway + Spring Security (JWT)
```

All API calls from the frontend proxy through Vite (`/api → http://localhost:8080`) in development.

---

## Roles and Portals

| Role | Portal | What they can do |
|------|--------|-----------------|
| `ADMIN` | `/admin` | Full access: tournaments, teams, players, schedule, results, standings, users, coaches, bookings, audit logs |
| `STAFF` | `/staff` | View and manage bookings, messages, availability, players, tournament details |
| `COACH` | `/coach` | Manage personal training sessions, availability, coach profile; also accesses captain portal |
| `TEAM_CAPTAIN` | `/captain` | Register teams, manage rosters, view registration status, submit payment, manage tournament entries |
| `PLAYER` | `/player` | View personal training sessions and player profile |
| `PARENT` | `/parent` | View and book training sessions, manage linked player profiles |
| `USER` | `/user` | General user: view bookings, manage player profiles |

Login redirects to the correct portal based on role automatically.

---

## Tournament Workflow (Admin)

The 7-step admin workflow at `/admin/tournaments/:id/workflow` covers the full lifecycle:

```
1. Details   → Name, location, dates, registration deadline, entry fee, age group, division
2. Teams     → Approve / waitlist / reject registered teams
3. Players   → View and manage players per team; bulk import (Name,Jersey,Position per line)
4. Format    → Round Robin or Knockout; match duration, points for win/draw, group stages
5. Schedule  → Auto-generate matches; assign fields, dates, and times; edit inline
6. Results   → Enter match scores and mark status (SCHEDULED / FINAL / CANCELLED)
7. Standings → Auto-computed from FINAL matches; grouped by stage; color-coded table
```

Standings are computed automatically from finalized match results — no manual entry required.

---

## Public Tournament Experience

- `/tournaments` — browse all tournaments with filter by status
- `/tournaments/:id` — public detail page with tabs:
  - **Overview** — description, dates, format, scoring rules
  - **Teams** — confirmed and pending teams with rosters
  - **Schedule** — matches grouped by stage with scores and kickoff times
  - **Standings** — standings table (only shown after matches are finalized)
  - **Bracket** — visual knockout bracket (only shown for KNOCKOUT format)

---

## Team Captain Flow

1. Register at `/register?intent=tournament&requestedRole=TEAM_CAPTAIN`
2. Browse tournaments at `/captain/tournaments` and submit a registration
3. Manage all registrations at `/captain/registrations`:
   - Update team info
   - Submit manual payment (Cash App, Zelle, Venmo, etc.)
   - Upload or paste player roster
   - View registration status in real time

Coaches with captain-level access also have access to the captain portal.

---

## API Overview

### Public

```
GET  /api/tournaments                       All tournaments
GET  /api/tournaments/{id}                  Tournament summary
GET  /api/tournaments/{id}/public           Full public view (teams, schedule, standings)
GET  /api/programs                          Training programs
GET  /api/events                            Public events
GET  /api/testimonials                      Testimonials
POST /api/bookings                          Create a booking
GET  /api/bookings/{id}                     Booking details
POST /api/contact                           Contact form submission
```

### Auth

```
POST /api/auth/register                     Register new user
POST /api/auth/login                        Login → access + refresh tokens
POST /api/auth/refresh                      Refresh access token
POST /api/auth/logout                       Revoke refresh token
POST /api/auth/forgot-password              Request password reset
POST /api/auth/reset-password               Submit new password with token
```

### Admin (requires `ADMIN` role)

```
GET/POST/PUT/DELETE /api/admin/tournaments/**   Tournament CRUD + workflow
GET/POST/PUT/DELETE /api/admin/teams/**         Team and player management
GET/POST/PUT/DELETE /api/admin/bookings/**      Booking management
GET/POST/PUT/DELETE /api/admin/users/**         User management and role changes
GET/POST/PUT/DELETE /api/admin/events/**        Events management
GET/POST/PUT/DELETE /api/admin/programs/**      Programs management
GET /api/admin/audit-logs                       Audit log viewer
```

### Captain (requires `TEAM_CAPTAIN` or `COACH`)

```
GET  /api/captain/dashboard                     Dashboard summary
GET  /api/captain/registrations                 All registrations for this captain
POST /api/captain/registrations                 Create registration
PUT  /api/captain/registrations/{id}            Update registration
DELETE /api/captain/registrations/{id}          Delete registration
POST /api/captain/registrations/{id}/roster     Submit player roster
POST /api/captain/registrations/{id}/payment    Submit manual payment
```

### Coach (requires `COACH` or `ADMIN`)

```
GET  /api/coach/profile                     Coach profile
PUT  /api/coach/profile                     Update coach profile
GET  /api/coach/sessions                    Assigned training sessions
GET  /api/coach/availability                Coach availability
POST /api/coach/availability                Set availability
```

---

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

```bash
cd backend
export DB_URL=jdbc:postgresql://localhost:5432/kante_elite
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export APP_EMAIL_ENABLED=false
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

The Vite dev server proxies `/api` to `http://localhost:8080`.

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |

### Admin account (strongly recommended for production)

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_EMAIL` | `admin@kanteelite.com` | Admin account email |
| `ADMIN_PASSWORD` | `admin123` | Admin account password — **change this** |
| `ADMIN_NAME` | `Kante Elite Admin` | Admin display name |

> ⚠️ **The backend will warn loudly at startup if default admin credentials are in use. Set these environment variables before deploying to production.**

### Auth

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | random dev key | JWT signing secret (use a long random string in production) |
| `JWT_EXPIRATION_MS` | `900000` (15 min) | Access token lifetime |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` (7 days) | Refresh token lifetime |

### App settings

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Allowed frontend origin |
| `FRONTEND_URL` | `http://localhost:5173` | Used in email links |
| `APP_EMAIL_ENABLED` | `false` | Set to `true` to send emails |
| `APP_EMAIL_FROM` | — | Sender email address |
| `APP_EMAIL_ADMIN` | — | Admin inbox for contact notifications |

### Email (only when `APP_EMAIL_ENABLED=true`)

| Variable | Description |
|----------|-------------|
| `SPRING_MAIL_HOST` | SMTP host |
| `SPRING_MAIL_PORT` | SMTP port |
| `SPRING_MAIL_USERNAME` | SMTP username |
| `SPRING_MAIL_PASSWORD` | SMTP password |

### Stripe (optional, currently disabled)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

Stripe is disabled by default. To re-enable, set `app.payments.enabled=true` in `application.properties` and supply the keys above.

---

## Production Build

### Frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend

```bash
cd backend
mvn package -DskipTests
java -jar target/kante-elite-training-1.0.0.jar
```

---

## Database Migrations (Flyway)

| Migration | Content |
|-----------|---------|
| `V1` | Programs table |
| `V2` | Events table |
| `V3` | Bookings table |
| `V4` | Testimonials table |
| `V5` | Contact messages table |
| `V6` | Seed data |
| `V7` | Users table + JWT auth |
| `V8` | Tournaments and team registrations |
| `V9` | Tournament matches |
| `V10` | Audit logs |
| `V11` | Tournament enrichment (entry fee, format, divisions) |
| `V12` | Password reset tokens |
| `V13` | Refresh tokens |
| `V14` | Coach profiles |
| `V15` | Player profiles |
| `V16` | Tournament + team enrichment (age group, notes) |
| `V17` | Notification scaffold |

