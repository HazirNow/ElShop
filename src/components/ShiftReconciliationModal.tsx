import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Banknote, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Calculator, 
  Share2, 
  ShieldCheck, 
  HelpCircle,
  Coins,
  FileSpreadsheet
} from 'lucide-react';

import { AppState, Store, Language, Order } from '../types';
import { submitSettlement } from '../api';
import { formatWhatsAppNumber, formatWhatsAppDeepLink } from '../lib/whatsapp';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  store: Store;
  lang: Language;
  onSuccess?: () => void;
}

export const ShiftReconciliationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  state,
  store,
  lang,
  onSuccess
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const todayStr = new Date().toISOString().split('T')[0];

  // Store orders delivered today
  const storeOrders = (state.orders || []).filter((o) => o.storeId === store.id);
  const deliveredToday = storeOrders.filter((o) => {
    const isDelivered = o.status === 'delivered';
    const isToday = o.createdAt.startsWith(todayStr);
    return isDelivered && isToday;
  });

  // Calculate System Totals
  const cashSales = deliveredToday
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = deliveredToday
    .filter((o) => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.total, 0);

  const khataSales = deliveredToday
    .filter((o) => o.paymentMethod === 'khata')
    .reduce((sum, o) => sum + o.total, 0);

  // Expected Cash in Drawer
  const expectedCash = parseFloat(cashSales.toFixed(2));

  // Local state for physical count & variance handling
  const [physicalCountInput, setPhysicalCountInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [varianceReason, setVarianceReason] = useState<string>('counting_error');
  const [managerNotes, setManagerNotes] = useState<string>('');
  const [denominationsMode, setDenominationsMode] = useState(false);

  // Quick denomination counter (AED bills)
  const [bills, setBills] = useState<{ [key: number]: number }>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0
  });

  // Update physical count when denominations change
  const handleBillCountChange = (denom: number, count: number) => {
    const nextBills = { ...bills, [denom]: Math.max(0, count) };
    setBills(nextBills);
    const sum = Object.entries(nextBills).reduce(
      (acc, [val, cnt]) => acc + Number(val) * Number(cnt),
      0
    );
    setPhysicalCountInput(sum > 0 ? sum.toFixed(2) : '');
  };

  const parsedPhysicalCount = physicalCountInput !== '' ? parseFloat(physicalCountInput) : null;
  const variance = parsedPhysicalCount !== null ? parseFloat((parsedPhysicalCount - expectedCash).toFixed(2)) : null;
  const isBalanced = variance !== null && Math.abs(variance) < 0.01;
  const isShort = variance !== null && variance < -0.01;
  const isOver = variance !== null && variance > 0.01;

  const handleApproveReconciliation = async () => {
    if (parsedPhysicalCount === null) return;
    setIsSubmitting(true);
    try {
      await submitSettlement({
        storeId: store.id,
        riderId: 'drawer-shift-closure',
        riderName: 'Shift Register Cash Drawer',
        expectedCash,
        actualCash: parsedPhysicalCount,
        status: isBalanced ? 'approved' : 'disputed',
        notes: `Shift Drawer Reconciliation | Status: ${
          isBalanced ? 'Balanced' : variance! < 0 ? `Short by ${Math.abs(variance!).toFixed(2)} AED` : `Over by ${variance!.toFixed(2)} AED`
        } | Reason: ${varianceReason} | Notes: ${managerNotes || 'None'}`
      });

      setIsCompleted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsCompleted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Reconciliation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp formatted report
  const generateWhatsAppReconciliationSlip = () => {
    const dateFormatted = new Date().toLocaleDateString(isAr ? 'ar-AE' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const timeFormatted = new Date().toLocaleTimeString(isAr ? 'ar-AE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const storeName = isAr ? store.nameAr || store.name : store.name;
    const varianceStr = variance !== null 
      ? isBalanced 
        ? '0.00 AED (متطابق بالكامل / Perfectly Balanced)' 
        : `${variance > 0 ? '+' : ''}${variance.toFixed(2)} AED (${variance < 0 ? 'عجز / Short' : 'فائض / Over'})`
      : 'N/A';

    let text = '';
    if (isAr) {
      text = `📑 *محضر إغلاق وتدقيق صندوق البقالة (End-of-Shift Reconciliation)*\n` +
        `🏪 *المتجر:* ${storeName}\n` +
        `📅 *التاريخ:* ${dateFormatted} | ⏰ ${timeFormatted}\n\n` +
        `💵 *النقد المتوقع في الصندوق:* *${expectedCash.toFixed(2)} درهم*\n` +
        `💰 *النقد الفعلي المعدود:* *${parsedPhysicalCount !== null ? parsedPhysicalCount.toFixed(2) : '0.00'} درهم*\n` +
        `⚖️ *الفارق (Variance):* *${varianceStr}*\n` +
        `💳 *مبيعات البطاقة (POS):* ${cardSales.toFixed(2)} درهم\n` +
        `📖 *ديون الخاطة المسجلة:* ${khataSales.toFixed(2)} درهم\n` +
        `📦 *عدد الطلبات المنفذة:* ${deliveredToday.length} طلب\n` +
        (managerNotes ? `📝 *ملاحظات الإدارة:* ${managerNotes}\n` : '') +
        `\n✅ *الحالة:* ${isBalanced ? 'تمت المطابقة والاعتماد بنجاح' : 'تم اعتماد الفارق وقفل الوردية'}\n` +
        `_نظام ElShop للتحكم المالي للبقالات والمتاجر_`;
    } else {
      text = `📑 *Daily Cash Drawer Shift Reconciliation Audit*\n` +
        `🏪 *Store:* ${store.name}\n` +
        `📅 *Date:* ${dateFormatted} at ${timeFormatted}\n\n` +
        `💵 *Expected Cash in Drawer:* *${expectedCash.toFixed(2)} AED*\n` +
        `💰 *Physical Cash Counted:* *${parsedPhysicalCount !== null ? parsedPhysicalCount.toFixed(2) : '0.00'} AED*\n` +
        `⚖️ *Variance:* *${varianceStr}*\n` +
        `💳 *Card POS Sales:* ${cardSales.toFixed(2)} AED\n` +
        `📖 *Khata Tab Orders:* ${khataSales.toFixed(2)} AED\n` +
        `📦 *Delivered Orders:* ${deliveredToday.length}\n` +
        (managerNotes ? `📝 *Manager Notes:* ${managerNotes}\n` : '') +
        `\n✅ *Audit Status:* ${isBalanced ? 'Reconciled & Perfectly Balanced' : 'Variance Approved & Shift Closed'}\n` +
        `_ElShop Financial Control System_`;
    }

    const cleanPhone = formatWhatsAppNumber(store.phone || store.whatsappNumber || '971501234567');
    return formatWhatsAppDeepLink(cleanPhone, text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{isAr ? 'إغلاق الوردية ومطابقة الصندوق' : 'End-of-Shift Cash Reconciliation'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {store.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'مطابقة النقد الفعلي في الدرج مع المبيعات المسجلة' : 'Verify physical cash in drawer against recorded sales'}
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: System Figures Overview */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {isAr ? '1. إجماليات السجل الرقمي (النظام)' : '1. System Register Totals'}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-950/80 border border-amber-500/30 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Banknote className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'كاش متوقع' : 'Expected Cash'}</span>
                </div>
                <div className="text-base font-black text-amber-400">
                  {expectedCash.toFixed(2)} <span className="text-[10px] text-amber-500/70">AED</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-emerald-500/30 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'مدفوعات POS' : 'Card / POS'}</span>
                </div>
                <div className="text-base font-black text-emerald-400">
                  {cardSales.toFixed(2)} <span className="text-[10px] text-emerald-500/70">AED</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-blue-500/30 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isAr ? 'ذمم الخاطة' : 'Khata Tab'}</span>
                </div>
                <div className="text-base font-black text-blue-400">
                  {khataSales.toFixed(2)} <span className="text-[10px] text-blue-500/70">AED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Physical Cash Count Input */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{isAr ? '2. النقد الفعلي المعدود في الدرج' : '2. Physical Cash Counted in Drawer'}</span>
              </label>
              <button
                type="button"
                onClick={() => setDenominationsMode(!denominationsMode)}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                {denominationsMode 
                  ? (isAr ? 'إدخال رقم مباشر' : 'Direct Total Entry') 
                  : (isAr ? 'عد الفئات النقدية' : 'Count Bill Denominations')}
              </button>
            </div>

            {/* Direct Total Input */}
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={physicalCountInput}
                onChange={(e) => setPhysicalCountInput(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-2xl py-3.5 px-4 text-2xl font-black text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                AED
              </span>
            </div>

            {/* Optional Bill Denominations Breakdown */}
            {denominationsMode && (
              <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isAr ? 'حاسبة فئات الدرهم الإماراتي:' : 'UAE Dirham Denominations:'}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 200, 100, 50, 20, 10, 5, 1].map((denom) => (
                    <div key={denom} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-amber-400 block">{denom} AED</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={bills[denom] || ''}
                        onChange={(e) => handleBillCountChange(denom, parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 text-white font-bold text-xs text-center rounded py-1 border border-slate-700 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Variance & Reconciliation Status */}
          {parsedPhysicalCount !== null && (
            <div className={`p-4 rounded-2xl border transition-all ${
              isBalanced 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : isShort 
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className={`w-5 h-5 ${isShort ? 'text-rose-400' : 'text-amber-400'}`} />
                  )}
                  <span className="font-extrabold text-sm">
                    {isBalanced 
                      ? (isAr ? 'الصندوق متطابق 100% (Reconciled)' : 'Cash Drawer Perfectly Balanced (Reconciled)')
                      : isShort 
                        ? (isAr ? `يوجد عجز نقدي بقيمة ${Math.abs(variance!).toFixed(2)} درهم` : `Cash Shortage Detected: -${Math.abs(variance!).toFixed(2)} AED`)
                        : (isAr ? `يوجد فائض نقدي بقيمة ${variance!.toFixed(2)} درهم` : `Cash Surplus Detected: +${variance!.toFixed(2)} AED`)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{isAr ? 'الفارق' : 'Variance'}</span>
                  <span className={`text-base font-black ${isBalanced ? 'text-emerald-400' : isShort ? 'text-rose-400' : 'text-amber-400'}`}>
                    {variance! > 0 ? `+${variance!.toFixed(2)}` : variance!.toFixed(2)} AED
                  </span>
                </div>
              </div>

              {/* Variance reason selection if variance exists */}
              {!isBalanced && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    {isAr ? 'سبب الفارق / التبرير المالي:' : 'Reason for Discrepancy:'}
                  </label>
                  <select
                    value={varianceReason}
                    onChange={(e) => setVarianceReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="counting_error">{isAr ? 'خطأ في عد النقود / تقريب كسور' : 'Counting / Coin Rounding Difference'}</option>
                    <option value="petty_cash_expense">{isAr ? 'مصاريف نثرية / مشتريات عاجلة لم تسجل' : 'Petty Cash / Unlogged Shop Expense'}</option>
                    <option value="customer_change_rounding">{isAr ? 'تسامح في باقي العميل' : 'Customer Small Change Forgiven'}</option>
                    <option value="unrecorded_withdrawal">{isAr ? 'سحب نقدي من صاحب المتجر' : 'Owner / Manager Cash Withdrawal'}</option>
                    <option value="theft_or_loss">{isAr ? 'فقدان أو عجز غير مبرر' : 'Unexplained Cash Shortage'}</option>
                    <option value="surplus_tips">{isAr ? 'إكراميات متبقية في الصندوق' : 'Surplus Tips Left in Register'}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Optional Manager Note */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              {isAr ? 'ملاحظات إضافية للمحاسب أو المالك:' : 'Auditor / Accountant Notes (Optional):'}
            </label>
            <input
              type="text"
              placeholder={isAr ? 'مثال: تم خصم 10 دراهم لشراء أكياس تغليف' : 'e.g. 15 AED used for grocery bag restock'}
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:border-slate-600 focus:outline-none"
            />
          </div>

          {/* Success Banner */}
          {isCompleted && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'تم اعتماد محضر الإغلاق بنجاح وحفظ السجل المالي' : 'Shift reconciled & audit trail successfully saved!'}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* 1-Tap WhatsApp Audit Slip */}
          <a
            href={generateWhatsAppReconciliationSlip()}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>{isAr ? 'إرسال محضر الإغلاق للواتساب' : 'Share Audit to WhatsApp'}</span>
          </a>

          {/* Confirm & Close Button */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleApproveReconciliation}
              disabled={parsedPhysicalCount === null || isSubmitting || isCompleted}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? (isAr ? 'جاري الحفظ...' : 'Saving...') 
                  : isBalanced 
                    ? (isAr ? 'اعتماد وإغلاق الوردية' : 'Reconcile & Close Shift') 
                    : (isAr ? 'اعتماد الفارق وإغلاق الوردية' : 'Approve Variance & Close')}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
