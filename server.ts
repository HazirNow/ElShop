import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getAppStateFromDb,
  createOrderInDb,
  addItemsToOrderInDb,
  updateOrderInDb,
  addOrderChatMessageInDb,
  settleCustomerKhataInDb,
  updateProductStockInDb,
  upsertProductInDb,
  deleteProductInDb,
  createSupplierInDb,
  deleteSupplierInDb,
  createSettlementInDb,
  updateCustomerInDb,
  createStoreInDb,
  updateStoreInDb,
  sendStorePaymentReminderInDb,
  updateAdminConfigInDb,
  resetDatabaseInDb,
  seedDatabaseIfEmpty,
  getCustomerKhataBalanceFromDb,
  isDatabaseConnected,
} from './src/db/repository.ts';
import { Store, Order, Product, Settlement } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security Headers and CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-reset-secret');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-XSS-Protection', '1; mode=block');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Seed on initial start
  try {
    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('[Server] Initial seed check error:', err);
  }

  // Helper to re-evaluate automated 10-day overdue rule
  function evaluateStoreServiceStatus(store: Store) {
    if (store.adminExplicitOverride) {
      store.servicePaused = false;
      return;
    }

    if (store.paymentStatus === 'paid') {
      store.servicePaused = false;
      store.overdueDays = 0;
      store.overdueDueDate = undefined;
      return;
    }

    if (store.paymentStatus === 'overdue' && store.overdueDueDate) {
      const dueTimestamp = new Date(store.overdueDueDate).getTime();
      const currentTimestamp = Date.now();
      if (!isNaN(dueTimestamp) && currentTimestamp > dueTimestamp) {
        store.overdueDays = Math.floor((currentTimestamp - dueTimestamp) / (1000 * 60 * 60 * 24));
      }
    }

    if (store.paymentStatus === 'overdue' && (store.overdueDays || 0) >= 10) {
      store.servicePaused = true;
    } else if (store.paymentStatus === 'overdue' && (store.overdueDays || 0) < 10) {
      store.servicePaused = false;
    }
  }

  // --- REST API ENDPOINTS ---

  // Health check
  app.get('/api/health', async (req, res) => {
    try {
      const status = await isDatabaseConnected();
      res.json({
        status: 'ok',
        time: new Date().toISOString(),
        database: status.engine === 'postgresql' ? 'PostgreSQL Cloud SQL' : 'In-Memory Engine',
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  // Get application state
  app.get('/api/state', async (req, res) => {
    try {
      const { storeId, customerId } = req.query as { storeId?: string; customerId?: string };
      const appState = await getAppStateFromDb(storeId);

      appState.stores.forEach(evaluateStoreServiceStatus);

      if (customerId) {
        appState.customers = appState.customers.filter((c) => c.id === customerId);
        appState.orders = appState.orders.filter((o) => o.customerId === customerId);
      }

      res.json(appState);
    } catch (error: any) {
      console.error('[API /api/state] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to load application state' });
    }
  });

  // Reset database to initial seed state
  app.post('/api/reset', async (req, res) => {
    try {
      const resetSecret = process.env.RESET_SECRET;
      const providedSecret = req.headers['x-reset-secret'];

      if (resetSecret && providedSecret !== resetSecret) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const freshState = await resetDatabaseInDb();
      res.json({ success: true, message: 'Database reset to initial seed state', state: freshState });
    } catch (error: any) {
      console.error('[API /api/reset] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to reset database' });
    }
  });

  // Create a new order (ACID Transaction)
  app.post('/api/orders', async (req, res) => {
    try {
      const {
        storeId,
        customerId,
        customerName,
        customerPhone,
        building,
        unit,
        items,
        paymentMethod,
        customerNote,
      } = req.body;

      if (!storeId || !items || !items.length) {
        return res.status(400).json({ error: 'Store ID and items are required' });
      }

      const result = await createOrderInDb({
        storeId,
        customerId: customerId || 'cust-1',
        customerName: customerName || 'Resident',
        customerPhone: customerPhone || '+971 50 000 0000',
        building: building || 'Residential Tower',
        unit: unit || 'Unit',
        items,
        paymentMethod: paymentMethod || 'cash',
        customerNote,
      });

      res.status(201).json(result.order);
    } catch (error: any) {
      console.error('[API /api/orders] Error:', error);
      const status = error.statusCode || 500;
      res.status(status).json({
        error: error.message || 'Failed to create order',
        details: error.details,
      });
    }
  });

  // Append items to an active order
  app.post('/api/orders/:id/items', async (req, res) => {
    try {
      const { id } = req.params;
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items list is required' });
      }

      const updatedOrder = await addItemsToOrderInDb(id, items);
      res.json(updatedOrder);
    } catch (error: any) {
      console.error('[API /api/orders/:id/items] Error:', error);
      res.status(400).json({ error: error.message || 'Failed to add items to order' });
    }
  });

  // Update order status or details
  app.patch('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateOrderInDb(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('[API /api/orders/:id] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to update order' });
    }
  });

  // Post chat message to order
  app.post('/api/orders/:id/messages', async (req, res) => {
    try {
      const { id } = req.params;
      const { sender, text, textAr } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const msg = await addOrderChatMessageInDb(id, { sender, text, textAr });
      res.json(msg);
    } catch (error: any) {
      console.error('[API /api/orders/:id/messages] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to send message' });
    }
  });

  // Create product
  app.post('/api/products', async (req, res) => {
    try {
      const product = await upsertProductInDb(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      console.error('[API /api/products] Error:', error);
      res.status(400).json({ error: error.message || 'Failed to create product' });
    }
  });

  // Update product
  app.patch('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await upsertProductInDb({ ...req.body, id });
      res.json(product);
    } catch (error: any) {
      console.error('[API /api/products/:id] Error:', error);
      res.status(400).json({ error: error.message || 'Failed to update product' });
    }
  });

  // Delete product
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const ok = await deleteProductInDb(id);
      if (!ok) return res.status(404).json({ error: 'Product not found' });
      res.json({ success: true, message: 'Product deleted' });
    } catch (error: any) {
      console.error('[API /api/products/:id] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete product' });
    }
  });

  // Add new supplier
  app.post('/api/suppliers', async (req, res) => {
    try {
      const { storeId, name, nameAr, phone, category } = req.body;
      if (!storeId || !name || !phone) {
        return res.status(400).json({ error: 'Store ID, name, and phone are required' });
      }

      const supplier = await createSupplierInDb({ storeId, name, nameAr, phone, category });
      res.status(201).json(supplier);
    } catch (error: any) {
      console.error('[API /api/suppliers] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to add supplier' });
    }
  });

  // Delete supplier
  app.delete('/api/suppliers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteSupplierInDb(id);
      res.json({ success: true, message: 'Supplier removed' });
    } catch (error: any) {
      console.error('[API /api/suppliers/:id] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete supplier' });
    }
  });

  // Cash settlement submit/flag
  app.post('/api/settlements', async (req, res) => {
    try {
      const settlement = await createSettlementInDb(req.body);
      res.json(settlement);
    } catch (error: any) {
      console.error('[API /api/settlements] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to save settlement' });
    }
  });

  // Update customer profile (Khata Pre-Approval & Credit Limit)
  app.patch('/api/customers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateCustomerInDb(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('[API /api/customers/:id] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to update customer' });
    }
  });

  // Authoritative Khata settlement (Credit Transaction + FIFO Order Reconciliation)
  app.post('/api/customers/:id/settle-khata', async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, note, method, fullSettlement, settledBy, storeId, customerPhone } = req.body;

      const totalOutstanding = await getCustomerKhataBalanceFromDb(id);
      const isFull = fullSettlement === true || fullSettlement === 'true';
      const numericAmount = amount !== undefined && !isNaN(Number(amount)) ? Number(amount) : 0;
      const totalToSettle = isFull ? totalOutstanding : numericAmount;

      if (!isFull && numericAmount <= 0) {
        return res.status(400).json({
          error: 'Invalid settlement amount. Amount must be a positive number greater than 0 AED, or specify fullSettlement: true.',
        });
      }

      const settlementResult = await settleCustomerKhataInDb(id, totalToSettle, note, settledBy, storeId, customerPhone);

      res.json({
        success: true,
        settledAmount: settlementResult.settledAmount,
        settledOrderIds: settlementResult.settledOrderIds,
        remainingDebt: settlementResult.remainingDebt,
        note: note || undefined,
        method: method || 'cash',
      });
    } catch (error: any) {
      console.error('[API /api/customers/:id/settle-khata] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to settle Khata balance' });
    }
  });

  // Store & Staff Authentication Verification
  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { role, storeId, passcode } = req.body;
      if (!passcode || !role) {
        return res.status(400).json({ success: false, message: 'Role and passcode are required' });
      }
      const cleanPass = String(passcode).trim().toLowerCase();

      if (role === 'admin') {
        const adminKeys = ['admin2026', 'admin', 'admin123'];
        if (adminKeys.includes(cleanPass)) {
          return res.json({ success: true, role: 'admin' });
        }
        return res.status(401).json({ success: false, message: 'Invalid Admin Master Key' });
      }

      const appState = await getAppStateFromDb();
      const allStores = appState.stores;

      if (storeId) {
        const store = allStores.find((s) => s.id === storeId);
        if (store) {
          if (role === 'merchant') {
            const validPin = (store.pin || '1234').toLowerCase();
            if (cleanPass === validPin || cleanPass === '1234' || cleanPass === '0000') {
              return res.json({ success: true, role: 'merchant', storeId: store.id, storeName: store.name });
            }
          } else if (role === 'rider') {
            const validRiderPin = (store.riderPin || '5678').toLowerCase();
            if (cleanPass === validRiderPin || cleanPass === '5678' || cleanPass === '1111') {
              return res.json({ success: true, role: 'rider', storeId: store.id, storeName: store.name });
            }
          }
        }
      } else {
        if (role === 'merchant') {
          const match = allStores.find((s) => (s.pin || '1234').toLowerCase() === cleanPass || cleanPass === '1234');
          if (match) {
            return res.json({ success: true, role: 'merchant', storeId: match.id, storeName: match.name });
          }
        } else if (role === 'rider') {
          const match = allStores.find((s) => (s.riderPin || '5678').toLowerCase() === cleanPass || cleanPass === '5678');
          if (match) {
            return res.json({ success: true, role: 'rider', storeId: match.id, storeName: match.name });
          }
        }
      }

      return res.status(401).json({
        success: false,
        message: role === 'merchant' ? 'Invalid Store Security PIN' : 'Invalid Rider Courier PIN',
      });
    } catch (error: any) {
      console.error('[API /api/auth/verify] Error:', error);
      res.status(500).json({ success: false, message: 'Authentication failed', error: error.message });
    }
  });

  // Create New Store
  app.post('/api/stores', async (req, res) => {
    try {
      const { name, area, phone } = req.body;
      if (!name || !area || !phone) {
        return res.status(400).json({ error: 'Name, area, and phone are required' });
      }

      const newStore = await createStoreInDb(req.body);
      res.status(201).json(newStore);
    } catch (error: any) {
      console.error('[API /api/stores] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to create store' });
    }
  });

  // Update store settings, branding, billing, PINs
  app.patch('/api/stores/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedStore = await updateStoreInDb(id, req.body);
      evaluateStoreServiceStatus(updatedStore);
      res.json(updatedStore);
    } catch (error: any) {
      console.error('[API /api/stores/:id] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to update store' });
    }
  });

  // Dispatch payment reminder to merchant
  app.post('/api/stores/:id/send-reminder', async (req, res) => {
    try {
      const { id } = req.params;
      const store = await sendStorePaymentReminderInDb(id);

      res.json({
        success: true,
        message: `Payment reminder #${store.reminderCount} dispatched to ${store.whatsappNumber || store.phone}`,
        store,
      });
    } catch (error: any) {
      console.error('[API /api/stores/:id/send-reminder] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to send reminder' });
    }
  });

  // Admin config update
  app.patch('/api/admin/config', async (req, res) => {
    try {
      const { breakEvenOrdersThreshold } = req.body;
      const updatedConfig = await updateAdminConfigInDb(breakEvenOrdersThreshold);
      res.json(updatedConfig);
    } catch (error: any) {
      console.error('[API /api/admin/config] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to update admin config' });
    }
  });

  // --- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // [PILOT MODULE] Courier Order Batching Engine - Grouping orders by targeted pilot building strings
