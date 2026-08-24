import { useState, useEffect } from 'react';
import { offlineSyncManager } from './offlineSyncManager';
import { SyncQueueItem } from './offlineDb';

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  syncProgress: { current: number; total: number } | null;
  pendingCount: number;
  conflictCount: number;
  lastSyncedAt: Date | null;
  items: SyncQueueItem[];
  conflictItems: SyncQueueItem[];
  toggleSimulatedOffline: () => void;
  syncNow: () => Promise<void>;
  retryItem: (id: number) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
  resolveForceLocal: (id: number) => Promise<boolean>;
  resolveKeepServer: (id: number) => Promise<boolean>;
  downloadBackup: () => Promise<void>;
  enqueueOrder: (orderPayload: any, storeId?: string) => Promise<SyncQueueItem>;
  enqueueKhataSettlement: (settlePayload: any, storeId?: string) => Promise<SyncQueueItem>;
  enqueueOrderUpdate: (orderId: string, data: any, storeId?: string) => Promise<SyncQueueItem>;
  enqueueProductUpdate: (productId: string, data: any, storeId?: string) => Promise<SyncQueueItem>;
}

export function useOfflineSync(): OfflineSyncStatus {
  const [status, setStatus] = useState({
    isOnline: offlineSyncManager.effectiveOnlineStatus(),
    isSimulatedOffline: offlineSyncManager.getSimulatedOffline(),
    isSyncing: false,
    syncProgress: null as { current: number; total: number } | null,
    pendingCount: 0,
    conflictCount: 0,
    lastSyncedAt: null as Date | null,
    items: [] as SyncQueueItem[],
    conflictItems: [] as SyncQueueItem[],
  });

  useEffect(() => {
    const unsubscribe = offlineSyncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleSimulatedOffline = () => {
    offlineSyncManager.setSimulatedOffline(!status.isSimulatedOffline);
  };

  const syncNow = async () => {
    await offlineSyncManager.processSyncQueue();
  };

  const retryItem = async (id: number) => {
    return await offlineSyncManager.retryItem(id);
  };

  const deleteItem = async (id: number) => {
    return await offlineSyncManager.deleteItem(id);
  };

  const resolveForceLocal = async (id: number) => {
    return await offlineSyncManager.resolveForceLocal(id);
  };

  const resolveKeepServer = async (id: number) => {
    return await offlineSyncManager.resolveKeepServer(id);
  };

  const downloadBackup = async () => {
    const backup = await offlineSyncManager.exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elshop-offline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const enqueueOrder = async (orderPayload: any, storeId?: string) => {
    const summary = `New Order: ${orderPayload.building || ''} ${orderPayload.unit || ''} • ${orderPayload.items?.length || 0} items (${orderPayload.paymentMethod || 'cash'})`;
    return await offlineSyncManager.enqueueAction('CREATE_ORDER', orderPayload, summary, storeId);
  };

  const enqueueKhataSettlement = async (settlePayload: any, storeId?: string) => {
    const summary = `Khata Settlement: ${settlePayload.amount || 0} AED (${settlePayload.customerPhone || 'Customer'})`;
    return await offlineSyncManager.enqueueAction('SETTLE_KHATA', settlePayload, summary, storeId);
  };

  const enqueueOrderUpdate = async (orderId: string, data: any, storeId?: string) => {
    const summary = `Update Order #${orderId}: status -> ${data.status || 'updated'}`;
    return await offlineSyncManager.enqueueAction('UPDATE_ORDER', { id: orderId, data }, summary, storeId);
  };

  const enqueueProductUpdate = async (productId: string, data: any, storeId?: string) => {
    const summary = `Update Product #${productId}: stock/price change`;
    return await offlineSyncManager.enqueueAction('UPDATE_PRODUCT', { id: productId, data }, summary, storeId);
  };

  return {
    ...status,
    toggleSimulatedOffline,
    syncNow,
    retryItem,
    deleteItem,
    resolveForceLocal,
    resolveKeepServer,
    downloadBackup,
    enqueueOrder,
    enqueueKhataSettlement,
    enqueueOrderUpdate,
    enqueueProductUpdate,
  };
}
