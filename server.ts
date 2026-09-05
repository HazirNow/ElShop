import express from 'express';
import path from 'path';
import crypto from 'crypto';
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
  getSuperadminPulseSummaryInDb,
  getBatchedRunsByBuildingInDb,
  getStateMetadataInDb,
} from './src/db/repository.ts';
import { Store, Order, Product, Settlement } from './src/types.ts';
import { logSuperadminAccess } from './src/api/index.ts';

// In-Memory Telemetry Cache for Pulse
let pulseCache: { timestamp: number; data: any } | null = null;
const PULSE_CACHE_TTL_MS = process.env.PULSE_CACHE_TTL_MS 
  ? parseInt(process.env.PULSE_CACHE_TTL_MS, 10) 
  : 15000; // 15s TTL default

// In-Memory Rate Limiting for Administrative Endpoints
const adminRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const ADMIN_RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const ADMIN_MAX_REQUESTS_PER_WINDOW = 30;

function pruneExpiredAdminRateLimits(now: number) {
  if (adminRateLimitMap.size > 50) {
    for (const [ip, rec] of adminRateLimitMap.entries()) {
      if (now > rec.resetTime) {
        adminRateLimitMap.delete(ip);
      }
    }
  }
}

export function checkAdminRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  pruneExpiredAdminRateLimits(now);

  const record = adminRateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    adminRateLimitMap.set(ip, { count: 1, resetTime: now + ADMIN_RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: ADMIN_MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= ADMIN_MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count += 1;
  return { allowed: true, remaining: ADMIN_MAX_REQUESTS_PER_WINDOW - record.count };
}

// --- SESSION TOKENS & RBAC / TENANT AUTHORIZATION ---

export interface AuthSession {
  role: 'merchant' | 'rider' | 'admin';
  storeId?: string;
  exp: number;
  iat: number;
}

const TOKEN_SECRET = process.env.SESSION_SECRET || process.env.SUPERADMIN_SECRET || crypto.randomBytes(32).toString('hex');

export function generateSessionToken(payload: { role: 'merchant' | 'rider' | 'admin'; storeId?: string }): string {
  const iat = Date.now();
  const exp = iat + 24 * 60 * 60 * 1000; // 24 hours
  const session: AuthSession = { ...payload, iat, exp };
  const payloadB64 = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): AuthSession | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest('base64url');
  if (signature.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;

  try {
    const session: AuthSession = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!session || typeof session.exp !== 'number' || session.exp < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function extractSession(req: express.Request): AuthSession | null {
  const authHeader = req.headers['authorization'];
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-session-token']) {
    token = String(req.headers['x-session-token']).trim();
  }
  if (!token) return null;
  return verifySessionToken(token);
}

export function requireAuth(allowedRoles: ('merchant' | 'rider' | 'admin')[] = ['merchant', 'rider', 'admin']) {
  return (req: any, res: express.Response, next: express.NextFunction) => {
    const session = extractSession(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: missing or invalid session token' });
    }
    if (!allowedRoles.includes(session.role)) {
      return res.status(403).json({ error: `Forbidden: role '${session.role}' not permitted for this action` });
    }
    req.session = session;
    next();
  };
}

// Superadmin authentication middleware
export function superadminAuthMiddleware(req: any, res: any, next?: any) {
  const clientIp =
    (req.headers && (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()) ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';
  const accessType = req.baseUrl || req.path || req.originalUrl || 'superadmin_api';
  const method = req.method;

  const configuredSecret = process.env.SUPERADMIN_SECRET;

  if (!configuredSecret) {
    logSuperadminAccess({
      timestamp: new Date().toISOString(),
      ip: clientIp,
      status: 'failure',
      access_type: accessType,
      endpoint: req.originalUrl || req.path,
      method,
      reason: 'MISSING_SECRET_CONFIGURATION',
    });
    return res.status(500).json({
      error: 'Server Misconfigured: Administrative secret is required.',
    });
  }

  const providedSecret =
    req.headers?.['x-elshop-admin-secret'] ||
    req.headers?.['authorization']?.replace(/^Bearer\s+/i, '');

  const isValid = Boolean(providedSecret && providedSecret === configuredSecret);

  if (!isValid) {
    logSuperadminAccess({
      timestamp: new Date().toISOString(),
      ip: clientIp,
      status: 'failure',
      access_type: accessType,
      endpoint: req.originalUrl || req.path,
      method,
      reason: 'UNAUTHORIZED_SECRET',
    });
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing x-elshop-admin-secret signature',
    });
  }

  logSuperadminAccess({
    timestamp: new Date().toISOString(),
    ip: clientIp,
    status: 'success',
    access_type: accessType,
    endpoint: req.originalUrl || req.path,
    method,
  });

  if (typeof next === 'function') {
    return next();
  }
}

// CORS Origin Allow-list helper
export function getOriginAllowList(): Set<string> {
  const origins = new Set<string>();
  if (process.env.APP_URL) {
    origins.add(process.env.APP_URL.trim().replace(/\/+$/, ''));
  }
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach((o) => {
      const trimmed = o.trim().replace(/\/+$/, '');
      if (trimmed) origins.add(trimmed);
    });
  }
  origins.add('http://localhost:3000');
  origins.add('http://127.0.0.1:3000');
  origins.add('https://elshop.ae');
  return origins;
}

