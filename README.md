# Kante Elite Training

Production-ready full-stack platform for Kante Elite Training in Columbus, Ohio.

The application combines:

- A public marketing site
- Direct training booking
- Events, camps, and clinics registration
- Tournament registration and team management
- An admin operations dashboard
- Customer account management
- Media, testimonials, results, FAQ, and contact content management

## Current Product Scope

This repository now reflects the launch product, not the earlier multi-portal prototype.

Active user experiences:

- Public website
- Customer account
- Team captain portal
- Admin dashboard

Launch-focused role model:

- `ADMIN`: full platform control
- `TEAM_CAPTAIN`: manages team tournament registrations and rosters
- `USER`: books training, registers for events, manages account and player profiles

Notes:

- `COACH` is still supported in auth and backend data, but the live frontend routes now redirect coach users into the team portal where applicable.
- Legacy `staff`, `player`, `parent`, and `user` portal routes are preserved only as redirects so older links do not break.
- Stripe is optional and disabled by default.

## Tech Stack

### Frontend

- Vite
- React 18
- React Router
- TypeScript
- Tailwind CSS
- Axios

Source lives in [frontend/](/C:/Users/moham/OneDrive/Documents/kante-elite-training/frontend).

### Backend

- Java 17
- Spring Boot 3
- Spring Security with JWT + refresh tokens
- Spring Data JPA
- Flyway
- PostgreSQL
- Thymeleaf email templates

Source lives in [backend/](/C:/Users/moham/OneDrive/Documents/kante-elite-training/backend).

## Repository Structure

```text
.
├─ frontend/   Vite + React application
├─ backend/    Spring Boot API
├─ docker-compose.yml
└─ README.md
```

Key frontend areas:

- `frontend/src/App.tsx`: route map
- `frontend/src/pages/`: public, account, captain, and admin pages
- `frontend/src/services/api.ts`: client API layer
- `frontend/src/utils/portal.ts`: role-based post-login destinations

Key backend areas:

- `backend/src/main/java/com/kanteelite/training/controller/`: API controllers
- `backend/src/main/java/com/kanteelite/training/service/`: business logic
- `backend/src/main/java/com/kanteelite/training/repository/`: JPA repositories
- `backend/src/main/resources/db/migration/`: Flyway migrations
- `backend/src/main/resources/templates/email/`: email templates

## Frontend Route Surface

### Public

- `/`
- `/training`
- `/events`
- `/events/:id/register`
- `/results`
- `/media`
- `/about`
- `/contact`
- `/tournaments`
- `/tournaments/:id`
- `/tournaments/:id/register`
- `/tournaments/registration/:token`
- `/book`
- `/book/success`
- `/faq`
- `/privacy`
- `/terms`
- `/cancellation-policy`
- `/cookie-policy`
- `/accessibility`

### Auth and Account

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/account`

### Team Portal

- `/captain/tournaments`
- `/captain/registrations`

### Admin

- `/admin`
- `/admin/registrations`
- `/admin/availability`
- `/admin/recurring-sessions`
- `/admin/programs`
- `/admin/events`
- `/admin/tournaments`
- `/admin/tournaments/:id/workflow`
- `/admin/content`
- `/admin/media`
- `/admin/testimonials`
- `/admin/coaches`
- `/admin/faqs`
- `/admin/messages`
- `/admin/users`
- `/admin/payments`

## Core Workflows

### Training Booking

- Public visitors browse programs and book directly from `/book`
- Active booking API path: `POST /api/bookings`
- The booking page checks `GET /api/payments/status`
- If payments are disabled, bookings are submitted directly
- If payments are enabled, the frontend can redirect into Stripe Checkout

### Event Registration

- Public visitors register from `/events/:id/register`
- Current registration contract is minimal and launch-friendly:
  - name
  - email
- The backend accepts legacy field aliases from older clients for safety

### Tournament Registration

- Public users open tournament detail pages and register teams
- Registration can create or elevate into `TEAM_CAPTAIN` access when needed
- Team managers use a tokenized registration dashboard and the captain portal to:
  - update team details
  - upload or paste rosters
  - submit manual payments
  - use Stripe checkout when enabled

### Admin Operations

The admin dashboard is trimmed to active business workflows:

- Bookings
- Availability
- Programs
- Events
- Tournaments and tournament workflow
- Website content
- Media
- Testimonials
- Messages
- Users
- Payments

## Environment Variables

See [backend/.env.example](/C:/Users/moham/OneDrive/Documents/kante-elite-training/backend/.env.example) for the authoritative backend template.

### Required backend settings

| Variable | Purpose |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | Use `prod` in production |
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | JWT signing secret |
| `ADMIN_EMAIL` | Bootstrapped admin email |
| `ADMIN_PASSWORD` | Bootstrapped admin password |
| `ADMIN_NAME` | Bootstrapped admin display name |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin list |
| `FRONTEND_URL` | Canonical frontend URL for links/emails |

### Optional backend settings

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_PAYMENTS_ENABLED` | `false` | Enables Stripe payment flows |
| `APP_UPLOADS_DIR` | `uploads` | Local/server upload storage |
| `APP_EMAIL_ENABLED` | `false` | Enables outbound email |
| `APP_EMAIL_FROM` | `noreply@localhost` | Sender email |
| `APP_EMAIL_ADMIN` | `admin@localhost` | Admin inbox for notifications |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `SPRING_MAIL_PORT` | `587` | SMTP port |
| `SPRING_MAIL_USERNAME` | empty | SMTP username |
| `SPRING_MAIL_PASSWORD` | empty | SMTP password |

