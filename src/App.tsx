import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShoppingBag, 
  Store as StoreIcon, 
  Bike, 
  BarChart3, 
  Globe, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  KeyRound,
  Layers,
  MapPin,
  Clock,
  Shield,
  HelpCircle,
  Phone,
  Star,
  FileText,
  AlertCircle,
  Scale,
  Home,
  LayoutDashboard
} from 'lucide-react';
import { AppState, Role, Language, Store } from './types';
import { fetchState, resetDatabase, getCachedState } from './api';
import { syncStateToIndexedDb } from './lib/offlineDb';
import { CustomerView } from './components/CustomerView';
import { RiderView } from './components/RiderView';
import { LandingPage } from './components/LandingPage';
import { StaffAuthModal } from './components/StaffAuthModal';
import { UnifiedLoginModal } from './components/UnifiedLoginModal';
import { LegalModal } from './components/LegalModal';
import { MerchantLandingModal } from './components/MerchantLandingModal';
import { ProductImage } from './components/ProductImage';
import { ElShopLogo } from './components/ElShopLogo';
import { PilotTrainingOverlay } from './components/PilotTrainingOverlay';
import { getTranslation } from './translations';

// Dynamic lazy imports for heavy sub-dashboards
const MerchantView = React.lazy(() =>
  import('./components/MerchantView').then((m) => ({ default: m.MerchantView }))
);
const AdminDashboard = React.lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