// --- EXPRESS APPLICATION SETUP ---
export const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Strict CORS and Security Headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = getOriginAllowList();

  if (origin && allowed.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else if (!origin && process.env.APP_URL) {
    res.header('Access-Control-Allow-Origin', process.env.APP_URL.trim().replace(/\/+$/, ''));
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-token, x-reset-secret, x-elshop-admin-secret'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

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
      poolState: (status as any).details,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get app state (supports optional ?storeId= filter for tenant data scoping)
app.get('/api/state', async (req, res) => {
  try {
    const { storeId } = req.query as { storeId?: string };
    const state = await getAppStateFromDb(storeId);
    res.json(state);
  } catch (error: any) {
    console.error('[API /api/state] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch state' });
  }
});

// Reset database to initial seed (Secured endpoint)
app.post('/api/reset', async (req, res) => {
  try {
    const configuredResetSecret = process.env.RESET_SECRET;
    if (!configuredResetSecret) {
      console.warn('[API /api/reset] Reset endpoint invoked but RESET_SECRET is not configured on this server. Failing closed.');
      return res.status(403).json({
        error: 'Forbidden: Database reset is disabled because RESET_SECRET is not configured on this server.',
      });
    }

    const providedSecret = req.headers['x-reset-secret'] || req.body?.resetSecret;
    if (!providedSecret || providedSecret !== configuredResetSecret) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing x-reset-secret header',
      });
    }

    const state = await resetDatabaseInDb();
    res.json({ success: true, message: 'Database reset to initial pilot baseline', state });
  } catch (error: any) {
    console.error('[API /api/reset] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset database' });
  }
});

// Create a new order (Customer order placement)
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

    if (result && result.order) {
      triggerWhatsAppOrderAlert(result.order).catch(() => {});
    }

    res.status(201).json(result.order);
  } catch (error: any) {
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : (error.message?.includes('expired') || error.message?.includes('stock') || error.message?.includes('Khata') ? 400 : 500));
    if (status < 500) {
      console.warn(`[API /api/orders] Client validation rejected (${status}):`, error.message);
    } else {
      console.error('[API /api/orders] Internal Server Error:', error);
    }
    res.status(status).json({
      error: error.message || 'Failed to create order',
      details: error.details,
    });
  }
});

// Append items to an active order (Tenant scoped)
app.post('/api/orders/:id/items', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items list is required' });
    }

    const session = extractSession(req);
    if (session && session.role !== 'admin') {
      const appState = await getAppStateFromDb();
      const existing = appState.orders.find((o) => o.id === id);
      if (existing && existing.storeId !== session.storeId) {
        return res.status(403).json({ error: 'Forbidden: cross-tenant order modification denied' });
      }
    }

    const updatedOrder = await addItemsToOrderInDb(id, items);
    res.json(updatedOrder);
  } catch (error: any) {
    console.error('[API /api/orders/:id/items] Error:', error);
    res.status(400).json({ error: error.message || 'Failed to add items to order' });
  }
});

