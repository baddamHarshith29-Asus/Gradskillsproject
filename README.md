# CoNexus — Coworking Multi-Center CRM & ERP OS

CoNexus is a unified SaaS coworking operating system built to streamline operations across multiple branches. It brings visitor logs, room/seat bookings, member CRM profiles, e-signatures, billing invoices, and support tickets into a single premium interface with local AI forecasts and visual drag-and-drop seating managers.

---

## 📋 Project Overview

Managing multiple coworking branches often results in fragmented operations across visitor management, bookings, billing, and internal communications. CoNexus solves this by consolidating all tools into a single, high-fidelity dashboard. Designed for coworking operators, branch managers, community leads, and finance teams, CoNexus replaces disparate spreadsheets and messaging tools with a central, role-based operating system.

---

## 🛠️ Tech Stack Used

*   **Frontend & Logic:** Next.js 16 (App Router), React 19, TypeScript
*   **Database:** SQLite (Zero-config local engine) with Prisma 7 ORM
*   **Styling:** Tailwind CSS v4 (Sleek custom dark mode theme with navy/slate surfaces and blue/emerald accents)
*   **State Management:** Zustand (for reactive simulation and webhooks console)
*   **Libraries:** 
    *   `react-konva` & `konva` (Interactive grid snapping seating layouts)
    *   `react-big-calendar` (Real-time booking and scheduling visualization)
    *   `pdf-lib` (Dynamic client lease agreement PDF generation)
    *   `signature_pad` (Smart e-signature capture)
    *   `lucide-react` (Modern vector iconography)
    *   `date-fns` (Date calculations and formatting)

---

## 🚀 Features Implemented

1.  **Multi-Center Control Center & AI Forecasting:**
    *   Unified view of MRR, occupancy, member rosters, and active support tickets across branches.
    *   Browser-native linear regression models to predict 7-day seat utilization.
2.  **Staff Registration & Authentication:**
    *   Database-connected registration (`/register`) to create staff/employee accounts mapped to specific branches.
    *   Database-connected credential sign-in (`/login`) verifying registered staff profiles.
    *   Judges' Quick Login panel to instantly jump between core personas (Super Admin, Branch Manager, Community Lead, Finance, Member, Kiosk).
3.  **Interactive Seating Layouts & Peak-Hour Bookings:**
    *   Visual floor plan builder allowing drag-and-drop desk/office allocation.
    *   Peak-hour pricing model (+15% peak surcharge, -15% off-peak discount) with double-booking collision guards.
4.  **5-Step Onboarding & E-Signatures:**
    *   Step-by-step wizard to collect member profile details, assign workspaces, establish leasing terms, and capture hand-drawn signatures.
    *   Dynamic generation of legal lease PDFs containing captured signature metadata.
5.  **Financial Ledger & SLA Ticketing:**
    *   Custom invoice creator with automated tax calculations and billing statement generation.
    *   SLA-monitored support ticketing board (breached tickets open > 4 hours flash warning flags).
6.  **Concierge Lobby Kiosk:**
    *   Self-check-in portal at `/kiosk` for visitors, notifying hosts on arrivals.

---

## 💻 Setup Instructions

Follow these instructions to run the project locally:

### 1. Clone & Install Dependencies
Ensure you use the legacy peer dependencies flag to avoid conflicts:
```bash
npm install --legacy-peer-deps
```

### 2. Configure Database & Environment
Prisma is configured to use SQLite locally:
```bash
# Push database schema & create local SQLite db file
npx prisma db push

# Seed the database with a complete set of branches, floors, spaces, and clients
npx prisma db seed
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
