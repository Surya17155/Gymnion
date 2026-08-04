# GymSync — Build Plan

A multi-tenant gym management platform (Super Admin → Gym Admin → Member) with QR attendance, fee tracking, and online payments — styled with the "Pulse AI Gym" dark + lime, mobile-first design system.

Nothing is built yet. This is the plan only. We will then build **one screen at a time**, and I will stop after each step and wait for your go-ahead.

## Stack decision

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | TanStack Start (React 19 + Vite, already in this project) + Tailwind v4 + shadcn | Fixed stack here; SSR-friendly, good SEO, file-based routes |
| Styling | Design tokens from `gym_app_design.md` written into `src/styles.css` as semantic tokens | No hardcoded colors anywhere; dark default, lime as scarce accent |
| Backend | Lovable Cloud (Postgres + Auth + Storage + server functions) | Replaces the PRD's Supabase/Vercel plan with zero setup; same Postgres + RLS model |
| Server logic | `createServerFn` for app logic; `/api/public/*` routes for Razorpay webhooks | Webhook signature verified server-side |
| Payments | Razorpay (test mode first), keys stored as secrets | PRD requirement; India-first UPI |
| Email | Resend via server function (invites, approvals, reminders, receipts) | Templated transactional email |

Security model: roles live in a separate `user_roles` table (never on profiles), RLS on every tenant table, Super Admin explicitly has **no** read access to member PII.

## Phase 0 — Foundation (design system + shell)

1. Tokens: colors, radii, spacing, Poppins typography, glow/shadow utilities in `src/styles.css`.
2. Mobile app shell: max-width 480px centered column, safe areas, top action row, fixed bottom nav.
3. Core primitives: card, lime primary button, secondary/icon buttons, pill chips, input, stat tile, progress ring/bar, toast.
4. A single style-preview screen so you can approve the look before any feature work.

## Phase 1 — Backend foundation

Enable Lovable Cloud and create the schema in one migration, with GRANTs + RLS + policies:

`gyms`, `gym_admins`, `user_roles`, `fee_plans`, `members`, `attendance`, `attendance_audit`, `payments`, plus a `has_role()` security-definer function. Amounts stored as integer paise.

## Phase 2 — Auth flows

Gym admin signup request → pending; login with role-based redirect (`/super-admin`, `/admin`, `/m`); member invite acceptance + set password; forgot/reset password.

## Phase 3 — Super Admin

Dashboard (gyms, members, MRR, pending count) → Pending approvals (approve/reject + email) → All gyms table → Gym detail (metadata only, no member PII) → suspend/reactivate.

## Phase 4 — Gym Admin core

Dashboard cards + live activity feed → Fee plans CRUD → Members list with search/filters → Add/edit member (photo upload, invite email) → Member detail with attendance calendar and payment history.

## Phase 5 — Attendance

Static gym QR at `/checkin?gym=ID` → logged-in check-in, second scan prompts check-out → success screens → admin "currently in gym" / "today's visits" with live refresh → GitHub-style contribution calendar → manual attendance edit with audit rows.

## Phase 6 — Payments

Monthly fee cycle generation → paid/pending/overdue dashboard → manual (cash/UPI) payment recording → Razorpay connect for the gym → member Pay Now with hosted checkout → verified webhook updating payment status → receipts and admin notification.

## Phase 7 — Member app

Member dashboard (last payment, next due, month attendance) → payment history → attendance calendar → profile.

## Phase 8 — Reminders, exports, polish

Single + bulk payment reminders, CSV exports (members / payments / attendance with date range), in-app notification bell, empty/loading/error states, accessibility pass, SEO metadata per route.

## Working agreement

- One task per turn: I build a single screen or slice, then stop.
- You review, report any bug, and tell me to fix or proceed.
- No unrequested extras, no bulk generation.

## Suggested order to start

Phase 0, step 1+2 (tokens + app shell + style preview screen). Say "start" and I'll do only that.
