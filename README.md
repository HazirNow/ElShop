# ElShop (الشوب) — UAE Hyper-Local Grocery & Digital Khata Platform

[![Proprietary: Commercial](https://img.shields.io/badge/License-Proprietary-red.svg)]()
[![Node: >=18](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)
[![TypeScript: ~5.8](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React: 19](https://img.shields.io/badge/React-19.0-cyan.svg)](https://react.dev/)
[![TailwindCSS: 4](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)

**ElShop** is a full-stack, WhatsApp-native grocery ordering and fulfillment platform engineered specifically for independent neighborhood supermarkets (*baqalas* and mini-marts) across residential tower clusters in the United Arab Emirates (Dubai, Abu Dhabi, Sharjah).

---

## 💡 Core Strategic Pillars

1. **Zero-Commission Economics & Tiered Growth**: Eliminates the 15%–30% GMV aggregator take-rates that squeeze small grocers. ElShop operates on a transparent SaaS tiering model (**Tier 1 Baqala: 299 AED/mo**, **Tier 2 Mart: 599 AED/mo**, **Tier 3 Franchise: 899 AED/mo**), ensuring 100% of grocery margins stay with the shopkeeper.
2. **Elevator Batching Fulfillment**: Fulfills high-density tower deliveries using the store's existing in-house staff and runners. Orders are automatically grouped by **elevator lift runs** within the same residential building rather than costly multi-neighborhood motorbike dispatch.
3. **Digital Khata (Community Credit Ledger)**: Digitizes the long-standing UAE neighborhood practice of informal store credit (*Daftar* / *Khata*) with merchant credit limits, partial repayment allocation, live statements, and 1-tap WhatsApp dispatches.
4. **End-of-Shift Cash Drawer Reconciliation**: Complete financial control system comparing expected physical cash vs. actual drawer count with UAE dirham denomination counters, variance auditing, and 1-tap WhatsApp audit reports.
5. **Zero-Install PWA Experience**: Residents order instantly via web links or elevator QR codes in their mobile browser with complete bilingual English/Arabic (RTL) support and zero app store friction.

---

## 📊 Plan & Subscription Tiering Matrix

| Feature | **Tier 1: Baqala (Small Grocery)** | **Tier 2: Mart (Mid-Size Store)** | **Tier 3: Franchise (Chains)** |
| :--- | :--- | :--- | :--- |
| **Pricing** | **299 AED / mo** | **599 AED / mo** | **899 AED / mo** |
| **Target User** | Owner-Operator | Store Manager & Accountant | Franchise General Manager |
| **Core POS** | Simple Counter & Fast Dispatch | Counter + End-of-Shift Reconciliation | Multi-Till POS + Central Auditing |
| **Customer PWA** | Quick Scan & Order | Scan & Order + Loyalty Points | Multi-Branch Catalog + Loyalty |
| **Daily Register** | Live Cash / Card / Khata Bar | Live Summary + Top Products + Shift Audit | Consolidated Multi-Store P&L |
| **Khata Controls** | Direct Ledger Balance & Settlement | Credit Limits per Resident + Warnings | Credit Limits + Aging Reports |
| **Staff & Roles** | Owner PIN | Manager, Cashier & Runner PINs | Granular RBAC Permissions |
| **WhatsApp Integration** | 1-Tap Slips & Ledger Statements | Automated Statements + Reorder Alerts | Automated Statements + Broadcast |

---

## 🏛️ System Architecture & Multi-Role Portals

```
                             ┌──────────────────────────────────────┐
                             │          ElShop Web Platform         │
                             └──────────────────┬───────────────────┘
                                                │
         ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
         │                  │                   │                   │                  │
         ▼                  ▼                   ▼                   ▼                  ▼
  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
  │   Customer   │   │   Merchant   │    │ Store Runner │    │  Super-Admin │   │  REST API &  │
  │  Storefront  │   │  POS Tablet  │    │  Mobile Web  │    │  HQ Console  │   │ State Engine │
  └──────────────┘   └──────────────┘    └──────────────┘    └──────────────┘   └──────────────┘
```

### 1. 🛍️ Customer Storefront (`CustomerView.tsx`)
- **Location-Aware Catalog**: Instant browsing of Fresh Produce, Dairy & Eggs, Bakery, Pantry, Beverages, Snacks, and Special Offers.
- **Bilingual & RTL**: One-tap toggle between English and Modern Standard Arabic with full bidirectional layout flow.
- **Strict Resident Privacy**: Isolated customer session with individual profile management (building name, unit number, contact phone).
- **Delivery Instruction Quick Chips**: Instant presets (`Leave at Door 🚪`, `Ring Doorbell 🔔`, `Do Not Disturb / Baby Sleeping 🤫`, `Call Upon Arrival 📞`, `Hand Directly 🤝`).
- **Free Delivery Progress Bar**: Live threshold tracker (Free delivery on orders $\ge$ 25 AED; 3.50 AED fee below 25 AED).
- **Intelligent Search Fallback**: When an item is unlisted or out of stock, generates an instant 1-tap WhatsApp request to the shopkeeper.
- **Conditional Khata Checkout**: Khata payment is exclusively displayed for pre-approved customers who haven't exceeded their credit limit.
- **Live Order Tracker & "Add More Items"**: Residents can monitor status and append extra grocery items to active orders before dispatch.

### 2. 🏪 Merchant Operations Dashboard (`MerchantView.tsx`)
- **Real-Time Kanban Board**: Live visual stages (`Incoming` $\rightarrow$ `Packing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`) with Web Audio API sound alerts for incoming rushes.
- **Daily Baqala Cash & Khata Register (`DailyBaqalaSummary.tsx`)**: Real-time ticker displaying Cash collected, Handheld Card POS payments, active Khata credit exposure, and delivered count with 1-tap WhatsApp summary dispatch.
- **End-of-Shift Cash Drawer Reconciliation (`ShiftReconciliationModal.tsx`)**:
  - Calculates expected cash against actual physical drawer count.
  - Interactive UAE Dirham bill counter (500, 200, 100, 50, 20, 10, 5, 1 AED).
  - Variance detection and reason auditing (*Counting Error, Petty Cash Restock, Small Change Forgiven, Unrecorded Withdrawal, Surplus Tips*).
  - 1-click formatted WhatsApp audit certificate dispatched to owner or accountant.
- **Elevator Batching Engine**: Automatic clustering of orders bound for the same residential tower to minimize lift runs.
- **Fast-Restock FMCG Presets**: 1-tap replenishment buttons (`+6`, `+12`, `+24`) directly on stock management cards.
- **Expiry Radar & Clearance Automation**: Proactive discount suggestions (30%–50% off) for items nearing expiry (<7 days) and auto-removal of expired stock.
- **Supplier Directory & Reorders**: Automated WhatsApp purchase orders and return requests for damaged/expired goods.
- **Digital Khata Management**:
  - Customer credit limit adjustments (250, 500, 1000, 2000 AED presets).
  - FIFO partial and full cash settlement logging.
  - 1-click UTF-8 CSV statement exports and formatted WhatsApp billing statements.
- **Elevator QR Poster Generator**: Printable high-resolution building flyers linking directly to the store's digital storefront.
- **Phone Camera Cataloging**: Direct HTML5 capture (`capture="environment"`) with client-side canvas compression.

### 3. 🛵 Store Runner / Rider View (`RiderView.tsx`)
- **High-Contrast Sunlight Mode**: 1-tap amber/black ultra-high contrast display for outdoor legibility in UAE midday sun (45°C+).
- **Floor Dispatch Sorter**: Ascending (bottom-up) and Descending (top-down) elevator sequence sorting based on regex-extracted unit numbers.
- **Doorstep Payment Mode Selector**: 1-tap recording for **Card Paid (Handheld Mobile POS Machine)** vs. **Cash Collected**.
- **Doorstep COD Quick-Change Calculator**: Quick tender buttons (Exact, 50, 100, 200 AED) with live change-due calculations.
- **Instant Digital WhatsApp Slips**: Generates itemized, bilingual proof-of-delivery receipts dispatched instantly to the customer's phone.
- **Swipe-to-Deliver Slider**: Prevents accidental touch events while walking or riding.

### 4. 📊 Platform Admin HQ (`AdminView.tsx`)
- **Network Overview**: Cross-store GMV, active order volume, aggregate Khata credit exposure, and shift cash dispute audits.
- **299 AED/Month Subscription Engine**: Real-time store payment status tracking with automatic suspension for accounts 10+ days overdue (backed by calendar date diffing).
- **Store Management**: Emergency pause/resume toggles, custom branding configurations, and direct WhatsApp billing reminders.

---

## 🧮 Core Business Invariants & Algorithms

### A. Unified Khata Balance Calculation (`src/khataUtils.ts`)
Khata debt calculations across all 6 API and UI call sites are consolidated into a single source of truth:

$$\text{Active Khata Debt} = \sum_{o \in \text{Orders}} \max(0, o.\text{total} - (o.\text{paidAmount} \mathbin{\Vert} 0))$$

*Criteria: `o.paymentMethod === 'khata'` $\land$ `o.paymentStatus === 'khata_debited'` $\land$ `o.status !== 'cancelled'`.*

### B. Elevator Batching Normalization
The engine normalizes building names while strictly preserving distinctive tower identifiers:
```typescript
const normalizeBuilding = (b: string) => {
  if (!b) return '';
  return b
    .toLowerCase()
    .trim()
    .replace(/[,\.\-\_\#\/]/g, ' ')
    .replace(/\b(tower|towers|twr|building|bldg|block|blk|residence|residences)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};
```
- *"Bay Square Tower 3"* $\rightarrow$ `"bay square 3"`
- *"Bay Square Tower 7"* $\rightarrow$ `"bay square 7"`
- Distinct towers never collide, preventing cross-building delivery confusion.

### C. Automated SaaS Subscription Suspension
Stores with `paymentStatus === 'overdue'` calculate elapsed days via `Math.floor((Date.now() - dueTimestamp) / 86400000)`:
- $\ge 10$ days overdue $\rightarrow$ `servicePaused = true`
- Payment settled or $< 10$ days $\rightarrow$ `servicePaused = false`
- `adminExplicitOverride: true` takes absolute precedence over automated pause states.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript (~5.8), Vite 6 |
| **Styling & Icons** | Tailwind CSS v4, Lucide React, Motion |
| **Backend Server** | Node.js (ESM), Express 4 |
| **Bundling & Build** | Vite (Client) + esbuild (Bundled CJS Server `dist/server.cjs`) |
| **Audio Engine** | Web Audio API (Synthesized order chimes) |
| **Localization** | Custom English/Arabic bidirectional dictionary (`src/translations.ts`) |

---

## 📁 Repository Structure

```
elshop/
├── server.ts                           # Express backend, REST API routes, in-memory DB & suspension logic
├── index.html                          # Root HTML entry point with viewport & font configurations
├── package.json                        # Dependencies, build scripts & metadata
├── tsconfig.json                       # TypeScript compiler options
├── vite.config.ts                      # Vite configuration with Tailwind CSS plugin
├── .env.example                        # Environment variable template
├── ONBOARDING.md                       # Merchant and store operator onboarding guide
├── README.md                           # Comprehensive platform documentation
├── src/
│   ├── main.tsx                        # React application bootstrap
│   ├── App.tsx                         # Root router, role switcher & modal controllers
│   ├── index.css                       # Global styles & Tailwind CSS v4 import
│   ├── types.ts                        # TypeScript interfaces (Store, Product, Order, Customer, etc.)
│   ├── khataUtils.ts                   # Single source of truth for Khata balance calculations
│   ├── seedData.ts                     # UAE sample catalogs (28 verified SKUs), stores, and orders
│   ├── translations.ts                 # Bilingual EN/AR dictionary and RTL text helpers
│   ├── api.ts                          # Frontend API client with offline resilience
│   ├── lib/
│   │   ├── whatsapp.ts                 # WhatsApp deep links, receipts, and statement generator
│   │   └── useOfflineSync.ts           # Service worker & offline state synchronizer
│   └── components/
│       ├── CustomerView.tsx            # Consumer ordering storefront & checkout flow
│       ├── MerchantView.tsx            # Merchant POS, Kanban board & elevator batching
│       ├── RiderView.tsx               # Store runner delivery tasks & Sunlight mode
│       ├── AdminView.tsx               # Super-admin SaaS subscription & store metrics
│       ├── DailyBaqalaSummary.tsx      # Live Cash, Card POS & Khata daily register ticker
│       ├── ShiftReconciliationModal.tsx# End-of-shift cash drawer audit & variance reconciliation
│       ├── CustomerCreditAdjustmentModal.tsx # Customer credit limit & settlement modal
│       ├── BatchKhataSettlementModal.tsx # Bulk Khata settlement wizard & CSV export
│       ├── CameraCaptureModal.tsx      # Native phone camera photo capture
│       ├── ElevatorPosterModal.tsx     # Printable building QR posters
│       ├── LegalModal.tsx              # UAE Consumer Protection (Law 15/2020) notice
│       ├── StaffAuthModal.tsx          # PIN/Passkey authentication modal
│       ├── ProductImage.tsx            # Resilient image component with category fallbacks
│       └── ElShopLogo.tsx              # Platform brand badge
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation & Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/elshop.git
   cd elshop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

### Production Build & Deployment

1. **Compile and bundle:**
   ```bash
   npm run build
   ```
   This compiles the client-side SPA to `dist/` and bundles `server.ts` into a self-contained CommonJS artifact at `dist/server.cjs` via `esbuild`.

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Type-check and lint:**
   ```bash
   npm run lint
   ```

---

## 🔑 Demo Access Credentials

| Role | Access Route | Default Passkey / PIN |
| :--- | :--- | :--- |
| **Customer** | Direct Browser URL / Elevator QR | None (Public Access) |
| **Merchant Tablet** | Role Switcher $\rightarrow$ Merchant | `1234` or `5678` |
| **Delivery Runner** | Role Switcher $\rightarrow$ Rider | `1234` or `5678` |
| **Platform Admin** | Role Switcher $\rightarrow$ Admin | `admin2026` |

---

## ⚖️ Legal & UAE Regulatory Compliance

ElShop includes consumer rights notices aligned with **UAE Federal Law No. 15 of 2020 on Consumer Protection**:
- Transparent bilingual itemized pricing (AED) including 5% UAE VAT.
- Return/refund policies for perishable and non-perishable goods.
- Contactless delivery and resident privacy protections.

*Note: For commercial production deployment in the UAE, consult certified local legal counsel to ensure licensing compliance with the relevant Department of Economy and Tourism (DET).*

---

## 🔒 Proprietary & Commercial Rights

Copyright © 2026 ElShop Technologies. All rights reserved.

This source code and related assets are proprietary and confidential. Unauthorized copying, distribution, reverse engineering, or commercial use without explicit authorization is strictly prohibited.
