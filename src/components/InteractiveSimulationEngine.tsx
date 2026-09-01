import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShoppingBag,
  Store,
  Bike,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Coins,
  Building2,
  Sun,
  Moon,
  RefreshCw,
  ArrowRight,
  Volume2,
  Layers,
  Timer,
  Receipt,
  Wallet,
  ChevronDown,
  Plus,
  Minus,
  X,
  Undo2,
  Flame,
  Check,
  CreditCard,
  Banknote,
  SendHorizontal
} from 'lucide-react';
import { Language } from '../types';

interface Props {
  initialRole?: 'customer' | 'merchant' | 'rider';
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export function InteractiveSimulationEngine({
  initialRole = 'customer',
  isOpen,
  onClose,
  lang = 'en'
}: Props) {
  const [activeTab, setActiveTab] = useState<'customer' | 'merchant' | 'rider'>(initialRole);
  const [isArabic, setIsArabic] = useState(lang === 'ar');

  useEffect(() => {
    setActiveTab(initialRole);
  }, [initialRole]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                    {isArabic ? 'محرك التدريب والمحاكاة التفاعلي' : 'Interactive Simulation Arena'}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {isArabic ? 'تدريب فوري' : 'Live Practice'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  {isArabic
                    ? 'تعلم إدارة وتشغيل نظام الشوب والبقالة عبر حركات وتفاعلات بصرية فورية'
                    : 'Master neighborhood retail & tower logistics with micro-animations & spring physics'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsArabic(!isArabic)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                {isArabic ? 'English' : 'العربية'}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Role Navigation Pills */}
          <div className="flex items-center justify-around sm:justify-start gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'customer'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/30 scale-102'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isArabic ? '١. بطولة المتسوق (العميل)' : '1. Shopper Tournament'}</span>
            </button>

            <button
              onClick={() => setActiveTab('merchant')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'merchant'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-900/30 scale-102'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{isArabic ? '٢. تدريب كاشير البقالة' : '2. Baqala Boss POS'}</span>
            </button>

            <button
              onClick={() => setActiveTab('rider')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'rider'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30 scale-102'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>{isArabic ? '٣. رحلة طيار البرج (المندوب)' : '3. Tower Runner Quest'}</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-900/50">
            {activeTab === 'customer' && <CustomerSimulation isArabic={isArabic} />}
            {activeTab === 'merchant' && <MerchantSimulation isArabic={isArabic} />}
            {activeTab === 'rider' && <RiderSimulation isArabic={isArabic} />}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* =========================================================================
   1. 🛒 THE CUSTOMER TOURNAMENT (Simulated Shopper Mode)
   ========================================================================= */
function CustomerSimulation({ isArabic }: { isArabic: boolean }) {
  // Products in fils (integer)
  const items = [
    { id: 'almarai', name: 'Almarai Fresh Milk 2L', nameAr: 'حليب المراعي طازج ٢ لتر', fils: 1100, icon: '🥛' },
    { id: 'indomie', name: 'Indomie Special Curry 5pk', nameAr: 'إندومي كاري خاص ٥ قطع', fils: 750, icon: '🍜' },
    { id: 'lipton', name: 'Lipton Yellow Label 100s', nameAr: 'شاي ليبتون ١٠٠ كيس', fils: 1400, icon: '☕' }
  ];

  const towers = [
    { id: 'marina_crown', name: 'Marina Crown Tower', nameAr: 'برج مارينا كراون' },
    { id: 'princess_tower', name: 'Princess Tower', nameAr: 'برنسس تاور' },
    { id: 'elite_residence', name: 'Elite Residence', nameAr: 'إليت ريزيدنس' },
    { id: 'ocean_heights', name: 'Ocean Heights', nameAr: 'أوشن هايتس' },
    { id: '23_marina', name: '23 Marina Tower', nameAr: 'برج ٢٣ مارينا' }
  ];

  const [cartFils, setCartFils] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [flyingItem, setFlyingItem] = useState<{ icon: string; name: string; id: number } | null>(null);

  // Tower Dropdown Ripple State
  const [isTowerOpen, setIsTowerOpen] = useState(false);
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [flatNumber, setFlatNumber] = useState('');

  // Khata Coin Countdown State
  const [khataWalletFils, setKhataWalletFils] = useState(50000); // 500.00 AED
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleAddToCart = (item: typeof items[0]) => {
    // Trigger floating badge pull
    setFlyingItem({ icon: item.icon, name: isArabic ? item.nameAr : item.name, id: Date.now() });
    setTimeout(() => {
      setCartFils((prev) => prev + item.fils);
      setCartCount((prev) => prev + 1);
    }, 450);
  };

  const handleKhataPay = () => {
    if (cartFils === 0 || isCheckingOut) return;
    setIsCheckingOut(true);

    const targetWallet = Math.max(0, khataWalletFils - cartFils);
    const stepDuration = 30;
    const steps = 25;
    const diff = (khataWalletFils - targetWallet) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setKhataWalletFils((prev) => {
        const nextVal = Math.round(prev - diff);
        return nextVal < targetWallet ? targetWallet : nextVal;
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setKhataWalletFils(targetWallet);
        setIsCheckingOut(false);
        setCheckoutSuccess(true);
        setCartFils(0);
        setCartCount(0);
      }
    }, stepDuration);
  };

  const handleReset = () => {
    setCartFils(0);
    setCartCount(0);
    setFlyingItem(null);
    setSelectedTower(null);
    setFlatNumber('');
    setIsTowerOpen(false);
    setKhataWalletFils(50000);
    setCheckoutSuccess(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs">
            🛒 {isArabic ? 'محاكاة العميل' : 'Simulated Resident'}
          </div>
          <p className="text-xs text-emerald-200/90 font-medium">
            {isArabic
              ? 'جرّب سحب السلة الطافي، واختيار البرج التموجي، وعداد خصم رصيد الخاطر (الدفتر) التفاعلي.'
              : 'Test the spring-loaded cart pull, staggered tower ripple, and real-time Khata fils ticker.'}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-700 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isArabic ? 'إعادة التعيين' : 'Reset'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Col: Step 1 & Step 2 */}
        <div className="space-y-5">
          {/* STEP 1: Floating Cart Pull */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                {isArabic ? 'الميزة ١: السلة الطافية (Floating Pull)' : 'Feature 1: Floating Cart Pull'}
              </span>
              <div className="relative">
                <motion.div
                  key={cartCount}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md shadow-emerald-950"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{cartCount}</span>
                  <span className="text-[10px] text-emerald-200">
                    ({(cartFils / 100).toFixed(2)} AED)
                  </span>
                </motion.div>

                {/* Flying Item Badge Animation */}
                <AnimatePresence>
                  {flyingItem && (
                    <motion.div
                      key={flyingItem.id}
                      initial={{ opacity: 1, scale: 0.5, x: -100, y: 50 }}
                      animate={{
                        opacity: [1, 1, 0],
                        scale: [0.8, 1.3, 0.4],
                        x: 0,
                        y: 0
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow-xl flex items-center gap-1 pointer-events-none z-30"
                    >
                      <span>{flyingItem.icon}</span>
                      <span>+1</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {isArabic
                ? 'اضغط على أي صنف لمشاهدة الحركة الارتدادية نحو أيقونة السلة:'
                : 'Click any staple to watch the spring-loaded badge pop into the cart:'}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleAddToCart(item)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">
                        {isArabic ? item.nameAr : item.name}
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-extrabold">
                        {(item.fils / 100).toFixed(2)} AED
                      </p>
                    </div>
                  </div>
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white transition">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* STEP 2: The Tower Dropdown Ripple */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              {isArabic ? 'الميزة ٢: اختيار البرج والشقة التموجي' : 'Feature 2: Staggered Tower Ripple'}
            </span>

            <p className="text-xs text-slate-400 mb-3">
              {isArabic
                ? 'عند اختيار البرج يتمدد النموذج بحركة متدرجة ويظهر حقل الشقة فوراً:'
                : 'Selecting a residential tower triggers a staggered ripple and springs the flat input into view:'}
            </p>

            <div className="space-y-3">
              {/* Dropdown Button */}
              <div className="relative">
                <button
                  onClick={() => setIsTowerOpen(!isTowerOpen)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:border-slate-500 transition"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>
                      {selectedTower
                        ? towers.find((t) => t.id === selectedTower)?.[isArabic ? 'nameAr' : 'name']
                        : isArabic
                        ? 'اختر برج السكن...'
                        : 'Select Residential Tower...'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isTowerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Staggered Dropdown Menu */}
                <AnimatePresence>
                  {isTowerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-slate-800 border border-slate-700 rounded-xl p-1.5 shadow-xl space-y-1"
                    >
                      {towers.map((tower, idx) => (
                        <motion.button
                          key={tower.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={() => {
                            setSelectedTower(tower.id);
                            setIsTowerOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs font-bold flex items-center justify-between transition ${
                            selectedTower === tower.id
                              ? 'bg-amber-400 text-slate-950'
                              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <span>{isArabic ? tower.nameAr : tower.name}</span>
                          {selectedTower === tower.id && <Check className="w-3.5 h-3.5" />}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Slide-In Flat Unit Input */}
              <AnimatePresence>
                {selectedTower && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, x: 20 }}
                    animate={{ opacity: 1, height: 'auto', x: 0 }}
                    exit={{ opacity: 0, height: 0, x: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 280 }}
                    className="overflow-hidden"
                  >
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                      {isArabic ? 'رقم الشقة / الجناح' : 'Apartment / Flat Number'}
                    </label>
                    <input
                      type="text"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder={isArabic ? 'مثال: شقة ١٤٠٢ (طابق ١٤)' : 'e.g. Flat 1402 (14th Floor)'}
                      className="w-full p-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Col: STEP 3: Khata Coin Checkout Countdown */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
              <Coins className="w-3.5 h-3.5" />
              {isArabic ? 'الميزة ٣: عداد خصم دفتر الخاطر (Khata)' : 'Feature 3: Khata Fils Countdown Ticker'}
            </span>

            <p className="text-xs text-slate-400 mb-4">
              {isArabic
                ? 'عند الشراء على الحساب، يتقلص رصيد المحفظة مع عداد فلسات سريع يؤكد حركة الأموال بدقة:'
                : 'On 1-Tap Khata checkout, watch the digital balance scale down with rapid integer fils ticking:'}
            </p>

            {/* Digital Wallet Graphic */}
            <motion.div
              animate={{
                scale: isCheckingOut ? 0.96 : 1,
                borderColor: isCheckingOut ? '#fbbf24' : '#334155'
              }}
              transition={{ type: 'spring', damping: 15 }}
              className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700 rounded-2xl relative overflow-hidden shadow-inner mb-4"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-bold">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  {isArabic ? 'محفظة الدفتر المعتمدة' : 'Resident Khata Credit Line'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-extrabold">
                  {isArabic ? 'معتمد' : 'Pre-Approved'}
                </span>
              </div>

              {/* Large Animated Balance Ticker */}
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {(khataWalletFils / 100).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-amber-400">AED</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({khataWalletFils.toLocaleString()} {isArabic ? 'فلس' : 'fils'})
                </span>
              </div>

              {/* Countdown Ticker Bar */}
              {isCheckingOut && (
                <div className="mt-3">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.75, ease: 'linear' }}
                      className="h-full bg-amber-400"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 mt-1 block">
                    {isArabic ? 'جاري خصم الفلسات وتسجيل القيد في الدفتر...' : 'Deducting fils & writing ledger entry...'}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Order Summary & Button */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300 mb-4">
              <div className="flex justify-between">
                <span>{isArabic ? 'إجمالي السلة الحالي:' : 'Current Cart Subtotal:'}</span>
                <span className="font-bold text-white">{(cartFils / 100).toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between">
                <span>{isArabic ? 'الوجهة المحددة:' : 'Target Destination:'}</span>
                <span className="font-bold text-amber-300">
                  {selectedTower
                    ? `${towers.find((t) => t.id === selectedTower)?.[isArabic ? 'nameAr' : 'name']} ${
                        flatNumber ? `- ${flatNumber}` : ''
                      }`
                    : isArabic
                    ? 'لم يحدد بعد'
                    : 'Not Selected'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleKhataPay}
              disabled={cartFils === 0 || isCheckingOut}
              className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                cartFils > 0 && !isCheckingOut
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-950/50'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isCheckingOut
                  ? isArabic
                    ? 'جاري الخصم الفوري...'
                    : 'Processing Fils Ledger...'
                  : isArabic
                  ? `تأكيد الشراء على الحساب (${(cartFils / 100).toFixed(2)} د.إ)`
                  : `1-Tap Khata Credit (${(cartFils / 100).toFixed(2)} AED)`}
              </span>
            </motion.button>

            {checkoutSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {isArabic
                    ? 'تم تسجيل الطلب في دفتر الخاطر وإرسال إشعار الواتساب بنجاح!'
                    : 'Order recorded to Khata ledger & WhatsApp notification fired!'}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. 🏪 THE BAQALA BOSS PRACTICE RUN (Simulated Cashier/POS Mode)
   ========================================================================= */
function MerchantSimulation({ isArabic }: { isArabic: boolean }) {
  // Simulated Kanban Stage: 'placed' | 'packing' | 'delivered'
  const [orderStage, setOrderStage] = useState<'placed' | 'packing' | 'delivered'>('placed');
  const [isReceiptPrinting, setIsReceiptPrinting] = useState(false);
  const [showReceiptSheet, setShowReceiptSheet] = useState(false);

  // End-of-shift cash counting game
  const expectedFils = 48550; // 485.50 AED
  const [countedFils, setCountedFils] = useState<number>(0);
  const [countHistory, setCountHistory] = useState<number[]>([]);
  const [activeBounceDenom, setActiveBounceDenom] = useState<string | null>(null);

  const denominations = [
    { label: '100 AED', fils: 10000, type: 'note', color: 'from-pink-600 to-rose-700' },
    { label: '50 AED', fils: 5000, type: 'note', color: 'from-purple-600 to-indigo-700' },
    { label: '20 AED', fils: 2000, type: 'note', color: 'from-blue-600 to-cyan-700' },
    { label: '10 AED', fils: 1000, type: 'note', color: 'from-emerald-600 to-teal-700' },
    { label: '5 AED', fils: 500, type: 'note', color: 'from-amber-600 to-amber-700' },
    { label: '1 AED', fils: 100, type: 'coin', color: 'from-amber-400 to-amber-500' },
    { label: '50F', fils: 50, type: 'coin', color: 'from-slate-300 to-slate-400' },
    { label: '25F', fils: 25, type: 'coin', color: 'from-slate-400 to-slate-500' }
  ];

  const handleAddDenom = (denom: typeof denominations[0]) => {
    setActiveBounceDenom(denom.label);
    setCountedFils((prev) => prev + denom.fils);
    setCountHistory((prev) => [...prev, denom.fils]);
    setTimeout(() => setActiveBounceDenom(null), 250);
  };

  const handleUndo = () => {
    if (countHistory.length === 0) return;
    const last = countHistory[countHistory.length - 1];
    setCountedFils((prev) => Math.max(0, prev - last));
    setCountHistory((prev) => prev.slice(0, -1));
  };

  const handlePrintReceipt = () => {
    setIsReceiptPrinting(true);
    setShowReceiptSheet(false);
    setTimeout(() => {
      setIsReceiptPrinting(false);
      setShowReceiptSheet(true);
    }, 600);
  };

  const varianceFils = countedFils - expectedFils;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs">
            🏪 {isArabic ? 'محاكاة كاشير البقالة' : 'Simulated Cashier POS'}
          </div>
          <p className="text-xs text-amber-200/90 font-medium">
            {isArabic
              ? 'تدرب على توجيه رادار الطلبات عبر أعمدة كانبان، واستخراج الإيصال الحراري، ولعبة مطابقة صندوق النقد.'
              : 'Master the pulsing radar order chime, spool thermal receipts, and play the tactile cash reconciliation game.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Col: Radar Chime & Receipt Spool */}
        <div className="space-y-5">
          {/* STEP 1: Radar Chime Order Response */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
              <Volume2 className="w-3.5 h-3.5" />
              {isArabic ? 'الميزة ١: رادار وصول الطلبات (Radar Response)' : 'Feature 1: Pulsing Radar Response'}
            </span>

            <p className="text-xs text-slate-400 mb-3">
              {isArabic
                ? 'عند وصول طلب جديد، ينبض الكرت بتوهج دائري. اضغط "قبول" لنقله بسلاسة لعمود التجهيز:'
                : 'Card pulses with radial radar rings. Tap ACCEPT to glide it into the PACKING lane:'}
            </p>

            {/* Kanban Mini Board */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 min-h-[140px]">
              {/* Placed Column */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                  {isArabic ? 'طلبات جديدة (New)' : 'New Orders'}
                </span>
                <AnimatePresence mode="popLayout">
                  {orderStage === 'placed' && (
                    <motion.div
                      layoutId="sim-order-card"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="p-2.5 bg-slate-800 border-2 border-amber-400 rounded-xl relative shadow-lg shadow-amber-950/30"
                    >
                      {/* Pulsing radar ping */}
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>

                      <div className="flex justify-between items-start text-xs mb-1">
                        <span className="font-extrabold text-white">#ORD-9021</span>
                        <span className="text-[10px] font-black text-amber-300">38.50 AED</span>
                      </div>
                      <p className="text-[10px] text-slate-300">🏢 Marina Crown, Flat 1402</p>

                      <button
                        onClick={() => setOrderStage('packing')}
                        className="mt-2 w-full py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-[10px] font-black uppercase transition"
                      >
                        {isArabic ? 'قبول وتجهيز ⚡' : 'Accept Order ⚡'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Packing Column */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                  {isArabic ? 'قيد التجهيز (Packing)' : 'Packing Lane'}
                </span>
                <AnimatePresence mode="popLayout">
                  {orderStage === 'packing' && (
                    <motion.div
                      layoutId="sim-order-card"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="p-2.5 bg-emerald-950/60 border border-emerald-500 rounded-xl relative"
                    >
                      <div className="flex justify-between items-start text-xs mb-1">
                        <span className="font-extrabold text-white">#ORD-9021</span>
                        <span className="text-[10px] font-bold text-emerald-300">Packing</span>
                      </div>
                      <p className="text-[10px] text-slate-300">🏢 Marina Crown, Flat 1402</p>

                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={handlePrintReceipt}
                          className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[9px] font-bold flex items-center justify-center gap-1"
                        >
                          <Printer className="w-2.5 h-2.5" />
                          {isArabic ? 'طباعة' : 'Print'}
                        </button>
                        <button
                          onClick={() => setOrderStage('placed')}
                          className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-[9px] hover:text-white"
                        >
                          <Undo2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* STEP 2: 1-Click Receipt Spool Animation */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
              <Printer className="w-3.5 h-3.5" />
              {isArabic ? 'الميزة ٢: خروج إيصال الطابعة الحرارية (Thermal Spool)' : 'Feature 2: Thermal Receipt Spool'}
            </span>

            <p className="text-xs text-slate-400 mb-3">
              {isArabic
                ? 'محاكاة خروج الإيصال الحراري 58mm/80mm عبر بروتوكول البلوتوث:'
                : 'Click to test continuous paper-feeding sheet animation for 58mm/80mm ESC/POS:'}
            </p>

            <button
              onClick={handlePrintReceipt}
              disabled={isReceiptPrinting}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition mb-3"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{isArabic ? 'تجربة طباعة الإيصال الحراري' : 'Test Receipt Print Spool'}</span>
            </button>

            {/* Receipt Sheet Unroll Area */}
            <AnimatePresence>
              {showReceiptSheet && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                  className="bg-white text-slate-950 p-3 rounded-lg font-mono text-[10px] shadow-2xl border-t-4 border-slate-950 max-w-xs mx-auto overflow-hidden"
                >
                  <div className="text-center font-black border-b border-dashed border-slate-400 pb-1 mb-1">
                    <p className="text-xs">ELSHOP BAQALA #10</p>
                    <p className="text-[8px] text-slate-600">DUBAI MARINA - TOWER BRANCH</p>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Order: #ORD-9021</span>
                    <span>14:32 GST</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Tower: Marina Crown</span>
                    <span>Flat: 1402</span>
                  </div>
                  <div className="border-t border-dashed border-slate-400 my-1"></div>
                  <div className="flex justify-between">
                    <span>1x Almarai Milk 2L</span>
                    <span>11.00 AED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Indomie Curry</span>
                    <span>15.00 AED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Lipton Tea 100s</span>
                    <span>12.50 AED</span>
                  </div>
                  <div className="border-t-2 border-slate-950 my-1 pt-1 flex justify-between font-black text-xs">
                    <span>TOTAL DUE:</span>
                    <span>38.50 AED</span>
                  </div>
                  <p className="text-[8px] text-center text-slate-500 mt-1">*** PAID VIA KHATA CREDIT ***</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Col: STEP 3: The Shift Coin Game */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                {isArabic ? 'الميزة ٣: لعبة مطابقة الدرج النقدي' : 'Feature 3: The Shift Coin Game'}
              </span>
              <button
                onClick={handleUndo}
                className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
              >
                <Undo2 className="w-3 h-3" />
                {isArabic ? 'تراجع' : 'Undo'}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {isArabic
                ? 'المبلغ المتوقع في الدرج هو ٤٨٥٫٥٠ د.إ. اضغط على الفئات النقدية لحساب الصندوق بدقة:'
                : 'Target drawer cash is 485.50 AED. Tap physical UAE denominations to match the balance:'}
            </p>

            {/* Target vs Counted Bar */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                  {isArabic ? 'المطلوب في النظام' : 'System Expected'}
                </span>
                <span className="text-sm font-black text-white font-mono">
                  {(expectedFils / 100).toFixed(2)} AED
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                  {isArabic ? 'المحسوب الفعلي' : 'Total Counted'}
                </span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {(countedFils / 100).toFixed(2)} AED
                </span>
              </div>
            </div>

            {/* Interactive Currency Touchpad */}
            <div className="space-y-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                {isArabic ? 'فئات الأوراق النقدية (Notes)' : 'Paper Notes (AED)'}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {denominations
                  .filter((d) => d.type === 'note')
                  .map((denom) => (
                    <motion.button
                      key={denom.label}
                      whileTap={{ scale: 0.88 }}
                      animate={{ scale: activeBounceDenom === denom.label ? 1.08 : 1 }}
                      onClick={() => handleAddDenom(denom)}
                      className={`p-2 rounded-xl text-center text-white font-extrabold text-[11px] shadow-sm bg-gradient-to-br ${denom.color} border border-white/20 transition`}
                    >
                      {denom.label}
                    </motion.button>
                  ))}
              </div>

              <span className="text-[10px] font-extrabold uppercase text-slate-400 block pt-1">
                {isArabic ? 'فئات العملات المعدنية (Coins)' : 'Metallic Coins (Dirham & Fils)'}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {denominations
                  .filter((d) => d.type === 'coin')
                  .map((denom) => (
                    <motion.button
                      key={denom.label}
                      whileTap={{ scale: 0.88 }}
                      animate={{ scale: activeBounceDenom === denom.label ? 1.08 : 1 }}
                      onClick={() => handleAddDenom(denom)}
                      className={`p-2 rounded-xl text-center font-black text-xs shadow-sm bg-gradient-to-br ${denom.color} text-slate-950 border border-white/40 transition`}
                    >
                      {denom.label}
                    </motion.button>
                  ))}
              </div>
            </div>
          </div>

          {/* Real-Time Flash Variance Box */}
          <div>
            {varianceFils === 0 && countedFils > 0 && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: [0.95, 1.03, 1] }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="p-3 bg-emerald-500/20 border-2 border-emerald-500 rounded-xl text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isArabic ? '✅ مطابقة تامة! الفارق ٠٫٠٠ د.إ' : '✅ PERFECT MATCH! 0.00 AED Variance'}</span>
                </div>
                <p className="text-[10px] text-emerald-200 mt-0.5">
                  {isArabic ? 'تم اعتماد تقرير الدرج بنجاح' : 'Audit Certificate Verified'}
                </p>
              </motion.div>
            )}

            {varianceFils !== 0 && countedFils > 0 && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={`p-3 rounded-xl text-center border-2 ${
                  varianceFils < 0
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-amber-500/20 border-amber-500 text-amber-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {varianceFils < 0
                      ? isArabic
                        ? `⚠️ عجز في الصندوق: ${((varianceFils) / 100).toFixed(2)} د.إ`
                        : `⚠️ DEFICIT: ${(varianceFils / 100).toFixed(2)} AED`
                      : isArabic
                      ? `⚠️ فائض في الصندوق: +${(varianceFils / 100).toFixed(2)} د.إ`
                      : `⚠️ SURPLUS: +${(varianceFils / 100).toFixed(2)} AED`}
                  </span>
                </div>
              </motion.div>
            )}

            {countedFils === 0 && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-[11px] text-slate-500 font-medium">
                {isArabic ? 'اضغط العملات لبدء المطابقة...' : 'Tap denominations above to tally register balance...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. 🏃‍♂️ THE TOWER RUNNER QUEST (Simulated Delivery Mode)
   ========================================================================= */
function RiderSimulation({ isArabic }: { isArabic: boolean }) {
  const [isSunlightMode, setIsSunlightMode] = useState(false);
  const [expandedTower, setExpandedTower] = useState<string | null>('Marina Crown');

  // Doorstep COD Quick-Changer State
  const orderFils = 3850; // 38.50 AED
  const [tenderedAED, setTenderedAED] = useState<number | null>(null);

  const towerRuns = [
    {
      tower: 'Marina Crown',
      totalStops: 3,
      estMins: 9,
      stops: [
        { flat: 'Flat 402', floor: 4, orderId: '#ORD-9021', amount: '38.50 AED' },
        { flat: 'Flat 1405', floor: 14, orderId: '#ORD-9022', amount: '62.00 AED' },
        { flat: 'Flat 2201', floor: 22, orderId: '#ORD-9023', amount: '19.00 AED' }
      ]
    },
    {
      tower: 'Princess Tower',
      totalStops: 2,
      estMins: 6,
      stops: [
        { flat: 'Flat 1102', floor: 11, orderId: '#ORD-9030', amount: '45.00 AED' },
        { flat: 'Flat 3804', floor: 38, orderId: '#ORD-9031', amount: '88.50 AED' }
      ]
    }
  ];

  const changeFils = tenderedAED ? tenderedAED * 100 - orderFils : null;

  return (
    <div
      className={`p-4 rounded-2xl transition-colors duration-300 space-y-6 ${
        isSunlightMode
          ? 'bg-amber-100 text-slate-950 border-4 border-amber-500'
          : 'bg-slate-900 text-slate-100 border border-slate-800'
      }`}
    >
      {/* Sunlight Toggle Banner */}
      <div
        className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border ${
          isSunlightMode
            ? 'bg-amber-200 border-amber-400 text-slate-950'
            : 'bg-slate-950/70 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl font-black text-xs ${
              isSunlightMode ? 'bg-amber-400 text-slate-950' : 'bg-cyan-500/20 text-cyan-300'
            }`}
          >
            🏃‍♂️ {isArabic ? 'محاكاة طيار البرج' : 'Simulated Runner'}
          </div>
          <p className="text-xs font-medium">
            {isArabic
              ? 'مجموعات المصاعد الذكية، ووضع ضوء الشمس الفائق، وحاسبة فكة الدفع عند الاستلام.'
              : 'Multi-order tower batching, instant outdoor sunlight mode, and the doorstep COD quick-changer.'}
          </p>
        </div>

        {/* FEATURE 2: 1-Tap Solar Flash Toggle */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsSunlightMode(!isSunlightMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition ${
            isSunlightMode
              ? 'bg-slate-950 text-amber-400 border border-slate-800'
              : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
          }`}
        >
          {isSunlightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          <span>{isSunlightMode ? (isArabic ? 'الوضع الليلي' : 'Night Mode') : (isArabic ? '☀️ وضع الشمس' : '☀️ Sunlight Mode')}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Col: Elevator Sorter Expand */}
        <div
          className={`p-4 rounded-2xl border ${
            isSunlightMode ? 'bg-amber-50 border-amber-300' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5" />
            {isArabic ? 'الميزة ١: حزم مصاعد الأبراج (Elevator Sorter)' : 'Feature 1: Tower Elevator Sorter'}
          </span>

          <p className={`text-xs mb-3 ${isSunlightMode ? 'text-slate-700' : 'text-slate-400'}`}>
            {isArabic
              ? 'يتم تجميع طلبيات البرج الواحد بحساب توقيت رحلة المصعد (٣ دقائق لكل طابق):'
              : 'Multi-stop orders for the same residential lift are bundled to optimize vertical transit:'}
          </p>

          <div className="space-y-3">
            {towerRuns.map((run) => {
              const isExpanded = expandedTower === run.tower;
              return (
                <div
                  key={run.tower}
                  className={`rounded-xl border overflow-hidden transition ${
                    isSunlightMode
                      ? 'bg-white border-amber-300'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <button
                    onClick={() => setExpandedTower(isExpanded ? null : run.tower)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500" />
                      <span className="font-extrabold text-xs">{run.tower}</span>
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        {run.totalStops} {isArabic ? 'طلبات' : 'Stops'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Timer className="w-3 h-3" />
                        ~{run.estMins}m
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-2.5 pt-0 border-t space-y-1.5 ${
                          isSunlightMode ? 'border-amber-200 bg-amber-50/50' : 'border-slate-800 bg-slate-950/40'
                        }`}
                      >
                        {run.stops.map((stop, idx) => (
                          <div
                            key={stop.orderId}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                              isSunlightMode ? 'bg-white text-slate-950' : 'bg-slate-900 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                                L{idx + 1}
                              </span>
                              <div>
                                <span className="font-bold">{stop.flat}</span>
                                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                                  (Fl. {stop.floor})
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {stop.amount}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Doorstep Quick-Change Cash Pad */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isSunlightMode ? 'bg-amber-50 border-amber-300' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-2">
              <Banknote className="w-3.5 h-3.5" />
              {isArabic ? 'الميزة ٣: حاسبة فكة الباب الفورية' : 'Feature 3: Quick-Change Cash Pad'}
            </span>

            <p className={`text-xs mb-3 ${isSunlightMode ? 'text-slate-700' : 'text-slate-400'}`}>
              {isArabic
                ? 'قيمة الطلب ٣٨٫٥٠ د.إ. اضغط على الورقة المسلمة من العميل لمعرفة الفكة فوراً وبخط كبير:'
                : 'Order due is 38.50 AED. Tap the note handed over at the flat doorstep for instant change math:'}
            </p>

            <div
              className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${
                isSunlightMode ? 'bg-white border-amber-300' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <span className="text-xs font-extrabold">{isArabic ? 'المبلغ المطلوب:' : 'Order Total Due:'}</span>
              <span className="text-sm font-black text-amber-500 font-mono">
                {(orderFils / 100).toFixed(2)} AED
              </span>
            </div>

            {/* Note Tender Buttons */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                {isArabic ? 'المبلغ المسلّم من العميل:' : 'Customer Tenders Note:'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200].map((note) => (
                  <motion.button
                    key={note}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTenderedAED(note)}
                    className={`py-2.5 rounded-xl font-black text-xs border transition ${
                      tenderedAED === note
                        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md scale-102'
                        : isSunlightMode
                        ? 'bg-white text-slate-900 border-amber-300 hover:bg-amber-100'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {note} AED
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Change Due Display */}
          <div>
            {changeFils !== null && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.9, 1.08, 1] }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`p-3.5 rounded-2xl text-center border-2 ${
                  isSunlightMode
                    ? 'bg-emerald-100 border-emerald-500 text-slate-950'
                    : 'bg-emerald-950/60 border-emerald-500 text-white'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-300 block">
                  {isArabic ? 'الفكة المرجعة للعميل فوراً:' : 'Exact Change to Hand Back:'}
                </span>
                <span className="text-2xl font-black font-mono text-emerald-500 dark:text-emerald-400">
                  {(changeFils / 100).toFixed(2)} AED
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isArabic
                    ? 'محسوبة بدقة الفلسات لسرعة التسليم عند باب الشقة'
                    : 'Instant door math prevents delivery delay'}
                </p>
              </motion.div>
            )}

            {changeFils === null && (
              <div
                className={`p-3 rounded-xl border text-center text-xs font-medium ${
                  isSunlightMode ? 'bg-amber-100/60 border-amber-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {isArabic ? 'حدد الورقة النقدية أعلاه لعرض الفكة' : 'Select banknote to compute doorstep change'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
