/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { seedDatabaseIfEmpty } from '../db/repository';

describe('ElShop Platform Security & Real Server Authorization Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    process.env = { ...originalEnv, NODE_ENV: 'test' };
    await seedDatabaseIfEmpty();
  });

  afterEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'test' };
  });

  describe('Strict CORS & Security Headers', () => {
    it('should never return a wildcard * for Access-Control-Allow-Origin', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://malicious-site.com');

      const originHeader = res.headers['access-control-allow-origin'];
      expect(originHeader).not.toBe('*');
      expect(originHeader).not.toBe('https://malicious-site.com');
    });

    it('should reflect explicitly allowed origin from the allow-list', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://elshop.ae');

      expect(res.headers['access-control-allow-origin']).toBe('https://elshop.ae');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should handle preflight OPTIONS with status 204 and strict headers', async () => {
      const res = await request(app)
        .options('/api/auth/verify')
        .set('Origin', 'https://elshop.ae');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('https://elshop.ae');
      expect(res.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('Database Reset Fail-Closed Protection (/api/reset)', () => {
    it('should fail closed with 403 if RESET_SECRET is not configured', async () => {
      delete process.env.RESET_SECRET;

      const res = await request(app)
        .post('/api/reset')
        .send({ resetSecret: 'any-secret' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('RESET_SECRET is not configured');
    });

    it('should reject with 401 if RESET_SECRET is configured but wrong secret is provided', async () => {
      process.env.RESET_SECRET = 'Super_Secure_Reset_Key_2026';

      const res = await request(app)
        .post('/api/reset')
        .set('x-reset-secret', 'wrong-secret-key')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid or missing x-reset-secret');
    });

    it('should succeed with 200 when valid RESET_SECRET is provided', async () => {
      process.env.RESET_SECRET = 'Super_Secure_Reset_Key_2026';

      const res = await request(app)
        .post('/api/reset')
        .set('x-reset-secret', 'Super_Secure_Reset_Key_2026')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Superadmin Global Pulse Authorization (/api/superadmin/global-pulse)', () => {
    it('should fail closed with 500 when SUPERADMIN_SECRET is not configured', async () => {
      delete process.env.SUPERADMIN_SECRET;

      const res = await request(app)
        .get('/api/superadmin/global-pulse')
        .set('x-elshop-admin-secret', 'candidate-secret');

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Server Misconfigured: Administrative secret is required');
    });

    it('should return 401 when SUPERADMIN_SECRET is set but invalid header is sent', async () => {
      process.env.SUPERADMIN_SECRET = 'Superadmin_Master_Secret_9918';

      const res = await request(app)
        .get('/api/superadmin/global-pulse')
        .set('x-elshop-admin-secret', 'wrong-secret');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('should succeed with 200 when valid SUPERADMIN_SECRET is provided', async () => {
      process.env.SUPERADMIN_SECRET = 'Superadmin_Master_Secret_9918';

      const res = await request(app)
        .get('/api/superadmin/global-pulse')
        .set('x-elshop-admin-secret', 'Superadmin_Master_Secret_9918');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('partitions');
      expect(res.body).toHaveProperty('networkSummary');
    });
  });

  describe('Staff Authentication (/api/auth/verify) & No Universal Bypasses', () => {
    it('should reject hardcoded universal PIN bypasses (1234, 0000, 5678, 1111) against stores with different PINs', async () => {
      // store-2 has PIN '2222', rider PIN '6666'
      const bypasses = ['1234', '0000', '5678', '1111'];

      for (const pin of bypasses) {
        const res = await request(app)
          .post('/api/auth/verify')
          .send({ role: 'merchant', storeId: 'store-2', passcode: pin });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      }
    });

    it('should reject default admin2026 passcode if SUPERADMIN_SECRET is not configured', async () => {
      delete process.env.SUPERADMIN_SECRET;
      delete process.env.ADMIN_PASSCODE;

      const res = await request(app)
        .post('/api/auth/verify')
        .send({ role: 'admin', passcode: 'admin2026' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should issue a signed session token upon valid merchant PIN authentication', async () => {
      // store-1 PIN is '1234'
      const res = await request(app)
        .post('/api/auth/verify')
        .send({ role: 'merchant', storeId: 'store-1', passcode: '1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.storeId).toBe('store-1');
      expect(res.body.role).toBe('merchant');
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
    });
  });

  describe('Real Cross-Tenant Mutation & RBAC Authorization Checks', () => {
    let store1Token: string;
    let riderToken: string;

    beforeEach(async () => {
      // Authenticate merchant for store-1
      const mRes = await request(app)
        .post('/api/auth/verify')
        .send({ role: 'merchant', storeId: 'store-1', passcode: '1234' });
      store1Token = mRes.body.token;

      // Authenticate rider for store-1 (rider PIN is 5678)
      const rRes = await request(app)
        .post('/api/auth/verify')
        .send({ role: 'rider', storeId: 'store-1', passcode: '5678' });
      riderToken = rRes.body.token;
    });

    it('should reject unauthenticated write mutations with 401', async () => {
      const res = await request(app)
        .patch('/api/stores/store-1')
        .send({ name: 'Unauthenticated Attacker Name' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('should reject cross-tenant store mutation with 403 Forbidden', async () => {
      // Store 1 tries to modify store 2
      const res = await request(app)
        .patch('/api/stores/store-2')
        .set('Authorization', `Bearer ${store1Token}`)
        .send({ name: 'Store 1 Hijacked Store 2' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('should reject rider role from accessing merchant-only store settings with 403 Forbidden', async () => {
      const res = await request(app)
        .patch('/api/stores/store-1')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ name: 'Rider Renamed Store' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('should reject cross-tenant customer khata settlement with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/customers/cust-1/settle-khata')
        .set('Authorization', `Bearer ${store1Token}`)
        .send({
          amount: 20,
          storeId: 'store-2', // Attacker specifies store-2 while authenticated as store-1
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('should allow legitimate store-1 merchant to update their own store settings', async () => {
      const res = await request(app)
        .patch('/api/stores/store-1')
        .set('Authorization', `Bearer ${store1Token}`)
        .send({ tagline: 'Fastest Groceries in Dubai Marina' });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('store-1');
      expect(res.body.tagline).toBe('Fastest Groceries in Dubai Marina');
    });
  });
});
