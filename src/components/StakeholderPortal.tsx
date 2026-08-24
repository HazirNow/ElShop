import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store as StoreIcon, 
  Bike, 
  ShoppingBag, 
  BarChart3, 
  Lock, 
  ShieldCheck, 
  X, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Sparkles,
  ExternalLink,
  PlusCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Role, Language, Store, Product } from '../types';
import { verifyStaffAuth } from '../api';
import { ProductImage } from './ProductImage';

interface StakeholderPortalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'merchant' | 'rider' | 'customer' | 'admin';
  stores: Store[];
  products?: Product[];
  activeStoreId: string;
  onSelectRoleAndStore: (role: Role, storeId: string, customerId?: string) => void;
  onOpenMerchantOnboarding?: () => void;
  lang?: Language;
}

export const StakeholderPortal: React.FC<StakeholderPortalProps> = ({
  isOpen,
  onClose,
  initialRole = 'merchant',
  stores,
  products = [],
  activeStoreId,
  onSelectRoleAndStore,
  onOpenMerchantOnboarding,
  lang = 'en',
}) => {
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'merchant' | 'rider' | 'customer' | 'admin'>(initialRole);
  
  // Login form states
  const [selectedStoreId, setSelectedStoreId] = useState<string>(activeStoreId || (stores[0]?.id ?? 'store-1'));
  const [phone, setPhone] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Customer search state
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [previewStoreId, setPreviewStoreId] = useState<string | null>(null);

  const targetStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const filteredStores = useMemo(() => {
    if (!customerSearchQuery.trim()) return stores;
    const q = customerSearchQuery.toLowerCase();
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.nameAr && s.nameAr.toLowerCase().includes(q)) ||
        s.area.toLowerCase().includes(q)
    );
  }, [stores, customerSearchQuery]);

  const previewStore = stores.find((s) => s.id === (previewStoreId || selectedStoreId)) || stores[0];
  const previewProducts = useMemo(() => {
    return products.filter((p) => p.storeId === previewStore.id).slice(0, 6);
  }, [products, previewStore]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال رمز المرور السري (PIN)' : 'Please enter security access PIN');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'customer') {
        onSelectRoleAndStore('customer', selectedStoreId);
        onClose();
        return;
      }

      const res = await verifyStaffAuth({
        role: activeTab as 'merchant' | 'rider' | 'admin',
        storeId: activeTab !== 'admin' ? selectedStoreId : undefined,
        passcode: pin.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSelectRoleAndStore(activeTab as Role, res.storeId || selectedStoreId);
          onClose();
          setIsSuccess(false);
          setPin('');
        }, 500);
      } else {
        setErrorMsg(res.message || (isRtl ? 'رمز المرور غير صحيح' : 'Invalid PIN entered.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication service error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoPin = (demoPin: string) => {
    setPin(demoPin);
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                {isRtl ? 'بوابة تسجيل الدخول والمنافذ' : 'ElShop Stakeholder Portal'}
              </h3>
              <p className="text-xs text-slate-400">
                {isRtl ? 'اختر دورك للوصول إلى لوحة التحكم' : 'Role-based multi-tenant access control'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 p-2 bg-slate-950 border-b border-slate-800/80 gap-1 text-xs">
          
          <button
            onClick={() => {
              setActiveTab('merchant');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'merchant'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <StoreIcon className="w-4 h-4" />
            <span>{isRtl ? 'التاجر (POS)' : 'Merchant POS'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('rider');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rider'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>{isRtl ? 'المندوب' : 'Courier / Rider'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('customer');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'customer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isRtl ? 'تصفح المتجر' : 'Visit a Store'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'admin'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{isRtl ? 'الإدارة العامة' : 'Franchise HQ'}</span>
          </button>

        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* MERCHANT LOGIN TAB */}
          {activeTab === 'merchant' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300 block uppercase tracking-wider">
                    {isRtl ? 'لوحة تحكم المتجر (POS)' : 'Merchant POS & Khata Station'}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRtl ? 'إدارة الطلبات، كشوفات الحساب، وتعديل الأسعار' : 'Manage orders, real-time inventory, and customer tabs'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoPin('1234')}
                  className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-[11px] font-bold"
                  title="Auto-fill Demo PIN"
                >
                  Quick Demo (1234)
                </button>
              </div>

              {/* Store Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {isRtl ? 'اختر المتجر أو الفرع:' : 'Select Store Branch:'}
                </label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:border-indigo-500 focus:outline-none"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.area}) • PIN: {s.pin || '1234'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Security PIN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {isRtl ? 'رمز الـ PIN السري للمتجر:' : 'Store Merchant PIN:'}
                  </label>
                  <span className="text-[11px] text-slate-500">Default: 1234</span>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Enter 4-digit PIN"
                    maxLength={10}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono tracking-widest focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{isRtl ? 'تم التحقق بنجاح! جاري فتح النظام...' : 'Authenticated! Launching Merchant POS...'}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRtl ? 'تسجيل الدخول إلى نقطة البيع' : 'Access Merchant Terminal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Onboarding trigger */}
              {onOpenMerchantOnboarding && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMerchantOnboarding();
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'ليس لديك متجر بعد؟ سجل متجرك مجاناً' : 'New store? Start 30-Day Free Trial (0% Comm.)'}</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* RIDER LOGIN TAB */}
          {activeTab === 'rider' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-300 block uppercase tracking-wider">
                    {isRtl ? 'بوابة مندوب التوصيل' : 'Runner / Courier Dispatch'}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRtl ? 'تسليم طلبات المصعد وتسوية الكاش اليومي' : 'Active building deliveries and shift cash balancing'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoPin('5678')}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold"
                  title="Auto-fill Demo PIN"
                >
                  Quick Demo (5678)
                </button>
              </div>

              {/* Store Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {isRtl ? 'المتجر التابع له المندوب:' : 'Assigned Store:'}
                </label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:border-amber-500 focus:outline-none"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.area}) • Rider PIN: {s.riderPin || '5678'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Security PIN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {isRtl ? 'رمز الـ PIN لمندوب التوصيل:' : 'Runner Courier PIN:'}
                  </label>
                  <span className="text-[11px] text-slate-500">Default: 5678</span>
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter 4-digit Runner PIN"
                  maxLength={10}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono tracking-widest focus:border-amber-500 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold py-3 px-6 rounded-xl text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRtl ? 'فتح مهام التوصيل' : 'Launch Delivery Tasks'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* CUSTOMER PREVIEW & SEARCH TAB */}
          {activeTab === 'customer' && (
            <div className="space-y-5">
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl">
                <span className="text-xs font-bold text-emerald-300 block uppercase tracking-wider">
                  {isRtl ? 'استعراض البقالات والمتاجر الحية' : 'Live Store Discovery & Preview'}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRtl ? 'ابحث عن بقالة برجك وتصفح المنتجات قبل الشراء' : 'Search your neighborhood mart and browse catalog live'}
                </p>
              </div>

              {/* Store Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'ابحث باسم المتجر أو الحي (مثال: Al Medina, Marina...)' : 'Search store or area (e.g. Medina, Marina, Downtown)...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Stores List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredStores.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setPreviewStoreId(s.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      previewStore.id === s.id
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={s.image}
                        alt={s.name}
                        fallbackType="store"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {isRtl ? s.nameAr || s.name : s.name}
                        </h4>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{s.area}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-bold">{s.rating} ★</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoleAndStore('customer', s.id);
                        onClose();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <span>{isRtl ? 'دخول المتجر' : 'Shop Now'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Catalog Snapshot */}
              {previewProducts.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{isRtl ? `منتجات متوفرة في ${previewStore.name}:` : `Sample items at ${previewStore.name}:`}</span>
                    <span className="text-emerald-400 font-bold">15-Min Delivery</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {previewProducts.map((p) => (
                      <div key={p.id} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                        <div className="text-[11px] font-bold text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">{p.price} AED</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADMIN HQ TAB */}
          {activeTab === 'admin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-300 block uppercase tracking-wider">
                    {isRtl ? 'لوحة تحكم الإدارة المركزية (Franchise Admin)' : 'Central Franchise HQ & Admin'}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRtl ? 'إشراف على جميع المتاجر، الرسوم، ومؤشرات الأداء' : 'Multi-store analytics, subscription billing, and franchise oversight'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoPin('admin999')}
                  className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-[11px] font-bold"
                  title="Auto-fill Demo Key"
                >
                  Quick Key (admin999)
                </button>
              </div>

              {/* Master Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {isRtl ? 'المفتاح السري للإدارة العامة:' : 'Franchise HQ Master Key:'}
                  </label>
                  <span className="text-[11px] text-slate-500">Key: admin999 or admin123</span>
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter Franchise Master Key"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono tracking-wider focus:border-purple-500 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-700 hover:bg-purple-600 text-white font-extrabold py-3 px-6 rounded-xl text-sm shadow-lg shadow-purple-700/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRtl ? 'فتح لوحة الإدارة العامة' : 'Enter Franchise HQ'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </motion.div>
    </div>
  );
};
