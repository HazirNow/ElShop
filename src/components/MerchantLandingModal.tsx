import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store as StoreIcon,
  X,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  QrCode,
  Bike,
  MessageCircle,
  Clock,
  ArrowRight,
  Calculator,
  Lock,
  ChevronRight,
  Layers,
  ShoppingBag,
  Zap,
  Building2,
  Phone,
  Mail,
  Palette,
  Check
} from 'lucide-react';
import { Language, Store } from '../types';
import { createStore } from '../api';
import { ElShopLogo } from './ElShopLogo';
import { notifyError } from '../utils/errorHandler';

interface MerchantLandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreCreated: (newStore: Store) => void;
  lang: Language;
}

type ModalTab = 'overview' | 'calculator' | 'register';

export const MerchantLandingModal: React.FC<MerchantLandingModalProps> = ({
  isOpen,
  onClose,
  onStoreCreated,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const isRtl = lang === 'ar';

  // Calculator State
  const [calcDailyOrders, setCalcDailyOrders] = useState<number>(45);
  const [calcAvgBasket, setCalcAvgBasket] = useState<number>(50);

  // Form State for Registration
  const [formStep, setFormStep] = useState<number>(1);
  const [storeName, setStoreName] = useState('');
  const [storeNameAr, setStoreNameAr] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80');
  const [brandColor, setBrandColor] = useState('#0B6E4F');
  const [managerPin, setManagerPin] = useState('1234');
  const [riderPin, setRiderPin] = useState('5678');
  const [starterCatalog, setStarterCatalog] = useState<'grocery' | 'minimart' | 'produce' | 'bakery'>('grocery');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdStoreData, setCreatedStoreData] = useState<Store | null>(null);

  // Calculation formulas
  const calcMonthlyGmv = useMemo(() => calcDailyOrders * 30 * calcAvgBasket, [calcDailyOrders, calcAvgBasket]);
  const calcAggregatorCut = useMemo(() => calcMonthlyGmv * 0.30, [calcMonthlyGmv]);
  const calcElShopCost = 299; // Flat monthly fee
  const calcMonthlySavings = useMemo(() => Math.max(0, calcAggregatorCut - calcElShopCost), [calcAggregatorCut]);
  const calcAnnualSavings = useMemo(() => calcMonthlySavings * 12, [calcMonthlySavings]);
  const calcBreakEvenOrdersMonth = Math.ceil(calcElShopCost / (calcAvgBasket * 0.30));

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !area.trim() || !phone.trim()) {
      alert(isRtl ? 'يرجى إدخال اسم المتجر، المنطقة ورقم الهاتف' : 'Please fill in store name, area, and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStore = await createStore({
        name: storeName.trim(),
        nameAr: storeNameAr.trim() || storeName.trim(),
        area: area.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsapp.trim() || phone.trim(),
        merchantName: managerName.trim() || 'Store Manager',
        merchantEmail: email.trim() || undefined,
        pin: managerPin.trim() || '1234',
        riderPin: riderPin.trim() || '5678',
        image: imageUrl.trim() || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
        subscriptionFee: 299,
        storeColor: brandColor,
      });

      setCreatedStoreData(newStore);
    } catch (err) {
      notifyError(err, isRtl ? 'حدث خطأ أثناء تسجيل المتجر' : 'Failed to register store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchStorePos = () => {
    if (createdStoreData) {
      onStoreCreated(createdStoreData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-100"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black shadow-inner">
                <StoreIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {isRtl ? 'منصة التجار والبقالات المحلية' : 'ElShop for Merchants & Baqalas'}
                  </h2>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    0% Commission
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRtl ? 'امتلك توصيل برجك السكني، ووفر 30% من رسوم تطبيقات التوصيل' : 'Own your residential tower delivery with zero aggregator commission'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Pills */}
          {!createdStoreData && (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRtl ? 'المزايا ونموذج العمل' : 'Why ElShop?'}</span>
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'calculator'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{isRtl ? 'حاسبة توفير الأرباح' : 'Profit Savings Calculator'}</span>
              </button>

              <button
                onClick={() => setActiveTab('register')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'register'
                    ? 'bg-[#0B6E4F] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <StoreIcon className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تسجيل متجر جديد' : 'Register Store (Self-Serve)'}</span>
              </button>
            </div>
          )}

          {/* Modal Body Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* SUCCESS VIEW (When Store Is Just Created) */}
            {createdStoreData ? (
              <div className="text-center py-6 px-4 space-y-6 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl border-2 border-emerald-500/50 flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    {isRtl ? 'مبروك! متجرك جاهز للعمل' : 'STORE SUCCESSFULLY PROVISIONED'}
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    {isRtl ? createdStoreData.nameAr : createdStoreData.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isRtl
                      ? `تم إنشاء متجرك في ${createdStoreData.area} وإضافة باقة المنتجات الأساسية بنجاح.`
                      : `Your store in ${createdStoreData.area} is now live with starter inventory and dedicated POS credentials.`}
                  </p>
                </div>

                {/* Credentials Badge */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Store ID:</span>
                    <span className="font-mono text-white font-bold">{createdStoreData.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Manager POS PIN:</span>
                    <span className="font-mono text-emerald-400 font-bold tracking-widest">{createdStoreData.pin || '1234'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Courier Runner PIN:</span>
                    <span className="font-mono text-amber-400 font-bold tracking-widest">{createdStoreData.riderPin || '5678'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>WhatsApp Contact:</span>
                    <span className="font-mono text-emerald-400 font-bold">{createdStoreData.whatsappNumber || createdStoreData.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleLaunchStorePos}
                    className="w-full bg-[#0B6E4F] hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
                  >
                    <StoreIcon className="w-4 h-4" />
                    <span>{isRtl ? 'فتح لوحة الكاشير وإدارة الطلبات' : 'Launch Merchant POS Terminal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all"
                  >
                    {isRtl ? 'إغلاق والعودة إلى الواجهة' : 'Close and Return to App'}
                  </button>
                </div>
              </div>
            ) : activeTab === 'overview' ? (
              /* --- TAB 1: OVERVIEW & VALUE PROPOSITION --- */
              <div className="space-y-6">
                
                {/* Hero Statement */}
                <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRtl ? 'نموذج الاشتراك الشهري الثابت' : 'Flat Subscription Model (299 AED/mo)'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {isRtl
                      ? 'توقف عن دفع عمولات 30% لتطبيقات التوصيل. احتفظ بكامل أرباحك في متجرك!'
                      : 'Stop Giving Away 30% to Aggregators. Keep 100% of Your Grocery Margins.'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {isRtl
                      ? 'تم تصميم منصة ElShop خصيصاً للبقالات ومتاجر الأحياء في الإمارات. وفر لزبائن برجك السكني تجربة تسوق سريعة خلال 15 دقيقة مع دفتر حسابات آلي (الدفتر/الخاطا) بدون أي اقتطاع من مبيعاتك.'
                      : 'Built specifically for Dubai & UAE neighborhood dark stores and baqalas. Deliver to resident towers via elevator runners in 15 minutes with automated WhatsApp Khata ledgers, keeping 100% of your retail margin.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('register')}
                      className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95"
                    >
                      <StoreIcon className="w-4 h-4" />
                      <span>{isRtl ? 'ابدأ بتسجيل متجرك الآن' : 'Onboard Your Store Now'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('calculator')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
                    >
                      <Calculator className="w-4 h-4 text-amber-400" />
                      <span>{isRtl ? 'احسب كم ستوفر سنوياً' : 'Calculate Your Annual Savings'}</span>
                    </button>
                  </div>
                </div>

                {/* 4 Value Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Pillar 1: 0% Commission */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4.5 space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                      <Percent className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-white">
                      {isRtl ? '0% عمولة - اشتراك شهري ثابت 299 درهم' : '0% Commission - Flat 299 AED / Mo'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isRtl
                        ? 'لا نأخذ أي نسبة مئوية من طلباتك. سواء بعت 500 درهم أو 50,000 درهم شهرياً، تكلفة اشتراكك ثابتة وشفافة.'
                        : 'No percentage deductions on orders. Whether you do 5,000 or 50,000 AED in monthly sales, your cost is strictly flat.'}
                    </p>
                  </div>

                  {/* Pillar 2: 15-Min Elevator Runners */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4.5 space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                      <Bike className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-white">
                      {isRtl ? 'توصيل مصاعد فوري خلال 15 دقيقة' : '15-Minute Building Elevator Runners'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isRtl
                        ? 'مندوب متجرك يوصل لسكان الأبراج المجاورة بسرعة فائقة دون انتظار سائقي التطبيقات الخارجية.'
                        : 'Your store runner hops on the elevator and delivers directly to doorsteps in the residential tower above or next door.'}
                    </p>
                  </div>

                  {/* Pillar 3: WhatsApp Khata Ledger */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4.5 space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-white">
                      {isRtl ? 'دفتر حسابات رقمي وواتساب فوري' : 'Automated WhatsApp Khata Tab'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isRtl
                        ? 'استبدل الدفاتر الورقية بدفتر ائتمان رقمي. يرسل كشوفات الحساب وتنبيهات الطلبات للزبائن عبر واتساب بضغطة زر.'
                        : 'Modernize credit notebooks. Instant WhatsApp order alerts, delivery confirmations, and 1-tap monthly tab reconciliation.'}
                    </p>
                  </div>

                  {/* Pillar 4: Elevator & Lobby Posters */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4.5 space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-white">
                      {isRtl ? 'ملصقات باركود QR للمصاعد والمداخل' : 'Printable Elevator QR Flyers'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isRtl
                        ? 'اطبع ملصق QR لمتجرك وضعه في مصعد البرج واللوبي ليكتشفك مئات السكان ويبدأوا بالطلب فوراً بدون تحميل تطبيقات.'
                        : 'Generate branded elevator posters with QR codes. Residents scan in the elevator and order instantly without downloading apps.'}
                    </p>
                  </div>

                </div>

              </div>
            ) : activeTab === 'calculator' ? (
              /* --- TAB 2: ROI & PROFIT SAVINGS CALCULATOR --- */
              <div className="space-y-6">
                
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-black text-white">
                    {isRtl ? 'حاسبة توفير أرباح البقالة' : 'Commission Savings & Profit Calculator'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isRtl ? 'شاهد كم من الأموال تخسرها سنوياً مع عمولات التطبيقات التقليدية (30%)' : 'Compare a 30% aggregator commission vs ElShop’s flat 299 AED/mo'}
                  </p>
                </div>

                {/* Sliders Container */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-5">
                  
                  {/* Slider 1: Daily Orders */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-300">
                        {isRtl ? 'متوسط عدد الطلبات اليومية:' : 'Average Daily Orders:'}
                      </label>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {calcDailyOrders} {isRtl ? 'طلب/يوم' : 'orders/day'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={200}
                      step={5}
                      value={calcDailyOrders}
                      onChange={(e) => setCalcDailyOrders(Number(e.target.value))}
                      className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>5 orders</span>
                      <span>50 orders</span>
                      <span>100 orders</span>
                      <span>200 orders</span>
                    </div>
                  </div>

                  {/* Slider 2: Average Basket Size */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-300">
                        {isRtl ? 'متوسط قيمة سلة المشتريات (درهم):' : 'Average Basket Value (AED):'}
                      </label>
                      <span className="text-sm font-black text-amber-400 font-mono">
                        {calcAvgBasket} AED
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={150}
                      step={5}
                      value={calcAvgBasket}
                      onChange={(e) => setCalcAvgBasket(Number(e.target.value))}
                      className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>15 AED (Quick snack)</span>
                      <span>50 AED (Daily grocery)</span>
                      <span>150 AED (Pantry restock)</span>
                    </div>
                  </div>

                </div>

                {/* Comparison Results Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Aggregator Lost Revenue */}
                  <div className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[11px] font-bold text-rose-300 uppercase">
                      {isRtl ? 'عمولة التطبيقات (30%)' : 'Aggregator Cut (30%)'}
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                      -{calcAggregatorCut.toLocaleString()} AED
                    </div>
                    <span className="text-[10px] text-rose-300/70 block">
                      {isRtl ? 'شهرياً مفقودة من أرباحك' : 'lost every single month'}
                    </span>
                  </div>

                  {/* ElShop Flat Cost */}
                  <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase">
                      {isRtl ? 'اشتراك ElShop الثابت' : 'ElShop Flat Rate'}
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                      299 AED
                    </div>
                    <span className="text-[10px] text-emerald-300/70 block">
                      {isRtl ? 'ثابت بدون أي نسب مئوية' : 'per month, no commissions'}
                    </span>
                  </div>

                  {/* Net Annual Savings */}
                  <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/50 rounded-2xl p-4 text-center space-y-1 shadow-lg">
                    <span className="text-[11px] font-extrabold text-amber-300 uppercase flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{isRtl ? 'صافي التوفير السنوي' : 'Net Annual Savings'}</span>
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                      +{calcAnnualSavings.toLocaleString()} AED
                    </div>
                    <span className="text-[10px] text-amber-200/80 block font-semibold">
                      {isRtl ? 'تبقى في جيب صاحب المتجر!' : 'kept directly in your pocket!'}
                    </span>
                  </div>

                </div>

                {/* Break-even Insight */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 text-xs flex items-center gap-3 text-slate-300">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                    ⚖️
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {isRtl
                        ? `نقطة التعادل: تحتاج فقط إلى ${calcBreakEvenOrdersMonth} طلب شهرياً (~${Math.ceil(calcBreakEvenOrdersMonth / 30)} طلب/يوم) لتغطية كامل الاشتراك!`
                        : `Break-even threshold: You only need ${calcBreakEvenOrdersMonth} orders/month (~${Math.ceil(calcBreakEvenOrdersMonth / 30)}/day) to fully cover your ElShop fee!`}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isRtl
                        ? 'كل طلب بعد ذلك يذهب ريعه بالكامل إلى أرباح متجرك الصافية.'
                        : 'Every single order beyond that is 100% pure profit retention for your store.'}
                    </span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setActiveTab('register')}
                    className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-xl inline-flex items-center gap-2 active:scale-95"
                  >
                    <StoreIcon className="w-4 h-4" />
                    <span>{isRtl ? 'سجل متجرك وابدأ بتوفير الأرباح' : 'Register Your Store & Start Saving'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              /* --- TAB 3: SELF-SERVE REGISTRATION FORM --- */
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                
                {/* Form Progress Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {formStep}
                    </span>
                    <span className="font-bold text-white">
                      {formStep === 1
                        ? (isRtl ? 'الخطوة ١: معلومات المتجر والمسؤول' : 'Step 1: Store & Owner Details')
                        : formStep === 2
                        ? (isRtl ? 'الخطوة ٢: رموز الأمان وهوية المتجر' : 'Step 2: Security PINs & Brand Theme')
                        : (isRtl ? 'الخطوة ٣: باقة المنتجات الأولية' : 'Step 3: Starter Inventory Catalog')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          formStep === s ? 'w-6 bg-emerald-500' : formStep > s ? 'w-3 bg-emerald-700' : 'w-3 bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* STEP 1: Basic Store & Contact Info */}
                {formStep === 1 && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          {isRtl ? 'اسم المتجر (بالإنجليزي) *' : 'Store Name (English) *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Marina Fresh Baqala"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          {isRtl ? 'اسم المتجر (بالعربي)' : 'Store Name (Arabic)'}
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: بقالة مارينا فريش"
                          value={storeNameAr}
                          onChange={(e) => setStoreNameAr(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          {isRtl ? 'اسم مدير أو صاحب المتجر' : 'Store Manager / Owner Name'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tariq Mansoor"
                          value={managerName}
                          onChange={(e) => setManagerName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          {isRtl ? 'المنطقة أو اسم البرج السكني *' : 'Neighborhood Area / Tower Location *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Downtown Dubai, Standpoint Towers"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp *</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+971 50 123 4567"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Used for order alerts & customer chat</span>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>Landline / Phone *</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+971 4 333 4455"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-sky-400" />
                          <span>Business Email</span>
                        </label>
                        <input
                          type="email"
                          placeholder="merchant@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!storeName.trim() || !area.trim() || !phone.trim()) {
                            alert(isRtl ? 'يرجى إكمال الحقول الإلزامية' : 'Please fill in required fields.');
                            return;
                          }
                          setFormStep(2);
                        }}
                        className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <span>{isRtl ? 'التالي: إعدادات الأمان والهوية' : 'Next: Security PINs & Theme'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Security PINs & Branding */}
                {formStep === 2 && (
                  <div className="space-y-4 text-xs">
                    
                    {/* PIN Multi-Tenant Isolation */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <Lock className="w-4 h-4" />
                        <span>{isRtl ? 'رموز الدخول والأمان للكاشير والمندوب' : 'Multi-Tenant Security Passkeys'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isRtl
                          ? 'استخدم هذه الرموز المكونة من 4 أرقام لتسجيل دخول موظفيك ومندوبي التوصيل بشكل منعزل وآمن.'
                          : 'Staff and building runners enter these 4-digit PINs at the staff portal to access your store POS.'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-emerald-400 font-bold mb-1">
                            {isRtl ? 'رمز كاشير المتجر (POS PIN)' : 'Manager POS PIN (4 digits)'}
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            placeholder="1234"
                            value={managerPin}
                            onChange={(e) => setManagerPin(e.target.value)}
                            className="w-full bg-slate-900 border border-emerald-500/60 rounded-xl px-3 py-2 text-white font-mono tracking-widest text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Unlocks store dashboard & inventory</span>
                        </div>

                        <div>
                          <label className="block text-amber-400 font-bold mb-1">
                            {isRtl ? 'رمز مندوب التوصيل (Courier PIN)' : 'Runner / Courier PIN (4 digits)'}
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            placeholder="5678"
                            value={riderPin}
                            onChange={(e) => setRiderPin(e.target.value)}
                            className="w-full bg-slate-900 border border-amber-500/60 rounded-xl px-3 py-2 text-white font-mono tracking-widest text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Used by runners to claim deliveries</span>
                        </div>
                      </div>
                    </div>

                    {/* Brand Color Theme Selection */}
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-bold">
                        {isRtl ? 'لون هوية المتجر (Theme Color)' : 'Store Theme Brand Color'}
                      </label>
                      <div className="flex items-center gap-3">
                        {['#0B6E4F', '#0284C7', '#7C3AED', '#D97706', '#DC2626', '#0F766E'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setBrandColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-7 h-7 rounded-full transition-all border-2 ${
                              brandColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          />
                        ))}
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                          title="Custom Color"
                        />
                      </div>
                    </div>

                    {/* Storefront Image URL */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {isRtl ? 'رابط صورة أو واجهة المتجر' : 'Storefront Image URL'}
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                      >
                        {isRtl ? 'السابق' : 'Back'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormStep(3)}
                        className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <span>{isRtl ? 'التالي: باقة المنتجات' : 'Next: Starter Catalog'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Starter Inventory Catalog & Submit */}
                {formStep === 3 && (
                  <div className="space-y-4 text-xs">
                    
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">
                        {isRtl ? 'اختر باقة المنتجات الأساسية لتجهيز المتجر فوراً:' : 'Select Starter SKU Catalog Package:'}
                      </label>
                      <p className="text-[11px] text-slate-400 mb-3">
                        {isRtl
                          ? 'سنقوم بإضافة الأصناف الأكثر طلباً فورياً لتبدأ باستقبال الطلبات من اليوم الأول.'
                          : 'ElShop auto-provisions top-selling SKUs so your POS is operational immediately upon creation.'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            id: 'grocery',
                            title: isRtl ? 'بقالة وسلع أساسية شاملة' : 'Grocery & Daily Essentials',
                            desc: 'Milk, Bread, Water, Rice, Eggs, Cooking Oil, Chips, Bananas',
                            icon: '🛒',
                          },
                          {
                            id: 'minimart',
                            title: isRtl ? 'ميني كشك ومشروبات وسناكس' : 'Mini-Mart & Beverages',
                            desc: 'Energy Drinks, Soft Drinks, Chocolate, Chips, Ice Cream',
                            icon: '🏪',
                          },
                          {
                            id: 'produce',
                            title: isRtl ? 'خضار وفواكه طازجة وألبان' : 'Fresh Greens, Fruit & Dairy',
                            desc: 'Tomatoes, Onions, Potatoes, Apples, Laban, Halloumi Cheese',
                            icon: '🍎',
                          },
                          {
                            id: 'bakery',
                            title: isRtl ? 'مخبوزات وفطور صباحي' : 'Bakery & Breakfast Items',
                            desc: 'Arabic Khubz, Croissants, Toast Bread, Butter, Jam, Tea',
                            icon: '🥐',
                          },
                        ].map((pkg) => (
                          <div
                            key={pkg.id}
                            onClick={() => setStarterCatalog(pkg.id as any)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              starterCatalog === pkg.id
                                ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{pkg.icon}</span>
                              <div className="flex-1">
                                <h5 className="font-bold text-white text-xs">{pkg.title}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">{pkg.desc}</p>
                              </div>
                              {starterCatalog === pkg.id && (
                                <Check className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subscription Terms Notice */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'اشتراك تجريبي مجاني لمدة 30 يوماً' : '30-Day Free Trial Included'}</span>
                      </div>
                      <p>
                        {isRtl
                          ? 'لا يلزم بطاقة ائتمانية للبدء. بعد الشهر الأول، تبلغ رسوم الاشتراك الثابت 299 درهم شهرياً فقط.'
                          : 'No credit card required. After 30 days, enjoy our flat 299 AED/month rate with zero percentage cuts.'}
                      </p>
                    </div>

                    {/* Final Action Buttons */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setFormStep(2)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                      >
                        {isRtl ? 'السابق' : 'Back'}
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#0B6E4F] hover:bg-emerald-600 disabled:bg-slate-800 text-white font-black py-3 px-6 rounded-2xl text-xs sm:text-sm transition-all shadow-xl flex items-center gap-2 active:scale-95"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{isRtl ? 'جاري تجهيز المتجر...' : 'Provisioning Store & SKUs...'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isRtl ? 'تأكيد وإنشاء المتجر فوراً' : 'Create & Launch Store Instantly'}</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                )}

              </form>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