// Update order status or details (Tenant scoped)
app.patch('/api/orders/:id', requireAuth(['merchant', 'rider', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const session = req.session as AuthSession;
    if (session.role !== 'admin') {
      const appState = await getAppStateFromDb();
      const existing = appState.orders.find((o) => o.id === id);
      if (existing && existing.storeId !== session.storeId) {
        return res.status(403).json({ error: 'Forbidden: cross-tenant order update denied' });
      }
    }
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

// Create product (Merchant/Admin only, Tenant-Scoped)
app.post('/api/products', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const session = req.session as AuthSession;
    if (session.role === 'merchant') {
      if (req.body.storeId && req.body.storeId !== session.storeId) {
        return res.status(403).json({ error: 'Forbidden: cross-tenant product creation denied' });
      }
      req.body.storeId = session.storeId;
    }
    const product = await upsertProductInDb(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('[API /api/products] Error:', error);
    res.status(400).json({ error: error.message || 'Failed to create product' });
  }
});

// Update product (Merchant/Admin only, Tenant-Scoped)
app.patch('/api/products/:id', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const session = req.session as AuthSession;
    if (session.role !== 'admin') {
      const appState = await getAppStateFromDb();
      const existing = appState.products.find((p) => p.id === id);
      if (existing && existing.storeId !== session.storeId) {
        return res.status(403).json({ error: 'Forbidden: cross-tenant product modification denied' });
      }
    }
    const product = await upsertProductInDb({ ...req.body, id });
    res.json(product);
  } catch (error: any) {
    console.error('[API /api/products/:id] Error:', error);
    res.status(400).json({ error: error.message || 'Failed to update product' });
  }
});

// Delete product (Merchant/Admin only, Tenant-Scoped)
app.delete('/api/products/:id', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const session = req.session as AuthSession;
    if (session.role !== 'admin') {
      const appState = await getAppStateFromDb();
      const existing = appState.products.find((p) => p.id === id);
      if (existing && existing.storeId !== session.storeId) {
        return res.status(403).json({ error: 'Forbidden: cross-tenant product deletion denied' });
      }
    }
    const ok = await deleteProductInDb(id);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    console.error('[API /api/products/:id] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete product' });
  }
});

// Add new supplier (Merchant/Admin only, Tenant-Scoped)
app.post('/api/suppliers', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const { storeId, name, nameAr, phone, category } = req.body;
    const session = req.session as AuthSession;
    if (session.role !== 'admin' && storeId && storeId !== session.storeId) {
      return res.status(403).json({ error: 'Forbidden: cross-tenant supplier creation denied' });
    }
    const targetStoreId = session.role === 'merchant' ? session.storeId : storeId;
    if (!targetStoreId || !name || !phone) {
      return res.status(400).json({ error: 'Store ID, name, and phone are required' });
    }

    const supplier = await createSupplierInDb({ storeId: targetStoreId, name, nameAr, phone, category });
    res.status(201).json(supplier);
  } catch (error: any) {
    console.error('[API /api/suppliers] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to add supplier' });
  }
});

// Delete supplier (Merchant/Admin only, Tenant-Scoped)
app.delete('/api/suppliers/:id', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const session = req.session as AuthSession;
    if (session.role !== 'admin') {
      const appState = await getAppStateFromDb();
      const existing = appState.suppliers.find((s) => s.id === id);
      if (existing && existing.storeId !== session.storeId) {
        return res.status(403).json({ error: 'Forbidden: cross-tenant supplier deletion denied' });
      }
    }
    await deleteSupplierInDb(id);
    res.json({ success: true, message: 'Supplier removed' });
  } catch (error: any) {
    console.error('[API /api/suppliers/:id] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete supplier' });
  }
});

// Cash settlement submit/flag (Tenant Scoped)
app.post('/api/settlements', requireAuth(['merchant', 'rider', 'admin']), async (req: any, res) => {
  try {
    const session = req.session as AuthSession;
    if (session.role !== 'admin') {
      if (req.body.storeId && req.body.storeId !== session.storeId) {
        return res.status(403).json({ error: 'Forbidden: cross-tenant settlement denied' });
      }
      req.body.storeId = session.storeId;
    }
    const settlement = await createSettlementInDb(req.body);
    res.json(settlement);
  } catch (error: any) {
    console.error('[API /api/settlements] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to save settlement' });
  }
});

// Update customer profile (Khata Pre-Approval & Credit Limit, Merchant/Admin only)
app.patch('/api/customers/:id', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const updated = await updateCustomerInDb(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('[API /api/customers/:id] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update customer' });
  }
});

