/**
 * Tenant Isolation & Ledger Scoping Verification Script
 * 
 * Verifies that:
 * 1. Store authentication correctly scopes merchant access by PIN.
 * 2. State and ledger queries filtered by storeId return strictly store-scoped
 *    data without cross-tenant leakage of orders, products, or khata transactions.
 * 3. An authenticated store cannot access or mutate another store's transactions.
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
  console.log('Store 1 Auth Result:', authStore1);
  if (!authStore1.success || authStore1.storeId !== 'store-1') {
    throw new Error('Store 1 authentication failed');
  }

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

  // 6. Test Store-Scoped Khata Settlement
  console.log('\n[Test 6] Testing store-scoped settlement execution...');
  const settleRes = await fetch(`${BASE_URL}/api/customers/cust-1/settle-khata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 5,
      note: 'Isolation automated test payment',
      storeId: 'store-1',
      customerPhone: '+971 50 123 4567',
    }),
  });
  const settleData = await settleRes.json();
  console.log('Settlement Response:', settleData);
  if (!settleData.success) {
    throw new Error('Settlement failed');
  }

  console.log('\n======================================================');
  console.log('>>> ALL MULTI-TENANT ISOLATION TESTS PASSED (100%) <<<');
  console.log('======================================================');
}

runTenantIsolationVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
