# 🏪 ElShop Merchant & Store Operator Onboarding Guide

Welcome to **ElShop (الشوب)** — the hyper-local grocery ordering and fulfillment platform engineered for UAE neighborhood supermarkets, *baqalas*, mini-marts, and residential tower communities.

This guide is designed for store owners, shift managers, cashiers, and delivery runners to set up and operate ElShop within 5 minutes.

---

## ⚡ Quick 5-Minute Launch Checklist

```
 [1] Login to Tablet ──► [2] Review Catalog ──► [3] Print Elevator Posters ──► [4] Start Delivering
```

---

### Step 1: Accessing Your Store Tablet
1. Open your tablet or phone browser to the ElShop URL (e.g., `https://elshop-pilot-xxxxxxxx-me.a.run.app` or your custom domain).
2. For dedicated counter tablets, tap **Share / Menu** $\rightarrow$ **Add to Home Screen** to launch in full-screen PWA Kiosk mode.
3. Select **Merchant Tablet** from the role selector in the top-right corner.
4. Enter your store staff PIN (`1234` or `5678` for demo access).
5. Select your active branch (e.g., *Al Madina Fresh Grocer* or *Dubai Marina QuickMart*).
6. **Thermal Printer Setup**: Turn on your 58mm/80mm Bluetooth thermal printer, tap **Connect ESC/POS Printer** in the header, and pair the device. The system will automatically print test receipts and fallback to browser printing if disconnected.

---

### Step 2: Catalog & Shelf Stock Management
1. Tap the **Inventory & Stock** tab on the navigation bar.
2. **Instant Quick Stock Adjustments (+1 / -1)**:
   - Tap the dedicated **+1** or **-1** buttons directly on any product card or low-stock pill to instantly adjust stock on the fly with zero UI lag.
   - For fast case replenishment, use the 1-tap **+6**, **+12**, or **+24** restock shortcuts.
3. **Full Product Editing**:
   - Tap **Edit** on any product card to open the comprehensive edit modal.
   - Modify product titles (English & Arabic), barcodes, SKUs, categories (Fresh Produce, Dairy & Eggs, Bakery, Pantry, Beverages, Snacks, Household, Personal Care), retail price, wholesale COGS, stock levels, low-stock reorder thresholds, supplier assignments, and expiry dates.
4. **Adding New Products & Taking Packaging Photos**:
   - Tap **+ Add New Product** or use the **Camera Barcode Scanner**.
   - Tap **Snap Photo** to capture shelf packaging photos directly via camera, or choose from your photo gallery.
   - Set stock count, pricing in AED, and expiration date.
5. **Promotions & Clearance Sales**:
   - Tap **Manage Sale Price** or edit sale pricing directly on the product card.
   - Toggle **Sale Active** and input the discounted price.
   - Discounted items automatically display promotional badges and appear under **🔥 Special Offers** in the customer storefront.
6. **Expiry Radar & Supplier Returns**:
   - **Nearing Expiry (Within 7 Days)**: Alert banners highlight expiring inventory. Tap to mark items 30%–50% off or initiate a supplier return.
   - **Expired Goods**: Expired products are automatically hidden from customer view. Tap **Return to Supplier** to dispatch a WhatsApp return request with one tap.

---

### Step 3: Residential Building Marketing & Elevator Posters
To onboard residents in neighboring towers without costly ad spend:
1. Go to the **Merchant** dashboard and tap **🖨️ Generate Elevator QR Posters**.
2. Select target residential buildings (e.g., *Bay Square Tower 3*, *Al Bateen Tower A*).
3. Tap **Print / Save Poster** to generate high-resolution bilingual flyers.
4. Place flyers on building notice boards, residential lifts, or distribute magnets to residents. Residents scan the QR code to open the store directly in their mobile browser with zero app install.

---

### Step 4: Digital Khata (Store Credit Ledger)
For trusted neighborhood residents who maintain monthly tabs:
1. In the **Runner Cash Settlement** or **Khata Ledger** tab, view your customer credit accounts.
2. Tap on any resident card to open the **Customer Credit Adjustment Modal**:
   - Toggle **Khata Pre-Approved**.
   - Set a custom credit ceiling (e.g. 250, 500, 1000, 2000 AED).