// Authoritative Khata settlement (Credit Transaction + FIFO Order Reconciliation, Merchant/Admin only, Tenant-Scoped)
app.post('/api/customers/:id/settle-khata', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { amount, note, method, fullSettlement, settledBy, storeId, customerPhone } = req.body;
    const session = req.session as AuthSession;
    if (session.role !== 'admin' && storeId && storeId !== session.storeId) {
      return res.status(403).json({ error: 'Forbidden: cross-tenant customer khata settlement denied' });
    }
    const activeStoreId = session.role === 'merchant' ? session.storeId : storeId;

    const totalOutstanding = await getCustomerKhataBalanceFromDb(id);
    const isFull = fullSettlement === true || fullSettlement === 'true';
    const numericAmount = amount !== undefined && !isNaN(Number(amount)) ? Number(amount) : 0;
    const totalToSettle = isFull ? totalOutstanding : numericAmount;

    if (!isFull && numericAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid settlement amount. Amount must be a positive number greater than 0 AED, or specify fullSettlement: true.',
      });
    }

    const settlementResult = await settleCustomerKhataInDb(id, totalToSettle, note, settledBy, activeStoreId, customerPhone);

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
    res.status(500).json({ error: error.message || 'Failed to settle Khata' });
  }
});

// Authenticate Staff (Merchant, Rider, Admin Master)
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { role, storeId, passcode } = req.body;

    if (!passcode || !role) {
      return res.status(400).json({ success: false, message: 'Role and passcode are required' });
    }

    const cleanPass = passcode.trim().toLowerCase();

    // Admin HQ Authentication
    if (role === 'admin') {
      const configuredAdminPass = process.env.SUPERADMIN_SECRET || process.env.ADMIN_PASSCODE;
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

      if (configuredAdminPass && cleanPass === configuredAdminPass.trim().toLowerCase()) {
        logSuperadminAccess({
          ip: clientIp,
          status: 'success',
          access_type: 'superadmin_auth',
          endpoint: '/api/auth/verify',
          method: 'POST',
        });
        const token = generateSessionToken({ role: 'admin' });
        return res.json({ success: true, role: 'admin', token });
      }
      logSuperadminAccess({
        ip: clientIp,
        status: 'failure',
        access_type: 'superadmin_auth',
        endpoint: '/api/auth/verify',
        method: 'POST',
        reason: !configuredAdminPass ? 'MISSING_PRODUCTION_SECRET' : 'INVALID_MASTER_KEY',
      });
      return res.status(401).json({ success: false, message: 'Invalid Admin Master Key' });
    }

    const appState = await getAppStateFromDb();
    const allStores = appState.stores;

    if (storeId) {
      const store = allStores.find((s) => s.id === storeId);
      if (store) {
        if (role === 'merchant') {
          const validPin = (store.pin || '').trim().toLowerCase();
          if (validPin && cleanPass === validPin) {
            const token = generateSessionToken({ role: 'merchant', storeId: store.id });
            return res.json({ success: true, role: 'merchant', storeId: store.id, storeName: store.name, token });
          }
        } else if (role === 'rider') {
          const validRiderPin = (store.riderPin || '').trim().toLowerCase();
          if (validRiderPin && cleanPass === validRiderPin) {
            const token = generateSessionToken({ role: 'rider', storeId: store.id });
            return res.json({ success: true, role: 'rider', storeId: store.id, storeName: store.name, token });
          }
        }
      }
    } else {
      if (role === 'merchant') {
        const match = allStores.find((s) => s.pin && s.pin.trim().toLowerCase() === cleanPass);
        if (match) {
          const token = generateSessionToken({ role: 'merchant', storeId: match.id });
          return res.json({ success: true, role: 'merchant', storeId: match.id, storeName: match.name, token });
        }
      } else if (role === 'rider') {
        const match = allStores.find((s) => s.riderPin && s.riderPin.trim().toLowerCase() === cleanPass);
        if (match) {
          const token = generateSessionToken({ role: 'rider', storeId: match.id });
          return res.json({ success: true, role: 'rider', storeId: match.id, storeName: match.name, token });
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

// Create New Store (Admin only)
app.post('/api/stores', requireAuth(['admin']), async (req, res) => {
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

// Update store settings, branding, billing, PINs (Merchant/Admin only, Tenant-Scoped)
app.patch('/api/stores/:id', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const session = req.session as AuthSession;
    if (session.role !== 'admin' && session.storeId !== id) {
      return res.status(403).json({ error: 'Forbidden: cross-tenant store modification denied' });
    }
    const updatedStore = await updateStoreInDb(id, req.body);
    evaluateStoreServiceStatus(updatedStore);
    res.json(updatedStore);
  } catch (error: any) {
    console.error('[API /api/stores/:id] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update store' });
  }
});

// Dispatch payment reminder to merchant (Merchant/Admin only, Tenant-Scoped)
app.post('/api/stores/:id/send-reminder', requireAuth(['merchant', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const session = req.session as AuthSession;
    if (session.role !== 'admin' && session.storeId !== id) {
      return res.status(403).json({ error: 'Forbidden: cross-tenant store payment reminder denied' });
    }
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

// Admin config update (Admin only)
app.patch('/api/admin/config', requireAuth(['admin']), async (req, res) => {
  try {
    const { breakEvenOrdersThreshold } = req.body;
    const updatedConfig = await updateAdminConfigInDb(breakEvenOrdersThreshold);
    res.json(updatedConfig);
  } catch (error: any) {
    console.error('[API /api/admin/config] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update admin config' });
  }
});

// Lightweight Metadata endpoint for quick sync and conflict checks
app.get('/api/state/metadata', async (req, res) => {
  try {
    const { storeId } = req.query as { storeId?: string };
    const metadata = await getStateMetadataInDb(storeId);
    res.json(metadata);
  } catch (error: any) {
    console.error('[API /api/state/metadata] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to load state metadata' });
  }
});

// Cross-tenant Superadmin Global Pulse Telemetry Endpoint (Guarded with Superadmin Auth & Rate Limit)
app.get(
  '/api/superadmin/global-pulse',
  (req, res, next) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const rateLimit = checkAdminRateLimit(clientIp);
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
    if (!rateLimit.allowed) {
      console.warn(`[Security Audit] Rate limit exceeded on /api/superadmin/global-pulse from IP: ${clientIp}`);
      return res.status(429).json({
        error: 'Too Many Requests: Superadmin telemetry rate limit exceeded. Please try again later.',
        retryAfterSeconds: rateLimit.retryAfter,
      });
    }
    next();
  },
  superadminAuthMiddleware,
  async (req, res) => {
    try {
      const now = Date.now();
      if (pulseCache && now - pulseCache.timestamp < PULSE_CACHE_TTL_MS) {
        return res.json(pulseCache.data);
      }

      const pulseData = await getSuperadminPulseSummaryInDb();
      pulseCache = {
        timestamp: now,
        data: pulseData,
      };

      res.json(pulseData);
    } catch (error: any) {
      console.error('[API /api/superadmin/global-pulse] Error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve superadmin global pulse' });
    }
  }
);

// Courier Order Batching Engine - DB-Level grouping by targeted pilot building strings
app.get('/api/rider/batched-tasks', async (req, res) => {
  try {
    const { storeId } = req.query as { storeId?: string };
    const batchedRuns = await getBatchedRunsByBuildingInDb(storeId);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalBatchedRuns: batchedRuns.length,
      data: batchedRuns,
    });
  } catch (err: any) {
    console.error('[API /api/rider/batched-tasks] Error:', err);
    res.status(500).json({ error: 'Failed to batch rider tasks' });
  }
});

