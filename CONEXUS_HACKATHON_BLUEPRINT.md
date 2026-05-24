# 🏆 CoNexus — Coworking Intelligence Platform
### One-Day Hackathon Master Blueprint · Problem #01 · Coworking CRM + ERP

> **Built to win. Engineered to ship. Designed to dominate.**
> This document is the single source of truth for every developer, agent, or contributor building CoNexus. Follow every phase in order. Do not skip steps. Do not hallucinate features — build what is listed here.

---

## Table of Contents

1. [What Makes CoNexus Win](#1-what-makes-conexus-win)
2. [Unique Differentiators — Never Done Before](#2-unique-differentiators--never-done-before)
3. [Tech Stack — Zero Royalty, All Open Source](#3-tech-stack--zero-royalty-all-open-source)
4. [System Architecture](#4-system-architecture)
5. [Open Source Libraries to Use](#5-open-source-libraries-to-use)
6. [Module Breakdown](#6-module-breakdown)
7. [Phase-Wise Build Plan (1 Day)](#7-phase-wise-build-plan-1-day)
8. [Database Schema Overview](#8-database-schema-overview)
9. [UX & Design System Rules](#9-ux--design-system-rules)
10. [GitHub Deployment Guide](#10-github-deployment-guide)
11. [Demo Script for Judges](#11-demo-script-for-judges)
12. [Agent Instructions (AI Build Rules)](#12-agent-instructions-ai-build-rules)

---

## 1. What Makes CoNexus Win

The market has Nexudus, OfficeRnD, and Archie. None of them have:

- **AI Occupancy Prediction** — predicts which seats/rooms will be in demand tomorrow based on historical patterns
- **Ambient Noise Intelligence** — IoT-ready noise level scoring per zone per hour
- **Behavioral Client Scoring** — auto-scores clients by renewal risk, community engagement, and payment history
- **Dynamic Pricing Engine** — prices rooms higher at peak hours, lower at off-peak automatically
- **Visual Floor Builder** — operators drag-drop their own SVG floor layout (no CAD needed)
- **WhatsApp-Native Notifications** — sends booking confirmations, renewal reminders directly via WhatsApp API
- **Community Health Score** — per-branch metric showing how "alive" the community is (events, utilization, referrals)
- **One-Click Digital Agreement** — e-signature built in, no DocuSign needed
- **Carbon Footprint Tracker** — sustainability score per branch based on occupancy efficiency

These are judge magnets. None of your competition will have them.

---

## 2. Unique Differentiators — Never Done Before

### 2.1 — AI Occupancy Prediction (The Killer Feature)
- Use historical booking data to forecast seat/room demand per day-of-week and hour
- Show a "Demand Heatmap" — a visual floor map where hot zones glow red, cold zones blue
- Operator gets a 7-day forecast panel: "Expect 87% capacity on Tuesday 10am–2pm"
- Powered by lightweight linear regression (no API cost, runs in browser or edge function)

### 2.2 — Behavioral Client Health Score
- Every client gets a 0–100 score calculated from:
  - Payment timeliness (weight: 30%)
  - Space usage vs contract (weight: 25%)
  - Event attendance (weight: 20%)
  - Referrals given (weight: 15%)
  - Support tickets raised (weight: 10%)
- Score drives automatic actions: low score → trigger renewal conversation, high score → send referral campaign

### 2.3 — Dynamic Pricing Engine
- Conference rooms auto-adjust hourly rate based on demand signal
- Rules: "If booking rate > 70% for this slot in last 30 days, increase price 15%"
- Operator can set floor price, ceiling price, and sensitivity
- Shown in booking UI as "Peak Pricing" with a small badge

### 2.4 — Visual Floor Plan Builder (Drag & Drop)
- Operators build their floor with a drag-and-drop canvas (React + Konva.js — MIT license)
- Drop: desks, hot desks, private offices, meeting rooms, phone booths, common areas
- Each shape gets: name, capacity, amenities, pricing tier
- Saved as JSON — rendered as SVG in the member-facing booking view
- Inspect mode: hover over a seat → see who's booked it, for how long, their company

### 2.5 — Community Health Dashboard
- Per-branch "Community Score" (0–100) shown prominently on multi-location dashboard
- Inputs: avg seat utilization %, events per month, client retention %, NPS proxy, new member referrals
- Score trends over 90 days shown as sparkline
- Branch manager gets weekly "Community Digest" email auto-generated from the score data

### 2.6 — WhatsApp-First Notification Layer
- Use **whatsapp-web.js** (open source, MIT) as the notification backbone
- Triggers: booking confirmation, renewal 30/15/7/1 day reminders, invoice due, visitor arrival, seat change
- Client can reply "CONFIRM", "CANCEL", "SNOOZE 3 DAYS" — system processes reply automatically
- No Twilio cost in demo — use whatsapp-web.js QR-code session for judges

### 2.7 — E-Signature Built-In (No DocuSign)
- Use **Signature Pad** (open source, MIT — https://github.com/szimek/signature_pad)
- Client receives link → signs on device → PNG stored in Supabase Storage
- Agreement PDF auto-generated using **pdf-lib** (MIT)
- Legally formatted with client details, space details, terms, date, and signature embedded

### 2.8 — Carbon Efficiency Score
- Formula: (Occupied seats / Total seats) × avg booking duration × days in period
- Score benchmarked against "industry average" (show as: "Your space is 23% more efficient than average")
- Shown on the sustainability tab of each branch card
- Exportable as a PDF sustainability report

---

## 3. Tech Stack — Zero Royalty, All Open Source

| Layer | Technology | License | Reason |
|---|---|---|---|
| Frontend Framework | **Next.js 14** (App Router) | MIT | SSR, API routes, file-based routing |
| UI Components | **shadcn/ui** + **Radix UI** | MIT | Unstyled, accessible, composable |
| Styling | **Tailwind CSS** | MIT | Utility-first, design-system friendly |
| Floor Plan Builder | **Konva.js** + **react-konva** | MIT | Canvas-based drag-drop, no royalties |
| Seat Map Viewer | **@alisaitteke/seatmap-canvas** | MIT | Interactive seat selection |
| Charts & Analytics | **Recharts** | MIT | Composable React charts |
| Database ORM | **Prisma** | Apache 2.0 | Type-safe DB client |
| Database | **Supabase (PostgreSQL)** | Apache 2.0 | Auth + DB + Storage + Realtime |
| Auth | **Supabase Auth** | MIT | RBAC-ready, zero config |
| Email | **Resend** + **React Email** | MIT | Transactional email, free tier |
| PDF Generation | **pdf-lib** | MIT | No server needed, browser + Node |
| E-Signature | **signature_pad** (szimek) | MIT | Canvas-based signature capture |
| WhatsApp | **whatsapp-web.js** | Apache 2.0 | QR-based session, no API cost |
| Notifications | **Sonner** (toast) | MIT | Premium toast notifications |
| Form Management | **React Hook Form** + **Zod** | MIT | Validation + type safety |
| Date/Time | **date-fns** | MIT | Zero-bloat date utility |
| State Management | **Zustand** | MIT | Lightweight global state |
| Tables | **TanStack Table v8** | MIT | Headless, powerful data tables |
| Realtime | **Supabase Realtime** | MIT | Live seat availability, visitor board |
| Icons | **Lucide React** | ISC | Clean, consistent icon set |
| Drag & Drop | **@dnd-kit/core** | MIT | Accessible drag-and-drop |
| Calendar | **react-big-calendar** | MIT | Room/desk booking calendar views |
| Deployment | **Vercel** (free tier) | — | GitHub-connected, zero config |

---

## 4. System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        CoNexus Platform                        │
├────────────────────┬───────────────────────────────────────────┤
│   Next.js Frontend │          Supabase Backend                 │
│   (App Router)     │                                           │
│                    │  ┌──────────┐  ┌──────────┐              │
│  ┌──────────────┐  │  │PostgreSQL│  │  Storage │              │
│  │ Operator     │  │  │(Prisma)  │  │(PDFs,    │              │
│  │ Dashboard    │  │  └──────────┘  │ Sigs,    │              │
│  ├──────────────┤  │  ┌──────────┐  │ Avatars) │              │
│  │ Branch Mgr   │◄─┼─►│  Auth    │  └──────────┘              │
│  │ Dashboard    │  │  │  (RBAC)  │  ┌──────────┐              │
│  ├──────────────┤  │  └──────────┘  │ Realtime │              │
│  │ Member Portal│  │  ┌──────────┐  │(WebSocket│              │
│  ├──────────────┤  │  │Edge Funcs│  │ channels)│              │
│  │ Finance View │  │  │(Triggers,│  └──────────┘              │
│  ├──────────────┤  │  │Reminders)│                            │
│  │ Visitor Kiosk│  │  └──────────┘                            │
│  └──────────────┘  │                                           │
│                    │                                           │
│  ┌──────────────┐  │  ┌─────────────────────────────────────┐ │
│  │ Floor Builder│  │  │    AI Layer (Edge, No API Cost)      │ │
│  │ (Konva.js)   │  │  │  - Occupancy Forecast (linear reg)  │ │
│  └──────────────┘  │  │  - Client Health Score calculation  │ │
│                    │  │  - Dynamic pricing rule engine       │ │
│  ┌──────────────┐  │  └─────────────────────────────────────┘ │
│  │ WhatsApp Bot │  │                                           │
│  │ (whatsapp-   │  │                                           │
│  │  web.js)     │  │                                           │
│  └──────────────┘  │                                           │
└────────────────────┴───────────────────────────────────────────┘
```

---

## 5. Open Source Libraries to Use

### Must-Use (Core)
```bash
npx create-next-app@latest conexus --typescript --tailwind --app
cd conexus

# UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog sheet table badge tabs form input select

# Database
npm install @prisma/client prisma
npm install @supabase/supabase-js @supabase/ssr

# Floor Plan
npm install konva react-konva

# Seat Map
npm install @alisaitteke/seatmap-canvas

# Charts
npm install recharts

# Forms
npm install react-hook-form @hookform/resolvers zod

# Tables
npm install @tanstack/react-table

# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Calendar
npm install react-big-calendar date-fns

# PDF + Signature
npm install pdf-lib signature_pad

# State
npm install zustand

# Notifications
npm install sonner

# Icons
npm install lucide-react

# Email
npm install resend @react-email/components

# Utilities
npm install clsx tailwind-merge class-variance-authority
```

### For WhatsApp (Run as separate microservice)
```bash
mkdir whatsapp-service && cd whatsapp-service
npm init -y
npm install whatsapp-web.js qrcode-terminal express
```

---

## 6. Module Breakdown

Build these modules in exactly this order. Each module is a folder under `app/(dashboard)/`.

### Module 1: Auth + RBAC (`/auth`)
- Supabase Auth with magic link + password
- Roles: `super_admin`, `branch_manager`, `community_lead`, `finance`, `member`, `visitor`
- Middleware: `middleware.ts` checks role → redirects to correct dashboard

### Module 2: Multi-Location Dashboard (`/dashboard`)
- Cards per branch: name, city, occupancy %, community score, MRR, open tickets
- Global filters: date range, branch
- KPI row: total members, total revenue, avg occupancy, renewals due
- Community Health Score sparkline (90-day trend)
- AI Demand Forecast panel (next 7 days)

### Module 3: Floor Plan Builder (`/floor-builder`)
- Konva.js canvas: 800×600px with grid
- Left sidebar: draggable elements (desk, hot-desk, office, meeting room, phone booth)
- Properties panel: name, capacity, hourly rate, amenities checklist
- Save floor → JSON stored in `floor_plans` table
- Published floor → rendered as interactive SVG booking view

### Module 4: Smart Booking (`/booking`)
- Calendar view (react-big-calendar): month/week/day
- Floor map view: click a seat → see availability + book
- Dynamic pricing badge on rooms at peak hours
- Conflict detection: real-time via Supabase Realtime
- Booking confirmation → triggers WhatsApp + email

### Module 5: Visitor Management (`/visitors`)
- Kiosk mode: fullscreen check-in page (iPad-friendly)
- QR code visitor pre-registration link
- Host notification on arrival (WhatsApp + in-app)
- Visitor log table: name, company, host, purpose, time-in, time-out
- Badge printing template (HTML/CSS print view)

### Module 6: Client CRM (`/clients`)
- Client cards with health score badge (0–100, color-coded)
- Lifecycle stages: Lead → Prospect → Onboarding → Active → At-Risk → Churned
- Timeline view: all interactions, bookings, payments, tickets, notes
- Quick actions: send proposal, create invoice, schedule call, log note
- Bulk actions: export CSV, send campaign

### Module 7: Lead & Sales Pipeline (`/pipeline`)
- Kanban board (dnd-kit): stages drag-and-drop
- Lead card: company, contact, space interest, deal value, last activity
- Lead score auto-calculated from engagement
- Proposal builder → PDF auto-generated with pdf-lib

### Module 8: Client Onboarding (`/onboarding`)
- Wizard: 5 steps (space selection → contract → payment → access setup → welcome)
- E-signature step: signature_pad → PNG → embedded in agreement PDF
- Agreement PDF: auto-filled from client + space data using pdf-lib
- Welcome email auto-sent via Resend on completion

### Module 9: Finance & Billing (`/finance`)
- Invoice builder: line items, tax, discount
- Recurring billing: monthly/quarterly/annual toggle
- Payment tracking: paid, due, overdue (with days count)
- Revenue chart: MRR, ARR, outstanding by branch
- Export: CSV for accounting, PDF invoices

### Module 10: Renewals & Reminders (`/renewals`)
- Calendar of expiring contracts (30/15/7/1 days buckets)
- Auto-reminder scheduler: WhatsApp + email at each milestone
- Renewal pipeline: status → Pending → In Negotiation → Renewed → Churned
- Risk flag: clients with health score < 40 auto-flagged

### Module 11: Team & HR (`/team`)
- Employee profiles: role, branch, permissions
- Task board: assign tasks across locations
- Team chat (simple, built-in): per-branch channels + direct messages
- Leave/availability calendar

### Module 12: Ticket System (`/tickets`)
- Submit: member submits issue (internet, AC, cleaning, noise, etc.)
- Assign: auto-assign by category to responsible team member
- Status: Open → In Progress → Resolved
- SLA timer: shows time since opened, SLA breach alert if > 4 hours

### Module 13: Analytics & Reports (`/analytics`)
- Occupancy heatmap: floor map color-coded by usage
- Revenue breakdown by branch, plan type, add-on
- Client retention cohort chart
- Peak hours bar chart per day of week
- Carbon efficiency score with trend
- Export: PDF report button (pdf-lib)

### Module 14: Website CMS (`/cms`)
- Edit: hero text, about, pricing plans, contact info
- Photo gallery management: upload → Supabase Storage
- Embedded booking widget: copy-paste code snippet
- SEO meta per branch microsite

### Module 15: Integrations & Settings (`/settings`)
- WhatsApp: QR code scan to connect session
- Email: SMTP or Resend API key input
- Payment Gateway: Razorpay / Stripe key toggle (India-first)
- Notification preferences per role
- RBAC management: add roles, assign users

---

## 7. Phase-Wise Build Plan (1 Day)

> Clock starts: 9:00 AM. Demo at: 5:00 PM. You have 8 hours.
> Assign 1 developer per phase. If solo, follow phases sequentially.

---

### ⏱ Phase 0 — Setup (9:00–9:30 AM) — 30 min

**Agent Task: Do exactly these commands, in this order.**

```bash
# 1. Create Next.js project
npx create-next-app@latest conexus --typescript --tailwind --app --src-dir --import-alias "@/*"
cd conexus

# 2. Install all dependencies (copy-paste the full block from Section 5)

# 3. Initialize shadcn/ui
npx shadcn-ui@latest init
# Choose: Default style, Slate base color, CSS variables YES

# 4. Initialize Prisma
npx prisma init

# 5. Create .env.local from template below

# 6. Push to GitHub
git init
git add .
git commit -m "feat: project scaffold"
gh repo create conexus --public --source=. --push
```

**.env.local template:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_supabase_postgres_url
RESEND_API_KEY=your_resend_key
NEXTAUTH_SECRET=generate_random_32chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### ⏱ Phase 1 — Foundation (9:30–10:30 AM) — 1 hour

**Build in this order:**

1. `prisma/schema.prisma` — full schema (see Section 8)
2. `npx prisma db push` — create all tables
3. `lib/supabase/` — client + server + middleware helpers
4. `middleware.ts` — role-based route protection
5. `app/(auth)/login/page.tsx` — login page (shadcn Card + Form)
6. `app/(auth)/layout.tsx` — auth layout
7. `lib/rbac.ts` — role permissions map

**Deliverable:** Working login that redirects by role. Commit: `feat: auth + rbac foundation`

---

### ⏱ Phase 2 — Dashboard Shell (10:30–11:30 AM) — 1 hour

**Build in this order:**

1. `app/(dashboard)/layout.tsx` — sidebar + topbar layout
2. `components/layout/Sidebar.tsx` — navigation with role-aware menu items
3. `components/layout/Topbar.tsx` — search, notifications bell, user avatar
4. `app/(dashboard)/dashboard/page.tsx` — multi-location overview
5. `components/dashboard/BranchCard.tsx` — occupancy, score, MRR card
6. `components/dashboard/KPIRow.tsx` — 4 metric cards with icons
7. Seed database: 3 branches, 10 clients, 50 bookings (run `prisma/seed.ts`)

**Deliverable:** Dashboard renders with seeded data. Commit: `feat: dashboard shell + seed data`

---

### ⏱ Phase 3 — Floor Plan + Booking (11:30 AM–1:00 PM) — 1.5 hours

**Build in this order:**

1. `app/(dashboard)/floor-builder/page.tsx` — Konva.js canvas floor builder
2. `components/floor/FloorCanvas.tsx` — draggable shapes, grid snap
3. `components/floor/ShapeSidebar.tsx` — draggable element palette
4. `components/floor/PropertiesPanel.tsx` — name, capacity, rate inputs
5. `app/(dashboard)/booking/page.tsx` — react-big-calendar + floor map tabs
6. `components/booking/BookingModal.tsx` — date/time picker, client select, price shown
7. `api/bookings/` — POST create, GET availability check

**Dynamic Pricing Logic (in `lib/pricing.ts`):**
```typescript
export function calculatePrice(baseRate: number, historicalBookingRate: number): number {
  if (historicalBookingRate > 0.7) return Math.round(baseRate * 1.15);
  if (historicalBookingRate < 0.3) return Math.round(baseRate * 0.85);
  return baseRate;
}
```

**Deliverable:** Book a desk from floor map. Dynamic pricing shows. Commit: `feat: floor builder + smart booking`

---

### ⏱ Phase 4 — CRM + Onboarding (1:00–2:00 PM) — 1 hour

**Build in this order:**

1. `app/(dashboard)/clients/page.tsx` — client list with health score badges
2. `components/clients/ClientCard.tsx` — health score ring, lifecycle badge
3. `lib/scoring.ts` — health score calculation function
4. `app/(dashboard)/clients/[id]/page.tsx` — client detail + timeline
5. `app/(dashboard)/onboarding/page.tsx` — 5-step wizard
6. `components/onboarding/SignatureStep.tsx` — signature_pad integration
7. `lib/pdf.ts` — agreement PDF generation with pdf-lib

**Health Score Calculation (`lib/scoring.ts`):**
```typescript
export function calculateHealthScore(client: ClientMetrics): number {
  const paymentScore = client.onTimePayments / client.totalPayments * 30;
  const usageScore = Math.min(client.avgUsage / client.contractedHours, 1) * 25;
  const eventScore = Math.min(client.eventsAttended / 4, 1) * 20;
  const referralScore = Math.min(client.referrals / 2, 1) * 15;
  const ticketScore = Math.max(0, 1 - client.tickets / 5) * 10;
  return Math.round(paymentScore + usageScore + eventScore + referralScore + ticketScore);
}
```

**Deliverable:** Client list with scores. Onboarding wizard with e-signature works. Commit: `feat: crm + onboarding + esignature`

---

### ⏱ Phase 5 — Finance + Renewals (2:00–3:00 PM) — 1 hour

**Build in this order:**

1. `app/(dashboard)/finance/page.tsx` — revenue dashboard + invoice list
2. `components/finance/InvoiceBuilder.tsx` — line items, tax, totals
3. `lib/invoice-pdf.ts` — invoice PDF with pdf-lib
4. `app/(dashboard)/renewals/page.tsx` — expiry buckets (30/15/7/1 days)
5. `components/renewals/RenewalCard.tsx` — client, contract end, risk score, actions
6. `api/reminders/` — cron-ready reminder trigger endpoint

**Deliverable:** Invoice generation to PDF. Renewals board visible. Commit: `feat: finance + renewals`

---

### ⏱ Phase 6 — Visitor + Tickets + Analytics (3:00–4:00 PM) — 1 hour

**Build in this order:**

1. `app/(dashboard)/visitors/page.tsx` — visitor log + realtime arrivals
2. `app/kiosk/page.tsx` — fullscreen visitor check-in (separate route, no sidebar)
3. `app/(dashboard)/tickets/page.tsx` — ticket board with SLA timers
4. `app/(dashboard)/analytics/page.tsx` — occupancy heatmap + revenue chart + carbon score
5. `components/analytics/OccupancyHeatmap.tsx` — floor map colored by usage %
6. `components/analytics/ForecastPanel.tsx` — 7-day AI demand forecast

**AI Forecast (lightweight, no API cost):**
```typescript
// lib/forecast.ts - Simple 7-day demand forecast using day-of-week averages
export function forecastDemand(historicalBookings: Booking[]): DayForecast[] {
  const dayAverages = [0,1,2,3,4,5,6].map(day => {
    const dayBookings = historicalBookings.filter(b => new Date(b.date).getDay() === day);
    return dayBookings.length > 0 
      ? dayBookings.reduce((sum, b) => sum + b.utilizationRate, 0) / dayBookings.length 
      : 0;
  });
  return next7Days().map(date => ({
    date,
    predictedUtilization: dayAverages[date.getDay()],
    confidence: historicalBookings.length > 28 ? 'high' : 'medium'
  }));
}
```

**Deliverable:** Visitor kiosk works. Analytics charts render. Commit: `feat: visitor + tickets + analytics`

---

### ⏱ Phase 7 — Polish + Deploy (4:00–5:00 PM) — 1 hour

**Must do in this order:**

1. Fix any broken imports or TypeScript errors: `npm run build` — fix every error
2. Make sure seed data is rich: 3 branches, 15+ clients, 100+ bookings
3. Ensure demo flow works end-to-end (see Section 11)
4. Push final code to GitHub
5. Deploy to Vercel:
   - Go to vercel.com → Import GitHub repo → Add env vars → Deploy
   - Custom domain optional: `conexus.vercel.app`
6. Add README.md with screenshots + live demo link
7. Record 60-second screen recording for submission (optional but powerful)

---

## 8. Database Schema Overview

```prisma
// prisma/schema.prisma

model Organization {
  id        String   @id @default(cuid())
  name      String
  branches  Branch[]
  createdAt DateTime @default(now())
}

model Branch {
  id             String    @id @default(cuid())
  name           String
  city           String
  address        String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  floors         Floor[]
  clients        Client[]
  bookings       Booking[]
  visitors       Visitor[]
  employees      Employee[]
  tickets        Ticket[]
  createdAt      DateTime  @default(now())
}

model Floor {
  id        String   @id @default(cuid())
  name      String
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  layoutJson Json    // Konva.js canvas state
  spaces    Space[]
}

model Space {
  id          String    @id @default(cuid())
  name        String
  type        SpaceType // DESK | HOT_DESK | PRIVATE_OFFICE | MEETING_ROOM | PHONE_BOOTH
  capacity    Int
  baseRate    Float
  floorId     String
  floor       Floor     @relation(fields: [floorId], references: [id])
  bookings    Booking[]
  amenities   String[]
  isActive    Boolean   @default(true)
}

model Client {
  id            String        @id @default(cuid())
  name          String
  company       String
  email         String        @unique
  phone         String?
  whatsapp      String?
  branchId      String
  branch        Branch        @relation(fields: [branchId], references: [id])
  lifecycle     LifecycleStage @default(LEAD)
  healthScore   Int           @default(50)
  contracts     Contract[]
  bookings      Booking[]
  invoices      Invoice[]
  tickets       Ticket[]
  createdAt     DateTime      @default(now())
}

model Contract {
  id          String    @id @default(cuid())
  clientId    String
  client      Client    @relation(fields: [clientId], references: [id])
  spaceId     String
  startDate   DateTime
  endDate     DateTime
  monthlyRate Float
  status      ContractStatus @default(ACTIVE)
  signedPdfUrl String?
  signatureUrl String?
  createdAt   DateTime  @default(now())
}

model Booking {
  id        String   @id @default(cuid())
  spaceId   String
  space     Space    @relation(fields: [spaceId], references: [id])
  clientId  String?
  client    Client?  @relation(fields: [clientId], references: [id])
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  startTime DateTime
  endTime   DateTime
  status    BookingStatus @default(CONFIRMED)
  totalAmount Float
  createdAt DateTime @default(now())
}

model Visitor {
  id          String   @id @default(cuid())
  name        String
  company     String?
  email       String?
  phone       String?
  hostName    String
  hostEmail   String
  purpose     String?
  branchId    String
  branch      Branch   @relation(fields: [branchId], references: [id])
  checkInAt   DateTime @default(now())
  checkOutAt  DateTime?
}

model Invoice {
  id          String    @id @default(cuid())
  clientId    String
  client      Client    @relation(fields: [clientId], references: [id])
  amount      Float
  tax         Float     @default(0)
  status      InvoiceStatus @default(PENDING)
  dueDate     DateTime
  paidAt      DateTime?
  lineItems   Json
  pdfUrl      String?
  createdAt   DateTime  @default(now())
}

model Employee {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  role      UserRole
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  createdAt DateTime @default(now())
}

model Ticket {
  id          String    @id @default(cuid())
  title       String
  description String
  category    String
  priority    Priority  @default(MEDIUM)
  status      TicketStatus @default(OPEN)
  branchId    String
  branch      Branch    @relation(fields: [branchId], references: [id])
  clientId    String?
  client      Client?   @relation(fields: [clientId], references: [id])
  assigneeId  String?
  createdAt   DateTime  @default(now())
  resolvedAt  DateTime?
}

enum SpaceType { DESK HOT_DESK PRIVATE_OFFICE MEETING_ROOM PHONE_BOOTH COMMON_AREA }
enum LifecycleStage { LEAD PROSPECT ONBOARDING ACTIVE AT_RISK CHURNED }
enum ContractStatus { ACTIVE EXPIRING EXPIRED RENEWED TERMINATED }
enum BookingStatus { CONFIRMED CANCELLED COMPLETED NO_SHOW }
enum InvoiceStatus { PENDING PAID OVERDUE CANCELLED }
enum UserRole { SUPER_ADMIN BRANCH_MANAGER COMMUNITY_LEAD FINANCE MEMBER VISITOR }
enum Priority { LOW MEDIUM HIGH URGENT }
enum TicketStatus { OPEN IN_PROGRESS RESOLVED CLOSED }
```

---

## 9. UX & Design System Rules

**These rules are non-negotiable. Every screen must follow them.**

### Color Palette
```css
/* Use in tailwind.config.ts */
:root {
  --brand-900: #0a0f1e;    /* Deep navy — primary bg */
  --brand-800: #111827;    /* Sidebar bg */
  --brand-700: #1e2a3b;    /* Card bg */
  --brand-600: #243447;    /* Border, divider */
  --brand-400: #3b82f6;    /* Primary accent — electric blue */
  --brand-300: #60a5fa;    /* Hover state */
  --success: #10b981;      /* Green — healthy, paid, confirmed */
  --warning: #f59e0b;      /* Amber — at-risk, due soon */
  --danger: #ef4444;       /* Red — overdue, churned, urgent */
  --neutral: #94a3b8;      /* Muted text */
}
```

### Typography Rules
- Headings: **DM Sans** (Google Fonts, OFL license) — weight 500, 600, 700
- Body: **Inter** — weight 400, 500
- Mono (for IDs, codes): **JetBrains Mono**
- Never use system fonts for headings

### Layout Rules
- Sidebar: 240px fixed, dark (`brand-800`)
- Topbar: 64px, border-bottom
- Content area: padding 24px, max-width 1400px
- Cards: `rounded-xl`, `border border-brand-600`, `bg-brand-700`
- No shadows on dark backgrounds — use borders instead

### Component Rules
- Health score: always shown as a colored ring (0–40 red, 41–70 amber, 71–100 green)
- Status badges: use `variant="outline"` shadcn badge with color-coded borders
- Tables: always use TanStack Table, never plain HTML tables
- Loading states: use skeleton components (shadcn Skeleton), never spinners alone
- Empty states: always include an icon + title + description + action button
- All forms: React Hook Form + Zod validation, errors shown inline
- Toasts: Sonner, always positioned bottom-right

### Things to NEVER Do
- No purple gradients
- No glassmorphism with white blur
- No stock photo backgrounds
- No centered dashboard layouts (always left-sidebar)
- No Comic Sans, Roboto, or Arial
- No success modals for every single action — use toast instead

---

## 10. GitHub Deployment Guide

### Repository Structure
```
conexus/
├── app/
│   ├── (auth)/          # Login, register pages
│   ├── (dashboard)/     # All protected routes
│   │   ├── dashboard/
│   │   ├── booking/
│   │   ├── floor-builder/
│   │   ├── clients/
│   │   ├── finance/
│   │   ├── renewals/
│   │   ├── visitors/
│   │   ├── analytics/
│   │   ├── tickets/
│   │   ├── team/
│   │   └── settings/
│   ├── kiosk/           # Public visitor check-in
│   └── api/             # API routes
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── floor/
│   ├── booking/
│   ├── clients/
│   ├── finance/
│   └── ui/              # shadcn components
├── lib/
│   ├── supabase/
│   ├── prisma.ts
│   ├── scoring.ts
│   ├── pricing.ts
│   ├── forecast.ts
│   └── pdf.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
└── whatsapp-service/    # Separate Node.js service
```

### Deployment Steps
```bash
# 1. Final build check
npm run build
# Fix ALL errors before proceeding

# 2. Push to GitHub
git add .
git commit -m "feat: complete CoNexus platform v1.0"
git push origin main

# 3. Deploy to Vercel
# Go to: https://vercel.com/new
# → Import from GitHub → select conexus repo
# → Add ALL env variables from .env.local
# → Click Deploy

# 4. After deploy, run seed on production
# In Vercel dashboard → Functions → run seed endpoint
# OR: connect to Supabase dashboard and run seed SQL

# 5. Share URL with judges:
# https://conexus.vercel.app
```

### README.md for GitHub (Copy This)
```markdown
# CoNexus — Coworking Intelligence Platform

**One platform. Every branch. Zero chaos.**

Live Demo: [conexus.vercel.app](https://conexus.vercel.app)
Demo Login: demo@conexus.app / demo123

## What CoNexus Does
- Multi-branch coworking CRM + ERP
- Visual drag-drop floor plan builder
- AI occupancy demand forecasting
- Client health scoring engine
- Dynamic pricing for meeting rooms
- Built-in e-signature + PDF agreements
- WhatsApp-native notifications
- Visitor management kiosk

## Stack
Next.js 14 · Supabase · Prisma · Konva.js · shadcn/ui · Tailwind CSS

## Run Locally
\`\`\`bash
git clone https://github.com/yourusername/conexus
cd conexus
npm install
cp .env.example .env.local
# Fill in Supabase credentials
npx prisma db push
npx prisma db seed
npm run dev
\`\`\`
```

---

## 11. Demo Script for Judges

**Time: 5 minutes max. Follow this exact flow.**

### Act 1: The Problem (30 seconds)
> "Coworking operators today juggle WhatsApp for renewals, Excel for billing, a separate booking tool, and another for visitor management. CoNexus replaces all of that."

### Act 2: Multi-Location Overview (1 minute)
- Open dashboard → show 3 branch cards
- Point to Community Health Score: "This branch is at 73/100 — healthy. This one is 41 — at risk"
- Show AI Forecast panel: "CoNexus predicts Tuesday will hit 87% capacity. Operator can pre-sell rooms"
- Show KPI row: total MRR, occupancy, renewals due

### Act 3: The Floor Builder (1 minute)
- Go to Floor Builder → drag a desk, a meeting room, a phone booth onto the canvas
- Set meeting room rate to ₹500/hr → save
- Switch to booking view → click the meeting room → "Peak Pricing: ₹575/hr" badge appears
- Book it → confirmation appears

### Act 4: Client Intelligence (1 minute)
- Go to Clients → show health score rings
- Click on a client with score 34 → timeline shows: 2 late payments, low event attendance
- Show that a renewal reminder was auto-sent to WhatsApp

### Act 5: Onboarding + E-Signature (1 minute)
- Go to Onboarding → run the wizard
- On signature step: sign on screen
- Show the generated PDF agreement with signature embedded
- "No DocuSign subscription needed"

### Act 6: The Closer (30 seconds)
> "CoNexus unifies 8 separate tools into one. It predicts demand before it happens, scores clients before they churn, and signs contracts without leaving the platform. This is what coworking operations look like in 2025."

---

## 12. Agent Instructions (AI Build Rules)

**If you are an AI agent building this project, follow these rules absolutely:**

### MUST DO
- Follow the phases in Section 7 in exact order
- Install only the libraries listed in Section 5
- Use the exact schema from Section 8 — no modifications without explicit instruction
- Every component must be TypeScript with proper types
- Use `shadcn/ui` components first, only build custom if shadcn doesn't have it
- Commit after every phase with the exact commit message given
- Use `lib/` for all utility functions — never put business logic in components
- All API routes go in `app/api/` as Next.js Route Handlers
- Use Supabase for auth — do not implement custom JWT

### MUST NOT DO
- Do not install libraries not listed in Section 5 without asking
- Do not use `any` TypeScript type
- Do not use inline styles — Tailwind only
- Do not create separate CSS files — use Tailwind classes
- Do not use `useEffect` for data fetching — use Next.js Server Components + `fetch`
- Do not build everything at once — phase by phase only
- Do not mock data with `Math.random()` in production components — use Prisma seed
- Do not add WhatsApp functionality until Phase 7 (it is a polish, not core)
- Do not deploy until `npm run build` returns zero errors

### WHEN STUCK
- If a library API is unclear, check the GitHub README of that library (links in Section 5)
- If Supabase auth behaves unexpectedly, check `middleware.ts` for route matching
- If Prisma schema conflicts, run `npx prisma migrate reset` (warning: drops data)
- If Konva.js has SSR issues, wrap the component in `dynamic(() => import(...), { ssr: false })`
- If build fails on PDF generation, ensure `pdf-lib` is imported only in server components or API routes

### PHASE GATE RULE
Before starting the next phase, the current phase must:
1. Build without TypeScript errors
2. Render correctly in browser
3. Be committed to GitHub

**Do not proceed if the previous phase is broken.**

---

## Appendix A: Winning Checklist

Before submission, verify every item:

- [ ] Live Vercel URL works and loads in < 3 seconds
- [ ] Demo login (demo@conexus.app / demo123) works
- [ ] 3 branches with seed data visible on dashboard
- [ ] Floor builder: can drag, drop, save a layout
- [ ] Booking: can book a desk from the floor map
- [ ] Dynamic pricing badge visible on a meeting room
- [ ] Client list shows health scores with colored rings
- [ ] Onboarding wizard completes and shows signed PDF
- [ ] Invoice generates and downloads as PDF
- [ ] Renewals board shows contracts expiring in each bucket
- [ ] Visitor check-in kiosk works at `/kiosk` route
- [ ] Analytics page loads with occupancy chart + forecast panel
- [ ] GitHub repository is public with descriptive README
- [ ] Mobile view is not broken (responsive sidebar)

---

## Appendix B: Pitch Positioning

**Against Nexudus:** "Nexudus costs $300+/month and has no AI features. CoNexus is open-source, self-hostable, and predicts demand."

**Against spreadsheets:** "Spreadsheets have a 0/100 community health score. CoNexus surfaces insights automatically."

**Against OfficeRnD:** "OfficeRnD has no floor builder, no behavioral scoring, no built-in e-signature."

**Your moat:** The combination of visual floor builder + AI demand forecast + client health scoring + built-in e-signature exists nowhere else in this market segment.

---

*CoNexus Blueprint v1.0 · Created for Hackathon #01 · One-Day Vibe Coding Challenge*
*All listed libraries are MIT / Apache 2.0 licensed — zero royalty for commercial use*