### Optional Stripe settings

Only set these when you are intentionally enabling live or test payments:

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

Important:

- Do not enable Stripe in production without valid keys and webhook configuration.
- The repository is aligned to the current direct-booking flow first, with Stripe as an optional production toggle.

### Frontend setting

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Optional backend origin when frontend and API are not same-origin |

If `VITE_API_URL` is not set, the frontend uses same-origin `/api`.

## Local Development

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.8+
- PostgreSQL 14+

### Run backend

```bash
cd backend
mvn -DskipTests spring-boot:run
```

By default the backend expects:

- `DB_URL=jdbc:postgresql://localhost:5432/kante_elite`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=postgres1`

Override those with environment variables before startup as needed.

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on [http://localhost:5173](http://localhost:5173) and proxies `/api` to `http://localhost:8080`.

### Docker Compose

For a full local stack:

```bash
docker compose up --build
```

Current compose services:

- `postgres`
- `backend`
- `frontend`

## Verification Commands

Use these before pushing or deploying:

```bash
cd frontend && npm run lint
cd frontend && npm run build
cd backend && mvn -q -DskipTests compile
```

Optional packaged backend build:

```bash
cd backend && mvn -q -DskipTests clean package
```

## Production Deployment Notes

Recommended production shape:

- Frontend served by nginx or another static host
- Backend running Spring Boot on EC2 or a similar VM/service
- PostgreSQL on RDS
- Shared canonical domain with `/api` reverse proxied to backend

### Deployment checklist

1. Set `SPRING_PROFILES_ACTIVE=prod`
2. Configure database credentials
3. Set a real `JWT_SECRET`
4. Override default admin credentials
5. Set `CORS_ALLOWED_ORIGINS` to the real frontend domain list
6. Set `FRONTEND_URL` to the canonical HTTPS URL
7. Run Flyway migrations on startup
8. Ensure `APP_UPLOADS_DIR` points to persistent server storage
9. Leave Stripe disabled unless production keys and webhook secret are configured

### Static/frontend deployment

```bash
cd frontend
npm install
npm run build
```

Deploy `frontend/dist/` to the static web root.

### Backend deployment

```bash
cd backend
mvn -q -DskipTests clean package
java -jar target/kante-elite-training-1.0.0.jar
```

## Data and Uploads

- Flyway migrations are stored in `backend/src/main/resources/db/migration/`
- Runtime uploads should live under `APP_UPLOADS_DIR`
- `backend/uploads/` is treated as runtime storage and is ignored for new files

Do not use this repository as a source of truth for production user-uploaded content.

## Notes for Future Developers

- This is not a Next.js app. Routing is defined manually in `frontend/src/App.tsx`.
- The live booking flow is `POST /api/bookings`.
- Keep docs and marketing copy aligned with the current direct booking flow.
- Avoid re-introducing removed staff/player/parent portal complexity unless there is a real product requirement.

## License

This repository includes the existing [LICENSE](/C:/Users/moham/OneDrive/Documents/kante-elite-training/LICENSE).
