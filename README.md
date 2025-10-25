# VictoryRecon (v0.1)

Streamlined recon workflow for Victory Honda of Jackson — replacing the live Excel with a role‑friendly web app: status tracking, ETA, keys, RO, and full audit trail. Detail is a third‑party vendor, so they have a lightweight PIN portal.

## Features (MVP+)
- Vehicle intake: Stock, VIN, Year/Make/Model/Trim, Miles, Location (On Lot / In Transport / At Vendor / At Auction), RO, Keys (0/1/2), Notes
- Status flow: Intake → Inspection → Awaiting Approval → Approved → Parts Ordered/Backordered → In Progress → Sublet: Detail/Photos → Quality Check → Ready for Frontline → On Frontline → Sold
- Kanban dashboard with quick‑update buttons
- Vehicle detail with history timeline
- Keys tracking (2 keys policy)
- ETA inline editing
- CSV export (/vehicles → Export CSV)
- Detailer portal (read‑only v1) with PIN: shows vehicles in SUBLET_DETAIL

> Roadmap: real‑time updates (Pusher/WebSockets), role auth (Clerk/NextAuth), file uploads (key photos, RO PDFs), vendor write access, inventory API integration, SLA timers, notifications, and a public “Frontline Ready” board.

## Tech
- Next.js 14 (App Router) + TypeScript
- Prisma + SQLite (easy to migrate to Postgres later)
- Tailwind for simple, clean UI
- Server Actions for mutations (no separate API layer for v1)

## Getting Started
```bash
# 1) Install deps
npm install

# 2) Configure env
cp .env.example .env
# (Optional) expose the detailer PIN to the client if you want:
# echo 'NEXT_PUBLIC_DETAILER_PIN=1234' >> .env

# 3) Init DB
npx prisma migrate dev --name init
npm run seed

# 4) Run
npm run dev
# open http://localhost:3000
```

## Deploy
- **Vercel**: Works great. Add `DATABASE_URL` (use Neon/PlanetScale/LibSQL) and `NEXT_PUBLIC_DETAILER_PIN`. Run `prisma migrate deploy` during build or switch to Prisma Data Proxy.
- **Docker**: add a Dockerfile later (easy).

## Data Model
- `Vehicle`: core recon item + `status`, `eta`, `keysCount`, `location`, `roNumber`, `notes`, `assignedTech`, `advisor`, `vendor`
- `ActivityLog`: every change and note (audit trail)
- `User`: techs/advisors/managers (simple for now)
- `Vendor`: external partner; we use it to tag detailer/photos

## Why SQLite?
- Fast to start. Swap `DATABASE_URL` to Postgres later and run `prisma migrate deploy`.

## Shortcuts You’ll Love
- Quick Add on dashboard (intake in seconds)
- One‑click status updates on cards and vehicle detail
- Export CSV for management reports or email

## Adding enhancements
- SLA badges (overdue based on `status` and `eta` rules)
- Drag‑and‑drop Kanban (react-beautiful-dnd) — left for v1.1
- Role auth & PIN gates per role
- Vendor write access for detailer (mark “Received”, “In Progress”, “Complete”)
- Inventory feed ingest (CSV/API) to pre-create vehicles
- Webhooks/notifications to Slack/SMS for key steps
