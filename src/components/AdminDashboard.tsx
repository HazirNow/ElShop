import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  Search, 
  Bell, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  PauseCircle, 
  PlayCircle, 
  RotateCcw, 
  Edit3, 
  KeyRound, 
  ExternalLink, 
  ArrowUpRight, 
  DollarSign, 
  ShoppingBag, 
  Activity, 
  Download, 
  Filter, 
  Send, 
  Check, 
  X, 
  Sparkles, 
  Clock, 
  Store as StoreIcon, 
  Bike, 
  RefreshCw, 
  ShieldAlert, 
  LogOut,
  TrendingUp,
  Percent,
  Settings as SettingsIcon,
  Menu,
  Sliders,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { AppState, Store, Language, Order } from '../types';
import { updateAdminConfig, createStore, updateStore, sendStorePaymentReminder } from '../api';
import { getTranslation } from '../translations';
import { ElShopLogo } from './ElShopLogo';
import { ProductImage } from './ProductImage';

// Modular Admin Sub-Components
import { AdminSidebar, AdminTab } from './admin/AdminSidebar';
import { AdminStoreTable } from './admin/AdminStoreTable';
import { AdminUserTable } from './admin/AdminUserTable';
import { AdminBillingView } from './admin/AdminBillingView';
import { AdminAuditLogs, AuditLogEntry } from './admin/AdminAuditLogs';
import { AdminKpiSkeleton, AdminTableSkeleton } from './admin/AdminSkeletonLoaders';

