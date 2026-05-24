# CoNexus — Coworking Multi-Center CRM & ERP OS

CoNexus is a unified SaaS coworking operating system built to streamline operations across multiple branches. It brings visitor logs, room/seat bookings, member CRM profiles, e-signatures, billing invoices, and support tickets into a single premium interface with local AI forecasts and visual drag-and-drop seating managers.

---

## 🚀 Key Features (Hackathon Moat)

1. **Multi-Center Control Center & AI Forecasting**
   - Review MRR, occupancy, member rosters, and support queues across all center locations.
   - Run browser-native linear regression models to predict 7-day seat utilization and adjust room bookings.

2. **Interactive Seating Layouts & Bookings**
   - Snapping grid canvas using `react-konva` for drawing desks and offices.
   - Double-booking guards, real-time schedule calendars (`react-big-calendar`), and dynamic pricing calculators adjusting hourly rates (+15% during peak hours, -15% for off-peak periods).

3. **5-Step Onboarding & E-Signatures**
   - Wizard collect profiles, floor allocations, licensing terms, and hand-drawn signatures (`signature_pad`).
   - Compiles metadata and signatures into a legal lease PDF dynamically (`pdf-lib`) for immediate download.

4. **Financial Ledger & Renewals Pipeline**
   - Compile custom invoices, calculate taxes, collect payments, and print PDF billing statements.
   - Filter expiries by day ranges and trigger simulated email/WhatsApp alerts.

5. **Concierge Lobby Kiosk & Ticketing SLAs**
   - Fullscreen tablet concierge route at `/kiosk` for self-check-ins and host arrival alerts.
   - SLA ticket board displaying support complaints. Tickets open for more than 4 hours flash a red warning badge.

---

## 🛠️ Technology Stack & Dependencies

- **Core**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: SQLite (Zero-config local development) with Prisma 7 ORM
- **Styling**: Tailwind CSS v4 (Sleek dark mode theme: navy blue background, slate cards, blue accents)
- **State**: Zustand (virtual WhatsApp alerts webhook console)
- **Key Libraries**: `react-konva` (Konva), `react-big-calendar`, `pdf-lib`, `signature_pad`, `lucide-react`, `date-fns`

---

## 💻 Developer Setup & Running Locally

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Database & Environment
Prisma 7 is configured to use JS-native driver adapters, mapping connection strings dynamically at runtime.
```bash
# Push database schema & create SQLite db file
npx prisma db push

# Populate database with rich demo dataset
# Seed script generates Orgs, Branches, Spaces, Clients, Bookings, Invoices, Employees, and Tickets
npx prisma db seed
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Navigating the Hackathon Demo

When accessing the app for the first time, you will be redirected to the login interface.

To facilitate a quick, 5-minute presentation loop, the login screen includes **Quick Role Logins** for all primary personas:
- **Super Admin / Branch Manager**: Grants complete control over dashboards, floor designs, and billing systems.
- **Community Lead**: Filters views for client check-ins, onboarding workflows, and SLA complaints.
- **Finance**: Restricts focus to revenue ledgers, billing structures, and invoice creations.
- **CoNexus Member**: Grants self-service bookings, ticket submissions, and visitor pre-registrations.
- **Visitor Kiosk**: Bypasses the shell and loads the public concierge self-check-in terminal `/kiosk`.
