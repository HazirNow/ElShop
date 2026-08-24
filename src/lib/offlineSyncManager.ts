import { offlineDb, SyncQueueItem, syncStateToIndexedDb, exportLocalDataBackup } from './offlineDb';
import { 
  createOrder as apiCreateOrder, 
  updateOrder as apiUpdateOrder, 
  appendOrderItems as apiAppendOrderItems,
  settleCustomerKhata as apiSettleKhata, 
  createProduct as apiCreateProduct, 
  updateProduct as apiUpdateProduct, 
  updateCustomer as apiUpdateCustomer,
  updateStore as apiUpdateStore,
  fetchState,
  saveCachedState,
  getCachedState
} from '../api';
import { Order, Product, CustomerProfile, KhataTransaction } from '../types';

type SyncListener = (status: {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  syncProgress: { current: number; total: number } | null;
  pendingCount: number;
  conflictCount: number;
  lastSyncedAt: Date | null;
  items: SyncQueueItem[];
  conflictItems: SyncQueueItem[];
}) => void;

class OfflineSyncManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private syncProgress: { current: number; total: number } | null = null;
  private lastSyncedAt: Date | null = null;
  private listeners: Set<SyncListener> = new Set();
  private syncInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // Check queue count on boot
      this.refreshStatus();

      // Periodic check every 20s to retry pending items if online and not simulated offline
      this.syncInterval = setInterval(() => {
        if (this.effectiveOnlineStatus() && !this.isSyncing) {
          this.processSyncQueue();
        }
      }, 20000);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.notify(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notify(targetListener?: SyncListener) {
    try {
      const allActive = await offlineDb.syncQueue
        .where('status')
        .anyOf(['pending', 'syncing', 'failed', 'conflict'])
        .reverse()
        .sortBy('id');

      const items = allActive.filter((i) => i.status !== 'conflict');
      const conflictItems = allActive.filter((i) => i.status === 'conflict');

      const status = {
        isOnline: this.effectiveOnlineStatus(),
        isSimulatedOffline: this.isSimulatedOffline,
        isSyncing: this.isSyncing,
        syncProgress: this.syncProgress,
        pendingCount: items.length,
        conflictCount: conflictItems.length,
        lastSyncedAt: this.lastSyncedAt,
        items,
        conflictItems,
      };

      if (targetListener) {
        targetListener(status);
      } else {
        this.listeners.forEach((l) => l(status));
      }
    } catch (err) {
      console.warn('[OfflineSync] Notify error:', err);
    }
  }

  /**
   * Effective online check: Network must be active AND simulation must NOT be active.
   * Simulation only pauses queue processing without dispatching synthetic browser offline events.
   */
  public effectiveOnlineStatus(): boolean {
    return this.isOnline && !this.isSimulatedOffline;
  }

  /**
   * Safe simulation toggle:
   * Only toggles internal software pause flag. Does NOT trigger window.dispatchEvent(offline).
   */
  public setSimulatedOffline(simulated: boolean) {
    this.isSimulatedOffline = simulated;
    this.notify();
    if (!simulated && this.isOnline) {
      this.processSyncQueue();
    }
  }

  public getSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    if (!this.isSimulatedOffline) {
      this.processSyncQueue();
    }
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  public async refreshStatus() {
    await this.notify();
  }

  /**
   * Enqueue an action to be executed immediately locally and synchronized with the backend.
   */
  public async enqueueAction(
    actionType: SyncQueueItem['actionType'],
    payload: any,
    summary: string,
    storeId?: string
  ): Promise<SyncQueueItem> {
    const idempotencyKey = `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const item: SyncQueueItem = {
      idempotencyKey,
      actionType,
      payload,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      summary,
      storeId,
    };

    const id = await offlineDb.syncQueue.add(item);
    item.id = id;

    // Apply optimistic updates wrapped in a Dexie transaction for full ACID safety
    await this.applyOptimisticTransaction(actionType, payload, storeId);

    this.notify();

    // If online and not simulated offline, process queue immediately
    if (this.effectiveOnlineStatus()) {
      this.processSyncQueue();
    }

    return item;
  }

  /**
   * Optimistically update local indexedDB tables and cached state in a transactional atomic scope
   */
  private async applyOptimisticTransaction(actionType: SyncQueueItem['actionType'], payload: any, storeId?: string) {
    try {
      const cached = getCachedState();

      await offlineDb.transaction('rw', [
        offlineDb.orders,
        offlineDb.products,
        offlineDb.khataTransactions,
        offlineDb.customers
      ], async () => {
        if (actionType === 'CREATE_ORDER') {
          const subtotal = (payload.items || []).reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
          const deliveryFee = subtotal < 25 ? 3.5 : 0;
          const total = subtotal + deliveryFee;
          const newId = payload.id || `ELS-${1000 + (cached.orders?.length || 0) + 1}`;

          const newOrder: Order = {
            id: newId,
            storeId: payload.storeId || storeId || 'store-1',
            customerId: payload.customerId || 'cust-1',
            customerName: payload.customerName || 'Resident Customer',
            customerPhone: payload.customerPhone || '+971 50 000 0000',
            building: payload.building || 'Princess Tower',
            unit: payload.unit || 'Apt 101',
            items: payload.items || [],
            subtotal: parseFloat(subtotal.toFixed(2)),
            deliveryFee: parseFloat(deliveryFee.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            paymentMethod: payload.paymentMethod || 'cash',
            paymentStatus: payload.paymentMethod === 'card' ? 'paid' : payload.paymentMethod === 'khata' ? 'khata_debited' : 'pending',
            status: 'placed',
            customerNote: payload.customerNote || '',
            createdAt: new Date().toISOString(),
            packedItems: [],
            chatMessages: [
              {
                id: `m-${Date.now()}-1`,
                sender: 'system',
                text: `Order #${newId} recorded locally in offline register. Subtotal: ${subtotal.toFixed(2)} AED`,
                textAr: `تم تسجيل الطلب #${newId} محلياً دون اتصال! المجموع: ${subtotal.toFixed(2)} درهم`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ]
          };

          // If khata payment, record khata transaction locally
          if (payload.paymentMethod === 'khata') {
            const khataTx: KhataTransaction = {
              id: `kt-off-${Date.now()}`,
              orderId: newId,
              customerId: payload.customerId || 'cust-1',
              customerPhone: payload.customerPhone,
              storeId: payload.storeId || storeId,
              type: 'debit',
              amount: total,
              timestamp: new Date().toISOString(),
              note: `Order #${newId} (Offline Counter Entry)`,
            };
            if (!cached.khataTransactions) cached.khataTransactions = [];
            cached.khataTransactions.unshift(khataTx);
            await offlineDb.khataTransactions.put(khataTx);
          }

          // Decrement local inventory stock for ordered items
          for (const item of (payload.items || [])) {
            const prod = await offlineDb.products.get(item.productId);
            if (prod) {
              const updatedStock = Math.max(0, (prod.stock || 0) - (Number(item.quantity) || 1));
              const updatedProd = { ...prod, stock: updatedStock, inStock: updatedStock > 0 };
              await offlineDb.products.put(updatedProd);
              const cachedProd = cached.products?.find((p) => p.id === item.productId);
              if (cachedProd) {
                cachedProd.stock = updatedStock;
                cachedProd.inStock = updatedStock > 0;
              }
            }
          }

          if (!cached.orders) cached.orders = [];
          cached.orders.unshift(newOrder);
          await offlineDb.orders.put(newOrder);
          saveCachedState(cached);
        } else if (actionType === 'UPDATE_ORDER') {
          const order = cached.orders?.find((o) => o.id === payload.id);
          if (order) {
            if (payload.data?.status) order.status = payload.data.status;
            if (payload.data?.packedItems) order.packedItems = payload.data.packedItems;
            if (payload.data?.riderId) order.riderId = payload.data.riderId;
            if (payload.data?.riderName) order.riderName = payload.data.riderName;
            await offlineDb.orders.put(order);
            saveCachedState(cached);
          }
        } else if (actionType === 'SETTLE_KHATA') {
          const khataTx: KhataTransaction = {
            id: `kt-settle-off-${Date.now()}`,
            customerId: payload.customerId,
            customerPhone: payload.customerPhone,
            storeId: payload.storeId || storeId,
            type: 'credit',
            amount: payload.amount,
            timestamp: new Date().toISOString(),
            note: payload.note || 'Offline Cash Settlement',
          };
          if (!cached.khataTransactions) cached.khataTransactions = [];
          cached.khataTransactions.unshift(khataTx);
          await offlineDb.khataTransactions.put(khataTx);
          saveCachedState(cached);
        } else if (actionType === 'UPDATE_PRODUCT') {
          const prod = cached.products?.find((p) => p.id === payload.id);
          if (prod) {
            Object.assign(prod, payload.data);
            await offlineDb.products.put(prod);
            saveCachedState(cached);
          }
        }
      });
    } catch (err) {
      console.warn('[OfflineSync] Optimistic transaction warning:', err);
    }
  }

  /**
   * Process all pending items in the sync queue sequentially with conflict detection
   */
  public async processSyncQueue(): Promise<{ processed: number; succeeded: number; conflicts: number; failed: number }> {
    if (this.isSyncing || !this.effectiveOnlineStatus()) {
      return { processed: 0, succeeded: 0, conflicts: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notify();

    let processed = 0;
    let succeeded = 0;
    let conflicts = 0;
    let failed = 0;

    try {
      const pendingItems = await offlineDb.syncQueue
        .where('status')
        .anyOf(['pending', 'failed'])
        .sortBy('id');

      const totalItems = pendingItems.length;
      if (totalItems === 0) {
        this.syncProgress = null;
        this.isSyncing = false;
        this.notify();
        return { processed: 0, succeeded: 0, conflicts: 0, failed: 0 };
      }

      // Fetch fresh server state once to perform optimistic timestamp conflict checks
      let freshServerState: any = null;
      try {
        freshServerState = await fetchState();
      } catch (err) {
        console.warn('[OfflineSync] Server fetch before sync had issues, proceeding with caution:', err);
      }

      for (let i = 0; i < totalItems; i++) {
        const item = pendingItems[i];
        if (!this.effectiveOnlineStatus()) {
          break; // Halt cleanly if went offline
        }

        processed++;
        this.syncProgress = { current: i + 1, total: totalItems };
        await offlineDb.syncQueue.update(item.id!, { status: 'syncing' });
        this.notify();

        try {
          // 1. Conflict Detection Check
          const conflict = this.detectConflict(item, freshServerState);
          if (conflict) {
            conflicts++;
            await offlineDb.syncQueue.update(item.id!, {
              status: 'conflict',
              conflict,
              lastError: `Conflict: ${conflict.reason}`
            });
            this.notify();
            continue; // Do NOT auto-apply, wait for user resolution
          }

          // 2. Replay action against backend
          await this.executeRemoteSync(item);

          // 3. Mark completed
          await offlineDb.syncQueue.update(item.id!, { 
            status: 'completed',
            retryCount: item.retryCount + 1,
            lastError: undefined 
          });
          succeeded++;
        } catch (error: any) {
          failed++;
          const errorMessage = error?.message || 'Sync replay failed';
          await offlineDb.syncQueue.update(item.id!, {
            status: 'failed',
            retryCount: item.retryCount + 1,
            lastError: errorMessage,
          });
        }
      }

      // Cleanup completed items older than 24 hours
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      await offlineDb.syncQueue
        .where('status')
        .equals('completed')
        .and((i) => i.timestamp < cutoff)
        .delete();

      if (succeeded > 0) {
        this.lastSyncedAt = new Date();
      }
    } catch (globalErr) {
      console.error('[OfflineSync] Global sync loop error:', globalErr);
    } finally {
      this.isSyncing = false;
      this.syncProgress = null;
      this.notify();
    }

    return { processed, succeeded, conflicts, failed };
  }

  /**
   * Conflict Detection Engine:
   * Checks if the server's entity timestamp is newer than the queuedAt timestamp
   */
  private detectConflict(item: SyncQueueItem, serverState: any): any | null {
    if (!serverState) return null;

    const queuedAt = new Date(item.timestamp).getTime();

    if (item.actionType === 'UPDATE_PRODUCT') {
      const serverProduct = serverState.products?.find((p: Product) => p.id === item.payload.id);
      if (serverProduct) {
        // If server product price or stock was modified after we queued our offline change
        const serverUpdatedAt = serverProduct.updatedAt 
          ? new Date(serverProduct.updatedAt).getTime()
          : null;

        if (serverUpdatedAt && serverUpdatedAt > queuedAt) {
          return {
            serverUpdatedAt: serverProduct.updatedAt,
            localQueuedAt: item.timestamp,
            serverState: {
              name: serverProduct.name,
              price: serverProduct.price,
              stock: serverProduct.stock,
              inStock: serverProduct.inStock
            },
            localState: item.payload.data,
            reason: `Product "${serverProduct.name}" was modified on cloud at ${new Date(serverProduct.updatedAt).toLocaleTimeString()} after offline change was queued at ${new Date(item.timestamp).toLocaleTimeString()}`
          };
        }
      }
    } else if (item.actionType === 'UPDATE_ORDER') {
      const serverOrder = serverState.orders?.find((o: Order) => o.id === item.payload.id);
      if (serverOrder) {
        // If server order status changed (e.g. cancelled by customer or delivered by another rider)
        const serverUpdatedAt = serverOrder.updatedAt ? new Date(serverOrder.updatedAt).getTime() : null;
        if (serverUpdatedAt && serverUpdatedAt > queuedAt && serverOrder.status !== item.payload.data?.status) {
          return {
            serverUpdatedAt: serverOrder.updatedAt,
            localQueuedAt: item.timestamp,
            serverState: { status: serverOrder.status },
            localState: { status: item.payload.data?.status },
            reason: `Order #${serverOrder.id} status was set to "${serverOrder.status}" on cloud while offline status set to "${item.payload.data?.status}"`
          };
        }
      }
    }

    return null;
  }

  /**
   * Resolve Conflict: Force Local (Overwrite server with local queued data)
   */
  public async resolveForceLocal(queueItemId: number): Promise<boolean> {
    const item = await offlineDb.syncQueue.get(queueItemId);
    if (!item) return false;

    try {
      await offlineDb.syncQueue.update(queueItemId, { status: 'syncing' });
      this.notify();

      // Force remote write
      await this.executeRemoteSync(item);

      // Mark completed
      await offlineDb.syncQueue.update(queueItemId, {
        status: 'completed',
        conflict: undefined,
        lastError: undefined
      });
      this.lastSyncedAt = new Date();
      this.notify();
      return true;
    } catch (err: any) {
      console.error('[OfflineSync] Force local resolution failed:', err);
      await offlineDb.syncQueue.update(queueItemId, {
        status: 'conflict',
        lastError: `Force push failed: ${err?.message || 'Server error'}`
      });
      this.notify();
      return false;
    }
  }

  /**
   * Resolve Conflict: Keep Server (Discard local queued mutation, sync local IndexedDB to match server)
   */
  public async resolveKeepServer(queueItemId: number): Promise<boolean> {
    const item = await offlineDb.syncQueue.get(queueItemId);
    if (!item) return false;

    try {
      // Discard queue mutation
      await offlineDb.syncQueue.delete(queueItemId);

      // Fetch server state and overwrite local IndexedDB record
      const freshState = await fetchState();
      if (freshState) {
        await syncStateToIndexedDb(freshState);
        saveCachedState(freshState);
      }

      this.notify();
      return true;
    } catch (err) {
      console.error('[OfflineSync] Keep server resolution failed:', err);
      return false;
    }
  }

  /**
   * Execute actual API call corresponding to the queued item
   */
  private async executeRemoteSync(item: SyncQueueItem): Promise<any> {
    switch (item.actionType) {
      case 'CREATE_ORDER':
        return await apiCreateOrder(item.payload);

      case 'UPDATE_ORDER':
        return await apiUpdateOrder(item.payload.id, item.payload.data);

      case 'APPEND_ORDER_ITEMS':
        return await apiAppendOrderItems(item.payload.orderId, item.payload.items);

      case 'SETTLE_KHATA':
        return await apiSettleKhata(item.payload.customerId, item.payload);

      case 'CREATE_PRODUCT':
        return await apiCreateProduct(item.payload);

      case 'UPDATE_PRODUCT':
        return await apiUpdateProduct(item.payload.id, item.payload.data);

      case 'UPDATE_CUSTOMER':
        return await apiUpdateCustomer(item.payload.id, item.payload.data);

      case 'UPDATE_STORE':
        return await apiUpdateStore(item.payload.id, item.payload.data);

      default:
        console.warn('[OfflineSync] Unknown action type:', item.actionType);
    }
  }

  /**
   * Force retry a specific failed queue item
   */
  public async retryItem(id: number): Promise<boolean> {
    const item = await offlineDb.syncQueue.get(id);
    if (!item) return false;

    await offlineDb.syncQueue.update(id, { status: 'pending', lastError: undefined });
    this.notify();
    if (this.effectiveOnlineStatus()) {
      this.processSyncQueue();
    }
    return true;
  }

  /**
   * Remove an item from the queue
   */
  public async deleteItem(id: number): Promise<boolean> {
    await offlineDb.syncQueue.delete(id);
    this.notify();
    return true;
  }

  /**
   * Clear all completed and failed items
   */
  public async clearCompletedAndFailed(): Promise<void> {
    await offlineDb.syncQueue
      .where('status')
      .anyOf(['completed', 'failed'])
      .delete();
    this.notify();
  }

  /**
   * Export all local data to JSON backup
   */
  public async exportBackup() {
    return await exportLocalDataBackup();
  }
}

export const offlineSyncManager = new OfflineSyncManager();
