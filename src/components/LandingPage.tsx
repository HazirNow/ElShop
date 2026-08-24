import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store as StoreIcon, 
  Bike, 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Lock, 
  MessageCircle, 
  QrCode, 
  Layers, 
  Users, 
  ChevronRight, 
  Phone, 
  Globe, 
  Star, 
  Building2, 
  Check, 
  ExternalLink,
  DollarSign,
  Clock,
  HelpCircle,
  ChevronDown,
  Play,
  Percent,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { AppState, Language, Role } from '../types';
import { ProfitCalculator } from './ProfitCalculator';
import { FeatureBento } from './FeatureBento';
import { ElShopLogo } from './ElShopLogo';
import { UnifiedLoginModal } from './UnifiedLoginModal';
import { Footer } from './Footer';

interface LandingPageProps {
  state: AppState;
  onEnterApp: (role: Role, storeId?: string) => void;
  onOpenMerchantOnboarding: () => void;
  onOpenLegal: (tab: 'terms' | 'privacy' | 'disclaimers') => void;
  lang: Language;
  onToggleLang: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  state,
  onEnterApp,
  onOpenMerchantOnboarding,
  onOpenLegal,
  lang,
  onToggleLang,
}) => {
  const isRtl = lang === 'ar';

  // Unified Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalInitialRole, setLoginModalInitialRole] = useState<Role>('merchant');

  // Interactive Demo Terminal Tab state
  const [activeDemoTab, setActiveDemoTab] = useState<'pos' | 'khata' | 'dispatch'>('pos');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Watch Demo Video Modal State
  const [showDemoVideoModal, setShowDemoVideoModal] = useState(false);

  const handleOpenLogin = (role: Role = 'merchant') => {
    setLoginModalInitialRole(role);
    setIsLoginModalOpen(true);
  };

  const faqs = [
    {
      qEn: 'How does ElShop eliminate the 30% aggregator commission?',
      qAr: 'كيف يقضي نظام إل شوب على عمولة تطبيقات التوصيل البالغة 30%؟',
      aEn: 'Aggregators charge 25% to 35% on every single order. ElShop replaces this with a simple, flat subscription of 299 AED per month. All grocery revenue, delivery fees, and tips go 100% directly to your store bank account.',
      aAr: 'تأخذ منصات التوصيل التقليدية ما بين 25% إلى 35% من كل طلب. يستبدل إل شوب ذلك باشتراك شهري ثابت قدره 299 درهم فقط. جميع إيرادات البقالة ورسوم التوصيل تذهب مباشرة بنسبة 100% إلى حسابك البنكي.',
    },
    {
      qEn: 'Do residents need to download an app to order?',
      qAr: 'هل يحتاج سكان البرج إلى تنزيل تطبيق خاص للطلب؟',
      aEn: 'No! Residents simply scan the QR poster in their elevator or click your store link. They can order seamlessly on the web or via direct automated WhatsApp message. Zero friction means 4x higher reorder rates.',
      aAr: 'لا على الإطلاق! يمسح السكان رمز QR الموجود في مصعد البرج أو يضغطون على رابط متجرك. يمكنهم الطلب فوراً عبر الويب أو رسائل واتساب التلقائية دون الحاجة لتنزيل أي تطبيق.',
    },
    {
      qEn: 'How does the Digital Khata (Monthly Credit Tab) work?',
      qAr: 'كيف يعمل دفتر الحسابات الرقمي (الذمة والشراء الآجل)؟',
      aEn: 'Trusted tower residents can charge their daily groceries to their monthly Khata tab with 1-click. At the end of the month, ElShop automatically generates and dispatches professional WhatsApp billing statements with Stripe payment links.',
      aAr: 'يمكن لسكان البرج المعتمدين تسجيل مشترياتهم اليومية على حسابهم الشهري (الدفتر) بنقرة واحدة. وفي نهاية الشهر، يقوم النظام تلقائياً بإصدار وإرسال كشف حساب مفصل عبر واتساب مع رابط سداد إلكتروني.',
    },
    {
      qEn: 'What hardware or devices do I need for my store?',
      qAr: 'ما هي الأجهزة أو المعدات التي أحتاجها في متجري؟',
      aEn: 'Any existing tablet, iPad, smartphone, or laptop works instantly. You do not need expensive proprietary POS terminals. Barcodes can be scanned directly with your phone camera.',
      aAr: 'يعمل النظام فوراً على أي جهاز لوحي (تابلت/آيباد) أو هاتف ذكي أو كمبيوتر محمول متوفر لديك دون الحاجة لشراء معدات مكلفة.',
    },
    {
      qEn: 'Can my in-house grocery delivery boy use the system?',
      qAr: 'هل يمكن لمندوب التوصيل الخاص ببقالتي استخدام النظام؟',
      aEn: 'Yes! Your in-house riders get a dedicated courier view that groups orders by tower floor for instant 15-minute elevator runs and collects digital proof-of-delivery.',
      aAr: 'نعم! يحصل مندوبو التوصيل لديك على واجهة مخصصة ترتب الطلبات حسب طوابق البرج لضمان توصيل سريع خلال 15 دقيقة مع توثيق التسليم الرقمي.',
    },
  ];

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden"
      id="elshop-landing-page"
    >
      {/* Background Gradients & Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-glow pointer-events-none opacity-80" />

      {/* =========================================================================
          1. HEADER NAVIGATION (Strict: Features, Pricing, How it Works, FAQ + Log In + CTA)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <ElShopLogo size="md" variant="white" showCountry />
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>0% Commission SaaS</span>
            </div>
          </div>

          {/* Center: Standard Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              {isRtl ? 'الميزات' : 'Features'}
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              {isRtl ? 'الأسعار' : 'Pricing'}
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              {isRtl ? 'كيف يعمل' : 'How it Works'}
            </a>
            <a href="#calculator" className="hover:text-white transition-colors">
              {isRtl ? 'حاسبة الأرباح' : 'ROI Calculator'}
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              {isRtl ? 'الأسئلة الشائعة' : 'FAQ'}
            </a>
          </nav>

          {/* Right: Language, Ghost Log In button & Start Free Trial CTA */}
          <div className="flex items-center gap-3">
            
            {/* Language Switch */}
            <button
              onClick={onToggleLang}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Ghost 'Log In' Button (Opens Unified Modal) */}
            <button
              onClick={() => handleOpenLogin('merchant')}
              id="landing-header-login-btn"
              className="text-slate-300 hover:text-white hover:bg-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-transparent hover:border-slate-800"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRtl ? 'تسجيل الدخول' : 'Log In'}</span>
            </button>

            {/* Primary CTA: Start Free Trial */}
            <button
              onClick={onOpenMerchantOnboarding}
              id="landing-header-trial-btn"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isRtl ? 'ابدأ تجربتك المجانية' : 'Start Free Trial'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (Merchant Focused: "Stop Losing 30% to Aggregators")
         ========================================================================= */}
      <section className="relative pt-14 sm:pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Trust Capsule */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner text-xs text-slate-300"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">
              {isRtl ? 'نظام إدارة البقالات والأبراج السكنية' : 'Hyperlocal Residential Commerce OS'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold">
              {isRtl ? 'عمولة 0% للأبد' : 'Zero Aggregator Commissions'}
            </span>
          </motion.div>

          {/* Strict Primary Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]"
          >
            {isRtl ? (
              <>
                توقف عن خسارة <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400">30% من أرباحك</span> لصالح التطبيقات.
              </>
            ) : (
              <>
                Stop Losing <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400">30%</span> to Aggregators.
              </>
            )}
          </motion.h1>

          {/* Strict Primary Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            {isRtl
              ? 'نظام التشغيل المتكامل لدفتر الحسابات (الذمة)، وإدارة المخزون، والتوصيل الفوري. الشهر الأول مجاناً بالكامل.'
              : 'The all-in-one OS for Khata, Catalog, and Delivery. First Month Free.'}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={onOpenMerchantOnboarding}
              id="hero-primary-cta-btn"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2.5 transition-all active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isRtl ? 'ابدأ تجربتك المجانية (شهر مجاناً)' : 'Start Free Trial'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('demo-terminal');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setShowDemoVideoModal(true);
              }}
              id="hero-secondary-cta-btn"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-bold text-sm px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
              <span>{isRtl ? 'شاهد العرض التفاعلي' : 'Watch Demo'}</span>
            </button>
          </motion.div>

          {/* Fast Guarantee Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>No Credit Card Required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>5-Minute Store Setup</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Flat 299 AED / month (0% Comm.)</span>
            </span>
          </div>

        </div>

        {/* High-Fidelity Interactive POS Terminal Preview Frame */}
        <div id="demo-terminal" className="pt-6 max-w-5xl mx-auto">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
            
            {/* Terminal Top Chrome */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-4 w-[1px] bg-slate-800" />
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <StoreIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ElShop Merchant POS Terminal • Al Medina Supermarket</span>
                </span>
              </div>

              {/* Interactive Terminal Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setActiveDemoTab('pos')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    activeDemoTab === 'pos' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  POS Orders
                </button>
                <button
                  onClick={() => setActiveDemoTab('khata')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    activeDemoTab === 'khata' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Digital Khata Ledger
                </button>
                <button
                  onClick={() => setActiveDemoTab('dispatch')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    activeDemoTab === 'dispatch' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Elevator Dispatch
                </button>
              </div>
            </div>

            {/* Terminal Live Screen Content */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 sm:p-6 min-h-[300px]">
              
              {activeDemoTab === 'pos' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Incoming Tower Orders (Live Webhook)</span>
                    <span className="text-emerald-400 font-mono font-bold">0% Commission Retained</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-xs">Order #ELS-1042 • Marina Tower 1402</div>
                        <div className="text-[11px] text-slate-400">2x Fresh Milk 2L, 1x Al Baker Flour, Eggs</div>
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Khata Debited (Auto-Approved)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-400">48.50 AED</div>
                        <span className="text-[10px] text-slate-500 font-medium">Packing ready</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-xs">Order #ELS-1043 • Princess Tower 2208</div>
                        <div className="text-[11px] text-slate-400">1x Nutella 750g, 2x Toast Bread, OJ</div>
                        <span className="inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                          Apple Pay (Direct Merchant)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-white">62.00 AED</div>
                        <span className="text-[10px] text-indigo-400 font-medium">Assigned to Rider</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === 'khata' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Monthly Tower Khata Ledger (Zero Bad Debt)</span>
                    <span className="text-amber-400 font-mono font-bold">WhatsApp Auto-Invoicing</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">Tariq Al-Mansoor • Unit 1402</div>
                        <div className="text-[11px] text-slate-400">14 Orders this month • Pre-Approved Limit: 500 AED</div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-black text-amber-400">324.50 AED</div>
                          <span className="text-[10px] text-slate-500">Unsettled Balance</span>
                        </div>
                        <button 
                          onClick={() => handleOpenLogin('merchant')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Send WhatsApp Statement
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">Fatima Al-Nuaimi • Unit 0804</div>
                        <div className="text-[11px] text-slate-400">9 Orders this month • Pre-Approved Limit: 500 AED</div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-black text-emerald-400">0.00 AED (Paid)</div>
                          <span className="text-[10px] text-slate-500">Settled via Card</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 rounded-lg">
                          Settled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === 'dispatch' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">In-House Courier Elevator Routing</span>
                    <span className="text-indigo-400 font-mono font-bold">15-Min Delivery Guarantee</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-white">Rider: Ahmed (Active Trip #8)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                        Floors Batched: [8, 14, 22]
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      The runner takes 1 single elevator ride to complete 3 tower deliveries at once, cutting courier round-trips by 65%.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </section>

      {/* =========================================================================
          3. FEATURE BENTO GRID (Strict Merchant Value: Khata, Inventory, Riders)
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <FeatureBento 
          onOpenStorePreview={() => handleOpenLogin('merchant')}
          onStartTrial={onOpenMerchantOnboarding}
          lang={lang}
        />
      </div>

      {/* =========================================================================
          4. HOW IT WORKS SECTION (3 Simple Steps for Grocery Stores)
         ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {isRtl ? 'آلية العمل البسيطة' : 'Fast Setup'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isRtl ? 'كيف تطلق متجرك الرقمي في 3 خطوات؟' : 'Launch Your Tower Store in 3 Steps'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isRtl
                ? 'لا تحتاج إلى مهارات تقنية أو أجهزة معقدة. ابدأ البيع لسكان برجك خلال دقائق.'
                : 'No complex hardware or developer setup. Start accepting 0% commission direct orders today.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-base">
                1
              </div>
              <h3 className="text-lg font-bold text-white">
                {isRtl ? 'أدخل بيانات متجرك وفعّل الكتالوج' : 'Claim Your Store & Catalog'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isRtl
                  ? 'اختر اسم بقالتك ورقم واتساب. كتالوج المأكولات والمشروبات المسبق يتيح لك البدء فوراً.'
                  : 'Enter your store phone number and address. Pre-populated UAE grocery catalogs let you start immediately.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black text-base">
                2
              </div>
              <h3 className="text-lg font-bold text-white">
                {isRtl ? 'اطبع ملصق المصعد برمز QR' : 'Place Elevator QR Posters'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isRtl
                  ? 'اطبع ملصقات المصعد الجاهزة وضعها في برجك السكني ليمسحها السكان مباشرة عند نزولهم أو صعودهم.'
                  : 'Print ready-made elevator flyers. Residents scan when heading home to order milk, bread, and daily snacks.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-base">
                3
              </div>
              <h3 className="text-lg font-bold text-white">
                {isRtl ? 'استلم الطلبات ووفّر 30% عمولة' : 'Deliver in 15 Min & Keep 100%'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isRtl
                  ? 'يقوم مندوب متجرك بتوصيل الطلب للباب عبر المصعد في 15 دقيقة مع سداد نقدي أو دفتر حسابات شهري.'
                  : 'Your in-house courier rides the elevator to deliver in 15 minutes. Keep 100% of order totals and tips.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. ROI PROFIT CALCULATOR SECTION
         ========================================================================= */}
      <section id="calculator" className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            {isRtl ? 'حساب التوفير المالي' : 'Aggregator vs ElShop'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isRtl ? 'كم ستوفّر شهرياً مع إل شوب؟' : 'Calculate Your Monthly Commission Savings'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {isRtl
              ? 'قارن بين عمولة التطبيقات البالغة 30% وبين اشتراك إل شوب الثابت 299 درهم.'
              : 'See exactly how much money stays in your pocket each month compared to delivery apps.'}
          </p>
        </div>

        <ProfitCalculator 
          onOpenMerchantModal={onOpenMerchantOnboarding}
          lang={lang}
        />
      </section>

      {/* =========================================================================
          6. SOCIAL PROOF LOGO WALL & PRICING SECTION (Transparent SaaS)
         ========================================================================= */}
      <section id="pricing" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          
          {/* Social Proof Logo Wall */}
          <div className="text-center space-y-4 pb-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              {isRtl ? 'موثوق به في أكثر من 500+ بقالة وسوبرماركت في أبراج الإمارات' : 'Trusted by 500+ UAE Baqalas & Residential Supermarkets'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-70 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-extrabold text-slate-300">
                <StoreIcon className="w-4 h-4 text-indigo-400" />
                <span>Al Madina Hypermarket</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-extrabold text-slate-300">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Marina Express Mart</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-extrabold text-slate-300">
                <StoreIcon className="w-4 h-4 text-amber-400" />
                <span>City Corner Grocery</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-extrabold text-slate-300">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>JLT Tower Baqala</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-extrabold text-slate-300">
                <StoreIcon className="w-4 h-4 text-teal-400" />
                <span>Downtown QuickMart</span>
              </div>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {isRtl ? 'اشتراك شفاف بدون مفاجآت' : 'Zero Hidden Fees'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isRtl ? 'خطة واحدة شاملة لكل ما تحتاجه' : 'Simple, Transparent Pricing'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isRtl
                ? 'لا نأخذ أي نسبة من مبيعاتك. كل الأرباح تعود لمتجرك بالكامل.'
                : 'Zero commission on orders. All features, WhatsApp integration, and Khata ledger included.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Plan 1: 1st Month Free Trial */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-emerald-400 uppercase">Trial Experience</div>
                <h3 className="text-xl font-bold text-white">First Month Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">0</span>
                  <span className="text-xs text-slate-400 font-bold">AED / 1st month</span>
                </div>
                <p className="text-xs text-slate-400">
                  Full unrestricted access to test with your tower residents. No credit card required.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>POS Terminal & Barcode Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Digital Khata (Up to 100 residents)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Elevator Flyer QR Generator</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenMerchantOnboarding}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Claim Free Month
              </button>
            </div>

            {/* Plan 2: Baqala Pro (Featured) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900 border-2 border-emerald-500/80 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-emerald-950/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-4">
                <div className="text-xs font-bold text-emerald-400 uppercase">Neighborhood Baqala</div>
                <h3 className="text-xl font-bold text-white">Baqala Unlimited OS</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-400">299</span>
                  <span className="text-xs text-slate-400 font-bold">AED / month</span>
                </div>
                <p className="text-xs text-slate-400">
                  Everything you need to dominate your residential tower with 0% commission forever.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <strong className="text-white">0% Commission on all orders</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unlimited Digital Khata Residents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Automated WhatsApp Monthly Invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In-House Rider Elevator Dispatch App</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>24/7 Priority UAE WhatsApp Support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenMerchantOnboarding}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950 transition-all active:scale-95"
              >
                Start 1st Month Free
              </button>
            </div>

            {/* Plan 3: Multi-Store Enterprise */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-purple-400 uppercase">Supermarket Chains</div>
                <h3 className="text-xl font-bold text-white">Multi-Store Franchise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">799</span>
                  <span className="text-xs text-slate-400 font-bold">AED / month</span>
                </div>
                <p className="text-xs text-slate-400">
                  Centralized multi-branch control with unified inventory sync and fleet tracking.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Multi-Branch Admin HQ Console</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Centralized ERP / Warehouse Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Custom Branded Resident Domain</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenLogin('admin')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Access HQ Console
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. FAQ SECTION
         ========================================================================= */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            {isRtl ? 'إجابات على تساؤلاتك' : 'Got Questions?'}
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isRtl ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 font-bold text-xs sm:text-sm text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{isRtl ? faq.qAr : faq.qEn}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {isRtl ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* =========================================================================
          8. BOTTOM CALL TO ACTION
         ========================================================================= */}
      <section className="py-16 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isRtl
              ? 'جاهز لاستعادة أرباحك وبناء ولاء سكان برجك؟'
              : 'Ready to Own Your Neighborhood Commerce?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {isRtl
              ? 'انضم إلى مئات البقالات والمتاجر في دبي وأبوظبي التي توفر آلاف الدراهم شهرياً مع إل شوب.'
              : 'Join grocery stores across Dubai & Abu Dhabi saving thousands in aggregator fees every single month.'}
          </p>
          <button
            onClick={onOpenMerchantOnboarding}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-emerald-950 transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isRtl ? 'ابدأ شهرك المجاني الآن' : 'Start Your 1-Month Free Trial'}</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          9. STANDARDIZED SAAS FOOTER (With Hidden Staff Portal Trigger)
         ========================================================================= */}
      <Footer 
        onOpenLogin={handleOpenLogin}
        onOpenMerchantOnboarding={onOpenMerchantOnboarding}
        onOpenLegal={onOpenLegal}
        lang={lang}
        onToggleLang={onToggleLang}
      />

      {/* =========================================================================
          10. UNIFIED LOGIN MODAL (Role Detection: Merchant, Rider, Admin)
         ========================================================================= */}
      <UnifiedLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuthenticate={(role, storeId) => onEnterApp(role, storeId)}
        stores={state.stores}
        initialRole={loginModalInitialRole}
        lang={lang}
      />

      {/* =========================================================================
          11. MOBILE STICKY CTA (Bottom bar on screens < 768px with min 48px height)
         ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 flex items-center gap-3 shadow-2xl">
        <button
          onClick={() => handleOpenLogin('merchant')}
          className="px-4 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold shrink-0 min-h-[48px] flex items-center justify-center transition-colors"
        >
          <Lock className="w-3.5 h-3.5 mr-1 text-amber-400" />
          <span>{isRtl ? 'دخول' : 'Log In'}</span>
        </button>
        <button
          onClick={onOpenMerchantOnboarding}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isRtl ? 'ابدأ تجربتك المجانية' : 'Start Free Trial'}</span>
        </button>
      </div>

    </div>
  );
};
