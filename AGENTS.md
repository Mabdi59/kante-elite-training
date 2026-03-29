## Workspace Notes

This repo is not a Next.js app.

The frontend uses Vite, React, React Router, and Tailwind in `frontend/`.
The backend uses Spring Boot in `backend/`.

Before changing frontend routing or build behavior:

- Read `frontend/src/App.tsx`
- Read `frontend/vite.config.ts`
- Do not assume file based routing

Before changing booking behavior:

- Treat `POST /api/bookings` as the active booking path
- Treat Stripe endpoints as future work unless the task explicitly restores payments
- Keep marketing copy and docs aligned with the current direct booking flow
