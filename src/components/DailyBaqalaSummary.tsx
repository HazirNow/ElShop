import React, { useState } from 'react';
import { 
  Banknote, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Share2, 
  Clock, 
  DollarSign,
  Store,
  Layers,
  Scale
} from 'lucide-react';
import { AppState, Store as StoreType, Language } from '../types';
import { calculateCustomerKhataBalance } from '../khataUtils';
import { formatWhatsAppNumber, formatWhatsAppDeepLink } from '../lib/whatsapp';
import { ShiftReconciliationModal } from './ShiftReconciliationModal';
import { useTierAccess } from '../lib/useTierAccess';

interface Props {
  state: AppState;
  store: StoreType;
  lang: Language;
  onRefresh?: () => void;
  onOpenUpgradeModal?: (featureTitle?: string) => void;
}

export const DailyBaqalaSummary: React.FC<Props> = ({ state, store, lang, onRefresh, onOpenUpgradeModal }) => {
  const isAr = lang === 'ar';
  const tierAccess = useTierAccess(store);
  const todayStr = new Date().toISOString().split('T')[0];
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);

  // Store orders
  const storeOrders = (state.orders || []).filter((o) => o.storeId === store.id);

  // Delivered today orders
  const deliveredToday = storeOrders.filter((o) => {
    const isDelivered = o.status === 'delivered';
    const isToday = o.createdAt.startsWith(todayStr);
    return isDelivered && isToday;
  });

  // Calculate Cash Collected Today
  const cashDeliveredTotal = deliveredToday
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  // Calculate Card Collected Today (both online and Handheld Mobile POS)
  const cardDeliveredTotal = deliveredToday
    .filter((o) => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.total, 0);

  // Total Outstanding Khata Debt (across all registered customers)
  const totalKhataOutstanding = (state.customers || []).reduce((sum, c) => {
    const bal = calculateCustomerKhataBalance(state.khataTransactions || [], c.id, c.phone);
    return sum + (bal > 0 ? bal : 0);
  }, 0);

  const totalRegisterGross = cashDeliveredTotal + cardDeliveredTotal;

  // Generate WhatsApp summary text for Store Owner / Management
  const generateDailyReportWhatsApp = () => {
    const dateFormatted = new Date().toLocaleDateString(isAr ? 'ar-AE' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const storeName = isAr ? store.nameAr || store.name : store.name;

    let text = '';
    if (isAr) {
      text = `📊 *تقرير ملخص صندوق البقالة اليومي* 🏪\n` +
        `🏪 *المتجر:* ${storeName}\n` +
        `📅 *التاريخ:* ${dateFormatted}\n\n` +
        `💵 *إجمالي النقد المستلم (كاش):* ${cashDeliveredTotal.toFixed(2)} درهم\n` +
        `💳 *إجمالي مدفوعات البطاقة (POS):* ${cardDeliveredTotal.toFixed(2)} درهم\n` +
        `💰 *إجمالي المبيعات المحصلة:* *${totalRegisterGross.toFixed(2)} درهم*\n\n` +
        `📦 *الطلبات المكتملة اليوم:* ${deliveredToday.length} طلب\n` +
        `📖 *إجمالي ديون دفتر الخاطة المعلقة:* ${totalKhataOutstanding.toFixed(2)} درهم\n\n` +
        `_تم التوليد تلقائياً عبر نظام ElShop_ ✨`;
    } else {
      text = `📊 *Daily Baqala Register & Cash Summary* 🏪\n` +
        `🏪 *Store:* ${store.name}\n` +
        `📅 *Date:* ${dateFormatted}\n\n` +
        `💵 *Cash Collected:* ${cashDeliveredTotal.toFixed(2)} AED\n` +
        `💳 *Card POS Collected:* ${cardDeliveredTotal.toFixed(2)} AED\n` +
        `💰 *Total Collected Today:* *${totalRegisterGross.toFixed(2)} AED*\n\n` +
        `📦 *Delivered Orders Today:* ${deliveredToday.length} orders\n` +
        `📖 *Total Outstanding Khata Ledger:* ${totalKhataOutstanding.toFixed(2)} AED\n\n` +
        `_Generated automatically by ElShop POS_ ✨`;
    }

    const cleanOwnerPhone = formatWhatsAppNumber(store.phone || store.whatsappNumber || '971501234567');
    return formatWhatsAppDeepLink(cleanOwnerPhone, text);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl mb-4">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <span>{isAr ? 'الملخص المالي اليومي للبقالة' : 'Daily Baqala Cash & Khata Summary'}</span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800/50">
                {isAr ? 'محدث لحظياً' : 'Live Register'}
              </span>
            </h3>
            <p className="text-slate-400 text-xs">
              {new Date().toLocaleDateString(isAr ? 'ar-AE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Top Actions: WhatsApp Report + End Shift Reconcile Button */}
        <div className="flex items-center gap-2">
          {/* End Shift / Drawer Reconciliation Modal Trigger */}
          <button
            type="button"
            onClick={() => {
              if (tierAccess.canReconcileDrawer) {
                setIsReconcileOpen(true);
              } else if (onOpenUpgradeModal) {
                onOpenUpgradeModal(isAr ? 'مطابقة وموازنة الصندوق وفئات الدراهم' : 'Cash Drawer Reconciliation & Denomination Counter');
              } else {
                setIsReconcileOpen(true);
              }
            }}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer ${
              tierAccess.canReconcileDrawer
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
            }`}
            title={
              tierAccess.canReconcileDrawer
                ? 'Reconcile AED cash drawer with system register'
                : 'Unlock cash drawer denomination counting with Mart Plan'
            }
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? 'إغلاق الوردية ومطابقة الصندوق' : 'End Shift / Reconcile Drawer'}</span>
            {!tierAccess.canReconcileDrawer && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/40 ml-1">
                Tier 2
              </span>
            )}
          </button>

          {/* 1-Tap WhatsApp Share */}
          <a
            href={generateDailyReportWhatsApp()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'تقرير واتساب 1-Tap' : '1-Tap WhatsApp'}</span>
          </a>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        {/* 1. Cash Collected */}
        <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>{isAr ? 'النقد المحصل اليوم' : 'Cash Collected'}</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-amber-400">
              {cashDeliveredTotal.toFixed(2)} <span className="text-xs font-semibold text-amber-500/80">AED</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {deliveredToday.filter(o => o.paymentMethod === 'cash').length} {isAr ? 'طلبات كاش' : 'cash orders'}
            </span>
          </div>
        </div>

        {/* 2. Card at Door / POS Collected */}
        <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>{isAr ? 'البطاقة / جهاز POS' : 'Card at Door (POS)'}</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-emerald-400">
              {cardDeliveredTotal.toFixed(2)} <span className="text-xs font-semibold text-emerald-500/80">AED</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {deliveredToday.filter(o => o.paymentMethod === 'card').length} {isAr ? 'طلبات بطاقة' : 'card orders'}
            </span>
          </div>
        </div>

        {/* 3. Khata Total Outstanding */}
        <div className="bg-slate-950/70 border border-blue-500/30 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>{isAr ? 'ديون دفتر الخاطة' : 'Khata Outstanding'}</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-blue-400">
              {totalKhataOutstanding.toFixed(2)} <span className="text-xs font-semibold text-blue-500/80">AED</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {isAr ? 'مستحق على سكان الأبراج' : 'due from residents'}
            </span>
          </div>
        </div>

        {/* 4. Orders Delivered */}
        <div className="bg-slate-950/70 border border-purple-500/30 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>{isAr ? 'طلبات تم تسليمها' : 'Delivered Today'}</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-purple-400">
              {deliveredToday.length} <span className="text-xs font-semibold text-purple-500/80">{isAr ? 'طلب' : 'orders'}</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {isAr ? 'إجمالي المقبوضات:' : 'Total gross:'} {totalRegisterGross.toFixed(2)} AED
            </span>
          </div>
        </div>
      </div>

      {/* End-of-Shift Reconciliation Modal */}
      <ShiftReconciliationModal
        isOpen={isReconcileOpen}
        onClose={() => setIsReconcileOpen(false)}
        state={state}
        store={store}
        lang={lang}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};