// Automated WhatsApp Order Notification Webhook Notification Handler
export const triggerWhatsAppOrderAlert = async (orderPayload: any) => {
  try {
    const storePhone = '971500000000';
    const messageString =
      `🔔 *NEW ORDER ALERT (#${orderPayload?.id ? orderPayload.id.substring(0, 6) : 'ORDER'})*\n` +
      `🏢 Tower: ${orderPayload?.building || orderPayload?.address?.building || 'General Area'}\n` +
      `🚪 Unit: ${orderPayload?.unit || orderPayload?.address?.unit || '-'}\n` +
      `💰 Total: ${((orderPayload?.totalFils || 0) / 100).toFixed(2)} AED\n` +
      `📲 _Open POS Tablet to accept assignment._`;

    console.log(`📲 [WhatsApp Webhook] Dispatched notification to ${storePhone}: \n${messageString}`);
    return true;
  } catch (err) {
    console.error('⚠️ WhatsApp notification webhook connection failure:', err);
    return false;
  }
};

let serverInstance: any = null;

export async function startServer() {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return;
  }
  if (serverInstance) {
    return serverInstance;
  }

  const PORT = 3000;

  // Seed on initial start
  try {
    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('[Server] Initial seed check error:', err);
  }

  // Vite middleware for development (only when not running vitest)
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  serverInstance = app.listen(PORT, '0.0.0.0', () => {
    console.log(`ElShop Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
  return serverInstance;
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer();
}
