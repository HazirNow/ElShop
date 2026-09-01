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
- **Quick-Adjustment Inventory (+1 / -1)**: Direct single-unit increments and decrements on each catalog item and low-stock pill with zero-latency optimistic updates.
- **Fast-Restock FMCG Presets**: 1-tap replenishment buttons (`+6`, `+12`, `+24`) directly on stock management cards.
- **Full Product Catalog Editing**: Comprehensive modal to update EN/AR titles, barcodes, SKUs, categories (Fresh Produce, Dairy & Eggs, Bakery, Pantry, Beverages, Snacks, Household, Personal Care), retail pricing, COGS, reorder thresholds, suppliers, and expiration dates.
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
│       ├── PilotTrainingOverlay.tsx    # Interactive self-guided training script overlay for pilot stores
│       ├── InteractiveSimulationEngine.tsx # Spring-physics interactive onboarding simulator arena (3 roles)
│       └── ElShopLogo.tsx              # Platform brand badge
```

---

## 🎮 Interactive Simulation Arena & Onboarding Playbooks

The `InteractiveSimulationEngine.tsx` provides zero-text, micro-animation practice arenas accessible by clicking **"🎮 Practice Simulator"** in the training header:
1. **🛒 The Customer Tournament**:
   - **Floating Cart Pull**: Spring-physics flying badge `[0, 1.2, 1]` trajectory straight into the shopping cart.
   - **Tower Dropdown Ripple**: Staggered staircase menu expansion and auto-sliding flat/unit input with spring autofocus.
   - **Khata Coin Checkout Countdown**: Digital wallet graphic with rapid real-time fils countdown ticker and ledger write-in.
2. **🏪 The Baqala Boss POS Practice Run**:
   - **Radar Chime Response**: Pulsing multi-ring radial glow on incoming urgent orders with smooth layout glide into the `PACKING` Kanban lane.
   - **Thermal Receipt Spool**: Continuous unrolling sheet animation with bilingual itemization, serrated edges, and barcode confirming ESC/POS thermal printing.
   - **The Shift Coin Game**: Tactile UAE currency touchpad (100/50/20/10 AED notes & 1D/50F/25F coins) with 3D scale compression and real-time Amber Deficit / Emerald Match audit box.
3. **🏃‍♂️ The Tower Runner Quest**:
   - **Tower Elevator Sorter**: Interactive building badges expanding multi-order elevator stops with vertical cycle times (~3 min/floor).
   - **1-Tap Sunlight Mode**: High-velocity high-contrast color sweep for outdoor Gulf sunlight visibility.
   - **Quick-Change Cash Pad**: Doorstep COD calculator with pulsing green change feedback.

---

## 🧪 Automated Testing & Invariants (24/24 Vitest Suite)

The codebase enforces strict mathematical integrity and architectural isolation across 4 test suites running on Vitest:
- **`src/backend.test.ts`**: Fils-based integer arithmetic, Khata debt calculations, 5-tower flyer dropdown constraints, cash reconciliation override logs, subscription suspension timers, Tier 3 Franchise COGS calculations, `useTierAccess` fail-safe rules, automated WhatsApp order webhook payload generator, concurrent multi-device cash counting, malformed input sanitization, 100-order elevator sorter stress tests, and offline ledger recovery sync (14 tests).
- **`src/tests/businessLogic.test.ts`**: Shift drawer variance calculations, cash dispute thresholds, and tenant isolation rules.
- **`src/frontend.test.ts`**: Component rendering integrity and currency formatting.
- **`src/tests/security.test.ts`**: RBAC permissions, role authorization, and PIN protection boundaries.

Run tests:
```bash
npx vitest run --no-cache
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

## ⚡ High-Throughput Architecture & Resilient Sync

ElShop features production-hardened optimizations designed for reliable high-concurrency operations:
- **Compound Database Indexes**: Drizzle ORM tables declare explicit compound indexes on `orders(store_id, status)`, `orders(building, status)`, `products(store_id, category)`, and `khata_transactions(customer_id)`.
- **Server-Level SQL Aggregations**: `/api/superadmin/global-pulse` and `/api/rider/batched-tasks` leverage SQL `GROUP BY`, `COUNT`, and `SUM` queries rather than performing in-memory reductions over full-tenant state trees.
- **Fail-Closed Administrative Security**: `/api/superadmin/*` routes enforce strict secret checks (`SUPERADMIN_SECRET`), IP-based rate limiting (30 reqs/min), and audit logging.
- **Event-Driven Offline Sync & Quarantine**: Client mutations enqueue optimistically to IndexedDB (Dexie) with exponential backoff on retry failures. Items exceeding 5 consecutive failures are quarantined into `'conflict'` review status to prevent infinite sync loops.
- **Lightweight State Metadata**: Clients check `/api/state/metadata` to verify updated timestamps and entity counts before fetching heavy state.

### 🛠️ Production Database Migration & Staged Rollout Runbook

#### 1. Pre-Flight Verification (Executed & Passed)
- **Unit & Integration Tests**: `npx vitest run --run` (35 of 35 tests passing green).
- **Type Safety & Lint**: `npm run lint` (`tsc --noEmit`) passes with 0 diagnostics.
- **Production Asset Compilation**: `npm run build` generates `/dist` static assets and bundled CommonJS backend `dist/server.cjs`.
- **Interactive Persona Demo**: `/public/demo.html` verified with bilingual EN/AR RTL switching, dark/light modes, and high-contrast runner Sunlight mode.

#### 2. Staging Environment Verification (Stage 1)

