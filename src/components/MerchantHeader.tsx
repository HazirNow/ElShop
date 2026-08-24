import React from 'react';
import { 
  Layers, 
  Boxes, 
  Users, 
  DollarSign, 
  Palette, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Plus, 
  QrCode, 
  Bell, 
  BellOff, 
  Sparkles, 
  Lock, 
  TrendingUp, 
  ShieldCheck, 
  KeyRound,
  Store as StoreIcon
} from 'lucide-react';
import { Store, Language } from '../types';
import { useTierAccess } from '../lib/useTierAccess';

export type MerchantTab = 'board' | 'inventory' | 'customers' | 'settlement' | 'pnl' | 'staff' | 'branding';

interface MerchantHeaderProps {
  store: Store;
  lang: Language;
  activeTab: MerchantTab;
  onTabChange: (tab: MerchantTab) => void;
  storeOrdersCount: number;
  storeProductsCount: number;
  lowStockCount: number;
  showLowStockAlerts: boolean;
  onQuickLowStockClick: () => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onOpenOfflineModal: () => void;
  onOpenQuickOrderModal: () => void;
  onOpenElevatorPosterModal: () => void;
  onOpenUpgradeModal: (featureTitle?: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MerchantHeader: React.FC<MerchantHeaderProps> = ({
  store,
  lang,
  activeTab,
  onTabChange,
  storeOrdersCount,
  storeProductsCount,
  lowStockCount,
  showLowStockAlerts,
  onQuickLowStockClick,
  isOnline,
  pendingSyncCount,
  onOpenOfflineModal,
  onOpenQuickOrderModal,
  onOpenElevatorPosterModal,
  onOpenUpgradeModal,
  soundEnabled,
  onToggleSound,
}) => {
  const isRtl = lang === 'ar';
  const tierAccess = useTierAccess(store);

  const handleTabClick = (tab: MerchantTab, featureName?: string, requiredTier?: number) => {
    if (tab === 'pnl' && !tierAccess.canViewPnL) {
      onOpenUpgradeModal(isRtl ? 'تحليل الأرباح P&L والمقارنة بين الفروع' : 'Consolidated P&L & Franchise Insights');
      return;
    }
    if (tab === 'staff' && !tierAccess.canManageStaffRoles) {
      onOpenUpgradeModal(isRtl ? 'إدارة الموظفين ورموز PIN المتقدمة' : 'Staff Role PINs & Cashier Management');
      return;
    }
    onTabChange(tab);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col gap-4 shadow-md mb-4" id="merchant-pos-header">
      {/* Top Row: Store Identity & Tier Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B6E4F] flex items-center justify-center text-white font-extrabold text-2xl shadow-md shrink-0 border border-emerald-500/30">
            🏪
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-base font-black text-white">
                {isRtl ? store.nameAr || store.name : store.name}
              </h2>
              
              {/* POS Mode Badge */}
              <span className="text-[10px] bg-[#0B6E4F] text-white font-bold px-2 py-0.5 rounded shadow-sm">
                MERCHANT POS
              </span>

              {/* Service Suspended Tag */}
              {store.servicePaused && (
                <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded shadow-sm animate-pulse">
                  {isRtl ? 'الخدمة متوقفة' : 'PAUSED'}
                </span>
              )}

              {/* Tier Access Badge & Upgrade Pill */}
              <button
                type="button"
                onClick={() => onOpenUpgradeModal()}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
                  tierAccess.tier === 3
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                    : tierAccess.tier === 2
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                }`}
                title="Click to view subscription plan details and upgrade"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Tier {tierAccess.tier}: {isRtl ? tierAccess.tierNameAr : tierAccess.tierName}</span>
                <span className="text-slate-400 font-normal">({tierAccess.tierFee} AED)</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 flex items-center flex-wrap gap-2 mt-1">
              <span>📍 {store.area}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono font-semibold">WA: {store.whatsappNumber || store.phone}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">
                {isRtl ? `الطلبات الشهرية: ${store.monthlyOrders}` : `Monthly Orders: ${store.monthlyOrders}`}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls: Quick Order, Offline, Elevator QR, Audio */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Counter / Phone Order Button */}
          <button
            onClick={onOpenQuickOrderModal}
            className="px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/60 active:scale-95 cursor-pointer"
            title="Create Instant Walk-in or Phone Order (Offline Supported)"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>{isRtl ? '+ طلب كاونتر فوري' : '+ Quick Order'}</span>
          </button>

          {/* Offline Sync Status Button */}
          <button
            onClick={onOpenOfflineModal}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer ${
              !isOnline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : pendingSyncCount > 0
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="IndexedDB Offline Sync Engine Status"
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{isRtl ? `دون اتصال (${pendingSyncCount})` : `Offline (${pendingSyncCount})`}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {pendingSyncCount > 0 
                    ? (isRtl ? `مزامنة (${pendingSyncCount})` : `Syncing (${pendingSyncCount})`) 
                    : (isRtl ? 'متصل' : 'Online')}
                </span>
              </>
            )}
          </button>

          {/* Elevator & Lobby QR Flyer Generator */}
          <button
            onClick={onOpenElevatorPosterModal}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md active:scale-95 cursor-pointer border border-emerald-600/50"
            title="Generate Printable Elevator & Lobby QR Flyer"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span>{isRtl ? 'ملصق المصعد QR' : 'Elevator QR'}</span>
          </button>

          {/* Quick Low Stock Alert Shortcut Pill */}
          {lowStockCount > 0 && (
            <button
              onClick={onQuickLowStockClick}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                showLowStockAlerts
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="View Low-Stock Items Needing Replenishment"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{lowStockCount} {isRtl ? 'نقص مخزون' : 'Low Stock'}</span>
            </button>
          )}

          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Order Sound Alert: Enabled' : 'Order Sound Alert: Muted'}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center border cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? (
              <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Row: Navigation Tabs with Feature Gating */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 overflow-x-auto">
        {/* 1. Order Board */}
        <button
          onClick={() => handleTabClick('board')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'board'
              ? 'bg-[#0B6E4F] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isRtl ? 'لوحة الطلبات' : 'Order Board'} ({storeOrdersCount})</span>
        </button>

        {/* 2. Inventory */}
        <button
          onClick={() => handleTabClick('inventory')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative cursor-pointer whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-[#0B6E4F] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>{isRtl ? 'المخزون والمنتجات' : 'Inventory'} ({storeProductsCount})</span>
          {lowStockCount > 0 && showLowStockAlerts && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-sm">
              {lowStockCount}
            </span>
          )}
        </button>

        {/* 3. Customers & Khata */}
        <button
          onClick={() => handleTabClick('customers')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-[#0B6E4F] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>{isRtl ? 'العملاء ودفتر الخاطة' : 'Customers & Khata'}</span>
        </button>

        {/* 4. Cash Settlement */}
        <button
          onClick={() => handleTabClick('settlement')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'settlement'
              ? 'bg-[#0B6E4F] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isRtl ? 'تسوية نقد المناديب' : 'Rider Cash Settlement'}</span>
        </button>

        {/* 5. Consolidated P&L (Tier 3 Feature) */}
        <button
          onClick={() => handleTabClick('pnl', 'Consolidated P&L', 3)}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap relative ${
            activeTab === 'pnl'
              ? 'bg-purple-600 text-white shadow-md'
              : tierAccess.canViewPnL
              ? 'text-slate-400 hover:text-purple-300 hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          <span>{isRtl ? 'الأرباح P&L والفروع' : 'Consolidated P&L'}</span>
          {!tierAccess.canViewPnL && (
            <span className="flex items-center gap-0.5 text-[9px] bg-purple-950/80 text-purple-300 px-1.5 py-0.2 rounded border border-purple-800">
              <Lock className="w-2.5 h-2.5" /> Tier 3
            </span>
          )}
        </button>

        {/* 6. Staff Roles & PINs (Tier 2+ Feature) */}
        <button
          onClick={() => handleTabClick('staff', 'Staff Management', 2)}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap relative ${
            activeTab === 'staff'
              ? 'bg-amber-600 text-white shadow-md'
              : tierAccess.canManageStaffRoles
              ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>{isRtl ? 'إدارة الموظفين والرموز' : 'Staff & Roles'}</span>
          {!tierAccess.canManageStaffRoles && (
            <span className="flex items-center gap-0.5 text-[9px] bg-amber-950/80 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800">
              <Lock className="w-2.5 h-2.5" /> Tier 2
            </span>
          )}
        </button>

        {/* 7. Store Profile & Branding */}
        <button
          onClick={() => handleTabClick('branding')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-[#0B6E4F] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isRtl ? 'ملف المتجر والأمان' : 'Store Profile'}</span>
        </button>
      </div>
    </div>
  );
};
