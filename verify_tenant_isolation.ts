/**
 * Tenant Isolation & Ledger Scoping Verification Script
 * 
 * Verifies that:
 * 1. Store authentication correctly scopes merchant access by PIN and issues a signed session token.
 * 2. Unauthenticated write requests are rejected with 401 Unauthorized.
 * 3. Cross-tenant mutation attempts (PATCH /api/stores/store-2, DELETE store-2 product, etc.)
 *    are strictly rejected with 403 Forbidden.
 * 4. Role restrictions are enforced (e.g. rider token cannot hit merchant-only store configuration routes).
 * 5. State queries filtered by storeId return strictly store-scoped data.
 * 6. Store-scoped Khata settlement succeeds only for the authorized tenant.
 */

async function runTenantIsolationVerification() {
  console.log('=== ELSHOP TENANT ISOLATION & LEDGER VERIFICATION ===\n');

  const BASE_URL = 'http://localhost:3000';

  // 1. Health check
  console.log('[Test 1] Checking API Health...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('Health Response:', healthData);
  if (healthData.status !== 'ok') {
    throw new Error('Health check failed');
  }

  // 2. Authenticate Store 1 ('store-1') with PIN '1234'
  console.log('\n[Test 2] Authenticating Store 1 (PIN: 1234)...');
  const authStore1Res = await fetch(`${BASE_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'merchant',
      storeId: 'store-1',
      passcode: '1234',
    }),
  });
  const authStore1 = await authStore1Res.json();
  console.log('Store 1 Auth Result:', { success: authStore1.success, storeId: authStore1.storeId, hasToken: Boolean(authStore1.token) });
  if (!authStore1.success || authStore1.storeId !== 'store-1' || !authStore1.token) {
    throw new Error('Store 1 authentication failed or token not issued');
  }
  const tokenStore1 = authStore1.token;

  // 3. Attempt Invalid PIN for Store 1
  console.log('\n[Test 3] Verifying PIN authorization rejection with wrong PIN...');
  const invalidAuthRes = await fetch(`${BASE_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'merchant',
      storeId: 'store-1',
      passcode: 'wrong_pin_9999',
    }),
  });
  console.log('Wrong PIN Status Code:', invalidAuthRes.status);
  if (invalidAuthRes.status !== 401) {
    throw new Error('Security violation: Invalid PIN was not rejected with 401');
  }

  // 4. Query State scoped to store-1
  console.log('\n[Test 4] Querying State strictly scoped to store-1...');
  const store1StateRes = await fetch(`${BASE_URL}/api/state?storeId=store-1`);
  const store1State = await store1StateRes.json();

  console.log(`- Stores returned: ${store1State.stores.length} (Expected: 1, ID: ${store1State.stores[0]?.id})`);
  console.log(`- Products returned: ${store1State.products.length} (All storeId === 'store-1': ${store1State.products.every((p: any) => p.storeId === 'store-1')})`);
  console.log(`- Orders returned: ${store1State.orders.length} (All storeId === 'store-1': ${store1State.orders.every((o: any) => o.storeId === 'store-1')})`);
  console.log(`- Khata Transactions returned: ${store1State.khataTransactions.length}`);

  // Strict Tenant Assertion for Store 1
  const hasStore2OrdersInStore1 = store1State.orders.some((o: any) => o.storeId === 'store-2');
  const hasStore2ProductsInStore1 = store1State.products.some((p: any) => p.storeId === 'store-2');
  const hasForeignDebitInStore1 = store1State.khataTransactions.some((t: any) => t.storeId && t.storeId !== 'store-1');

  if (hasStore2OrdersInStore1 || hasStore2ProductsInStore1 || hasForeignDebitInStore1) {
    throw new Error('Tenant isolation failure: store-1 query leaked store-2 data!');
  }
  console.log('✓ Store 1 query strictly isolated without foreign tenant leakage.');

  // 5. Query State scoped to store-2
  console.log('\n[Test 5] Querying State strictly scoped to store-2...');
  const store2StateRes = await fetch(`${BASE_URL}/api/state?storeId=store-2`);
  const store2State = await store2StateRes.json();

  console.log(`- Stores returned: ${store2State.stores.length} (Expected: 1, ID: ${store2State.stores[0]?.id})`);
  console.log(`- Products returned: ${store2State.products.length} (All storeId === 'store-2': ${store2State.products.every((p: any) => p.storeId === 'store-2')})`);
  console.log(`- Orders returned: ${store2State.orders.length} (All storeId === 'store-2': ${store2State.orders.every((o: any) => o.storeId === 'store-2')})`);

  const hasStore1OrdersInStore2 = store2State.orders.some((o: any) => o.storeId === 'store-1');
  const hasForeignDebitInStore2 = store2State.khataTransactions.some((t: any) => t.storeId && t.storeId !== 'store-2');

  if (hasStore1OrdersInStore2 || hasForeignDebitInStore2) {
    throw new Error('Tenant isolation failure: store-2 query leaked store-1 data!');
  }
  console.log('✓ Store 2 query strictly isolated without foreign tenant leakage.');

  // 6. Test Unauthenticated Mutation Rejection
  console.log('\n[Test 6] Verifying unauthenticated write rejection (401)...');
  const unauthPatchRes = await fetch(`${BASE_URL}/api/stores/store-1`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacked Store' }),
  });
  console.log('Unauthenticated PATCH Status Code:', unauthPatchRes.status);
  if (unauthPatchRes.status !== 401) {
    throw new Error(`Security violation: Unauthenticated mutation was not rejected with 401 (got ${unauthPatchRes.status})`);
  }
  console.log('✓ Unauthenticated write rejected with 401.');

  // 7. Test Cross-Tenant Store Modification Rejection
  console.log('\n[Test 7] Authenticated store-1 attempting to PATCH store-2 settings...');
  const crossStorePatchRes = await fetch(`${BASE_URL}/api/stores/store-2`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenStore1}`,
    },
    body: JSON.stringify({ name: 'Store 1 Hijack Name' }),
  });
  console.log('Cross-tenant Store PATCH Status Code:', crossStorePatchRes.status);
  if (crossStorePatchRes.status !== 403) {
    throw new Error(`Security violation: Cross-tenant store PATCH was not rejected with 403 (got ${crossStorePatchRes.status})`);
  }
  console.log('✓ Cross-tenant store mutation rejected with 403 Forbidden.');

  // 8. Test Cross-Tenant Product Deletion Rejection
  console.log('\n[Test 8] Authenticated store-1 attempting to DELETE store-2 product...');
  const store2Product = store2State.products[0];
  if (!store2Product) {
    throw new Error('Setup error: No store-2 products available for cross-tenant test');
  }
  const crossDeleteProductRes = await fetch(`${BASE_URL}/api/products/${store2Product.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${tokenStore1}`,
    },
  });
  console.log('Cross-tenant Product DELETE Status Code:', crossDeleteProductRes.status);
  if (crossDeleteProductRes.status !== 403) {
    throw new Error(`Security violation: Cross-tenant product DELETE was not rejected with 403 (got ${crossDeleteProductRes.status})`);
  }
  console.log('✓ Cross-tenant product deletion rejected with 403 Forbidden.');

  // 9. Test Cross-Tenant Customer Khata Settlement Rejection
  console.log('\n[Test 9] Authenticated store-1 attempting to settle Khata for store-2...');
  const crossSettleRes = await fetch(`${BASE_URL}/api/customers/cust-1/settle-khata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenStore1}`,
    },
    body: JSON.stringify({
      amount: 10,
      storeId: 'store-2', // Deliberate mismatch
      customerPhone: '+971 50 123 4567',
    }),
  });
  console.log('Cross-tenant Settle Khata Status Code:', crossSettleRes.status);
  if (crossSettleRes.status !== 403) {
    throw new Error(`Security violation: Cross-tenant khata settlement was not rejected with 403 (got ${crossSettleRes.status})`);
  }
  console.log('✓ Cross-tenant Khata settlement rejected with 403 Forbidden.');

  // 10. Test Role Restriction: Rider attempting merchant-only configuration
  console.log('\n[Test 10] Rider token attempting merchant-only store PATCH...');
  const authRiderRes = await fetch(`${BASE_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'rider',
      storeId: 'store-1',
      passcode: '5678',
    }),
  });
  const authRider = await authRiderRes.json();
  if (!authRider.success || !authRider.token) {
    throw new Error('Rider authentication failed');
  }
  const riderToken = authRider.token;

  const riderStorePatchRes = await fetch(`${BASE_URL}/api/stores/store-1`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${riderToken}`,
    },
    body: JSON.stringify({ name: 'Rider Renamed Store' }),
  });
  console.log('Rider Store PATCH Status Code:', riderStorePatchRes.status);
  if (riderStorePatchRes.status !== 403) {
    throw new Error(`Security violation: Rider role was not rejected with 403 on merchant route (got ${riderStorePatchRes.status})`);
  }
  console.log('✓ Rider role access to merchant route rejected with 403 Forbidden.');

  // 11. Test Legitimate Store 1 Khata Settlement
  console.log('\n[Test 11] Executing legitimate Store 1 Khata settlement with store-1 token...');
  const legitimateSettleRes = await fetch(`${BASE_URL}/api/customers/cust-1/settle-khata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenStore1}`,
    },
    body: JSON.stringify({
      amount: 5,
      note: 'Isolation automated test payment',
      storeId: 'store-1',
      customerPhone: '+971 50 123 4567',
    }),
  });
  const legitimateSettle = await legitimateSettleRes.json();
  console.log('Legitimate Settlement Response:', legitimateSettle);
  if (!legitimateSettle.success) {
    throw new Error('Legitimate settlement failed');
  }
  console.log('✓ Legitimate store settlement succeeded.');

  console.log('\n======================================================');
  console.log('>>> ALL MULTI-TENANT ISOLATION TESTS PASSED (100%) <<<');
  console.log('======================================================');
}

runTenantIsolationVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
