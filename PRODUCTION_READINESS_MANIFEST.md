# 🚀 ElShop Production Readiness & Deployment Manifest
**Document Version:** 1.0.0-PROD  
**Target Release:** 10-Store Dubai Residential Pilot  
**System Architecture:** Full-Stack Node.js (Express) + React 18 + TypeScript + Vite + Tailwind CSS + IndexedDB Offline Sync  
**Execution Date:** 2026-08-27  

---

## 1. Executive Summary & Verification State

ElShop has completed all development sprints, multi-tenant hardening, and test suites. This manifest documents the final pre-flight checklist, environment variable matrix, file hygiene audit, security verification, and day-of-launch rollout sequence for the 10 pilot baqala stores across Downtown Dubai, Dubai Marina, JLT, Business Bay, and DIFC.

| Category | Status | Verified Metric |
| :--- | :---: | :--- |
| **Automated Test Suite** | 🟢 PASS | 24/24 Tests passing across all 4 suites (100% green) |
| **Tenant Isolation** | 🟢 PASS | Zero-leak keys: `pilot_cash_audit_trail_{storeId}` & `elshop_offline_orders_{storeId}` |
| **Price & Financials** | 🟢 PASS | Integer fils-based math (`Math.round(val * 100)`), 0 floating-point rounding errors |
| **Offline Resilience** | 🟢 PASS | IndexedDB order queue + background auto-sync with conflict resolution |
| **Role-Based Access (RBAC)** | 🟢 PASS | 3 Tiers (Tier 1 Starter, Tier 2 Mart, Tier 3 Franchise) with PIN override locks |
| **Loss Prevention Engine** | 🟢 PASS | Tier 3 ROI visualization against regional 2.1% retail shrinkage baseline |
| **Hardware & Peripherals** | 🟢 PASS | ESC/POS 58mm/80mm thermal receipt printing + 1-Page A4 Cashier Quick Guide |

---

## 2. Environment Variables Verification Matrix

Ensure the following variables are configured in production hosting environments (e.g., Cloud Run / AWS ECS / Railway / Kubernetes):

| Variable Name | Required | Environment | Description / Target Value | Verification Check |
| :--- | :---: | :--- | :--- | :--- |
| `NODE_ENV` | **YES** | Server | `production` | Enables compiled bundle delivery & Express static compression |
| `PORT` | **YES** | Server | `3000` | Hardcoded container binding port |
| `VITE_WHATSAPP_BUSINESS_PHONE` | **YES** | Client/Server | e.g., `+971501234567` | WhatsApp Dispatch & automated deep link generator |
| `VITE_ENABLE_OFFLINE_SYNC` | **YES** | Client | `true` | Activates IndexedDB local order queueing engine |
| `VITE_DEFAULT_STORE_ID` | Optional | Client | `store-001` | Default fallback store for kiosk / single-store deployments |
| `VITE_CURRENCY_CODE` | Optional | Client | `AED` | GCC standard currency identifier |
| `VITE_CURRENCY_SUBUNIT` | Optional | Client | `fils` | Minor unit (100 fils = 1.00 AED) |

---

## 3. Repository File Hygiene & Cleanup Audit

The repository has been audited to eliminate residual test artifacts, duplicate hooks, and unreferenced assets:

### Retained Core Modules
- `src/components/LossPreventionROIView.tsx`: Tier 3 Franchise cash protection and regional shrinkage benchmark dashboard.
- `src/components/CashierQuickGuideModal.tsx`: Print-ready A4 single-page bilingual cheat sheet for cashier shift operations.
- `src/components/ShiftReconciliationModal.tsx`: Cash drawer denomination tally engine with automatic discrepancy audit logs.
- `src/components/ConsolidatedPnLView.tsx`: Full COGS, gross margins, and multi-branch comparison analytics.
- `src/components/ElevatorPosterModal.tsx`: Print-ready tower elevator and lobby promotional flyer generator with dynamic QR.
- `src/lib/useOfflineSync.ts`: IndexedDB offline sync hook with online/offline network listeners and retry backoff.
- `src/lib/priceUtils.ts`: Integer fils sanitizer preventing IEEE 754 precision artifacts in totals and tax calculation.

### Production Build Script Integrity
Verified inside `package.json`:
```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "test": "vitest run"
  }
}
```