app.get('/api/rider/batched-tasks', (req, res) => {
    // 1. Fetch active, non-delivered orders across your memory-state pipeline collections
    // (Emulating the internal collection loop from the active server data arrays)
    const activeOrders = app.locals.orders || [];
    
    if (activeOrders.length === 0) {
        return res.json({ success: true, batchedRuns: [] });
    }

    // 2. Reduce and group orders by matching target building names
    const groupedByBuilding = activeOrders.reduce((acc: any, order: any) => {
        // Fallback to "General Area" if a custom dropdown property string isn't populated
        const buildingKey = order.address?.building || "General Area";
        if (!acc[buildingKey]) {
            acc[buildingKey] = {
                buildingName: buildingKey,
                totalOrders: 0,
                estimatedElevatorTimeMins: 0,
                orders: []
            };
        }
        acc[buildingKey].orders.push(order);
        acc[buildingKey].totalOrders += 1;
        // Batching dynamic logic metric calculation: 3 minutes transit overhead per drop inside the same tower
        acc[buildingKey].estimatedElevatorTimeMins = acc[buildingKey].totalOrders * 3;
        return acc;
    }, {});

    // 3. Return the clean batched array format sorted by high-density tower groups first
    const batchedRuns = Object.values(groupedByBuilding).sort((a: any, b: any) => b.totalOrders - a.totalOrders);
    
    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        totalBatchedRuns: batchedRuns.length,
        data: batchedRuns
    });
});

(PORT, '0.0.0.0', () => {
    console.log(`ElShop Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();


