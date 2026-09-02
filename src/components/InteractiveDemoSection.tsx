import React, { useState, useEffect, useRef } from 'react';
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
  HelpCircle,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Tag,
  Receipt,
  Package,
  Printer,
  ChevronRight,
  ShieldCheck,
  DoorClosed
} from 'lucide-react';
import { Language } from '../types';
import { DEMO_CATEGORIES, DEMO_PRODUCTS, DemoProduct } from '../data/demoProducts';
import { GesturePointer } from './demo/GesturePointer';
import { DevicePhoneFrame } from './demo/DevicePhoneFrame';
import { DeviceTabletFrame } from './demo/DeviceTabletFrame';

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

  // 3 Focused Persona Tabs (Customer, Merchant POS, Runner)
  const [activePersona, setActivePersona] = useState<'customer' | 'merchant' | 'rider'>('customer');

  // GUIDED DEMO STATE (5 Focused Steps)
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [showGuidedTour, setShowGuidedTour] = useState<boolean>(true);


  // TAB 1: Customer State & Catalogue
  const [customerScreen, setCustomerScreen] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('offers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<{ [productId: string]: number }>({
    'p-offer-1': 1 // Pre-loaded Weekend Combo
  });
  const [payLaterActive, setPayLaterActive] = useState<boolean>(true);
  const [showKhataTooltip, setShowKhataTooltip] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // TAB 2: Merchant State
  const [merchantTab, setMerchantTab] = useState<'kanban' | 'register' | 'inventory' | 'khata'>('kanban');
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(true);
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState<boolean>(false);
  const [merchantStock, setMerchantStock] = useState<{ [id: string]: number }>({
    'p-offer-1': 12,
    'p-dairy-1': 14,
    'p-bakery-1': 24,
    'p-bev-1': 18,
    'p-snack-3': 6,
    'p-pantry-1': 8
  });

  // TAB 3: Rider State
  const [riderScreen, setRiderScreen] = useState<1 | 2 | 3 | 4>(1);
  const [sunlightMode, setSunlightMode] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card'>('cash');
  const [tenderedAmount, setTenderedAmount] = useState<number>(100);
  const [elevatorFloor, setElevatorFloor] = useState<number>(1);
  const [isElevatorMoving, setIsElevatorMoving] = useState<boolean>(false);

  // TAB 4: Admin State
  const [selectedStoreDetail, setSelectedStoreDetail] = useState<string | null>(null);
  const [autoSuspendActive, setAutoSuspendActive] = useState<boolean>(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Cart Calculations
  const cartItems = (Object.entries(cart) as [string, number][])
    .map(([id, qty]) => {
      const product = DEMO_PRODUCTS.find((p) => p.id === id);
      return { product, qty };
    })
    .filter((item): item is { product: DemoProduct; qty: number } => Boolean(item.product && item.qty > 0));

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const deliveryFee = cartSubtotal > 50 ? 0 : 3.50;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleAddToCart = (product: DemoProduct) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    setLastAddedId(product.id);
    setTimeout(() => setLastAddedId(null), 800);
    showToast(isRtl ? `تمت إضافة ${product.nameAr} (+1)` : `Added ${product.nameEn} to cart (+1)`);

    // Advance guided tour if on step 1
    if (guidedStep === 1) {
      setTimeout(() => {
        setGuidedStep(2);
        setSelectedCategory('bakery');
      }, 1000);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[productId] > 1) {
        next[productId] -= 1;
      } else {
        delete next[productId];
      }
      return next;
    });
  };

  // Auto-play Guided Tour Loop (5 Focused Steps across Customer, Merchant, Runner)
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setGuidedStep((prev) => {
        const next = prev >= 5 ? 1 : prev + 1;
        // Sync Persona tab with step
        if (next === 1) {
          setActivePersona('customer');
          setCustomerScreen(1);
          setSelectedCategory('offers');
        } else if (next === 2) {
          setActivePersona('customer');
          setCustomerScreen(1);
          setSelectedCategory('bakery');
        } else if (next === 3) {
          setActivePersona('customer');
          setCustomerScreen(2);
        } else if (next === 4) {
          setActivePersona('merchant');
          setMerchantTab('kanban');
        } else if (next === 5) {
          setActivePersona('rider');
          setRiderScreen(3);
        }
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Sync Persona when clicking Guided Step directly
  const handleSelectGuidedStep = (stepNum: number) => {
    setGuidedStep(stepNum);
    setIsAutoPlaying(false);
    if (stepNum === 1) {
      setActivePersona('customer');
      setCustomerScreen(1);
      setSelectedCategory('offers');
    } else if (stepNum === 2) {
      setActivePersona('customer');
      setCustomerScreen(1);
      setSelectedCategory('bakery');
    } else if (stepNum === 3) {
      setActivePersona('customer');
      setCustomerScreen(2);
    } else if (stepNum === 4) {
      setActivePersona('merchant');
      setMerchantTab('kanban');
    } else if (stepNum === 5) {
      setActivePersona('rider');
      setRiderScreen(3);
    }
  };


  // Filter products by category and search
  const filteredProducts = DEMO_PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.nameAr.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="demo" className="py-16 sm:py-24 bg-slate-950 relative overflow-hidden border-t border-slate-800/80 font-demo">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[350px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تجربة النظام التفاعلية' : 'Interactive Product Demo'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {isRtl ? 'تجربة ثلاثية تفاعلية: العميل • الكاشير • المندوب' : '3-Way Realtime Experience: Customer • POS • Runner'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            {isRtl
              ? 'محاكاة تفاعلية فورية. اتبع المؤشرات الدائرية المضيئة لاستكشاف دورة الطلب والتوصيل بالكامل.'
              : 'Interactive device simulation. Follow the subtle pulsating pointers to test ordering, POS packaging, and doorstep delivery.'}
          </p>
        </div>

        {/* GUIDED DEMO STEP-BY-STEP CONTROL BAR (5 Steps) */}
        {showGuidedTour && (
          <div className="max-w-4xl mx-auto bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs">
                  {guidedStep}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      {isRtl ? `الخطوة ${guidedStep} من 5 • جولة إرشادية` : `Interactive Tour • Step ${guidedStep} of 5`}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <h4 className="text-sm font-black text-white">
                    {guidedStep === 1 && (isRtl ? '١. استكشف العروض الخاصة وأضف للسلة' : '1. Special Offers & Super Bundles (Up to 50% Off)')}
                    {guidedStep === 2 && (isRtl ? '٢. تصفح فئات البقالة (مخبوزات، ألبان، تموين)' : '2. Category Switch (Fresh Bakery & Dairy)')}
                    {guidedStep === 3 && (isRtl ? '٣. فعّل حساب الدفتر الشهري (الخاتا)' : '3. Enable Monthly Khata Credit Tab')}
                    {guidedStep === 4 && (isRtl ? '٤. كاشير البقالة وتجهيز الدفعة للمصعد' : '4. POS Kanban & Dispatch to Elevator')}
                    {guidedStep === 5 && (isRtl ? '٥. تسليم المندوب عند الباب وحساب الفكة' : '5. Rider Doorstep Delivery & Cash Change')}
                  </h4>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                    isAutoPlaying
                      ? 'bg-amber-500 text-slate-950 border border-amber-400'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50'
                  }`}
                >
                  {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isAutoPlaying ? (isRtl ? 'إيقاف مؤقت' : 'Pause Tour') : (isRtl ? 'تشغيل تلقائي' : 'Auto-Play')}</span>
                </button>

                <button
                  onClick={() => handleSelectGuidedStep(1)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Reset Demo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5 Step Indicator Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
              {[
                { step: 1, label: isRtl ? '🔥 1. عروض خاصة' : '🔥 1. Offers' },
                { step: 2, label: isRtl ? '🍞 2. فئات المنتجات' : '🍞 2. Categories' },
                { step: 3, label: isRtl ? '📒 3. دفتر الخاتا' : '📒 3. Khata Tab' },
                { step: 4, label: isRtl ? '💻 4. كاشير وتجهيز' : '💻 4. POS Dispatch' },
                { step: 5, label: isRtl ? '🚴 5. توصيل وفكة' : '🚴 5. Rider Delivery' }
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => handleSelectGuidedStep(item.step)}
                  className={`px-2.5 py-1.5 rounded-xl text-left text-[11px] font-bold border transition-all ${
                    guidedStep === item.step
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3 Focused Persona Switcher (Customer | Merchant POS | Rider) */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl gap-1 max-w-full">
            <button
              onClick={() => {
                setActivePersona('customer');
                setIsAutoPlaying(false);
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePersona === 'customer'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isRtl ? '١. تجربة العميل (هاتف)' : '1. Customer App'}</span>
            </button>

            <button
              onClick={() => {
                setActivePersona('merchant');
                setIsAutoPlaying(false);
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePersona === 'merchant'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span>{isRtl ? '٢. كاشير البقالة (تابلت)' : '2. Merchant POS'}</span>
            </button>

            <button
              onClick={() => {
                setActivePersona('rider');
                setIsAutoPlaying(false);
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePersona === 'rider'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>{isRtl ? '٣. تطبيق المندوب (هاتف)' : '3. Runner App'}</span>
            </button>
          </div>
        </div>

        {/* Global Micro Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border-2 border-white/40"
            >
              <CheckCircle2 className="w-4 h-4 fill-slate-950 text-emerald-300" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            TAB 1: CUSTOMER PERSONA (Fixed 375px x 720px Phone)
            ========================================================================= */}
        {activePersona === 'customer' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Column: Fixed Phone Mockup */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              
              {/* Screen Step Navigation Pills */}
              <div className="flex items-center gap-2 mb-3 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setCustomerScreen(1)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    customerScreen === 1 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? '١. الكتالوج والطلب' : '1. Catalogue'}
                </button>
                <button
                  onClick={() => setCustomerScreen(2)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    customerScreen === 2 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? '٢. السلة والدفتر' : '2. Cart & Khata'}
                </button>
                <button
                  onClick={() => setCustomerScreen(3)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    customerScreen === 3 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRtl ? '٣. تتبع المصعد الفوري' : '3. Elevator Tracking'}
                </button>
              </div>

              {/* STRICTLY FIXED REAL SMARTPHONE FRAME: 375px x 720px */}
              <DevicePhoneFrame statusBarTitle="Al Medina Baqala">
                
                {/* Top Store Identity Bar */}
                <div className="px-3.5 py-2 bg-slate-900/95 border-b border-slate-800/90 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
                      🏪
                    </div>
                    <div>
                      <div className="font-black text-xs text-white leading-tight">Al Medina Supermarket</div>
                      <div className="text-[9px] text-emerald-400 font-bold">● Open • Marina Pinnacle Tower (GF)</div>
                    </div>
                  </div>

                  {/* Cart Trigger Badge with Micro-bounce */}
                  <button
                    onClick={() => setCustomerScreen(2)}
                    className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-90"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-400" />
                    {totalCartCount > 0 && (
                      <motion.span
                        key={totalCartCount}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-md"
                      >
                        {totalCartCount}
                      </motion.span>
                    )}
                  </button>
                </div>

                {/* SCREEN 1: REAL UAE GROCERY CATALOGUE */}
                {customerScreen === 1 && (
                  <div className="flex-1 flex flex-col p-3 space-y-3">
                    
                    {/* Search Input Bar */}
                    <div className="relative shrink-0">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isRtl ? 'ابحث عن حليب، خبز، أرز، زيت...' : 'Search milk, bread, rice, water...'}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* 8 Category Slider Tabs */}
                    <div className="relative shrink-0">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {DEMO_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              if (guidedStep === 2) {
                                setGuidedStep(3);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold whitespace-nowrap flex items-center gap-1 border transition-all ${
                              selectedCategory === cat.id
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                : cat.isSpecial
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{isRtl ? cat.nameAr : cat.nameEn}</span>
                          </button>
                        ))}
                      </div>

                      {/* Guided Gesture for Category Switch (Step 2) */}
                      {guidedStep === 2 && (
                        <div className="absolute -top-1 left-28 z-40">
                          <GesturePointer
                            actionText={isRtl ? 'انقر' : 'click'}
                            label={isRtl ? 'تصفح المخبوزات' : 'Explore Bakery'}
                            subLabel={isRtl ? 'تغيير الفئة' : 'Switch category'}
                            pulseColor="sky"
                            hintPosition="bottom"
                            onClick={() => {
                              setSelectedCategory('bakery');
                              showToast(isRtl ? 'تم الانتقال للمخبوزات' : 'Browsing Bakery');
                              setTimeout(() => {
                                setGuidedStep(3);
                                setCustomerScreen(2);
                              }, 900);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Special Offers Promotional Highlight Banner */}
                    {selectedCategory === 'offers' && (
                      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-emerald-500/20 border border-amber-400/40 shrink-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-black text-[11px] text-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                            <span>{isRtl ? 'عروض وباقات التوفير اليومية' : 'Daily Baqala Flash Deals & Combos'}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[8px] animate-pulse">
                            {isRtl ? 'وفر حتى ٥٠٪' : 'SAVE UP TO 50%'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-300">
                          <span>{isRtl ? 'أسعار مخفضة حصرياً لسكان البرج' : 'Exclusive tower resident discounted combos'}</span>
                          <span className="font-mono font-bold text-amber-400">⏳ Ends in 02:45:10</span>
                        </div>
                      </div>
                    )}

                    {/* Real Product Cards Grid with Exact AED Prices */}
                    <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-0.5">
                      {filteredProducts.map((product, idx) => {
                        const inCartQty = cart[product.id] || 0;
                        const isFirstOffer = idx === 0 && (selectedCategory === 'offers' || selectedCategory === 'dairy');

                        return (
                          <motion.div
                            key={product.id}
                            layout
                            className={`p-2.5 rounded-2xl bg-slate-900/90 border transition-all relative flex items-center justify-between gap-2.5 ${
                              product.isSpecialOffer
                                ? 'border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/10 to-slate-900 shadow-sm'
                                : 'border-slate-800/80 hover:border-slate-700'
                            } ${
                              lastAddedId === product.id
                                ? 'border-emerald-400 ring-1 ring-emerald-400/50 bg-emerald-950/20'
                                : ''
                            }`}
                          >
                            {/* Guided Gesture for Add to Cart (Step 1) */}
                            {guidedStep === 1 && isFirstOffer && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40">
                                <GesturePointer
                                  actionText={isRtl ? 'انقر' : 'click'}
                                  label={isRtl ? 'أضف عرض الفطور' : 'Add Breakfast Combo'}
                                  subLabel={isRtl ? 'انقر للإضافة' : 'Click to add to cart'}
                                  pulseColor="emerald"
                                  hintPosition="left"
                                  onClick={() => handleAddToCart(product)}
                                />
                              </div>
                            )}

                            {/* Product Visual & Details */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 relative">
                                {product.imageEmoji}
                                {product.discountPercent && (
                                  <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-rose-600 text-white font-black text-[7px] leading-tight shadow">
                                    -{product.discountPercent}%
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {product.offerBadgeEn ? (
                                    <span className="text-[8px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded uppercase tracking-wider font-mono">
                                      {isRtl ? product.offerBadgeAr : product.offerBadgeEn}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                      {product.brand}
                                    </span>
                                  )}
                                  {product.isSale && !product.offerBadgeEn && (
                                    <span className="text-[8px] font-black bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30">
                                      SALE
                                    </span>
                                  )}
                                  {product.lowStock && (
                                    <span className="text-[8px] font-black bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                                      {product.lowStock} left
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-extrabold text-xs text-white truncate leading-tight pt-0.5">
                                  {isRtl ? product.nameAr : product.nameEn}
                                </h5>
                                <div className="flex items-center gap-2 text-[10px] pt-0.5">
                                  <span className="font-mono font-black text-emerald-400 text-xs">
                                    {product.price.toFixed(2)} AED
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-slate-500 line-through text-[9px]">
                                      {product.originalPrice.toFixed(2)}
                                    </span>
                                  )}
                                  <span className="text-slate-400 text-[9px]">
                                    • {isRtl ? product.unitAr : product.unitEn}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 shrink-0">
                              {inCartQty > 0 ? (
                                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700 p-0.5">
                                  <button
                                    onClick={() => handleRemoveFromCart(product.id)}
                                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center font-mono font-black text-xs text-emerald-400">
                                    {inCartQty}
                                  </span>
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center active:scale-90"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md active:scale-95 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{isRtl ? 'إضافة' : 'Add'}</span>
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Bottom Sticky Checkout Preview Bar */}
                    <div className="pt-2 border-t border-slate-800 shrink-0 relative">
                      {/* Guided Gesture for Review Cart (Step 3 transition if still on screen 1) */}
                      {guidedStep === 3 && customerScreen === 1 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40">
                          <GesturePointer
                            actionText={isRtl ? 'انقر' : 'click'}
                            label={isRtl ? 'متابعة الدفع والدفتر' : 'Review Cart & Khata'}
                            subLabel={isRtl ? 'فتح السلة' : 'Open cart'}
                            pulseColor="amber"
                            hintPosition="top"
                            onClick={() => setCustomerScreen(2)}
                          />
                        </div>
                      )}

                      <button
                        onClick={() => setCustomerScreen(2)}
                        className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-between shadow-lg shadow-emerald-950/60 transition active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-[10px]">
                            {totalCartCount} {isRtl ? 'منتجات' : 'items'}
                          </span>
                          <span>{isRtl ? 'متابعة الدفع والدفتر' : 'Review Cart & Khata'}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-sm">
                          <span>{grandTotal.toFixed(2)} AED</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 2: CART & KHATA LEDGER TAB */}
                {customerScreen === 2 && (
                  <div className="flex-1 flex flex-col p-3.5 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <div className="font-black text-xs text-white">
                        {isRtl ? 'سلة الطلب والمحاسبة' : 'Order Basket (Unit 1402)'}
                      </div>
                      <button
                        onClick={() => setCustomerScreen(1)}
                        className="text-[10px] text-emerald-400 font-bold hover:underline"
                      >
                        + {isRtl ? 'إضافة أصناف' : 'Add More'}
                      </button>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar max-h-48">
                      {cartItems.map(({ product, qty }) => (
                        <div
                          key={product.id}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{product.imageEmoji}</span>
                            <div className="truncate">
                              <div className="font-bold text-white text-[11px] truncate">
                                {isRtl ? product.nameAr : product.nameEn}
                              </div>
                              <div className="text-[9px] text-slate-400">
                                {qty} × {product.price.toFixed(2)} AED
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-black text-emerald-400 text-xs">
                            {(product.price * qty).toFixed(2)} AED
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* KHATA CREDIT LEDGER SWITCH (Step 3 Focus) */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 relative">
                      {/* Guided Gesture for Khata Toggle (Step 3) */}
                      {guidedStep === 3 && (
                        <div className="absolute right-6 top-2 z-40">
                          <GesturePointer
                            actionText={isRtl ? 'انقر' : 'click'}
                            label={isRtl ? 'تفعيل دفتر الخاتا' : 'Enable Khata Tab'}
                            subLabel={isRtl ? 'انقر للتفعيل' : 'Click to toggle credit'}
                            pulseColor="amber"
                            hintPosition="left"
                            onClick={() => {
                              setPayLaterActive(true);
                              showToast(isRtl ? 'تم تفعيل دفتر الخاتا لسكان البرج!' : 'Resident Khata Credit Tab Enabled!');
                              setTimeout(() => {
                                setGuidedStep(4);
                                setActivePersona('merchant');
                                setMerchantTab('kanban');
                              }, 1100);
                            }}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📒</span>
                          <div>
                            <div className="font-black text-xs text-amber-200">
                              {isRtl ? 'سجل في دفتر الحساب (الخاتا)' : 'Monthly Khata Credit Tab'}
                            </div>
                            <div className="text-[9px] text-amber-400/80">
                              {isRtl ? 'سدد نهاية الشهر عبر واتساب' : 'Pay at end of month via WhatsApp link'}
                            </div>
                          </div>
                        </div>

                        {/* Switch Toggle */}
                        <button
                          onClick={() => {
                            setPayLaterActive(!payLaterActive);
                            if (guidedStep === 3) {
                              setGuidedStep(4);
                              setActivePersona('merchant');
                              setMerchantTab('kanban');
                            }
                          }}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                            payLaterActive ? 'bg-amber-500' : 'bg-slate-700'
                          }`}
                        >
                          <motion.div
                            animate={{ x: payLaterActive ? 20 : 0 }}
                            className="w-5 h-5 rounded-full bg-slate-950 shadow-md"
                          />
                        </button>
                      </div>

                      {/* Khata Balance Meter */}
                      {payLaterActive && (
                        <div className="pt-2 border-t border-amber-500/20 text-[10px] space-y-1">
                          <div className="flex justify-between text-amber-300 font-bold">
                            <span>{isRtl ? 'رصيد الحساب المستخدم:' : 'Used Credit (Marina Cl. A):'}</span>
                            <span className="font-mono">145.50 / 800.00 AED</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                            <div className="w-[18%] h-full bg-amber-400 rounded-full" />
                          </div>
                          <div className="text-[9px] text-emerald-400 font-bold">
                            ✓ {isRtl ? 'الائتمان معتمد وموثق لدى البقالة' : 'Verified Resident Credit Limit Active'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Summary & Dispatch Action */}
                    <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>{isRtl ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                        <span className="font-mono">{cartSubtotal.toFixed(2)} AED</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>{isRtl ? 'توصيل المصعد (الطابق 14):' : 'Elevator Runner (Floor 14):'}</span>
                        <span className="font-mono text-emerald-400">
                          {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toFixed(2)} AED`}
                        </span>
                      </div>
                      <div className="flex justify-between font-black text-white text-sm pt-1 border-t border-slate-800/80">
                        <span>{isRtl ? 'المجموع الكلي:' : 'Total Amount:'}</span>
                        <span className="font-mono text-emerald-400">{grandTotal.toFixed(2)} AED</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        showToast(isRtl ? 'تم إرسال الطلب للبقالة عبر واتساب!' : 'Order sent to Baqala via WhatsApp!');
                        setCustomerScreen(3);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {payLaterActive
                          ? (isRtl ? 'تأكيد الطلب وتسجيله على الدفتر' : 'Place Order on Khata Tab')
                          : (isRtl ? 'طلب الآن والدفع عند الباب' : 'Order Now • Pay at Door')}
                      </span>
                    </button>
                  </div>
                )}

                {/* SCREEN 3: LIVE ELEVATOR DISPATCH & TRACKING */}
                {customerScreen === 3 && (
                  <div className="flex-1 flex flex-col p-4 space-y-4 justify-between">
                    <div className="space-y-3 text-center">
                      <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-2xl animate-pulse">
                        🛗
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                          <span>{isRtl ? 'المندوب في المصعد' : 'Runner In Elevator'}</span>
                        </div>
                        <h4 className="font-black text-base text-white pt-1">
                          {isRtl ? 'الطلب في طريقه للطابق 14' : 'Arriving at Floor 14 in 4 mins'}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {isRtl ? 'المندوب أحمد يجمع 3 طلبات لنفس البرج' : 'Runner Ahmed is grouped with 2 other Marina Pinnacle stops.'}
                        </p>
                      </div>

                      {/* Animated Elevator Floor Tracker */}
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-[11px] font-mono text-slate-300 font-bold">
                          <span>Ground Floor</span>
                          <span className="text-emerald-400 font-black animate-pulse">Floor 10 of 14</span>
                          <span>Unit 1402</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                          <motion.div
                            animate={{ width: ['20%', '70%', '100%'] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActivePersona('merchant');
                        setMerchantTab('kanban');
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <span>{isRtl ? 'عرض شاشة الكاشير لهذا الطلب ➔' : 'View Merchant POS Screen ➔'}</span>
                    </button>
                  </div>
                )}
              </DevicePhoneFrame>
            </div>

            {/* Right Column: Customer Value Highlights */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {isRtl ? 'تجربة المتجر الرقمي' : 'WhatsApp-Native Commerce'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {isRtl ? 'طلب البقالة في أقل من 30 ثانية' : '30-Second Ordering with Zero Friction'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isRtl
                    ? 'بدون تحميل تطبيقات ثقيلة أو تسجيل بطاقات معقد. العميل يطلب من الرابط أو واتساب مباشرة ويسجل على حسابه الشهري.'
                    : 'No app download required. Residents order in 30 seconds via WhatsApp catalog link with instant monthly building credit tab.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">
                      {isRtl ? 'كتالوج البقالة الحقيقي' : 'Full Hyperlocal Grocery Catalogue'}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'أصناف البقالة المألوفة مع أسعار الدرهم الدقيقة ومخزون حي.' : 'Common UAE pantry essentials, fresh dairy, bakery, and snacks with live stock.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">
                      {isRtl ? 'دفتر الخاتا الموثوق' : 'ACID-Compliant Digital Khata Tab'}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'تسجيل فوري للديون الشهرية مع إشعارات واتساب تلقائية وسداد إلكتروني.' : 'Residents pay at month-end. Zero unrecorded slips, automated WhatsApp receipts.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">
                      {isRtl ? 'توصيل المصاعد السريع' : 'Elevator Runner Dispatch'}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'تجميع ذكي لطلبات البرج الواحد لتسريع التوصيل إلى باب الشقة.' : 'Orders batched by tower floor to minimize elevator cycles and arrive in 15 mins.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            TAB 2: MERCHANT POS PERSONA (Fixed 860px x 560px Tablet)
            ========================================================================= */}
        {activePersona === 'merchant' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* STRICTLY FIXED REAL COUNTERTOP POS TABLET FRAME */}
            <DeviceTabletFrame
              storeName="Al Medina Supermarket (Marina Pinnacle)"
              terminalId="POS-01"
              headerControls={
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setMerchantTab('kanban')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      merchantTab === 'kanban' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isRtl ? 'تجميع الطلبات' : '1. Kanban'}
                  </button>
                  <button
                    onClick={() => setMerchantTab('register')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      merchantTab === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isRtl ? 'نقطة البيع السريعة' : '2. Register'}
                  </button>
                  <button
                    onClick={() => setMerchantTab('inventory')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      merchantTab === 'inventory' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isRtl ? 'المخزون' : '3. Inventory'}
                  </button>
                  <button
                    onClick={() => setMerchantTab('khata')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      merchantTab === 'khata' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isRtl ? 'دفتر الخاتا' : '4. Khata Ledger'}
                  </button>
                </div>
              }
            >
              {/* TAB 2.1: KANBAN ELEVATOR DISPATCH BOARD */}
              {merchantTab === 'kanban' && (
                <div className="flex-1 flex flex-col space-y-4">
                  
                  {/* Top Notification Bar */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span>{isRtl ? 'تجميع ذكي لبرج مارينا بيناكل: 3 طلبات جاهزة لرحلة مصعد واحدة' : 'Marina Pinnacle Elevator Batch: 3 orders grouped for single elevator run'}</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsPrintingReceipt(true);
                        setTimeout(() => setIsPrintingReceipt(false), 2500);
                        showToast(isRtl ? 'تمت طباعة إيصال المصعد الحراري!' : 'Printed 3-Stop Elevator Run Slip!');
                      }}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'طباعة تذكرة المصعد' : 'Print Batch Slip'}</span>
                    </button>
                  </div>

                  {/* 3 Kanban Columns */}
                  <div className="grid grid-cols-3 gap-3.5 flex-1">
                    
                    {/* COL 1: NEW WHATSAPP ORDERS */}
                    <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex flex-col space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs font-black">
                        <span className="text-sky-400">Incoming WhatsApp (2)</span>
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                      </div>

                      {/* Order Card #001 */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-emerald-500/50 transition">
                        <div className="flex justify-between items-center font-mono text-xs font-black">
                          <span className="text-white">#ORD-001 • Unit 1402</span>
                          <span className="text-emerald-400">87.50 AED</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          1x Al Rawabi Milk 2L, 2x Khubz, 1x Eggs
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[9px]">
                          <span className="font-bold text-amber-400">📒 Khata Tab Approved</span>
                          <span className="text-slate-400 font-mono">1 min ago</span>
                        </div>
                      </div>

                      {/* Order Card #002 */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 opacity-80">
                        <div className="flex justify-between items-center font-mono text-xs font-black">
                          <span className="text-white">#ORD-002 • Unit 0704</span>
                          <span className="text-emerald-400">34.00 AED</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          6x Mai Dubai Water, Biscuits
                        </div>
                        <div className="text-[9px] text-slate-400">Paid Card • Stop 1</div>
                      </div>
                    </div>

                    {/* COL 2: PACKING / READY FOR RUNNER */}
                    <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex flex-col space-y-2 relative">
                      {/* Guided Gesture on Step 4 */}
                      {guidedStep === 4 && (
                        <div className="absolute -top-3 right-4 z-40">
                          <GesturePointer
                            actionText={isRtl ? 'انقر' : 'click'}
                            label={isRtl ? 'تفويج المندوب أحمد' : 'Dispatch Runner'}
                            subLabel={isRtl ? 'انقر للتفويج' : 'Click to batch dispatch'}
                            pulseColor="emerald"
                            hintPosition="bottom"
                            onClick={() => {
                              showToast(isRtl ? 'تم إرسال المندوب أحمد لتوصيل الدفعة B-14!' : 'Runner Ahmed dispatched with Batch B-14!');
                              setTimeout(() => {
                                setGuidedStep(5);
                                setActivePersona('rider');
                                setRiderScreen(3);
                              }, 1100);
                            }}
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs font-black">
                        <span className="text-amber-400">Packed &amp; Staged (1)</span>
                        <Package className="w-3.5 h-3.5 text-amber-400" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
                        <div className="flex justify-between items-center font-mono text-xs font-black">
                          <span className="text-white">Batch #B-14 (3 Stops)</span>
                          <span className="text-amber-400 font-mono">Floors 7, 14, 22</span>
                        </div>
                        <div className="text-[10px] text-slate-300">
                          Total 3 orders bagged in Thermal Tote A
                        </div>
                        <button
                          onClick={() => {
                            showToast(isRtl ? 'تم إرسال المندوب أحمد لتوصيل الدفعة B-14!' : 'Runner Ahmed dispatched with Batch B-14!');
                            if (guidedStep === 4) {
                              setGuidedStep(5);
                              setActivePersona('rider');
                              setRiderScreen(3);
                            }
                          }}
                          className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow"
                        >
                          <Bike className="w-3 h-3" />
                          <span>Dispatch Runner Ahmed ➔</span>
                        </button>
                      </div>
                    </div>

                    {/* COL 3: DELIVERED TODAY */}
                    <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex flex-col space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs font-black">
                        <span className="text-emerald-400">Completed (48)</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>

                      <div className="space-y-1.5 overflow-y-auto no-scrollbar max-h-48 text-[11px]">
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-slate-300">
                          <span>#ORD-998 • Unit 1802</span>
                          <span className="font-mono text-emerald-400 font-bold">52.00 AED ✓</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-slate-300">
                          <span>#ORD-997 • Unit 1105</span>
                          <span className="font-mono text-emerald-400 font-bold">112.50 AED ✓</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-slate-300">
                          <span>#ORD-996 • Unit 0401</span>
                          <span className="font-mono text-emerald-400 font-bold">28.00 AED ✓</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2.2: REGISTER QUICK POS */}
              {merchantTab === 'register' && (
                <div className="flex-1 grid grid-cols-12 gap-4">
                  {/* Left Fast Items Grid */}
                  <div className="col-span-8 space-y-2">
                    <div className="text-xs font-black text-slate-300">Fast Touch Counter Items</div>
                    <div className="grid grid-cols-3 gap-2">
                      {DEMO_PRODUCTS.slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => showToast(`Added ${item.nameEn} to counter register`)}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition flex flex-col justify-between h-20"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-lg">{item.imageEmoji}</span>
                            <span className="font-mono font-black text-emerald-400 text-xs">
                              {item.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="font-bold text-white text-[11px] truncate">
                            {item.nameEn}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right POS Keypad & Total */}
                  <div className="col-span-4 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Current Counter Bill</div>
                      <div className="text-2xl font-black font-mono text-emerald-400 pt-1">37.25 AED</div>
                      <div className="text-[10px] text-slate-400">3 items scanned via USB Gun</div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-xs font-mono font-bold">
                      {['1','2','3','4','5','6','7','8','9','C','0','.'].map((k) => (
                        <button
                          key={k}
                          className="py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800"
                        >
                          {k}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => showToast('Counter sale completed & receipt printed')}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs"
                    >
                      Cash Tender (Exact)
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2.3: INVENTORY LIVE TRACKER */}
              {merchantTab === 'inventory' && (
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-white">Live Store Inventory &amp; Expiry Monitor</span>
                    <span className="text-[11px] text-emerald-400 font-bold">Barcode Scanner USB Ready</span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-900/60">
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5">Stock</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Quick Stock (+10)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {DEMO_PRODUCTS.slice(0, 5).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/40">
                            <td className="p-2.5 font-bold text-white flex items-center gap-2">
                              <span>{p.imageEmoji}</span>
                              <span>{p.nameEn}</span>
                            </td>
                            <td className="p-2.5 text-slate-400 uppercase text-[10px]">{p.category}</td>
                            <td className="p-2.5 font-mono text-emerald-400">{p.price.toFixed(2)} AED</td>
                            <td className="p-2.5 font-mono font-bold text-white">
                              {merchantStock[p.id] || 12} units
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                In Stock
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => {
                                  setMerchantStock((prev) => ({
                                    ...prev,
                                    [p.id]: (prev[p.id] || 12) + 10
                                  }));
                                  showToast(`Added +10 units to ${p.nameEn}`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold"
                              >
                                +10 Units
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2.4: DIGITAL KHATA COMMUNITY LEDGER */}
              {merchantTab === 'khata' && (
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-black text-white">Residential Building Credit Ledger (Khata)</span>
                      <div className="text-[10px] text-slate-400">Marina Pinnacle Tower • 42 Active Tabs</div>
                    </div>
                    <div className="font-mono font-black text-amber-400 text-sm">
                      Total Ledger: 8,450.00 AED
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-900/60">
                          <th className="p-2.5">Unit / Resident</th>
                          <th className="p-2.5">Current Balance</th>
                          <th className="p-2.5">Credit Limit</th>
                          <th className="p-2.5">Last Order</th>
                          <th className="p-2.5 text-right">1-Tap WhatsApp Bill</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        <tr className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-bold text-white">Unit 1402 (Tariq M.)</td>
                          <td className="p-2.5 font-mono text-amber-400 font-bold">145.50 AED</td>
                          <td className="p-2.5 font-mono text-slate-400">800.00 AED</td>
                          <td className="p-2.5 text-slate-400 text-[10px]">Today, 10:30 AM</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => showToast('Dispatched WhatsApp statement with 1-click payment link to Unit 1402')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                            >
                              Send Statement
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-bold text-white">Unit 1804 (Sarah K.)</td>
                          <td className="p-2.5 font-mono text-amber-400 font-bold">420.00 AED</td>
                          <td className="p-2.5 font-mono text-slate-400">1,000.00 AED</td>
                          <td className="p-2.5 text-slate-400 text-[10px]">Yesterday</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => showToast('Dispatched WhatsApp reminder to Unit 1804')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                            >
                              Send Statement
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-bold text-white">Unit 2208 (Dr. Imran)</td>
                          <td className="p-2.5 font-mono text-amber-400 font-bold">680.00 AED</td>
                          <td className="p-2.5 font-mono text-slate-400">1,500.00 AED</td>
                          <td className="p-2.5 text-slate-400 text-[10px]">2 days ago</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => showToast('Dispatched WhatsApp reminder to Unit 2208')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                            >
                              Send Statement
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </DeviceTabletFrame>
          </motion.div>
        )}

        {/* =========================================================================
            TAB 3: RIDER PERSONA (Fixed 375px x 720px Phone)
            ========================================================================= */}
        {activePersona === 'rider' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Column: Fixed Phone Mockup */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              
              {/* Screen Step Navigation */}
              <div className="flex items-center gap-2 mb-3 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setRiderScreen(1)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    riderScreen === 1 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Queue
                </button>
                <button
                  onClick={() => setRiderScreen(3)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    riderScreen === 3 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. Doorstep &amp; Change Calc
                </button>
                <button
                  onClick={() => setRiderScreen(4)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    riderScreen === 4 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3. Receipt Proof
                </button>
              </div>

              {/* STRICTLY FIXED REAL SMARTPHONE FRAME: 375px x 720px */}
              <DevicePhoneFrame theme={sunlightMode ? 'sunlight' : 'dark'} statusBarTitle="Rider Runner: Ahmed">
                
                {/* Top Sunlight Mode Bar */}
                <div className="px-3.5 py-2 flex items-center justify-between border-b border-slate-800/80 shrink-0">
                  <div className="flex items-center gap-1.5 font-black text-[11px]">
                    <Bike className={`w-4 h-4 ${sunlightMode ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span>Marina Run (Stop 1 of 3)</span>
                  </div>

                  <button
                    onClick={() => {
                      setSunlightMode(!sunlightMode);
                      showToast(sunlightMode ? 'Switched to Standard Mode' : '45°C High-Contrast Sunlight Mode Activated!');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] transition-all shadow-md ${
                      sunlightMode 
                        ? 'bg-amber-400 text-black border border-amber-300 animate-pulse' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>{sunlightMode ? '🌞 45°C SUNLIGHT ACTIVE' : '☀️ Sunlight Mode'}</span>
                  </button>
                </div>

                {/* SCREEN 1: ELEVATOR BATCH QUEUE */}
                {riderScreen === 1 && (
                  <div className="flex-1 p-3.5 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span>Marina Pinnacle Run</span>
                        <span className="text-emerald-400 font-mono">3 Orders</span>
                      </div>

                      <div
                        onClick={() => setRiderScreen(3)}
                        className={`p-3 rounded-2xl border cursor-pointer transition ${
                          sunlightMode
                            ? 'bg-black border-amber-400 text-amber-200'
                            : 'bg-slate-900 border-emerald-500/50 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex justify-between items-center font-black text-xs">
                          <span>#ORD-001 • Unit 1402</span>
                          <span className="font-mono text-emerald-400">87.50 AED</span>
                        </div>
                        <div className="text-[10px] opacity-80 pt-1">
                          1x Milk 2L, 2x Bread, 1x Eggs (Floor 14)
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800/80 text-[9px]">
                          <span className="font-bold text-amber-400">🚪 Leave at door</span>
                          <span className="text-emerald-400 font-bold">Stop 1 of 3</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 opacity-70">
                        <div className="flex justify-between font-black text-xs">
                          <span>#ORD-002 • Unit 1804</span>
                          <span className="font-mono">42.00 AED</span>
                        </div>
                        <div className="text-[9px] text-slate-400 pt-1">Stop 2 of 3 (Floor 18)</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setRiderScreen(3)}
                      className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 ${
                        sunlightMode ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <span>Arrived at Floor 14 (Unit 1402) ➔</span>
                    </button>
                  </div>
                )}

                {/* SCREEN 3: DOORSTEP SETTLEMENT & CASH TENDER CALCULATOR */}
                {riderScreen === 3 && (
                  <div className="flex-1 p-3.5 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <div>
                          <div className="font-black text-xs">Unit 1402 Doorstep</div>
                          <div className="text-[10px] text-amber-400 font-bold">🚪 Customer Note: Leave at door</div>
                        </div>
                        <div className="text-right font-black text-sm text-emerald-400">87.50 AED</div>
                      </div>

                      {/* Payment Method Selector */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPaymentMode('cash')}
                          className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                            paymentMode === 'cash'
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Cash Payment</span>
                        </button>
                        <button
                          onClick={() => setPaymentMode('card')}
                          className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                            paymentMode === 'card'
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Tap Card (POS)</span>
                        </button>
                      </div>

                      {/* Cash Tender Calculation Box */}
                      {paymentMode === 'cash' ? (
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative">
                          {/* Guided Gesture on Step 5 for Cash Change calculation */}
                          {guidedStep === 5 && (
                            <div className="absolute -top-3 right-4 z-40">
                              <GesturePointer
                                actionText={isRtl ? 'انقر' : 'click'}
                                label={isRtl ? 'حساب الفكة (استلام ١٠٠ درهم)' : 'Tender 100 AED & Compute Change'}
                                subLabel={isRtl ? 'احسب الفكة' : 'Compute change'}
                                pulseColor="amber"
                                hintPosition="bottom"
                                onClick={() => {
                                  setTenderedAmount(100);
                                  showToast(isRtl ? 'تم حساب الفكة: إرجاع ١٢.٥٠ درهم للمشتري' : 'Change computed: Return 12.50 AED to customer');
                                  setTimeout(() => {
                                    setRiderScreen(4);
                                    showToast(isRtl ? 'تم إرسال إيصال واتساب للعميل بنجاح!' : 'WhatsApp receipt sent to resident!');
                                    setTimeout(() => {
                                      setGuidedStep(1);
                                      setActivePersona('customer');
                                      setCustomerScreen(1);
                                      setSelectedCategory('offers');
                                    }, 2000);
                                  }, 1000);
                                }}
                              />
                            </div>
                          )}

                          <div className="flex justify-between text-[11px] font-bold">
                            <span>Amount Tendered:</span>
                            <span className="font-mono text-white text-xs">{tenderedAmount}.00 AED</span>
                          </div>

                          <div className="flex gap-1.5">
                            {[87.5, 100, 200].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => setTenderedAmount(amt)}
                                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                                  tenderedAmount === amt
                                    ? 'bg-amber-400 text-black border-amber-300 font-black'
                                    : 'bg-slate-900 text-slate-300 border-slate-700'
                                }`}
                              >
                                {amt === 87.5 ? 'Exact' : `${amt} AED`}
                              </button>
                            ))}
                          </div>

                          {/* Instant Change Return Math */}
                          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex justify-between items-center text-xs font-bold">
                            <span className="text-emerald-300">Change to Return to Customer:</span>
                            <span className="font-mono text-emerald-400 text-sm font-black">
                              {(tenderedAmount - 87.50).toFixed(2)} AED
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                          <CreditCard className="w-6 h-6 mx-auto text-sky-400" />
                          <div className="font-bold text-xs">Tap Card on Mobile POS</div>
                          <div className="text-[10px] text-slate-400">Payment reconciled directly to store bank</div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        showToast(isRtl ? 'تم التسليم وإرسال إيصال واتساب بنجاح!' : 'Delivery completed & WhatsApp receipt dispatched');
                        setRiderScreen(4);
                        if (guidedStep === 5) {
                          setTimeout(() => {
                            setGuidedStep(1);
                            setActivePersona('customer');
                            setCustomerScreen(1);
                            setSelectedCategory('offers');
                          }, 2000);
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg ${
                        sunlightMode ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Dropoff &amp; WhatsApp Receipt</span>
                    </button>
                  </div>
                )}

                {/* SCREEN 4: WHATSAPP RECEIPT DISPATCHED */}
                {riderScreen === 4 && (
                  <div className="flex-1 p-4 flex flex-col justify-between text-center space-y-4">
                    <div className="space-y-3 pt-4">
                      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-2xl animate-bounce">
                        ✓
                      </div>
                      <h4 className="font-black text-sm text-white">Delivery Complete ✓</h4>
                      
                      <div className="p-3 rounded-2xl bg-[#0B141A] border border-emerald-500/30 text-left space-y-1 text-slate-200 shadow-md">
                        <div className="text-[10px] text-emerald-400 font-bold">WhatsApp Receipt Sent:</div>
                        <div className="text-[11px] font-mono text-slate-300">
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
                      Next Stop (#ORD-002 Floor 18) ➔
                    </button>
                  </div>
                )}

              </DevicePhoneFrame>
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

      </div>
    </section>
  );
};

