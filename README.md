# Tech Village — Phase 0/1 Foundation

**Learn. Build. Earn.**

This is the technical foundation of Tech Village: a learning, mentorship,
productivity and professional-development ecosystem. This scaffold covers
**Phase 0 (technical foundation)** and the start of **Phase 1 (core
platform)** from the master spec — authentication, RBAC, the domain model,
and the role-specific frontend shells everything else builds on.

Want to deploy this somewhere to click through it — AWS (RDS + App Runner +
Amplify), or Vercel/Railway — rather than run it locally? See **`DEPLOYMENT.md`**.

## Stack

- **Frontend**: Vue 3 + TypeScript + Tailwind CSS + Vue Router + Pinia (no React)
- **Backend**: Node.js + TypeScript + Express, layered as routes → controllers → services → repositories
- **Database**: PostgreSQL via Prisma
- **Auth**: JWT access + refresh tokens, bcrypt password hashing, role/permission-based authorization
- **Integrations**: abstracted interfaces for email, meeting (Zoom/Meet/Teams), payment (Paystack/Flutterwave) and community (Discord/Telegram) providers — swap implementations without touching business logic

## What's built

- Full Prisma schema: identity/RBAC, learning (paths/courses/modules/lessons/enrollment/progress), goals/roadmaps/tasks, mentorship, events, notifications, projects/assessments/certificates, community access, audit log
- Auth module end-to-end: register, login, refresh, logout — with a seed script that bootstraps the six roles (`learner`, `mentor`, `professional`, `company`, `admin`, `super_admin`) and their default permissions
- `/users/me` endpoint and a Pinia auth store that persists session + auto-refreshes expired access tokens
- **Learning module, end-to-end**: learning paths and courses (list + detail), enrollment, per-lesson progress tracking with auto-completion of the course once every lesson is done, and full admin authoring (create/publish learning paths and courses, add modules and lessons via a real admin UI at `/admin/courses/:id`)
- **Productivity module, end-to-end**: Goals with milestones and live progress %, a Tasks manager with Today/Upcoming/Completed/All views and priority levels, and a Roadmap builder with custom roadmaps, milestone tracking, and three seeded "recommended roadmap" templates (Frontend, Backend, Data Science) a learner can clone into their own
- **Mentorship module, end-to-end**: learners can apply to become a mentor and admins approve/revoke; a mentor marketplace with request/accept/decline flow; mentor-side mentee management with **private notes that are never returned to the mentee** (enforced in the service layer, not just the UI); session scheduling through the `MeetingProvider` abstraction (mentor pastes a Zoom/Meet/Teams link, stored and surfaced to both sides)
- **Events module, end-to-end**: webinars/live classes/workshops with capacity limits, learner registration (with confirmation email and a duplicate/capacity/cancelled-event guard in the service layer), a Calendar page showing "my registrations" + browsable upcoming events, mentor/admin event creation reusing the same `MeetingProvider` abstraction, and cancellation that emails every registered attendee
- **Community access module, end-to-end**: every user gets General Discord + Telegram access automatically (idempotent, lazily granted on first visit) via the `CommunityProvider` abstraction — Tech Village never calls the Discord/Telegram APIs, it just hands out admin-configured invite links and tracks eligibility as data. Admins grant/revoke **Professional** community access from a dedicated screen, which flips `ProfessionalProfile.isQualified` and syncs the Professional Discord access row + notification email in one step
- **Projects, Assessments & Certificates module, end-to-end**: learner portfolio CRUD; admin-authored assessments with pass scores; certificate issuance with a unique verification code and **a public, unauthenticated verification page** at `/verify/:code` (spec section 26 — anyone, including employers, can check a certificate without logging in)
- **Jobs & Company Portal, end-to-end**: a genuinely separate **Company** role and layout (`/company/*`, per spec section 56) with its own profile screen and job posting/application-management flow; learners browse and apply to published jobs from a new Jobs nav item, see their application statuses, and get notified by email at each stage; company users manage applicants per job with a status pipeline (Submitted → Reviewed → Shortlisted → Rejected/Hired)
- **Payments module, end-to-end**: real `PaymentProvider` implementations for **Paystack and Flutterwave** (calling their actual REST APIs), plus a `MockPaymentProvider` that's used automatically in dev when no API key is configured — so the app runs out of the box with no payment credentials. `initiate`/`verify` endpoints and an Admin Payments screen with a revenue summary and transaction table are wired; nothing in the codebase is priced yet (courses/events/mentorship don't have a cost field), so this is the payment rail ready to attach to any of them without further architecture changes
- **Admin Users screen, end-to-end**: search users, suspend/reactivate accounts, and assign or remove roles (`learner`/`mentor`/`professional`/`company`/`admin`/`super_admin`) directly — with self-protection guards so an admin can't suspend their own account or strip their own admin access. This removes the "use Prisma Studio" workaround for every role except the very first admin on a fresh install (see Local Setup)
- **Audit logging, end-to-end**: a shared `recordAuditLog()` helper (in `common/audit.ts`) that any module can call, wired into the highest-value admin actions — role assignment/removal, account suspension, mentor approval, professional qualification changes, and certificate issuance — plus a real Admin Audit Logs screen with entity filtering. A failed audit write never breaks the action it's recording (fire-and-forget with a caught error), by design
- **Admin Emails module, end-to-end**: segmented campaigns (All users / Learners / Mentors / Professionals / Companies) built on the same `EmailProvider` abstraction used everywhere else, with `[First Name]` variable substitution, draft-then-send workflow, per-recipient failure tolerance (one bad address doesn't fail the whole campaign), and audit logging on send
- Role-guarded Vue Router setup with **separate layouts** for Learner, Mentor, Company and Admin portals (per spec — admin nav is deliberately distinct from the learner platform), with role-aware redirects so a Company or Mentor user never gets bounced into the Learner dashboard
- Tailwind theme wired to the exact Tech Village brand palette and gradients
- A fully built-out Learner Dashboard (welcome, continue learning, goals, today's tasks, upcoming, progress, community) and starter Mentor/Admin dashboards
- **Reports, Settings and a real Admin Dashboard**: the dashboard now shows live platform metrics (users by role, enrollments, completion rate, certificates, active mentorships, upcoming events, open jobs, applications, revenue) plus a 30-day sign-up chart, instead of hardcoded numbers; Reports adds role/learning-funnel/application-pipeline breakdowns; Settings lets admins edit the Discord/Telegram invite links and support email without a redeploy (stored in a `PlatformSetting` table, with env-var defaults as the fallback, and read by the community module at request time). Setting changes are audit-logged. Every screen in the admin nav is now wired to real endpoints
- **`DEPLOYMENT.md`** — AWS as the primary path (RDS + App Runner + Amplify Hosting, with concrete CLI steps to build/push the backend image via ECR), plus a lighter Vercel/Railway/Neon alternative. `frontend/amplify.yml` (Amplify build spec) and `backend/.dockerignore` support this alongside the existing `backend/Dockerfile` and `frontend/vercel.json`

## What's intentionally NOT built yet

Per the phased plan in the spec, later phases add: **scheduled** email sends (campaigns currently send immediately or stay a draft; `EmailCampaign.status` is only `DRAFT`/`SENDING`/`SENT`/`FAILED`, so scheduling would need a new status value, a scheduled-time field, and a background job runner to pick campaigns up), mentor-scoped messaging to their own mentees specifically (spec section 17 — Admin Emails covers role-wide segments; a mentor emailing "my mentees" or "inactive mentees" isn't built), real quiz/exam delivery (the current Assessments UI lets a learner self-report a score to a pre-set pass threshold — a stand-in for a proper quiz engine), Discord OAuth-based role sync (the `CommunityProvider` interface is ready for it — see `StaticCommunityProvider`), a dedicated signup flow for Company accounts (new registrations still default to `learner`; assign the `company` role via the Admin Users screen instead of Prisma Studio now), pricing UI on courses/events/mentorship (the Payments rail exists; nothing calls it yet), and payment webhook handlers (verification is currently pull-based via `GET /payments/verify/:reference`, not gateway-pushed). The architecture (modular backend, abstracted integrations, RBAC-driven frontend) is built so none of that requires rewriting what's here.

## Local setup

### 1. Database

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` (db `tech_village`, user/pass `postgres`/`postgres`).

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate      # creates tables from prisma/schema.prisma
npx tsx prisma/seed.ts      # bootstraps roles + permissions (incl. admin:community:manage, admin:credentials:manage) + recommended roadmap templates
npm run dev                 # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Create an account at `/register`, then sign in — you'll land on the Learner
dashboard. To test the Mentor, Company or Admin portals, you need at least
one admin account first: since a brand-new install has no admins yet, promote
your first user to `admin` via `prisma studio` (`npm run prisma:studio` in
`backend/`) — add a row in `UserRole` linking your user to the `admin` role.
From then on, use the Admin → Users screen to assign `mentor`/`company`/`admin`
to any account (including your own additional test accounts) without
touching Prisma Studio again.

## Project structure

```
tech-village/
├── backend/
│   ├── prisma/schema.prisma       # full domain model
│   ├── prisma/seed.ts             # roles + permissions bootstrap
│   └── src/
│       ├── modules/               # auth, users (more added per phase)
│       │   └── <module>/
│       │       ├── *.routes.ts
│       │       ├── *.controller.ts
│       │       ├── *.service.ts
│       │       ├── *.repository.ts
│       │       └── *.validation.ts
│       ├── integrations/          # email/, meeting/, payment/, community/ — provider interfaces + factories
│       ├── middleware/            # auth, rbac, error handling
│       ├── common/                # ApiError, asyncHandler, jwt helpers
│       ├── config/                # env, logger
│       ├── database/prisma.ts     # shared Prisma client
│       ├── app.ts
│       └── server.ts
└── frontend/
    └── src/
        ├── layouts/                # AppShell + LearnerLayout/MentorLayout/AdminLayout/AuthLayout
        ├── views/{auth,learner,mentor,admin}/
        ├── stores/auth.ts          # Pinia
        ├── services/               # axios client + auth API
        ├── router/index.ts         # role-guarded routes
        └── types/
```

## Next steps (suggested order)

1–10. Learning, Productivity, Mentorship, Events, Community, Credentials, Jobs/Companies, Payments, Admin Users, Audit logging — all ✅ built (see above)
11. ~~**Admin Emails (segmented campaigns)**~~ ✅ built
12. Wire certificate issuance to automatically flip `ProfessionalProfile.isQualified` (currently a separate admin toggle in Community Access)
13. Attach pricing to at least one purchasable thing (a paid course, or private mentorship) so the Payments rail has a real caller
14. ~~Reports and Settings admin screens~~ ✅ built
15. Scheduled sends and mentor-scoped mentee messaging for the Emails module

Ask for any of these by name and we'll build that vertical slice the same way auth was built: schema → repository → service → controller → routes → frontend views wired to the real API.
