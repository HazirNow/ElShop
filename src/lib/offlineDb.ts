import Dexie, { Table } from 'dexie';
import { Order, Product, CustomerProfile, KhataTransaction, Store } from '../types';

export interface ConflictDetails {
  serverUpdatedAt?: string;
  localQueuedAt: string;
  serverState?: any;
  localState?: any;
  reason: string;
}

export interface SyncQueueItem {
  id?: number;
  idempotencyKey: string;
  actionType: 
    | 'CREATE_ORDER' 
    | 'UPDATE_ORDER' 
    | 'APPEND_ORDER_ITEMS'
    | 'SETTLE_KHATA' 
    | 'ADJUST_KHATA_CREDIT' 
    | 'UPDATE_PRODUCT' 
    | 'CREATE_PRODUCT'
    | 'UPDATE_CUSTOMER'
    | 'UPDATE_STORE';
  payload: any;
  timestamp: string; // queuedAt
  status: 'pending' | 'syncing' | 'failed' | 'completed' | 'conflict';
  retryCount: number;
  lastError?: string;
  summary: string;
  storeId?: string;
  conflict?: ConflictDetails;
}

export interface OfflineMeta {
  key: string;
  value: any;
  updatedAt: string;
}

export class ElShopOfflineDatabase extends Dexie {
  products!: Table<Product, string>;
  orders!: Table<Order, string>;
  customers!: Table<CustomerProfile, string>;
  khataTransactions!: Table<KhataTransaction, string>;
  stores!: Table<Store, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  meta!: Table<OfflineMeta, string>;

  constructor() {
    super('ElShopOfflineDB_v2');
    this.version(1).stores({
      products: 'id, storeId, category, name, inStock',
      orders: 'id, storeId, customerId, customerPhone, status, paymentStatus, createdAt',
      customers: 'id, phone, name, building, unit',
      khataTransactions: 'id, customerId, customerPhone, storeId, type, timestamp',
      stores: 'id, name, phone',
      syncQueue: '++id, idempotencyKey, actionType, status, timestamp, storeId',
      meta: 'key, updatedAt'
    });
  }
}

export const offlineDb = new ElShopOfflineDatabase();

/**
 * Seed or update local IndexedDB cache from current AppState in a single transaction
 */
export async function syncStateToIndexedDb(state: {
  products?: Product[];
  orders?: Order[];
  customers?: CustomerProfile[];
  khataTransactions?: KhataTransaction[];
  stores?: Store[];
}): Promise<void> {
  try {
    await offlineDb.transaction('rw', [
      offlineDb.products,
      offlineDb.orders,
      offlineDb.customers,
      offlineDb.khataTransactions,
      offlineDb.stores,
      offlineDb.meta
    ], async () => {
      if (state.products && state.products.length > 0) {
        await offlineDb.products.bulkPut(state.products);
      }
      if (state.orders && state.orders.length > 0) {
        await offlineDb.orders.bulkPut(state.orders);
      }
      if (state.customers && state.customers.length > 0) {
        await offlineDb.customers.bulkPut(state.customers);
      }
      if (state.khataTransactions && state.khataTransactions.length > 0) {
        await offlineDb.khataTransactions.bulkPut(state.khataTransactions);
      }
      if (state.stores && state.stores.length > 0) {
        await offlineDb.stores.bulkPut(state.stores);
      }
      await offlineDb.meta.put({
        key: 'lastFullSync',
        value: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  } catch (error) {
    console.warn('[OfflineDB] Warning updating local cache:', error);
  }
}

/**
 * Export all local IndexedDB tables to a JSON structure for backup
 */
export async function exportLocalDataBackup(): Promise<{
  exportDate: string;
  app: string;
  version: string;
  data: {
    products: Product[];
    orders: Order[];
    customers: CustomerProfile[];
    khataTransactions: KhataTransaction[];
    stores: Store[];
    syncQueue: SyncQueueItem[];
  };
}> {
  const [products, orders, customers, khataTransactions, stores, syncQueue] = await Promise.all([
    offlineDb.products.toArray(),
    offlineDb.orders.toArray(),
    offlineDb.customers.toArray(),
    offlineDb.khataTransactions.toArray(),
    offlineDb.stores.toArray(),
    offlineDb.syncQueue.toArray()
  ]);

  return {
    exportDate: new Date().toISOString(),
    app: 'ElShop UAE Baqala OS',
    version: '2.0.0-offline',
    data: {
      products,
      orders,
      customers,
      khataTransactions,
      stores,
      syncQueue
    }
  };
}