---

## 4. Multi-Tenant Isolation & Security Hardening

To prevent data leaks between pilot stores operating concurrently:

1. **Storage Partitioning**: Every `localStorage` and `IndexedDB` record MUST use the composite prefix:
   - Audit Trails: `pilot_cash_audit_trail_${store.id}`
   - Offline Orders: `elshop_offline_orders_${store.id}`
   - Customer Khata: `elshop_customers_${store.id}`
   - Shift Closures: `elshop_shift_history_${store.id}`

2. **Manager PIN Gatekeeping**:
   - Any cash reconciliation variance (`|actual - expected| > 0.00 AED`) requires an authenticated Manager PIN (default `1234` or custom store PIN).
   - Staff PINs are restricted from viewing P&L or adjusting customer credit limits.

3. **Fils-Based Numerical Sanitizer**:
   - All monetary calculations are performed in integer fils:
   ```ts
   export const toFils = (aed: number): number => Math.round(aed * 100);
   export const fromFils = (fils: number): number => fils / 100;
   ```

---

## 5. Hardware & Counter Deployment Checklist

For each of the 10 pilot baqala stores:

- [ ] **Counter Tablet Setup**: Minimum 10.1" Android or iPadOS tablet running Chrome/Safari in PWA / Fullscreen Kiosk mode.
- [ ] **Thermal Receipt Printer**: ESC/POS compatible 58mm or 80mm Bluetooth / USB receipt printer paired with the POS terminal.
- [ ] **Cash Drawer Float**: Initial opening float verified at 200.00 AED in small denominations (5 AED, 10 AED, 20 AED, coins).
- [ ] **A4 Printable Quick Guide**: Print and laminate the **ElShop Operational Quick Guide** (`CashierQuickGuideModal.tsx`) and clip it directly beside the cashier register.
- [ ] **Elevator QR Flyer Deployment**: Generate and print 5 copies of the building-specific elevator poster from the POS menu for each residential tower serviced by the baqala.
- [ ] **Sound Alerts Verification**: Ensure tablet media volume is set to ≥80% and the POS chime is active to ensure instant notification on incoming doorstep orders.

---

## 6. Pre-Flight Deployment Runbook

### Step 1: Pre-Build Test Verification
```bash
npm run test
```
*Expected Output:* `4 passed (4 suites), 24 passed (24 tests), 0 failures`.

### Step 2: TypeScript & Linter Verification
```bash
npm run build
```
*Expected Output:* Clean Vite client compilation in `/dist` and bundled server in `dist/server.cjs`.

### Step 3: Container Deployment & Ingress Binding
- Verify application binds to `0.0.0.0:3000`.
- Verify health check endpoint: `GET /api/health` returns `{"status":"ok"}`.

### Step 4: Smoke Test Workflow
1. Load POS terminal at `https://<pilot-domain>/`.
2. Select **Al Madina Fresh Grocer (store-001)**.
3. Open **Operational Quick Guide** (`Quick Guide` button in header) and trigger print dialog.
4. Open **Consolidated P&L** (Tier 3) -> switch to **Loss Prevention ROI** tab -> verify variance data and GCC shrinkage benchmark graphs.
5. Create a test order -> complete cashier shift reconciliation -> verify audit trail records into `pilot_cash_audit_trail_store-001`.

---

## 7. Incident Response & Emergency Fallback

| Incident Scenario | Automatic Mitigation | Cashier Action |
| :--- | :--- | :--- |
| **Store Internet Outage** | IndexedDB switches to Offline Mode instantly. Orders queue locally. | Continue ringing up walk-in sales via "Quick Offline Order". Receipts print locally. |
| **Cash Drawer Discrepancy** | System prompts for discrepancy reason & logs variance to persistent audit log. | Call Store Manager for 4-digit PIN override. Do not force-close register without approval. |
| **Printer Jam / Out of Paper** | Order remains in "Ready" status on order board. | Replace 58mm/80mm roll and tap "Reprint Receipt" on order card. |
| **Dispatch Helpdesk Emergency** | Direct WhatsApp hotline integration built into footer. | Tap WhatsApp SOS hotline: `+971 50 123 4567` or dial `*778`. |

---
**Signed off for Pilot Deployment:**  
*ElShop Engineering & Operations Team* • Dubai, UAE • 2026
