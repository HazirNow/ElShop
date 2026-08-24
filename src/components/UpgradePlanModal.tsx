import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Lock, 
  ShieldCheck, 
  Store, 
  Building2, 
  Layers, 
  Scale, 
  Users, 
  TrendingUp, 
  FileSpreadsheet,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Store as StoreType, Language } from '../types';
import { updateStore } from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  store: StoreType;
  lang: Language;
  lockedFeatureTitle?: string;
  onSuccess?: () => void;
}

export const UpgradePlanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  store,
  lang,
  lockedFeatureTitle,
  onSuccess
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const currentTier = store.subscriptionTier || 1;
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(
    currentTier === 1 ? 2 : currentTier === 2 ? 3 : 1
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const plans = [
    {
      tier: 1 as const,
      name: 'Baqala Plan',
      nameAr: 'باقة البقالة (المستوى ١)',
      price: 299,
      icon: Store,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: isAr ? 'مثالية للبقالات الفردية والمتاجر الصغيرة' : 'Ideal for neighborhood single-counter grocery stores',
      features: [
        { en: 'Single-Counter Ultra Fast POS', ar: 'كاشير سريع مبسط لشخص واحد', included: true },
        { en: '1-Tap Daily WhatsApp Register Summary', ar: 'تقرير اليومية المالي للواتساب بضغطة واحدة', included: true },
        { en: 'Elevator Building QR Ordering & Batching', ar: 'طلب وتجميع المصعد لبرج سكني بـ QR', included: true },
        { en: 'Basic Khata Ledger & WhatsApp Statements', ar: 'سجل الخاطة البسيط مع كشف حساب واتساب', included: true },
        { en: 'End-of-Shift Cash Drawer Reconciliation', ar: 'محضر إغلاق الصندوق ومطابقة النقد الفعلي', included: false },
        { en: 'Customer Credit Limit Enforcement', ar: 'تحديد سقف الدين لكل ساكن والتحذير التلقائي', included: false },
        { en: 'Staff Role PINs (Manager, Cashier, Runner)', ar: 'رموز PIN للمدير والكاشير والمندوب', included: false },
        { en: 'Consolidated P&L & Multi-Store Insights', ar: 'تحليل الأرباح P&L والمقارنة بين الفروع', included: false },
      ]
    },
    {
      tier: 2 as const,
      name: 'Mart Plan',
      nameAr: 'باقة المارت والسوبرماركت (المستوى ٢)',
      popular: true,
      price: 599,
      icon: Building2,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: isAr ? 'المستوى المفضل للسوبرماركت ومتاجر التجزئة مع محاسب' : 'Most popular for mid-sized marts & stores with accountants',
      features: [
        { en: 'Single-Counter Ultra Fast POS', ar: 'كاشير سريع مبسط لشخص واحد', included: true },
        { en: '1-Tap Daily WhatsApp Register Summary', ar: 'تقرير اليومية المالي للواتساب بضغطة واحدة', included: true },
        { en: 'Elevator Building QR Ordering & Batching', ar: 'طلب وتجميع المصعد لبرج سكني بـ QR', included: true },
        { en: 'Basic Khata Ledger & WhatsApp Statements', ar: 'سجل الخاطة البسيط مع كشف حساب واتساب', included: true },
        { en: 'End-of-Shift Cash Drawer Reconciliation', ar: 'محضر إغلاق الصندوق ومطابقة النقد الفعلي', included: true },
        { en: 'Customer Credit Limit Enforcement', ar: 'تحديد سقف الدين لكل ساكن والتحذير التلقائي', included: true },
        { en: 'Staff Role PINs (Manager, Cashier, Runner)', ar: 'رموز PIN للمدير والكاشير والمندوب', included: true },
        { en: 'Consolidated P&L & Multi-Store Insights', ar: 'تحليل الأرباح P&L والمقارنة بين الفروع', included: false },
      ]
    },
    {
      tier: 3 as const,
      name: 'Franchise Plan',
      nameAr: 'باقة سلاسل الفروع (المستوى ٣)',
      price: 899,
      icon: Layers,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: isAr ? 'للسلاسل التجارية وإدارات الفروع المتعددة' : 'For multi-branch chains, franchises & enterprise HQ',
      features: [
        { en: 'Single-Counter Ultra Fast POS', ar: 'كاشير سريع مبسط لشخص واحد', included: true },
        { en: '1-Tap Daily WhatsApp Register Summary', ar: 'تقرير اليومية المالي للواتساب بضغطة واحدة', included: true },
        { en: 'Elevator Building QR Ordering & Batching', ar: 'طلب وتجميع المصعد لبرج سكني بـ QR', included: true },
        { en: 'Basic Khata Ledger & WhatsApp Statements', ar: 'سجل الخاطة البسيط مع كشف حساب واتساب', included: true },
        { en: 'End-of-Shift Cash Drawer Reconciliation', ar: 'محضر إغلاق الصندوق ومطابقة النقد الفعلي', included: true },
        { en: 'Customer Credit Limit Enforcement', ar: 'تحديد سقف الدين لكل ساكن والتحذير التلقائي', included: true },
        { en: 'Staff Role PINs (Manager, Cashier, Runner)', ar: 'رموز PIN للمدير والكاشير والمندوب', included: true },
        { en: 'Consolidated P&L & Multi-Store Insights', ar: 'تحليل الأرباح P&L والمقارنة بين الفروع', included: true },
      ]
    }
  ];

  const handleSelectTier = async (newTier: 1 | 2 | 3) => {
    setIsUpdating(true);
    const fee = newTier === 1 ? 299 : newTier === 2 ? 599 : 899;
    try {
      await updateStore(store.id, {
        subscriptionTier: newTier,
        subscriptionFee: fee
      });
      setSuccessMsg(
        isAr 
          ? `تم ترقية خطة المتجر بنجاح إلى ${newTier === 1 ? 'باقة البقالة' : newTier === 2 ? 'باقة المارت' : 'باقة الفروع'}!`
          : `Store successfully switched to ${newTier === 1 ? 'Baqala Plan' : newTier === 2 ? 'Mart Plan' : 'Franchise Plan'}!`
      );
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update subscription tier:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>{isAr ? 'خطط وباقات اشتراك ElShop للمتاجر' : 'ElShop Merchant Plan Matrix'}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {store.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lockedFeatureTitle 
                  ? (isAr ? `لفتح ميزة (${lockedFeatureTitle})، يرجى الترقية إلى باقة المارت أو الفروع` : `To unlock "${lockedFeatureTitle}", upgrade to Mart or Franchise plan`)
                  : (isAr ? 'اختر الخطة المناسبة لحجم متجرك مع التحكم المالي وإدارة الصندوق' : 'Select the ideal tier for your counter speed and accounting controls')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Active Plan Callout */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{isAr ? 'الباقة الحالية للمتجر:' : 'Current Store Plan:'}</span>
              <span className="text-xs font-black text-white px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700">
                {currentTier === 1 ? 'Tier 1: Baqala (299 AED/mo)' : currentTier === 2 ? 'Tier 2: Mart (599 AED/mo)' : 'Tier 3: Franchise (899 AED/mo)'}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {isAr ? '٠٪ عمولة على المبيعات' : '0% Commission on Orders'}
            </span>
          </div>

          {/* 3 Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = currentTier === plan.tier;
              const PlanIcon = plan.icon;

              return (
                <div
                  key={plan.tier}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative ${
                    plan.popular
                      ? 'bg-slate-950 border-amber-500/60 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : isCurrent
                      ? 'bg-slate-950/90 border-emerald-500/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow">
                      {isAr ? 'الأكثر طلباً' : 'Accountant Choice'}
                    </span>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                        <PlanIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${plan.badgeColor}`}>
                        Tier {plan.tier}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white">{isAr ? plan.nameAr : plan.name}</h3>
                    <p className="text-[11px] text-slate-400 min-h-[32px] mt-1 mb-3">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{plan.price}</span>
                        <span className="text-xs font-bold text-slate-400">AED / {isAr ? 'شهر' : 'month'}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold">{isAr ? 'ثابت بدون عمولات' : 'Flat rate, zero take-rate'}</span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          {feat.included ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                          )}
                          <span className={feat.included ? 'text-slate-300' : 'text-slate-600 line-through'}>
                            {isAr ? feat.ar : feat.en}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isAr ? 'الباقة النشطة حالياً' : 'Current Active Plan'}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectTier(plan.tier)}
                        disabled={isUpdating}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                          plan.tier > currentTier
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <span>
                          {plan.tier > currentTier 
                            ? (isAr ? `ترقية إلى باقة (${plan.price} درهم)` : `Upgrade to Tier ${plan.tier}`) 
                            : (isAr ? `تغيير إلى باقة (${plan.price} درهم)` : `Switch to Tier ${plan.tier}`)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs animate-bounce">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{isAr ? 'فواتير الاشتراك شهرية مع فترة سماح ١٠ أيام' : 'Monthly billing with 10-day payment grace period.'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
