import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  MessageCircle, 
  Layers, 
  Bike, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Check, 
  CheckCircle2,
  Smartphone, 
  ArrowUpRight, 
  Lock, 
  Zap, 
  DollarSign, 
  Clock, 
  Cpu
} from 'lucide-react';
import { Language } from '../types';

interface FeatureBentoProps {
  onOpenStorePreview: () => void;
  onStartTrial: () => void;
  lang?: Language;
}

export const FeatureBento: React.FC<FeatureBentoProps> = ({
  onOpenStorePreview,
  onStartTrial,
  lang = 'en',
}) => {
  const isRtl = lang === 'ar';

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <section id="features" className="py-16 sm:py-24 space-y-12">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>{isRtl ? 'باقة الميزات الشاملة' : 'The Neighborhood Retail OS'}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {isRtl
            ? 'كل ما يحتاجه متجرك للنمو والسيطرة على مبيعات البرج'
            : 'Everything Your Baqala Needs to Own Local Commerce.'}
        </h2>
        <p className="text-base text-slate-400 leading-relaxed">
          {isRtl
            ? 'منصة سحابية متكاملة مصممة خصيصاً للبقالات ومتاجر الأحياء: دفتر ديون ذكي، متجر فوري، وتوصيل مصاعد سريع.'
            : 'Engineered specifically for hyper-local retail: ACID-compliant customer tabs, automated WhatsApp alerts, and 15-minute elevator runner dispatch.'}
        </p>
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 px-2 sm:px-0">
        
        {/* CARD 1: Automated Khata Ledger (Large: 7 cols) with Handwritten Notebook Styling */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group transition-all"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/20 transition-all" />

          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              ACID Khata Ledger
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {isRtl ? 'دفتر حسابات رقمي وواتساب آلي' : 'ACID Khata Ledger & WhatsApp Auto-Invoicing'}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isRtl
                ? 'استبدل الدفاتر الورقية بدفتر ديون إلكتروني محمي بقواعد البيانات. أرسل كشوفات الحساب وتذكيرات الدفع للزبائن بنقرة زر عبر واتساب مع رابط دفع فوري.'
                : 'Replace lost physical notebook pages with mathematical, ACID-compliant customer credit ledgers. Automatic 1-tap WhatsApp statement delivery, balance tracking, and instant reconciliation.'}
            </p>
          </div>

          {/* Physical Notebook / Digital Khata Hybrid Preview */}
          <div className="mt-6 bg-[#1a1c23] border border-amber-500/20 rounded-2xl p-4 sm:p-5 relative shadow-inner overflow-hidden">
            {/* Lined Notebook Paper Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_28px] pointer-events-none" />
            
            <div className="relative space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-extrabold text-amber-200 uppercase tracking-wider text-[11px]">
                    {isRtl ? 'سجل الحسابات والذمم (دفتر البرج)' : 'Tower Resident Credit Ledger'}
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                  100% Reconciled
                </span>
              </div>

              {/* Handwritten style notebook entry (Using Caveat only for the notebook ledger lines) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Apt 1402 • Tariq Mansoor</span>
                    <span className="text-amber-400 font-mono">14 Orders</span>
                  </div>
                  <div className="font-['Caveat'] text-xl font-bold text-amber-300 tracking-wide leading-tight">
                    "2x Milk, Eggs, Bread — Paid 150 AED via Stripe"
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>WhatsApp reminder dispatched</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Apt 0804 • Sarah Al-Zahra</span>
                    <span className="text-emerald-400 font-mono">Paid (0.00 AED)</span>
                  </div>
                  <div className="font-['Caveat'] text-xl font-bold text-slate-300 tracking-wide leading-tight">
                    "Monthly settlement completed on 1st"
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Auto-cleared via Apple Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: Real-time Multi-Tenant Inventory (Medium: 5 cols) */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group transition-all flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Live Cloud Sync
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {isRtl ? 'إدارة المخزون الفوري والأسعار' : 'Real-Time Inventory & Price Sync'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isRtl
                  ? 'تحكم في أكثر من 500 صنف بلمسة واحدة: تنبيهات فورية لنقص المخزون وتحديثات فورية لأسعار العروض والخصومات.'
                  : 'Manage 500+ SKUs with instantaneous stock counts, one-tap sale pricing, and automated supplier reorder alerts.'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Check className="w-4 h-4" />
              <span>Multi-tenant isolation</span>
            </span>
            <span className="font-mono text-slate-400">PostgreSQL Powered</span>
          </div>
        </motion.div>

        {/* CARD 3: 15-Min Elevator Runners (Medium: 5 cols) */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group transition-all flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                15-Min Delivery
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {isRtl ? 'تطبيق المندوب وتسوية الكاش' : 'Elevator Runner App & Cash Shift'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isRtl
                  ? 'واجهة مخصصة لمندوبي التوصيل مع تسوية كاش دقيقة في نهاية كل وردية لمنع أي عجز أو تلاعب.'
                  : 'Utilitarian runner portal for doorstep drop-offs with end-of-shift cash audit and variance tracking.'}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Shift Cash Audit:</span>
            <span className="text-emerald-400 font-bold">0.00 AED Variance (100% Balanced)</span>
          </div>
        </motion.div>

        {/* CARD 4: Elevator QR Flyers & Zero App Download (Large: 7 cols) */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group transition-all"
        >
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Zero App Download
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {isRtl ? 'ملصقات باركود QR لمصاعد ومداخل الأبراج' : 'Printable Elevator QR Posters & Instant Web App'}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isRtl
                ? 'أنشئ واطبع ملصقات مخصصة لمتجرك في المصعد واللوبي. يقوم سكان البرج بمسح الباركود والطلب فوراً عبر المتصفح في أقل من 30 ثانية بدون تحميل أي تطبيق ثقيل.'
                : 'Generate high-res elevator flyers with store QR codes. Residents scan while riding the elevator and complete orders on lightweight mobile web in under 30 seconds.'}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenStorePreview}
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span>{isRtl ? 'عرض تجربة المتصفح للزبائن' : 'Preview Customer Web Storefront'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRtl ? 'يعمل على أجهزة iOS وأندرويد فورياً' : 'Instant on iOS & Android Safari / Chrome'}</span>
            </span>
          </div>
        </motion.div>

      </div>

    </section>
  );
};