3. Pre-approved customers will see **Khata / Store Credit** as an option at checkout.
4. **Settling Balances**:
   - Accept partial or full cash payments at the counter.
   - Use the **Batch Khata Settlement** tool to record payments across multiple customers.
   - Tap **Download Monthly CSV** to export complete account statements for your bookkeeper.
   - Tap **Send WhatsApp Statement** to send an itemized bill directly to the customer.

---

### Step 5: Order Dispatch & Elevator Batch Runs
1. **Live Kanban Order Board**:
   - Incoming orders trigger an audible order chime. Tap **Accept Order** to move to **Packing**.
2. **Elevator Batch Alerts**:
   - When 2 or more orders are destined for the same tower (e.g. *Bay Square Tower 3*), the system displays a **Batch Elevator Run** alert.
   - Assign both orders to a single runner for a 5-minute single-lift delivery trip.
3. **Packing Checklist**:
   - Check off items as they are placed into the grocery bag, assign a runner, and tap **Dispatch Order**.
4. **Runner Delivery & Payment Recording at Door**:
   - The runner can tap **Card Paid (Handheld POS)** or **Cash Collected**.
   - The runner can tap **Send WhatsApp Digital Slip** to send an instant itemized receipt directly to the customer's phone.

---

### Step 6: Daily Register & End-of-Shift Drawer Reconciliation
1. **Live Financial Ticker**:
   - Monitor the top banner in your order board to see real-time **Cash Collected**, **Card POS Volume**, **Outstanding Khata Debt**, and **Completed Deliveries**.
   - Tap **Share Register Summary** to dispatch the daily numbers directly to WhatsApp for owner/accountant review.
2. **Shift Drawer Reconciliation**:
   - Tap **End Shift / Reconcile Drawer**.
   - Review the calculated **Expected Cash in Drawer** based on today's cash sales.
   - Count physical cash in the drawer directly or use the **UAE Dirham Denominations Counter** (500, 200, 100, 50, 20, 10, 5, 1 AED).
   - If a discrepancy is detected, select the variance category (*Counting error, petty cash expense, change rounding, unrecorded withdrawal*).
   - Tap **Reconcile & Close Shift** and tap **Share Audit to WhatsApp** to store the audit trail.

---

## 📱 Quick Reference for Roles

| Role | Device Recommendation | Primary Tasks |
| :--- | :--- | :--- |
| **Customer / Resident** | Smartphone (Mobile Browser) | Browse catalog, order via Card/COD/Khata, track live delivery |
| **Merchant Store Manager** | iPad / Android Tablet / POS | Manage stock, accept orders, batch elevator dispatches, manage Khata, reconcile cash drawer |
| **Store Runner / Rider** | Smartphone | View assigned orders, use Sunlight mode, select Card/Cash at door, calculate change, send WhatsApp slips |
| **Franchise / Admin HQ** | Desktop / Laptop | Monitor network GMV, track Khata debt exposure, manage tiered subscriptions |

---

## ❓ Frequently Asked Questions (FAQ)

**Q: Do customers have to install an app from the App Store or Google Play?**  
*A: No. ElShop is a Progressive Web App (PWA) that loads instantly in any mobile browser or WhatsApp link with zero download.*

**Q: What happens if a customer owes more than their Khata credit limit?**  
*A: The system automatically hides the Khata payment option at checkout until the resident settles their outstanding balance.*

**Q: What are the available subscription plans?**  
*A: ElShop offers 3 clear tiers:*
- **Tier 1 (Baqala - 299 AED/mo)**: Single-counter POS, live daily summary, 1-tap WhatsApp receipts, and simple Khata balances.
- **Tier 2 (Mart - 599 AED/mo)**: Adds end-of-shift drawer reconciliation, customer credit limits, multi-staff PINs, and automated statements.
- **Tier 3 (Franchise - 899 AED/mo)**: Multi-branch consolidated registers, advanced aging reports, and unlimited roles.

**Q: How does the zero-commission model work?**  
*A: Unlike third-party aggregators that deduct 15%–30% per order, ElShop charges a flat monthly fee with 0% commission on orders. Invoices are tracked in the Admin HQ panel with a 10-day grace period.*
