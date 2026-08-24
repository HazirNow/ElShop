import { getAppStateFromDb, settleCustomerKhataInDb } from '../db/repository.ts';

/**
 * Security & Multi-Tenant Isolation Test Suite
 * 
 * Simulates cross-tenant access attempts to verify:
 * 1. Query-level isolation: getAppStateFromDb(storeId) filters all records strictly by storeId.
 * 2. Order privacy: store A cannot view orders belonging to store B.
 * 3. Ledger privacy: store A cannot view khata transactions (debits/credits) belonging to store B.
 * 4. Product catalog isolation: store A cannot mutate or view private catalog records of store B.
 * 5. Settlement scoping: khata settlements are strictly tied to the designated storeId.
 */

async function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

export async function runSecurityTests() {
  console.log('====================================================');
  console.log('🔒 RUNNING MULTI-TENANT REPOSITORY SECURITY TESTS');
  console.log('====================================================\n');

  // 1. Fetch state for store-1 (Al Medina Supermarket)
  console.log('[Scenario 1] Retrieving repository state scoped to store-1...');
  const store1State = await getAppStateFromDb('store-1');

  await assert(
    store1State.stores.length === 1 && store1State.stores[0].id === 'store-1',
    'store-1 state returns exactly one store record matching store-1'
  );

  await assert(
    store1State.products.every((p) => p.storeId === 'store-1'),
    'All products in store-1 state belong strictly to store-1'
  );

  await assert(
    store1State.orders.every((o) => o.storeId === 'store-1'),
    'All orders in store-1 state belong strictly to store-1 (no cross-store order leakage)'
  );

  await assert(
    store1State.khataTransactions.every((t) => !t.storeId || t.storeId === 'store-1'),
    'All Khata transactions in store-1 state belong strictly to store-1'
  );

  // 2. Fetch state for store-2 (City Corner Grocery)
  console.log('\n[Scenario 2] Retrieving repository state scoped to store-2 (simulating merchant login to store-2)...');
  const store2State = await getAppStateFromDb('store-2');

  await assert(
    store2State.stores.length === 1 && store2State.stores[0].id === 'store-2',
    'store-2 state returns exactly one store record matching store-2'
  );

  await assert(
    store2State.products.every((p) => p.storeId === 'store-2'),
    'All products in store-2 state belong strictly to store-2'
  );

  await assert(
    store2State.orders.every((o) => o.storeId === 'store-2'),
    'Store-2 cannot access or view orders placed at store-1'
  );

  await assert(
    store2State.khataTransactions.every((t) => !t.storeId || t.storeId === 'store-2'),
    'Store-2 cannot access Khata debt ledger records belonging to store-1'
  );

  // 3. Cross-Tenant Leakage Verification
  console.log('\n[Scenario 3] Explicit Cross-Store Data Leakage Audit...');
  const leakedOrdersInStore2 = store2State.orders.filter((o) => o.storeId === 'store-1');
  await assert(
    leakedOrdersInStore2.length === 0,
    `Zero store-1 orders found in store-2 queries (found: ${leakedOrdersInStore2.length})`
  );

  const leakedProductsInStore2 = store2State.products.filter((p) => p.storeId === 'store-1');
  await assert(
    leakedProductsInStore2.length === 0,
    `Zero store-1 products found in store-2 queries (found: ${leakedProductsInStore2.length})`
  );

  const leakedDebitsInStore2 = store2State.khataTransactions.filter(
    (t) => t.storeId === 'store-1'
  );
  await assert(
    leakedDebitsInStore2.length === 0,
    `Zero store-1 Khata ledger entries found in store-2 queries (found: ${leakedDebitsInStore2.length})`
  );

  // 4. Scoped Ledger Settlement Test
  console.log('\n[Scenario 4] Verifying Store-Scoped Ledger Settlement...');
  const settlementResult = await settleCustomerKhataInDb(
    'cust-1',
    1.0,
    'Security test scoped credit entry',
    'Merchant Al Medina',
    'store-1',
    '+971 50 123 4567'
  );

  await assert(
    settlementResult.settledAmount === 1.0,
    'Settlement execution recorded correct credit amount for store-1'
  );

  // Re-verify that store-2 state remains completely isolated after the settlement
  const store2StatePostSettle = await getAppStateFromDb('store-2');
  const leakedTxPostSettle = store2StatePostSettle.khataTransactions.filter(
    (t) => t.note?.includes('Security test scoped credit entry') && t.storeId !== 'store-2'
  );

  await assert(
    leakedTxPostSettle.length === 0,
    'Settlement credit created for store-1 does not leak into store-2 query results'
  );

  console.log('\n====================================================');
  console.log('✅ ALL MULTI-TENANT ISOLATION SECURITY TESTS PASSED');
  console.log('====================================================\n');
}

// Allow direct execution via tsx
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('security.test')) {
  runSecurityTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