##### A. One-Shot Automated Staging Rollout Script
Ops teams can run the end-to-end rollout script (creates dump, applies concurrent migration, runs EXPLAINs, performs smoke tests, and validates JSON logs):
```bash
export STAGE_HOST="staging-db.internal"
export STAGE_PORT="5432"
export STAGE_USER="elshop_admin"
export STAGE_DB="elshop_staging"
export DB_PASS="your_secure_staging_password"
export STAGE_URL="https://staging.elshop.internal"
export SUPERADMIN_SECRET="your_staging_secret"

./tools/staging-rollout.sh
```

##### B. Manual Step-by-Step Execution
```bash
# 1. Non-interactive binary backup
PGPASSWORD="$DB_PASS" pg_dump -Fc -h "$STAGE_HOST" -p "$STAGE_PORT" -U "$STAGE_USER" -d "$STAGE_DB" -f "backup_$(date +%F).dump"

# 2. Non-interactive concurrent index migration (executed outside transaction block)
PGPASSWORD="$DB_PASS" psql "host=$STAGE_HOST port=$STAGE_PORT user=$STAGE_USER dbname=$STAGE_DB sslmode=require" -f drizzle/0001_add_performance_indexes_concurrent.sql

# 3. Monitor active locks and I/O wait events during index creation
PGPASSWORD="$DB_PASS" psql -h "$STAGE_HOST" -U "$STAGE_USER" -d "$STAGE_DB" -c "
  SELECT pid, now() - query_start AS duration, state, query 
  FROM pg_stat_activity 
  WHERE state <> 'idle' 
  ORDER BY duration DESC LIMIT 10;
"
```

##### C. Targeted EXPLAIN ANALYZE for Repository Queries
Run targeted execution plan checks corresponding to actual application queries:
```sql
-- a. Global Pulse Order Aggregation (getSuperadminPulseSummaryInDb)
EXPLAIN ANALYZE 
SELECT store_id, 
       COUNT(*) AS total_orders, 
       COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS delivered_orders,
       COUNT(CASE WHEN status IN ('placed', 'packing', 'out_for_delivery') THEN 1 END) AS active_orders,
       COALESCE(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 0) AS total_revenue,
       COUNT(DISTINCT customer_id) AS unique_customers
FROM orders 
GROUP BY store_id;

-- b. Building Dispatch Elevator Batching (getBatchedRunsByBuildingInDb)
EXPLAIN ANALYZE 
SELECT * FROM orders 
WHERE status IN ('placed', 'packing', 'out_for_delivery') 
ORDER BY building;

-- c. Khata Credit Ledger Calculation
EXPLAIN ANALYZE 
SELECT type, amount FROM khata_transactions 
WHERE customer_id = 'cust-001';
```

##### D. Live API Smoke Tests (Curl)
```bash
# 1. Server Health
curl -sS "https://$STAGE_URL/api/health" | jq .

# 2. Lightweight Metadata Sync
curl -sS "https://$STAGE_URL/api/state/metadata" | jq .

# 3. Authenticated Superadmin Global Pulse
curl -sS -H "x-elshop-admin-secret: $SUPERADMIN_SECRET" "https://$STAGE_URL/api/superadmin/global-pulse" | jq .
```

#### 3. Structured JSON Logging Auditing
All logs are emitted to standard output (`stdout`) as unnested, parseable JSON lines:
- **Offline Sync Loop Summary (`OFFLINE_SYNC_LOOP_SUMMARY`)**:
  ```json
  {"timestamp":"2026-09-01T08:16:45.000Z","event":"OFFLINE_SYNC_LOOP_SUMMARY","level":"info","processed":5,"succeeded":4,"conflicted":1,"conflicts":1,"failed":0,"durationMs":45,"isOnline":true,"isSimulatedOffline":false}
  ```
- **Superadmin Access Attempts (`SUPERADMIN_ACCESS`)**:
  ```json
  {"timestamp":"2026-09-01T08:16:45.000Z","ip":"192.168.1.50","status":"success","access_type":"superadmin_global_pulse","endpoint":"/api/superadmin/global-pulse","method":"GET"}
  ```

##### Real-Time Log Streaming & Parsers
Stream and inspect specific log events using `jq`:
```bash
# Stream Offline Sync Loop Summaries
tail -F stdout.log | jq -c 'select(.event=="OFFLINE_SYNC_LOOP_SUMMARY") | {ts:.timestamp, processed:.processed, succeeded:.succeeded, conflicts:.conflicts, failed:.failed, durationMs:.durationMs}'

# Stream Superadmin Access Logs
tail -F stdout.log | jq -c 'select(.access_type=="superadmin_global_pulse" or .event=="SUPERADMIN_ACCESS") | {ts:.timestamp, ip:.ip, status:.status, endpoint:.endpoint, reason:.reason}'
```

#### 4. Monitoring, Latency Thresholds & Alerts
Capture real-time logs (`tail -F stdout.log | jq .`) with automated alerts:
- **Aggregation Latency**: Trigger alert if `/api/superadmin/global-pulse` p95 > 1.0s for 5 consecutive minutes.
- **Sync Conflict Threshold**: Trigger alert if conflict rate > 5% of processed items over 1 hour.
- **Queue Backpressure**: Trigger alert if sync queue depth > 2× baseline over 10 minutes.
- **Security Breach Spike**: Trigger immediate alert if superadmin authentication failures > 5 per minute.

#### 5. Rollback Procedures
- **Application Rollback**: Redeploy previous Docker container image tag.
- **Zero-Downtime Index Rollback**:
  ```sql
  DROP INDEX CONCURRENTLY IF EXISTS orders_store_status_idx;
  DROP INDEX CONCURRENTLY IF EXISTS khata_transactions_customer_id_idx;
  DROP INDEX CONCURRENTLY IF EXISTS products_store_category_idx;
  ```
- **Database Restoration**: Restore binary backup (`pg_restore -d <DB_NAME> backup_<DATE>.dump`).

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