export default function App() {
  const [appState, setAppState] = useState<AppState>(getCachedState);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [activeRole, setActiveRole] = useState<Role>('customer');
  const [activeStoreId, setActiveStoreId] = useState<string>('store-1');
  const [activeCustomerId, setActiveCustomerId] = useState<string>('cust-1');
  const [lang, setLang] = useState<Language>('en');
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showStaffAuth, setShowStaffAuth] = useState(false);
  const [showMerchantLanding, setShowMerchantLanding] = useState(false);

  // Legal Modal State
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy' | 'disclaimers'>('terms');

  const t = (key: string, params?: Record<string, any>) => getTranslation(lang, key, params);
  const isRtl = lang === 'ar';

  const loadState = useCallback(async () => {
    try {
      const data = await fetchState();
      if (data) {
        setAppState(data);
        syncStateToIndexedDb(data);
      }
    } catch (err) {
      // Handled gracefully in api.ts
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Restore staff session on mount if valid
  useEffect(() => {
    try {
      const sessionStr = sessionStorage.getItem('elshop_staff_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.role && (session.role === 'merchant' || session.role === 'rider' || session.role === 'admin')) {
          setActiveRole(session.role);
          if (session.storeId) {
            setActiveStoreId(session.storeId);
          }
          setViewMode('app');
        }
      }
    } catch (e) {
      // Ignore sessionStorage access errors
    }
  }, []);

  // Poll state every 1.5s for real-time reactivity across all roles
  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 1500);
    return () => clearInterval(interval);
  }, [loadState]);

  const handleResetData = async () => {
    if (!window.confirm(t('resetConfirm'))) return;
    setIsResetting(true);
    try {
      const resetState = await resetDatabase();
      setAppState(resetState);
      showToast('Database reset to initial seed state');
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleStaffAuthenticated = (role: Role, storeId?: string) => {
    setActiveRole(role);
    if (storeId) setActiveStoreId(storeId);
    setViewMode('app');
    showToast(`Authenticated as ${role.toUpperCase()}`);
  };

  const handleStoreCreated = (newStore: Store) => {
    setActiveStoreId(newStore.id);
    setActiveRole('merchant');
    setViewMode('app');
    try {
      sessionStorage.setItem(
        'elshop_staff_session',
        JSON.stringify({ role: 'merchant', timestamp: Date.now(), storeId: newStore.id })
      );
    } catch (e) {}
    loadState();
    showToast(`Store "${newStore.name}" created and loaded into POS terminal!`);
  };

  const handleEnterAppFromLanding = (role: Role, storeId?: string) => {
    setActiveRole(role);
    if (storeId) setActiveStoreId(storeId);
    setViewMode('app');
    showToast(`Opened ${role.toUpperCase()} View`);
  };

  const handleLockAndExitStaff = () => {
    try {
      sessionStorage.removeItem('elshop_staff_session');
    } catch (e) {}
    setActiveRole('customer');
    setViewMode('landing');
    showToast('Signed out. Returned to Home.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openLegalModal = (tab: 'terms' | 'privacy' | 'disclaimers') => {
    setLegalTab(tab);
    setShowLegalModal(true);
  };

  if (!appState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-indigo-400">Loading ElShop Enterprise Platform...</span>
        </div>
      </div>
    );
  }

  // If in Landing Page view mode, render the world-class LandingPage
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          state={appState}
          onEnterApp={handleEnterAppFromLanding}
          onOpenMerchantOnboarding={() => setShowMerchantLanding(true)}
          onOpenLegal={openLegalModal}
          lang={lang}
          onToggleLang={() => setLang(lang === 'en' ? 'ar' : 'en')}
        />

        {/* Self-Serve Merchant Landing, ROI Calculator & Onboarding Modal */}
        <MerchantLandingModal
          isOpen={showMerchantLanding}
          onClose={() => setShowMerchantLanding(false)}
          onStoreCreated={handleStoreCreated}
          lang={lang}
        />

        {/* Terms, Privacy & Disclaimers Modal */}
        <LegalModal
          isOpen={showLegalModal}
          onClose={() => setShowLegalModal(false)}
          initialTab={legalTab}
          lang={lang}
        />
      </>
    );
  }

  const currentStore = appState.stores.find((s) => s.id === activeStoreId) || appState.stores[0];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-600 selection:text-white"
    >
      {/* =========================================================================
          STAKEHOLDER OPERATION TOOLBAR (In App Mode)
         ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-indigo-900/60 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg z-50">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Back to Public Landing Page Button */}
          <button
            onClick={() => setViewMode('landing')}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Return to Public Landing Page and ROI Calculator"
          >
            <Home className="w-3.5 h-3.5 text-indigo-400" />
            <span>Landing Page</span>
          </button>

          {/* 4 Primary Stakeholder View Buttons */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveRole('customer');
                showToast('Switched to Customer Storefront');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeRole === 'customer'
                  ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => {
                setActiveRole('merchant');
                showToast('Switched to Merchant / Baqala POS');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeRole === 'merchant'
                  ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <StoreIcon className="w-3.5 h-3.5" />
              <span>Merchant POS</span>
            </button>

            <button
              onClick={() => {
                setActiveRole('rider');
                showToast('Switched to Runner Courier View');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeRole === 'rider'
                  ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Runner</span>
            </button>

            <button
              onClick={() => {
                setActiveRole('admin');
                showToast('Switched to Franchise Admin HQ');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeRole === 'admin'
                  ? 'bg-purple-700 text-white shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Admin HQ</span>
            </button>
          </div>
        </div>

        {/* Right Toolbar Options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Customer Persona Simulator (active when in customer view) */}
          {activeRole === 'customer' && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px]">
              <span className="text-slate-400 font-medium hidden md:inline">Simulate Resident:</span>
              <select
                value={activeCustomerId}
                onChange={(e) => {
                  setActiveCustomerId(e.target.value);
                  const cust = appState.customers.find((c) => c.id === e.target.value);
                  showToast(`Simulating Resident: ${cust?.name || 'Customer'}`);
                }}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
                title="Select customer persona"
              >
                {appState.customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.unit} • {c.isKhataPreApproved ? 'Khata Approved' : 'COD/Card'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Store Selector */}
          {activeRole !== 'admin' && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px]">
              <span className="text-slate-400 font-medium hidden md:inline">Store:</span>
              <select
                value={activeStoreId}
                onChange={(e) => {
                  setActiveStoreId(e.target.value);
                  const store = appState.stores.find((s) => s.id === e.target.value);
                  showToast(`Switched Store: ${store?.name}`);
                }}
                className="bg-transparent text-indigo-300 font-bold focus:outline-none cursor-pointer"
              >
                {appState.stores.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name} ({s.area})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exit / Sign Out Staff */}
          <button
            onClick={handleLockAndExitStaff}
            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
            title="Log Out & Return to Landing"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit View</span>
          </button>
        </div>
      </div>

      {/* Dynamic Role Training Script Overlay */}
      <PilotTrainingOverlay currentRole={activeRole} />

      {/* --- TOP STORE BRANDING HEADER (Customer / Merchant / Rider) --- */}
      {activeRole !== 'admin' && (
        <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 md:px-6 py-3 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            
            {/* Brand Logo & Store Name */}
            <div className="flex items-center gap-3">
              <ProductImage
                src={currentStore.image}
                alt={currentStore.name}
                fallbackType="store"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-slate-700 shadow-md bg-slate-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-white font-black text-base sm:text-lg tracking-tight leading-none">
                    {isRtl ? currentStore.nameAr : currentStore.name}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                    <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    <span>{currentStore.rating}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px] font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>{currentStore.area}</span>
                  </span>
                  <span className="hidden md:inline text-slate-600">•</span>
                  <span className="hidden md:inline text-emerald-400">
                    {isRtl ? 'توصيل خلال 15-20 دقيقة' : '15-20 Min Doorstep Delivery'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Header Utilities & Brand Logo on Right Corner */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language LTR / RTL toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'en' ? 'العربية' : 'English'}</span>
              </button>

              {/* Reset Database Button */}
              <button
                onClick={handleResetData}
                disabled={isResetting}
                className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-700 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title={t('resetData')}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{t('resetData')}</span>
              </button>

              {/* ElShop Brand Logo placed proudly on the Right Corner */}
              <div className="pl-1 sm:pl-2.5 border-l border-slate-800 hidden sm:flex items-center shrink-0">
                <ElShopLogo size="sm" variant="white" showCountry />
              </div>
            </div>

          </div>
        </header>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-indigo-600 text-white text-xs font-bold py-2 px-4 text-center shadow-md animate-fade-in flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- MAIN ROLE VIEW BODY --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6">
        <React.Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">{isRtl ? 'جاري تحميل لوحة التحكم...' : 'Loading dashboard module...'}</p>
            </div>
          }
        >
          {activeRole === 'customer' && (
            <CustomerView
              state={appState}
              activeStoreId={activeStoreId}
              activeCustomerId={activeCustomerId}
              lang={lang}
              isLoading={isInitialLoading || !appState.stores.length}
              onRefresh={loadState}
              onToggleLang={() => setLang(lang === 'en' ? 'ar' : 'en')}
              onOpenLegal={openLegalModal}
            />
          )}

          {activeRole === 'merchant' && (
            <MerchantView
              state={appState}
              activeStoreId={activeStoreId}
              lang={lang}
              isLoading={isInitialLoading || !appState.stores.length}
              onRefresh={loadState}
            />
          )}

          {activeRole === 'rider' && (
            <RiderView
              state={appState}
              activeStoreId={activeStoreId}
              lang={lang}
              onRefresh={loadState}
            />
          )}

          {activeRole === 'admin' && (
            <AdminDashboard
              state={appState}
              lang={lang}
              onRefresh={loadState}
              onLogout={handleLockAndExitStaff}
            />
          )}
        </React.Suspense>
      </main>

      {/* Terms, Privacy & Disclaimers Modal */}
      <LegalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalTab}
        lang={lang}
      />

      {/* Self-Serve Merchant Landing, ROI Calculator & Onboarding Modal */}
      <MerchantLandingModal
        isOpen={showMerchantLanding}
        onClose={() => setShowMerchantLanding(false)}
        onStoreCreated={handleStoreCreated}
        lang={lang}
      />

    </div>
  );
}
