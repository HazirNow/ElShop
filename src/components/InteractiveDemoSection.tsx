import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Tablet,
  Bike,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Banknote,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Send,
  Sparkles,
  AlertTriangle,
  Flame,
  Layers,
  ArrowRight,
  TrendingUp,
  Store,
  Users,
  Percent,
  Download,
  Sliders,
  Bell,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Language } from '../types';

interface InteractiveDemoSectionProps {
  lang: Language;
  onOpenSignup: () => void;
  onOpenStoreLogin?: () => void;
}

export const InteractiveDemoSection: React.FC<InteractiveDemoSectionProps> = ({
  lang,
  onOpenSignup,
  onOpenStoreLogin
}) => {
  const isRtl = lang === 'ar';

  // 4 Main Persona Tabs
  const [activePersona, setActivePersona] = useState<'customer' | 'merchant' | 'rider' | 'admin'>('customer');

  // TAB 1: Customer State
  const [customerScreen, setCustomerScreen] = useState<1 | 2 | 3>(1);
  const [cartCount, setCartCount] = useState<number>(2);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [payLaterActive, setPayLaterActive] = useState<boolean>(true);
  const [showKhataTooltip, setShowKhataTooltip] = useState<boolean>(false);

  // Auto-cycle customer screens if untouched
  useEffect(() => {
    if (activePersona !== 'customer') return;
    const timer = setInterval(() => {
      setCustomerScreen((prev) => (prev === 3 ? 1 : ((prev + 1) as 1 | 2 | 3)));
    }, 6000);
    return () => clearInterval(timer);
  }, [activePersona]);

  // TAB 2: Merchant State
  const [merchantTab, setMerchantTab] = useState<'kanban' | 'register' | 'inventory' | 'khata'>('kanban');
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(true);
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);
  const [inventoryStock, setInventoryStock] = useState({
    milk: 3,
    bread: 0,
    biscuits: 45
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // TAB 3: Rider State
  const [riderScreen, setRiderScreen] = useState<1 | 2 | 3 | 4>(1);
  const [sunlightMode, setSunlightMode] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card'>('cash');
  const [tenderedAmount, setTenderedAmount] = useState<number>(100);

  // TAB 4: Admin State
  const [selectedStoreDetail, setSelectedStoreDetail] = useState<string | null>(null);
  const [autoSuspendActive, setAutoSuspendActive] = useState<boolean>(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleAddToCart = (productName: string) => {
    setCartCount((c) => c + 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 600);
    showToast(isRtl ? `تمت إضافة ${productName} للسلة (+1)` : `Added ${productName} to cart (+1)`);
  };

  return (
    <section id="demo" className="py-16 sm:py-24 bg-slate-950 relative overflow-hidden border-t border-slate-800/80">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تجربة النظام التفاعلية الكاملة' : 'Interactive Product Demo'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {isRtl ? 'شاهد كيف يعمل النظام لجميع الأطراف' : 'Experience ElShop Across 4 Roles'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {isRtl
              ? 'جرّب تجربة العميل، لوحة تحكم البقالة، تطبيق المندوب الذكي، ولوحة الإدارة العامة بكل مرونة.'
              : 'Interactive walkthrough: test the customer WhatsApp storefront, merchant tablet POS, rider elevator app, and network admin control.'}
          </p>
        </div>

        {/* 4 Persona Segmented Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl gap-1 max-w-full">
            
            <button
              onClick={() => setActivePersona('customer')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePersona === 'customer'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isRtl ? '1. تجربة العميل' : '1. Customer'}</span>
              <span className="hidden md:inline-block text-[10px] opacity-75 font-normal">
                {isRtl ? '(طلب سريع)' : '(<30s WhatsApp)'}
              </span>
            </button>

            <button
              onClick={() => setActivePersona('merchant')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePersona === 'merchant'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span>{isRtl ? '2. عمليات البقالة' : '2. Merchant'}</span>
              <span className="hidden md:inline-block text-[10px] opacity-75 font-normal">
                {isRtl ? '(إدارة ودفتر)' : '(Tablet POS)'}
              </span>
            </button>

            <button
              onClick={() => setActivePersona('rider')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePersona === 'rider'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>{isRtl ? '3. مندوب التوصيل' : '3. Rider / Runner'}</span>
              <span className="hidden md:inline-block text-[10px] opacity-75 font-normal">
                {isRtl ? '(تجميع المصاعد)' : '(Elevator Batches)'}
              </span>
            </button>

            <button
              onClick={() => setActivePersona('admin')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePersona === 'admin'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isRtl ? '4. لوحة الإدارة' : '4. Admin Network'}</span>
              <span className="hidden md:inline-block text-[10px] opacity-75 font-normal">
                {isRtl ? '(تحليلات الشبكة)' : '(24 Stores Pulse)'}
              </span>
            </button>

          </div>
        </div>

        {/* Toast Notification for Interactive Clicks */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 shadow-2xl text-emerald-400 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: CUSTOMER EXPERIENCE */}
        {activePersona === 'customer' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left/Main Column: Interactive Phone Mockup */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* Screen Selector Pills */}
              <div className="flex items-center gap-2 mb-4 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setCustomerScreen(1)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    customerScreen === 1 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? '1. رابط واتساب' : '1. WhatsApp Link / QR'}
                </button>
                <button
                  onClick={() => setCustomerScreen(2)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    customerScreen === 2 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? '2. تصفح الكتالوج' : '2. Catalog Browse'}
                </button>
                <button
                  onClick={() => setCustomerScreen(3)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    customerScreen === 3 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? '3. إتمام الطلب' : '3. Instant Checkout'}
                </button>
              </div>

              {/* iPhone 14 Device Shell */}
              <div className="relative w-[340px] sm:w-[380px] h-[640px] sm:h-[680px] bg-slate-950 rounded-[44px] p-3.5 border-[6px] border-slate-800 shadow-2xl shadow-emerald-950/40 flex flex-col overflow-hidden ring-1 ring-slate-700">
                
                {/* Dynamic Island / Speaker Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 animate-pulse" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="w-full h-full bg-slate-900 rounded-[34px] overflow-hidden flex flex-col pt-8 text-slate-100 text-xs relative">
                  
                  {/* SCREEN 1: WhatsApp Gateway */}
                  {customerScreen === 1 && (
                    <div className="flex-1 p-4 flex flex-col justify-between animate-fade-in bg-[#0B141A] text-slate-200">
                      <div className="space-y-4 pt-2">
                        {/* WhatsApp Header */}
                        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                            🏪
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">Al Medina Supermarket</div>
                            <div className="text-[10px] text-emerald-400">Online • WhatsApp Official</div>
                          </div>
                        </div>

                        {/* WhatsApp Chat Message */}
                        <div className="bg-[#1F2C34] p-3.5 rounded-2xl rounded-tl-none space-y-2.5 max-w-[90%] shadow-md border border-slate-700/50">
                          <p className="text-[11px] leading-relaxed text-slate-100">
                            مرحباً بك في بقالة المدينة! 🛒<br />
                            اطلب الآن لسكان <strong>Marina Pinnacle</strong> مع توصيل خلال 15 دقيقة بالدفتر أو كاش:
                          </p>
                          <div 
                            onClick={() => setCustomerScreen(2)}
                            className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center justify-between cursor-pointer hover:bg-emerald-800/40 transition"
                          >
                            <span>🛒 elshop.ae/almedina</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] text-slate-400 block text-right">10:42 AM ✓✓</span>
                        </div>

                        {/* Elevator QR Card Graphic */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-dashed border-emerald-500/40 text-center space-y-2">
                          <div className="w-20 h-20 mx-auto bg-white p-1.5 rounded-xl flex items-center justify-center shadow-inner">
                            <div className="w-full h-full border-2 border-slate-900 flex flex-col items-center justify-center font-mono font-black text-[9px] text-slate-900 leading-tight">
                              <span>ELSHOP</span>
                              <span>[ QR ]</span>
                              <span>PINNACLE</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-300 font-semibold">
                            {isRtl ? 'امسح الرمز في المصعد للطلب الفوري' : 'Scan elevator poster or tap link'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setCustomerScreen(2)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                      >
                        <span>{isRtl ? 'فتح متجر البقالة' : 'Open Store Catalog'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* SCREEN 2: Catalog Browse */}
                  {customerScreen === 2 && (
                    <div className="flex-1 flex flex-col justify-between p-3.5 bg-slate-950 animate-fade-in">
                      <div className="space-y-3">
                        {/* Store Nav */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-white text-sm">Al Medina Baqala</h4>
                            <span className="text-[10px] text-emerald-400 font-medium">⚡ Avg 12 min to Unit 1402</span>
                          </div>
                          <div className="relative">
                            <button 
                              onClick={() => setCustomerScreen(3)}
                              className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-200 relative"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              {cartCount > 0 && (
                                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ${addedAnimation ? 'animate-bounce' : ''}`}>
                                  {cartCount}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
                          <Search className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'ابحث عن حليب، خبز، بيض...' : 'Search milk, bread, eggs...'}</span>
                        </div>

                        {/* Category Scroller */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white shrink-0">🔥 Offers</span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 shrink-0">Dairy</span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 shrink-0">Bakery</span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 shrink-0">Pantry</span>
                        </div>

                        {/* Product Cards Grid */}
                        <div className="space-y-2">
                          
                          {/* Item 1 */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="font-bold text-white text-[11px]">Al Rawabi Fresh Milk 1L</div>
                              <div className="text-[10px] text-emerald-400 font-mono font-bold">12.50 AED</div>
                            </div>
                            <button
                              onClick={() => handleAddToCart('Al Rawabi Fresh Milk')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 active:scale-95 transition"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isRtl ? 'إضافة' : 'Add'}</span>
                            </button>
                          </div>

                          {/* Item 2 */}
                          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-300 text-[11px]">Homemade Toast Bread</div>
                              <div className="text-[10px] text-slate-400 font-mono">5.00 AED</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                              {isRtl ? 'مخزون قليل (2)' : 'Low Stock (2)'}
                            </span>
                          </div>

                          {/* Item 3 */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-white text-[11px]">Sunbulah Biscuits</span>
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[8px] font-extrabold">SALE</span>
                              </div>
                              <div className="text-[10px] text-emerald-400 font-mono font-bold">3.50 AED</div>
                            </div>
                            <button
                              onClick={() => handleAddToCart('Sunbulah Biscuits')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 active:scale-95 transition"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isRtl ? 'إضافة' : 'Add'}</span>
                            </button>
                          </div>

                        </div>
                      </div>

                      <button
                        onClick={() => setCustomerScreen(3)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                      >
                        <span>{isRtl ? 'متابعة الدفع (17.50 درهم)' : 'Checkout (17.50 AED)'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* SCREEN 3: Instant Checkout */}
                  {customerScreen === 3 && (
                    <div className="flex-1 flex flex-col justify-between p-3.5 bg-slate-950 animate-fade-in">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <h4 className="font-black text-white text-xs">{isRtl ? 'تأكيد الطلب السريع' : 'Quick Checkout'}</h4>
                          <span className="text-[10px] text-emerald-400 font-bold">Marina Pinnacle • 1402</span>
                        </div>

                        {/* Delivery Details */}
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <div className="text-[10px] text-slate-400">{isRtl ? 'عنوان التوصيل' : 'Delivery Address'}</div>
                          <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Marina Pinnacle • Unit 1402</span>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>1x Al Rawabi Milk + 1x Biscuits</span>
                            <span className="font-mono font-bold text-white">16.00 AED</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Elevator Delivery</span>
                            <span className="font-mono text-emerald-400 font-bold">1.50 AED</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-xs">
                            <span className="text-white">Total</span>
                            <span className="font-mono text-emerald-400">17.50 AED</span>
                          </div>
                        </div>

                        {/* Digital Khata Toggle */}
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                              <span>{isRtl ? 'دفتر الحساب (الدفع لاحقاً)' : 'Khata: Pay Later'}</span>
                              <span className="px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[8px]">Approved</span>
                            </div>
                            <div className="text-[9px] text-slate-400">Settle at end of month</div>
                          </div>
                          <button
                            onClick={() => setPayLaterActive(!payLaterActive)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${
                              payLaterActive ? 'bg-amber-500' : 'bg-slate-800'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                payLaterActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Doorstep Note Chip */}
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 text-[10px] font-bold">
                          <span>🚪 Leave at door</span>
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          showToast(isRtl ? 'تم إرسال الطلب للبقالة بنجاح!' : 'Order Placed! Sent to Store POS');
                          setCustomerScreen(1);
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 animate-pulse"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isRtl ? 'تأكيد وإرسال الطلب (17.50 درهم)' : 'Place Order Now (17.50 AED)'}</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Right Column: Key Benefits & Statistics */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {isRtl ? 'بساطة فائقة للعميل' : 'Zero App Friction'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {isRtl ? 'العملاء يطلبون في أقل من 30 ثانية' : 'Customers Order in <30 Seconds'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isRtl
                    ? 'بدون الحاجة لتنزيل تطبيقات ثقيلة أو إدخال بيانات معقدة. رابط واتساب وملصق المصعد يقدمان طلباً فورياً بلمسة واحدة.'
                    : 'No app download required. Residents scan elevator QR codes or tap their WhatsApp link to place instant grocery orders.'}
                </p>
              </div>

              {/* 4 Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>24/7 Ordering</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'يعمل على أي هاتف دون تحميل تطبيق' : 'No app download. Works on any phone.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-indigo-400 font-bold text-xs flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Building Aware</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'تجميع تلقائي لطلبات نفس البرج والمصعد' : 'Auto-groups elevator deliveries.'}
                  </p>
                </div>

                <div 
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 relative group cursor-pointer"
                  onMouseEnter={() => setShowKhataTooltip(true)}
                  onMouseLeave={() => setShowKhataTooltip(false)}
                >
                  <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Khata Ready</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'ادفع فوراً أو لاحقاً بدفتر الحساب' : 'Pay now or later—your choice.'}
                  </p>
                  {showKhataTooltip && (
                    <div className="absolute -top-12 left-0 right-0 p-2 rounded-xl bg-slate-950 border border-amber-500/50 text-[10px] text-amber-200 shadow-2xl z-30">
                      Community credit ledger. Residents pre-approved by store can order and settle monthly.
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>&lt;2min Dispatch</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'من السلة إلى باب الشقة مباشرة' : 'From cart to doorstep fast.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">
                    {isRtl ? 'جرّب بنفسك على متجرك' : 'Ready to offer WhatsApp ordering?'}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    {isRtl ? '0% عمولة • إعداد في ساعة واحدة' : '0% commission • 1-hour store setup'}
                  </div>
                </div>
                <button
                  onClick={onOpenSignup}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                >
                  {isRtl ? 'ابدأ مجاناً' : 'Start Trial'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: MERCHANT OPERATIONS */}
        {activePersona === 'merchant' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Tablet Mockup (iPad Frame) */}
            <div className="max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              
              {/* Tablet Top Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="h-4 w-[1px] bg-slate-800" />
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>ElShop Merchant Terminal • iPad Pro (12.9&quot;)</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Audio Alert Toggle */}
                  <button
                    onClick={() => {
                      setAudioAlertEnabled(!audioAlertEnabled);
                      showToast(audioAlertEnabled ? 'Audio alerts disabled' : 'Audio alerts active for new orders');
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                      audioAlertEnabled 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {audioAlertEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{audioAlertEnabled ? 'Audio Alert ON' : 'Audio Muted'}</span>
                  </button>

                  {/* Tablet Sub-tabs */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                      onClick={() => setMerchantTab('kanban')}
                      className={`px-3 py-1 rounded-lg transition ${
                        merchantTab === 'kanban' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Kanban Board
                    </button>
                    <button
                      onClick={() => setMerchantTab('register')}
                      className={`px-3 py-1 rounded-lg transition ${
                        merchantTab === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Daily Register
                    </button>
                    <button
                      onClick={() => setMerchantTab('inventory')}
                      className={`px-3 py-1 rounded-lg transition ${
                        merchantTab === 'inventory' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Inventory
                    </button>
                    <button
                      onClick={() => setMerchantTab('khata')}
                      className={`px-3 py-1 rounded-lg transition ${
                        merchantTab === 'khata' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Khata Ledger
                    </button>
                  </div>
                </div>
              </div>

              {/* Tablet Screen Content */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 sm:p-6 min-h-[360px]">
                
                {/* SUBTAB A: Kanban Board */}
                {merchantTab === 'kanban' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="font-bold text-white">Live Store Kanban Board (Real-Time Drag &amp; Dispatch)</span>
                      <span className="text-emerald-400 font-mono font-bold">34 Total Orders Today</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      
                      {/* Column 1: Incoming */}
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                          <span>🔵 Incoming (3)</span>
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                        </div>
                        
                        <div 
                          onClick={() => setSelectedOrderModal({ id: 'ORD-001', tower: 'Marina Pinnacle 1402', amount: '87.50 AED', rider: 'Ahmed', items: '2x Fresh Milk, 1x Bread, 1x Eggs' })}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 cursor-pointer space-y-1.5 transition"
                        >
                          <div className="flex justify-between items-center text-[11px] font-bold text-white">
                            <span>#ORD-001</span>
                            <span className="text-emerald-400">87.50 AED</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Marina Pinnacle • 1402</div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[9px] text-slate-500">
                            <span>🛵 Rider: Ahmed</span>
                            <span className="text-amber-400 font-bold">Khata Debited</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 opacity-80">
                          <div className="flex justify-between items-center text-[11px] font-bold text-white">
                            <span>#ORD-002</span>
                            <span className="text-emerald-400">34.00 AED</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Princess Tower • 0804</div>
                        </div>
                      </div>

                      {/* Column 2: Packing */}
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                          <span>🟠 Packing (5)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold text-white">
                            <span>#ORD-005</span>
                            <span className="text-emerald-400">112.00 AED</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Bay Central • Unit 2201</div>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            Bagging Groceries
                          </span>
                        </div>
                      </div>

                      {/* Column 3: Out for Delivery */}
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                          <span>🟢 Out for Delivery (2)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold text-white">
                            <span>#ORD-008</span>
                            <span className="text-emerald-400">45.00 AED</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Marina Pinnacle • Fl. 14</div>
                          <span className="text-[9px] text-indigo-300 font-medium">🛵 Runner in Elevator</span>
                        </div>
                      </div>

                      {/* Column 4: Delivered */}
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                          <span>✅ Delivered (24)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                          <div className="flex justify-between items-center text-[11px] font-bold text-slate-300">
                            <span>#ORD-024</span>
                            <span className="text-slate-400">62.50 AED</span>
                          </div>
                          <div className="text-[10px] text-slate-500">Completed 4 min ago</div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUBTAB B: Daily Register */}
                {merchantTab === 'register' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Cash in Drawer</span>
                        <div className="text-lg font-black text-emerald-400 font-mono">1,250.00 AED</div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Card / Apple Pay</span>
                        <div className="text-lg font-black text-sky-400 font-mono">350.00 AED</div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Khata Owed</span>
                        <div className="text-lg font-black text-amber-400 font-mono">200.00 AED</div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                        <span className="text-[10px] text-emerald-300 font-bold uppercase">Day Gross Total</span>
                        <div className="text-xl font-black text-white font-mono">1,800.00 AED</div>
                      </div>
                    </div>

                    {/* Animated 7-Day Revenue Trend Bars */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Last 7 Days Revenue Trend (0% Commission)</span>
                        <span className="text-emerald-400 font-mono font-bold">+28% vs Last Week</span>
                      </div>
                      <div className="flex items-end justify-between gap-2 h-28 pt-4">
                        {[
                          { day: 'Mon', val: 1200, pct: '65%' },
                          { day: 'Tue', val: 1450, pct: '78%' },
                          { day: 'Wed', val: 1300, pct: '70%' },
                          { day: 'Thu', val: 1680, pct: '90%' },
                          { day: 'Fri', val: 1950, pct: '100%' },
                          { day: 'Sat', val: 1820, pct: '95%' },
                          { day: 'Sun', val: 1800, pct: '92%' }
                        ].map((d, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-[9px] text-slate-400 font-mono">{d.val}</span>
                            <div className="w-full bg-slate-800 rounded-t-lg h-20 relative flex items-end">
                              <div
                                style={{ height: d.pct }}
                                className="w-full bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t-lg transition-all duration-700 hover:brightness-110"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-300">{d.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => showToast('End-of-shift drawer reconciliation report exported (PDF/WhatsApp)')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>End-of-Shift Drawer Report</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBTAB C: Inventory */}
                {merchantTab === 'inventory' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="font-bold text-white">Store Inventory &amp; Expiry Monitor</span>
                      <span className="text-slate-400 text-[11px]">Instant barcode scanner + camera support</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                            <th className="pb-2">Product</th>
                            <th className="pb-2">Category</th>
                            <th className="pb-2">Stock Level</th>
                            <th className="pb-2">Alert Threshold</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2 text-right">Quick Adjust</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {/* Row 1 */}
                          <tr>
                            <td className="py-3 font-bold text-white">Al Rawabi Fresh Milk 1L</td>
                            <td className="py-3 text-slate-400">Dairy</td>
                            <td className="py-3 font-mono font-bold text-white">{inventoryStock.milk} units</td>
                            <td className="py-3 text-slate-400">&lt;5 units</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] animate-pulse">
                                🚨 LOW STOCK
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => setInventoryStock((s) => ({ ...s, milk: Math.max(0, s.milk - 1) }))}
                                  className="w-6 h-6 rounded bg-slate-800 text-slate-200 font-bold flex items-center justify-center hover:bg-slate-700"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => setInventoryStock((s) => ({ ...s, milk: s.milk + 1 }))}
                                  className="w-6 h-6 rounded bg-slate-800 text-slate-200 font-bold flex items-center justify-center hover:bg-slate-700"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => {
                                    setInventoryStock((s) => ({ ...s, milk: s.milk + 12 }));
                                    showToast('Restocked +12 crates for Al Rawabi Milk');
                                  }}
                                  className="px-2 py-0.5 rounded bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]"
                                >
                                  +12 Crate
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Row 2 */}
                          <tr>
                            <td className="py-3 font-bold text-white">Homemade Bread</td>
                            <td className="py-3 text-slate-400">Bakery</td>
                            <td className="py-3 font-mono font-bold text-slate-400">{inventoryStock.bread} units</td>
                            <td className="py-3 text-slate-400">&lt;3 units</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">
                                ❌ OUT OF STOCK
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setInventoryStock((s) => ({ ...s, bread: 10 }));
                                  showToast('Restocked 10 loaves of bakery bread');
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                              >
                                Restock +10
                              </button>
                            </td>
                          </tr>

                          {/* Row 3 */}
                          <tr>
                            <td className="py-3 font-bold text-white">Sunbulah Biscuits</td>
                            <td className="py-3 text-slate-400">Snacks</td>
                            <td className="py-3 font-mono font-bold text-emerald-400">{inventoryStock.biscuits} units</td>
                            <td className="py-3 text-slate-400">&lt;10 units</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                                ✓ HEALTHY
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => setInventoryStock((s) => ({ ...s, biscuits: s.biscuits + 24 }))}
                                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold"
                              >
                                +24 Box
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBTAB D: Khata Ledger */}
                {merchantTab === 'khata' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="font-bold text-white">Tower Resident Credit Ledger (Digital Khata)</span>
                      <span className="text-amber-400 font-mono font-bold">Total Khata Owed: 450.00 AED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* Card 1 */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-white text-xs">Fatima Al-Mansouri</div>
                            <div className="text-[10px] text-slate-400">Marina Pinnacle • Unit 1402</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            450.00 AED Owed
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Credit Limit: 500 AED</span>
                            <span className="font-bold text-rose-400">90% utilized</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="w-[90%] h-full bg-rose-500 rounded-full" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => showToast('WhatsApp monthly billing statement sent to Fatima (+971-50-xxx-1402)')}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send WhatsApp Statement</span>
                          </button>
                          <button
                            onClick={() => showToast('Payment of 450.00 AED recorded and ledger reconciled')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px]"
                          >
                            Record Payment
                          </button>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-white text-xs">Ahmed Khan</div>
                            <div className="text-[10px] text-slate-400">Bay Square Tower 3 • Unit 0702</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                            0.00 AED Owed
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Credit Limit: 1,000 AED</span>
                            <span className="font-bold text-emerald-400">All Settled ✓</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="w-[0%] h-full bg-emerald-500 rounded-full" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => showToast('WhatsApp receipt copy dispatched to Ahmed')}
                            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px]"
                          >
                            View Transaction History
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal for Order Inspection */}
            {selectedOrderModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h4 className="font-black text-white text-sm">Order Detail {selectedOrderModal.id}</h4>
                    <button 
                      onClick={() => setSelectedOrderModal(null)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div><strong>Destination:</strong> {selectedOrderModal.tower}</div>
                    <div><strong>Items:</strong> {selectedOrderModal.items}</div>
                    <div><strong>Total Amount:</strong> {selectedOrderModal.amount}</div>
                    <div><strong>Assigned Runner:</strong> {selectedOrderModal.rider}</div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        showToast(`Dispatched ${selectedOrderModal.id} to runner ${selectedOrderModal.rider}`);
                        setSelectedOrderModal(null);
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Dispatch Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: RIDER / DELIVERY */}
        {activePersona === 'rider' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Column: Interactive Runner Device */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* Screen Pills */}
              <div className="flex items-center gap-2 mb-4 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setRiderScreen(1)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    riderScreen === 1 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Batched Queue
                </button>
                <button
                  onClick={() => setRiderScreen(2)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    riderScreen === 2 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. Sunlight Mode Demo
                </button>
                <button
                  onClick={() => setRiderScreen(3)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    riderScreen === 3 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3. Doorstep Settlement
                </button>
                <button
                  onClick={() => setRiderScreen(4)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    riderScreen === 4 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  4. WhatsApp Receipt
                </button>
              </div>

              {/* Rider Phone Shell */}
              <div className={`relative w-[340px] sm:w-[380px] h-[640px] sm:h-[680px] rounded-[44px] p-3.5 border-[6px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${
                sunlightMode 
                  ? 'bg-[#141414] border-amber-500 ring-4 ring-amber-400/40 shadow-amber-500/30' 
                  : 'bg-slate-950 border-slate-800 ring-1 ring-slate-700 shadow-emerald-950/30'
              }`}>
                
                {/* Dynamic Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <div className={`w-2.5 h-2.5 rounded-full ${sunlightMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                </div>

                {/* Inner Screen */}
                <div className={`w-full h-full rounded-[34px] overflow-hidden flex flex-col pt-8 text-xs relative transition-colors duration-500 ${
                  sunlightMode ? 'bg-[#1F1F1F] text-[#FFF8DC]' : 'bg-slate-900 text-slate-100'
                }`}>
                  
                  {/* Top Bar with Sunlight Toggle */}
                  <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5 font-black text-[11px]">
                      <Bike className={`w-4 h-4 ${sunlightMode ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span>Rider Runner: Ahmed</span>
                    </div>

                    <button
                      onClick={() => setSunlightMode(!sunlightMode)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] transition-all shadow-md ${
                        sunlightMode 
                          ? 'bg-amber-400 text-black border border-amber-300 animate-pulse' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <Sun className="w-3 h-3" />
                      <span>{sunlightMode ? '🌞 45°C SUNLIGHT ACTIVE' : '☀️ Sunlight Mode'}</span>
                    </button>
                  </div>

                  {/* SCREEN 1: Active Deliveries Queue */}
                  {riderScreen === 1 && (
                    <div className="flex-1 p-3.5 flex flex-col justify-between animate-fade-in">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span>My Active Elevator Run (5 Stops)</span>
                          <span className={sunlightMode ? 'text-amber-400' : 'text-emerald-400'}>Marina Pinnacle</span>
                        </div>

                        {/* Batched Order Card 1 */}
                        <div 
                          onClick={() => setRiderScreen(3)}
                          className={`p-3 rounded-2xl border cursor-pointer transition ${
                            sunlightMode 
                              ? 'bg-black border-amber-400 text-amber-200 hover:border-white' 
                              : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50'
                          }`}
                        >
                          <div className="flex justify-between items-center font-black text-xs">
                            <span>#ORD-001 • Unit 1402</span>
                            <span className="font-mono text-emerald-400">87.50 AED</span>
                          </div>
                          <div className="text-[10px] opacity-80 pt-1">1x Fresh Milk, 2x Bread, Eggs</div>
                          <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/80 text-[9px]">
                            <span className="font-bold text-amber-400">🚪 Leave at door</span>
                            <span className="text-emerald-400 font-bold">Stop 1 of 3</span>
                          </div>
                        </div>

                        {/* Batched Order Card 2 */}
                        <div className={`p-3 rounded-2xl border opacity-75 ${
                          sunlightMode ? 'bg-black border-slate-700' : 'bg-slate-950 border-slate-800'
                        }`}>
                          <div className="flex justify-between items-center font-black text-xs">
                            <span>#ORD-003 • Unit 1804</span>
                            <span className="font-mono">42.00 AED</span>
                          </div>
                          <div className="text-[10px] opacity-75 pt-1">2x Apple Juice, Biscuits</div>
                          <span className="text-[9px] opacity-60">Stop 2 of 3 (Floor 18)</span>
                        </div>

                        {/* Batched Order Card 3 */}
                        <div className={`p-3 rounded-2xl border opacity-75 ${
                          sunlightMode ? 'bg-black border-slate-700' : 'bg-slate-950 border-slate-800'
                        }`}>
                          <div className="flex justify-between items-center font-black text-xs">
                            <span>#ORD-004 • Unit 2208</span>
                            <span className="font-mono">65.00 AED</span>
                          </div>
                          <div className="text-[10px] opacity-75 pt-1">Pantry Essentials</div>
                          <span className="text-[9px] opacity-60">Stop 3 of 3 (Floor 22)</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setRiderScreen(3)}
                        className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg ${
                          sunlightMode ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        <span>Start Floor 14 Dropoff (#ORD-001)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* SCREEN 2: Sunlight Mode Explanation Screen */}
                  {riderScreen === 2 && (
                    <div className="flex-1 p-4 flex flex-col justify-between animate-fade-in text-center">
                      <div className="space-y-4 pt-4">
                        <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${
                          sunlightMode ? 'bg-amber-400 text-black' : 'bg-slate-800 text-amber-400'
                        }`}>
                          <Sun className="w-8 h-8 animate-spin-slow" />
                        </div>
                        <h4 className="font-black text-sm">
                          {sunlightMode ? '45°C High-Contrast Active' : 'Standard Delivery View'}
                        </h4>
                        <p className="text-[11px] opacity-80 leading-relaxed max-w-[280px] mx-auto">
                          UAE summers reach 45°C+. Standard smartphone screens wash out in direct glare. ElShop riders toggle instant amber-contrast for instant visibility without eye strain.
                        </p>
                      </div>

                      <button
                        onClick={() => setSunlightMode(!sunlightMode)}
                        className={`w-full py-2.5 rounded-xl font-black text-xs ${
                          sunlightMode ? 'bg-amber-400 text-black' : 'bg-slate-800 text-white'
                        }`}
                      >
                        {sunlightMode ? 'Switch Back to Normal' : 'Simulate 45°C Sunlight Mode'}
                      </button>
                    </div>
                  )}

                  {/* SCREEN 3: Doorstep Delivery & Cash Calculator */}
                  {riderScreen === 3 && (
                    <div className="flex-1 p-3.5 flex flex-col justify-between animate-fade-in">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <div>
                            <div className="font-black text-xs">Unit 1402 Doorstep</div>
                            <div className="text-[10px] text-amber-400 font-bold">🚪 Customer Note: Leave at door</div>
                          </div>
                          <div className="text-right font-black text-sm text-emerald-400">87.50 AED</div>
                        </div>

                        {/* Payment Selector */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setPaymentMode('cash')}
                            className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                              paymentMode === 'cash' 
                                ? 'bg-emerald-600 text-white border-emerald-400' 
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Cash</span>
                          </button>
                          <button
                            onClick={() => setPaymentMode('card')}
                            className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                              paymentMode === 'card' 
                                ? 'bg-emerald-600 text-white border-emerald-400' 
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Card / POS</span>
                          </button>
                        </div>

                        {/* Tender Calculator (Cash) */}
                        {paymentMode === 'cash' ? (
                          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span>Amount Tendered:</span>
                              <span className="font-mono text-white">{tenderedAmount}.00 AED</span>
                            </div>

                            <div className="flex gap-1.5">
                              {[87.5, 100, 200].map((amt) => (
                                <button
                                  key={amt}
                                  onClick={() => setTenderedAmount(amt)}
                                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                                    tenderedAmount === amt 
                                      ? 'bg-amber-500 text-black border-amber-400' 
                                      : 'bg-slate-900 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {amt === 87.5 ? 'Exact' : `${amt} AED`}
                                </button>
                              ))}
                            </div>

                            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex justify-between items-center text-xs font-bold">
                              <span className="text-emerald-300">Change to Return:</span>
                              <span className="font-mono text-emerald-400 text-sm">
                                {(tenderedAmount - 87.50).toFixed(2)} AED
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                            <CreditCard className="w-6 h-6 mx-auto text-sky-400" />
                            <div className="font-bold text-xs">Tap Card on Mobile Terminal</div>
                            <div className="text-[10px] text-slate-400">Payment reconciled directly to store bank</div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          showToast('Delivery completed & WhatsApp receipt dispatched');
                          setRiderScreen(4);
                        }}
                        className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg ${
                          sunlightMode ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Payment &amp; Send Receipt</span>
                      </button>
                    </div>
                  )}

                  {/* SCREEN 4: WhatsApp Receipt Sent */}
                  {riderScreen === 4 && (
                    <div className="flex-1 p-4 flex flex-col justify-between animate-fade-in text-center">
                      <div className="space-y-4 pt-6">
                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="font-black text-sm text-white">Delivery Complete ✓</h4>
                        <div className="p-3 rounded-2xl bg-[#0B141A] border border-emerald-500/30 text-left space-y-1 text-slate-200 max-w-[280px] mx-auto shadow-md">
                          <div className="text-[10px] text-emerald-400 font-bold">WhatsApp Receipt Sent:</div>
                          <div className="text-[11px] font-mono">
                            #ORD-001 Delivered • Unit 1402<br />
                            Total: 87.50 AED (Paid in Cash)<br />
                            Thank you for ordering with Al Medina!
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setRiderScreen(1)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs"
                      >
                        Next Delivery (#ORD-003 Floor 18)
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Right Column: Rider Benefits */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {isRtl ? 'لوجستيات المصاعد الفائقة' : 'Hyperlocal Logistics'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {isRtl ? 'مندوب البقالة ينجز ضعف الطلبات في نفس الوقت' : 'Runners Complete 2x More Deliveries'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isRtl
                    ? 'نظام يجمع طلبات البرج الواحد في رحلة مصعد واحدة، مع حاسبة فكة سريعة ونمط شمس عالي التباين لدرجات حرارة 45 مئوية.'
                    : 'Batches residential towers by floor to minimize elevator cycle delays, includes one-touch cash change calculation, and extreme sunlight readability.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                    <Sun className="w-4 h-4" />
                    <span>Sunlight Mode</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Ultra high-contrast for 45°C+ UAE heat.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-indigo-400 font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Auto-Batching</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Orders auto-grouped by tower floor.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <Banknote className="w-4 h-4" />
                    <span>Instant Change Calc</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Exact change calculation in 1-tap.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <Send className="w-4 h-4" />
                    <span>WhatsApp Receipts</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Zero paper, automated instant proofs.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: ADMIN NETWORK DASHBOARD */}
        {activePersona === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Desktop Dashboard Mockup */}
            <div className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
              
              {/* Dashboard Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm sm:text-base">
                      ElShop Superadmin Global Pulse Dashboard
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      Dubai &amp; UAE Store Network Telemetry • Live WebSocket Feed
                    </div>
                  </div>
                </div>

                {/* Right Quick Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowBroadcastModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Notice</span>
                  </button>

                  <button
                    onClick={() => {
                      setAutoSuspendActive(!autoSuspendActive);
                      showToast(autoSuspendActive ? 'Auto-suspension turned OFF' : 'Auto-suspension for overdue stores turned ON');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition ${
                      autoSuspendActive 
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Auto-Suspend: {autoSuspendActive ? 'ACTIVE' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Animated KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Stores</span>
                  <div className="text-2xl font-black text-white flex items-center gap-2">
                    <span>24</span>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">100% Online</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Operating across 8 Dubai clusters</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Orders Today</span>
                  <div className="text-2xl font-black text-white flex items-center gap-2">
                    <span>1,547</span>
                    <span className="text-[11px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded">+18% vs avg</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Avg 11.4 min delivery speed</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Network GMV (Month)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">42,300 AED</div>
                  <div className="text-[10px] text-slate-500">Zero commission taken from stores</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fulfillment Success</span>
                  <div className="text-2xl font-black text-white flex items-center gap-2">
                    <span>94.8%</span>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Elite</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Zero lost or disputed items</div>
                </div>
              </div>

              {/* Store List Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Network Store Status &amp; Khata Exposure</span>
                  <span className="text-slate-400 text-[11px]">Click any store for deep P&amp;L audit</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-900/60">
                        <th className="p-3">Store Name</th>
                        <th className="p-3">Subscription</th>
                        <th className="p-3">Orders Today</th>
                        <th className="p-3">Monthly GMV</th>
                        <th className="p-3">Khata Exposure</th>
                        <th className="p-3">SaaS Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr 
                        onClick={() => setSelectedStoreDetail('Baqala Al-Rawabi')}
                        className="hover:bg-slate-900/60 cursor-pointer transition"
                      >
                        <td className="p-3 font-bold text-white">Baqala Al-Rawabi (Marina)</td>
                        <td className="p-3 text-slate-300">Tier 2 (599 AED)</td>
                        <td className="p-3 font-mono font-bold text-white">45 orders</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">12,500 AED</td>
                        <td className="p-3 font-mono text-amber-400 font-bold">450 AED</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ✓ Paid
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold">
                            Audit Store
                          </button>
                        </td>
                      </tr>

                      <tr 
                        onClick={() => setSelectedStoreDetail('Mart Bay Square')}
                        className="hover:bg-slate-900/60 cursor-pointer transition bg-amber-500/5"
                      >
                        <td className="p-3 font-bold text-white">Mart Bay Square (Business Bay)</td>
                        <td className="p-3 text-slate-300">Tier 1 (299 AED)</td>
                        <td className="p-3 font-mono font-bold text-white">78 orders</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">18,900 AED</td>
                        <td className="p-3 font-mono text-amber-400 font-bold">1,200 AED</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold animate-pulse">
                            ⚠️ Overdue (2d)
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast('Payment reminder dispatched via WhatsApp to Bay Square owner');
                            }}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black text-[10px] font-black"
                          >
                            Send Reminder
                          </button>
                        </td>
                      </tr>

                      <tr 
                        onClick={() => setSelectedStoreDetail('Supermarket Khan')}
                        className="hover:bg-slate-900/60 cursor-pointer transition"
                      >
                        <td className="p-3 font-bold text-white">Supermarket Khan (JLT Cl. D)</td>
                        <td className="p-3 text-slate-300">Tier 3 (899 AED)</td>
                        <td className="p-3 font-mono font-bold text-white">156 orders</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">42,300 AED</td>
                        <td className="p-3 font-mono text-amber-400 font-bold">8,500 AED</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ✓ Paid
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold">
                            Audit Store
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts Section: GMV Curve + Tier Pie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SVG Area Line Chart */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">30-Day Network GMV Trend</span>
                    <span className="text-emerald-400 font-bold">+34% Growth</span>
                  </div>
                  <div className="h-32 w-full pt-2">
                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0B6E4F" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#0B6E4F" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,80 Q 50,75 100,60 T 200,35 T 300,10 L 300,100 L 0,100 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M 0,80 Q 50,75 100,60 T 200,35 T 300,10"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="300" cy="10" r="4" fill="#10B981" className="animate-ping" />
                      <circle cx="300" cy="10" r="4" fill="#10B981" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Day 1: 12K AED</span>
                    <span>Day 15: 28K AED</span>
                    <span>Day 30: 42.3K AED</span>
                  </div>
                </div>

                {/* Tier Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="font-bold text-white text-xs block">Subscription Tier Distribution</span>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                        <span>Tier 2: Mart Plan (599 AED)</span>
                        <span className="font-bold text-white">50% (12 stores)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="w-[50%] h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                        <span>Tier 1: Baqala Starter (299 AED)</span>
                        <span className="font-bold text-white">30% (7 stores)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="w-[30%] h-full bg-sky-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                        <span>Tier 3: Franchise (899 AED)</span>
                        <span className="font-bold text-white">20% (5 stores)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="w-[20%] h-full bg-amber-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Broadcast Notice Modal */}
            {showBroadcastModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h4 className="font-black text-white text-sm">Send Network Broadcast to 24 Stores</h4>
                    <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                      Close
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Instantly push an announcement or system update banner to all merchant POS tablets and rider runners across UAE.
                  </p>
                  <textarea
                    defaultValue="Scheduled system optimization tonight at 03:00 AM GST. Offline mode will cache all orders automatically."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        showToast('Broadcast sent to 24 stores & 42 active riders');
                        setShowBroadcastModal(false);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Dispatch Broadcast Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </section>
  );
};
