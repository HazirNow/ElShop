import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  PauseCircle, 
  PlayCircle, 
  Send, 
  KeyRound, 
  DollarSign, 
  Store as StoreIcon, 
  Check, 
  X, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Edit3,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';
import { Store, Language } from '../../types';
import { updateStore, sendStorePaymentReminder } from '../../api';

interface AdminStoreTableProps {
  stores: Store[];
  lang: Language;
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
  onOpenCreateStore: () => void;
  onAddAuditLog: (entry: { actor: string; action: string; target: string; severity: 'info' | 'warning' | 'critical' | 'success'; details?: string }) => void;
}

export const AdminStoreTable: React.FC<AdminStoreTableProps> = ({
  stores,
  lang,
  onRefresh,
  onShowToast,
  onOpenCreateStore,
  onAddAuditLog,
}) => {
  const isRtl = lang === 'ar';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'suspended'>('all');

  // Bulk Selection State
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Quick PIN Edit State
  const [editingPinStoreId, setEditingPinStoreId] = useState<string | null>(null);
  const [newPinValue, setNewPinValue] = useState('');

  // Quick Fee Edit State
  const [editingFeeStoreId, setEditingFeeStoreId] = useState<string | null>(null);
  const [newFeeValue, setNewFeeValue] = useState('');

  // Filtered stores
  const filteredStores = stores.filter((store) => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.merchantName && store.merchantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      store.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'active') {
      return !store.servicePaused && store.paymentStatus !== 'overdue';
    }
    if (statusFilter === 'overdue') {
      return store.paymentStatus === 'overdue' && !store.servicePaused;
    }
    if (statusFilter === 'suspended') {
      return store.servicePaused;
    }
    return true;
  });

  // Bulk Select Toggle
  const isAllSelected = filteredStores.length > 0 && selectedStoreIds.length === filteredStores.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStoreIds([]);
    } else {
      setSelectedStoreIds(filteredStores.map((s) => s.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedStoreIds.includes(id)) {
      setSelectedStoreIds(selectedStoreIds.filter((sid) => sid !== id));
    } else {
      setSelectedStoreIds([...selectedStoreIds, id]);
    }
  };

  // Bulk Actions
  const handleBulkSuspend = async () => {
    if (selectedStoreIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const id of selectedStoreIds) {
        await updateStore(id, { servicePaused: true });
      }
      onAddAuditLog({
        actor: 'Admin HQ',
        action: 'Bulk Store Suspension',
        target: `${selectedStoreIds.length} Stores`,
        severity: 'critical',
        details: `Suspended catalog & delivery service for IDs: ${selectedStoreIds.join(', ')}`,
      });
      onShowToast(`Suspended ${selectedStoreIds.length} stores.`);
      setSelectedStoreIds([]);
      onRefresh();
    } catch (err) {
      onShowToast('Failed to execute bulk suspend');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkActivate = async () => {
    if (selectedStoreIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const id of selectedStoreIds) {
        await updateStore(id, { servicePaused: false });
      }
      onAddAuditLog({
        actor: 'Admin HQ',
        action: 'Bulk Store Activation',
        target: `${selectedStoreIds.length} Stores`,
        severity: 'success',
        details: `Restored full active operations for IDs: ${selectedStoreIds.join(', ')}`,
      });
      onShowToast(`Reactivated ${selectedStoreIds.length} stores.`);
      setSelectedStoreIds([]);
      onRefresh();
    } catch (err) {
      onShowToast('Failed to execute bulk activate');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkInvoiceReminder = async () => {
    if (selectedStoreIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const id of selectedStoreIds) {
        await sendStorePaymentReminder(id);
      }
      onAddAuditLog({
        actor: 'Admin HQ',
        action: 'Bulk Invoice Dispatched',
        target: `${selectedStoreIds.length} Stores`,
        severity: 'info',
        details: `Automated WhatsApp payment notices sent.`,
      });
      onShowToast(`Sent invoices to ${selectedStoreIds.length} stores.`);
      setSelectedStoreIds([]);
      onRefresh();
    } catch (err) {
      onShowToast('Failed to send invoice reminders');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Single Actions
  const handleToggleSingleSuspend = async (store: Store) => {
    const newPaused = !store.servicePaused;
    try {
      await updateStore(store.id, { servicePaused: newPaused });
      onAddAuditLog({
        actor: 'Admin HQ',
        action: newPaused ? 'Store Suspended' : 'Store Resumed',
        target: `${store.name} (${store.id})`,
        severity: newPaused ? 'warning' : 'success',
        details: newPaused ? 'Service paused manually.' : 'Service restored to operational status.',
      });
      onShowToast(`${store.name} is now ${newPaused ? 'Suspended' : 'Active'}`);
      onRefresh();
    } catch (e) {
      onShowToast('Failed to update store status');
    }
  };

  const handleSendSingleReminder = async (store: Store) => {
    try {
      const res = await sendStorePaymentReminder(store.id);
      onAddAuditLog({
        actor: 'Admin HQ',
        action: 'Payment Reminder Dispatched',
        target: `${store.name} (${store.id})`,
        severity: 'info',
        details: `Dispatched WhatsApp reminder to ${store.whatsappNumber || store.phone}`,
      });
      onShowToast(res.message || `Payment notice sent to ${store.name}`);
      onRefresh();
    } catch (e) {
      onShowToast('Failed to send reminder');
    }
  };

  const handleSavePin = async (store: Store) => {
    if (!newPinValue || newPinValue.length < 4) {
      onShowToast('PIN must be at least 4 digits');
      return;
    }
    try {
      await updateStore(store.id, { pin: newPinValue });
      onAddAuditLog({
        actor: 'Admin HQ',
        action: 'Merchant POS PIN Reset',
        target: `${store.name} (${store.id})`,
        severity: 'warning',
        details: `Updated POS PIN code to ${newPinValue}.`,
      });
      onShowToast(`Updated PIN for ${store.name}`);
      setEditingPinStoreId(null);
      setNewPinValue('');
      onRefresh();
    } catch (e) {
      onShowToast('Failed to update PIN');
    }
  };

  const handleSaveFee = async (store: Store) => {
    const fee = parseFloat(newFeeValue);
    if (isNaN(fee) || fee < 0) {
      onShowToast('Invalid subscription fee');
      return;
    }
    try {
      await updateStore(store.id, { subscriptionFee: fee });
      onAddAuditLog({
        actor: 'Admin HQ',
        action: 'Subscription Rate Adjusted',
        target: `${store.name} (${store.id})`,
        severity: 'info',
        details: `Adjusted monthly SaaS fee to ${fee} AED.`,
      });
      onShowToast(`Updated SaaS fee for ${store.name} to ${fee} AED`);
      setEditingFeeStoreId(null);
      setNewFeeValue('');
      onRefresh();
    } catch (e) {
      onShowToast('Failed to update subscription fee');
    }
  };

  return (
    <div className="space-y-6" id="admin-store-management-module">
      
      {/* Header & Onboard Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <span>{isRtl ? 'إدارة متاجر البقالة والمستأجرين' : 'Baqala Store Fleet & Tenants'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'التحكم المركزي في صلاحيات المتاجر، أسعار الاشتراكات، رموز الـ PIN وإيقاف الخدمة'
              : 'Multi-tenant administration, bulk provisioning, billing SLA, and POS PIN overrides.'}
          </p>
        </div>

        <button
          onClick={onOpenCreateStore}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRtl ? 'إضافة بقالة جديدة' : 'Onboard New Store'}</span>
        </button>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث باسم المتجر، البرج، المعرف...' : 'Search store name, tower, ID...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['all', 'active', 'overdue', 'suspended'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Strip (When rows selected) */}
      {selectedStoreIds.length > 0 && (
        <div className="bg-indigo-950/70 border border-indigo-700/60 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span>{selectedStoreIds.length} Stores Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkSuspend}
              disabled={isBulkProcessing}
              className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Suspend All</span>
            </button>

            <button
              onClick={handleBulkActivate}
              disabled={isBulkProcessing}
              className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Activate All</span>
            </button>

            <button
              onClick={handleBulkInvoiceReminder}
              disabled={isBulkProcessing}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span>Send Invoices to All</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Store Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-white"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'المتجر والبرج' : 'Store & Location'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'حالة الخدمة' : 'SLA & Status'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'الاشتراك الشهري' : 'Monthly Fee'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'رمز الـ PIN' : 'POS PIN'}</th>
                <th className="py-3.5 px-4 font-extrabold text-right">{isRtl ? 'إجراءات التحكم' : 'Operations'}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No stores found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const isSelected = selectedStoreIds.includes(store.id);
                  const isOverdue = store.paymentStatus === 'overdue';
                  const isChurnRisk = isOverdue && (store.overdueDays || 0) >= 10;
                  const isPaused = store.servicePaused;

                  return (
                    <tr 
                      key={store.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-950/30' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleSelectOne(store.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Store & Tower */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {store.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                              <span>{store.name}</span>
                              {store.nameAr && (
                                <span className="text-[11px] text-slate-400 font-normal">({store.nameAr})</span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                              <span>{store.area}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-500">ID: {store.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SLA Status & Churn Risk Badge */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {isPaused && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <PauseCircle className="w-3 h-3" />
                              <span>Suspended</span>
                            </span>
                          )}

                          {isChurnRisk && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white border border-rose-400 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Churn Risk (&gt;10d)</span>
                            </span>
                          )}

                          {!isPaused && !isChurnRisk && isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Clock className="w-3 h-3" />
                              <span>Overdue ({store.overdueDays || 3}d)</span>
                            </span>
                          )}

                          {!isPaused && !isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Monthly SaaS Fee */}
                      <td className="py-3.5 px-4">
                        {editingFeeStoreId === store.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={newFeeValue}
                              onChange={(e) => setNewFeeValue(e.target.value)}
                              className="w-16 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveFee(store)}
                              className="p-1 bg-emerald-700 text-white rounded hover:bg-emerald-600"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingFeeStoreId(null)}
                              className="p-1 bg-slate-800 text-slate-400 rounded hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">{store.subscriptionFee || 299} AED</span>
                            <button
                              onClick={() => {
                                setEditingFeeStoreId(store.id);
                                setNewFeeValue(String(store.subscriptionFee || 299));
                              }}
                              className="text-slate-500 hover:text-indigo-400 p-0.5"
                              title="Edit Monthly Fee"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* POS PIN Code */}
                      <td className="py-3.5 px-4">
                        {editingPinStoreId === store.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={newPinValue}
                              onChange={(e) => setNewPinValue(e.target.value)}
                              maxLength={6}
                              className="w-16 bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-amber-300 font-mono font-bold"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePin(store)}
                              className="p-1 bg-emerald-700 text-white rounded hover:bg-emerald-600"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingPinStoreId(null)}
                              className="p-1 bg-slate-800 text-slate-400 rounded hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {store.pin || '1234'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPinStoreId(store.id);
                                setNewPinValue(store.pin || '1234');
                              }}
                              className="text-slate-500 hover:text-amber-300 p-0.5"
                              title="Reset POS PIN"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Operations Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Suspend / Resume Single Button */}
                          <button
                            onClick={() => handleToggleSingleSuspend(store)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isPaused
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700'
                            }`}
                            title={isPaused ? 'Resume Service' : 'Suspend Service'}
                          >
                            {isPaused ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Invoice / WhatsApp Notice */}
                          <button
                            onClick={() => handleSendSingleReminder(store)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 rounded-lg transition-all"
                            title="Dispatch WhatsApp Invoice / Notice"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