interface AdminDashboardProps {
  state: AppState;
  lang?: Language;
  onRefresh: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  state,
  lang = 'en',
  onRefresh,
  onLogout,
}) => {
  const currentLang: Language = lang === 'ar' ? 'ar' : 'en';
  const isRtl = currentLang === 'ar';
  const t = (key: string, params?: Record<string, any>) => getTranslation(currentLang, key, params);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Skeleton loading simulation
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notifications Popover
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);

  // Toast System
  const [toastMsg, setToastMsg] = useState<{ id: string; text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = String(Date.now());
    setToastMsg({ id, text, type });
    setTimeout(() => {
      setToastMsg((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  // Create Store Modal State
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreNameAr, setNewStoreNameAr] = useState('');
  const [newStoreArea, setNewStoreArea] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreWhatsapp, setNewStoreWhatsapp] = useState('');
  const [newStoreMerchantName, setNewStoreMerchantName] = useState('');
  const [newStoreMerchantEmail, setNewStoreMerchantEmail] = useState('');
  const [newStorePin, setNewStorePin] = useState('1234');
  const [newStoreRiderPin, setNewStoreRiderPin] = useState('5678');
  const [newStoreSubFee, setNewStoreSubFee] = useState('299');
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);

  // Settings State
  const [deliveryFeeCap, setDeliveryFeeCap] = useState(3.5);
  const [commissionRate, setCommissionRate] = useState(0); // 0%
  const [systemAnnouncement, setSystemAnnouncement] = useState('Welcome to ElShop Network v2.4 — 0% Commission Active');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
      actor: 'Admin HQ (admin@elshop.ae)',
      action: '2FA Policy Audit',
      target: 'Al Medina Supermarket (store-1)',
      severity: 'info',
      details: 'Automated 2FA verification verified for all POS sessions.',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toLocaleTimeString(),
      actor: 'System Reconciler',
      action: 'Khata Batch Settled',
      target: 'Tariq Al-Mansoor (cust-1)',
      severity: 'success',
      details: 'Settled 120.00 AED via Card to store-1 merchant balance.',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString(),
      actor: 'Stripe Webhook',
      action: 'Monthly Subscription Renewed',
      target: 'Marina Express Mart (store-3)',
      severity: 'success',
      details: '299.00 AED auto-debited via saved corporate Visa.',
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 1000 * 60 * 95).toLocaleTimeString(),
      actor: 'Admin HQ',
      action: 'Security PIN Synchronized',
      target: 'City Corner Grocery (store-2)',
      severity: 'warning',
      details: 'Merchant POS PIN updated upon manager request.',
    },
  ]);

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      ...entry,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Metrics
  const totalStores = state.stores.length;
  const activeStores = state.stores.filter((s) => !s.servicePaused && s.paymentStatus !== 'overdue').length;
  const overdueStores = state.stores.filter((s) => s.paymentStatus === 'overdue' && !s.servicePaused).length;
  const suspendedStores = state.stores.filter((s) => s.servicePaused).length;

  const totalGMV = useMemo(() => {
    return state.orders.reduce((sum, o) => sum + o.total, 0);
  }, [state.orders]);

  const totalMRR = useMemo(() => {
    return state.stores.reduce((sum, s) => sum + (s.subscriptionFee || 299), 0);
  }, [state.stores]);

  const totalKhataExposure = useMemo(() => {
    return state.khataTransactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.khataTransactions]);

  // Notifications list
  const notificationsList = useMemo(() => {
    const list: { id: string; title: string; desc: string; type: 'warning' | 'alert' | 'info'; time: string }[] = [];
    if (overdueStores > 0) {
      list.push({
        id: 'notif-overdue',
        title: `${overdueStores} Stores Overdue`,
        desc: 'Stores have overdue monthly SaaS subscriptions. WhatsApp dunning queued.',
        type: 'warning',
        time: 'Just now',
      });
    }
    if (suspendedStores > 0) {
      list.push({
        id: 'notif-suspended',
        title: `${suspendedStores} Stores Suspended`,
        desc: 'Service paused due to 10+ days overdue policy or manual hold.',
        type: 'alert',
        time: '1h ago',
      });
    }
    list.push({
      id: 'notif-db',
      title: 'Cloud SQL Connected',
      desc: 'All ACID multi-tenant transactions healthy with 0ms replication lag.',
      type: 'info',
      time: 'Realtime',
    });
    return list.filter((n) => !dismissedNotifs.includes(n.id));
  }, [overdueStores, suspendedStores, dismissedNotifs]);

  // Manual Triggered Refresh with Simulated Skeleton
  const handleTriggerRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Dashboard metrics & live states synchronized', 'info');
    }, 500);
  };

  // Create Store Submit
  const handleCreateStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStore(true);
    try {
      const created = await createStore({
        name: newStoreName,
        nameAr: newStoreNameAr || newStoreName,
        area: newStoreArea,
        phone: newStorePhone,
        whatsappNumber: newStoreWhatsapp || newStorePhone,
        merchantName: newStoreMerchantName,
        merchantEmail: newStoreMerchantEmail,
        pin: newStorePin,
        riderPin: newStoreRiderPin,
        subscriptionFee: parseFloat(newStoreSubFee) || 299,
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      });

      addAuditLog({
        actor: 'Admin HQ',
        action: 'Store Onboarded',
        target: `${created.name} (${created.id})`,
        severity: 'success',
        details: `Created new baqala node in ${created.area} with trial subscription.`,
      });

      showToast(`Store "${created.name}" created successfully!`);
      setShowCreateStoreModal(false);
      // Reset form
      setNewStoreName('');
      setNewStoreNameAr('');
      setNewStoreArea('');
      setNewStorePhone('');
      setNewStoreWhatsapp('');
      setNewStoreMerchantName('');
      setNewStoreMerchantEmail('');
      onRefresh();
    } catch (err) {
      showToast('Failed to create store', 'warning');
    } finally {
      setIsSubmittingStore(false);
    }
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white"
    >
      {/* =========================================================================
          TOP ENTERPRISE CONTROL BAR
         ========================================================================= */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Mobile Hamburger & Current Route Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Multi-Tenant HQ</span>
              </span>
              <span className="text-slate-400 text-xs font-medium hidden md:inline">
                / {activeTab.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Right Utilities (Refresh, Notifications, Profile) */}
          <div className="flex items-center gap-2.5">
            {/* Live Refresh Button */}
            <button
              onClick={handleTriggerRefresh}
              disabled={isRefreshing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all text-xs font-bold flex items-center gap-1.5"
              title="Synchronize Live Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Sync DB</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 relative transition-all"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationsList.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                    {notificationsList.length}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 animate-scale-up">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-black text-white">System Alerts</span>
                    <span className="text-[10px] text-slate-400">{notificationsList.length} Active</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notificationsList.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">All systems operational</div>
                    ) : (
                      notificationsList.map((n) => (
                        <div key={n.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1">
                              {n.type === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                              {n.type === 'alert' && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                              {n.type === 'info' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                              {n.title}
                            </span>
                            <button
                              onClick={() => setDismissedNotifs([...dismissedNotifs, n.id])}
                              className="text-slate-500 hover:text-white"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{n.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-bold text-slate-200 hidden sm:inline">admin@elshop.ae</span>
            </div>
          </div>

        </div>
      </header>

      {/* =========================================================================
          MAIN APPLICATION BODY (Sidebar + Dynamic View Container)
         ========================================================================= */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Persistent Desktop / Drawer Mobile Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLogout={onLogout}
          lang={currentLang}
          overdueCount={overdueStores}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchChange={setGlobalSearchQuery}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl w-full space-y-6">
          
          {/* SKELETON LOADER STATE (During Sync) */}
          {isRefreshing ? (
            <div className="space-y-6">
              <AdminKpiSkeleton />
              <AdminTableSkeleton rows={5} />
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in" id="admin-overview-view">
                  
                  {/* Top Welcome & KPI Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {isRtl ? 'نظرة عامة على شبكة إل شوب' : 'Network Telemetry & Operations'}
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        {isRtl
                          ? 'مراقبة فورية لأداء شبكة البقالات، الطلبات النشطة، وحسابات الذمة في الأبراج'
                          : 'Live telemetry across connected baqala nodes, elevator couriers, and digital Khata accounts.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowCreateStoreModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{isRtl ? 'إضافة متجر جديد' : 'Onboard New Store'}</span>
                    </button>
                  </div>

                  {/* 4 Core KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Active Stores */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                        <span>Connected Stores</span>
                        <Building2 className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {activeStores} <span className="text-xs text-slate-400 font-normal">/ {totalStores}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{suspendedStores} suspended • {overdueStores} overdue</span>
                      </div>
                    </div>

                    {/* Contracted MRR */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                        <span>Contracted MRR</span>
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {totalMRR.toLocaleString()} <span className="text-xs text-emerald-400 font-bold">AED</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Zero commission SaaS
                      </div>
                    </div>

                    {/* Network GMV */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                        <span>Network GMV</span>
                        <DollarSign className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {totalGMV.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-xs text-amber-400 font-bold">AED</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {state.orders.length} total orders processed
                      </div>
                    </div>

                    {/* Khata Outstanding Tab */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                        <span>Khata Active Tab</span>
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {totalKhataExposure.toFixed(0)} <span className="text-xs text-purple-400 font-bold">AED</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Across tower residents
                      </div>
                    </div>
                  </div>

                  {/* Live Order Dispatch Stream & Quick Alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Live Order Feed */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            Live Order Activity
                          </h3>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">Real-Time Polling (1.5s)</span>
                      </div>

                      <div className="space-y-2.5 max-h-96 overflow-y-auto">
                        {state.orders.slice(0, 6).map((order) => {
                          const parentStore = state.stores.find((s) => s.id === order.storeId);
                          return (
                            <div
                              key={order.id}
                              className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white shrink-0">
                                  #{order.id.slice(-3)}
                                </div>
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{order.customerName}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-400">{order.customerUnit}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    Store: {parentStore?.name || order.storeId} • {order.items.length} items
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-black text-white">{order.total.toFixed(2)} AED</div>
                                <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                  order.status === 'delivered'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : order.status === 'out_for_delivery'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-indigo-500/20 text-indigo-300'
                                }`}>
                                  {order.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Store Operations Shortcuts */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          <span>Platform Health</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Database Layer</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Cloud SQL Active</span>
                            </span>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Elevator Couriers</span>
                            <span className="text-indigo-300 font-bold">
                              {state.riders.filter((r) => r.isOnline).length} Active Online
                            </span>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Stripe Dunning Sync</span>
                            <span className="text-emerald-400 font-bold">Connected</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800">
                        <button
                          onClick={() => setActiveTab('stores')}
                          className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>Manage Store Fleet ({totalStores})</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: STORE MANAGEMENT */}
              {activeTab === 'stores' && (
                <AdminStoreTable
                  stores={state.stores}
                  lang={currentLang}
                  onRefresh={onRefresh}
                  onShowToast={showToast}
                  onOpenCreateStore={() => setShowCreateStoreModal(true)}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {/* TAB 3: USER MANAGEMENT & 2FA */}
              {activeTab === 'users' && (
                <AdminUserTable
                  state={state}
                  lang={currentLang}
                  onShowToast={showToast}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {/* TAB 4: BILLING & DUNNING */}
              {activeTab === 'billing' && (
                <AdminBillingView
                  state={state}
                  lang={currentLang}
                  onRefresh={onRefresh}
                  onShowToast={showToast}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {/* TAB 5: SECURITY AUDIT TRAIL */}
              {activeTab === 'audit' && (
                <AdminAuditLogs
                  logs={auditLogs}
                  lang={currentLang}
                  onShowToast={showToast}
                />
              )}

              {/* TAB 6: GLOBAL SYSTEM SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in" id="admin-settings-view">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                        <SettingsIcon className="w-6 h-6 text-indigo-400" />
                        <span>{isRtl ? 'إعدادات النظام العامة والرسوم' : 'Global Platform Controls & SLA'}</span>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Configure network delivery caps, announcements, and maintenance overrides.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300">Default Delivery Fee Cap (AED)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={deliveryFeeCap}
                          onChange={(e) => setDeliveryFeeCap(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-[11px] text-slate-500">Maximum courier fee charged to residential tower customers.</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300">Platform Order Commission (%)</label>
                        <input
                          type="number"
                          disabled
                          value={commissionRate}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold text-xs cursor-not-allowed"
                        />
                        <span className="text-[11px] text-emerald-400 font-semibold">Locked at 0% (Pure SaaS Operating Model).</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-800">
                      <label className="text-xs font-bold text-slate-300">Network Announcement Banner</label>
                      <input
                        type="text"
                        value={systemAnnouncement}
                        onChange={(e) => setSystemAnnouncement(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          addAuditLog({
                            actor: 'Admin HQ',
                            action: 'Global Settings Updated',
                            target: 'Platform Configuration',
                            severity: 'info',
                            details: `Delivery cap: ${deliveryFeeCap} AED, Announcement synced.`,
                          });
                          showToast('Global settings updated and broadcast to all nodes');
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-950 transition-all active:scale-95"
                      >
                        Save & Apply Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* =========================================================================
          GLOBAL TOAST NOTIFICATIONS
         ========================================================================= */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 ${
              toastMsg.type === 'warning'
                ? 'bg-amber-950 text-amber-200 border-amber-800'
                : toastMsg.type === 'info'
                ? 'bg-slate-900 text-slate-100 border-slate-700'
                : 'bg-emerald-950 text-emerald-200 border-emerald-800'
            }`}
          >
            {toastMsg.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : toastMsg.type === 'info' ? (
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: ONBOARD NEW STORE
         ========================================================================= */}
      {showCreateStoreModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white">Onboard New Store to Network</h3>
              </div>
              <button
                onClick={() => setShowCreateStoreModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStoreSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Store Name (English)</label>
                  <input
                    type="text"
                    required
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="Al Marina Mart"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Store Name (Arabic)</label>
                  <input
                    type="text"
                    value={newStoreNameAr}
                    onChange={(e) => setNewStoreNameAr(e.target.value)}
                    placeholder="سوبرماركت المارينا"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Tower / Neighborhood Area</label>
                  <input
                    type="text"
                    required
                    value={newStoreArea}
                    onChange={(e) => setNewStoreArea(e.target.value)}
                    placeholder="Marina Pinnacle Tower"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Monthly Fee (AED)</label>
                  <input
                    type="number"
                    required
                    value={newStoreSubFee}
                    onChange={(e) => setNewStoreSubFee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Merchant Manager Name</label>
                  <input
                    type="text"
                    value={newStoreMerchantName}
                    onChange={(e) => setNewStoreMerchantName(e.target.value)}
                    placeholder="Rashid Khan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">WhatsApp Billing Number</label>
                  <input
                    type="tel"
                    value={newStoreWhatsapp}
                    onChange={(e) => setNewStoreWhatsapp(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Merchant POS PIN (4 Digits)</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={newStorePin}
                    onChange={(e) => setNewStorePin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Courier Runner PIN (4 Digits)</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={newStoreRiderPin}
                    onChange={(e) => setNewStoreRiderPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateStoreModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStore}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-950 flex items-center gap-2"
                >
                  {isSubmittingStore && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Provision & Launch Node</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
