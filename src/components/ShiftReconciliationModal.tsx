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
  Coins,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
  Info
} from 'lucide-react';

import { AppState, Store, Language, Order } from '../types';
import { submitSettlement } from '../api';
import { formatWhatsAppNumber, formatWhatsAppDeepLink } from '../lib/whatsapp';
import { notifyError } from '../utils/errorHandler';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  store: Store;
  lang: Language;
  tillId?: string;
  tillHardwareToken?: string;
  onSuccess?: () => void;
}

// UAE Dirham Official Denominations in Fils (1 AED = 100 Fils)
const UAE_DENOMINATIONS: { key: string; label: string; fils: number; type: 'note' | 'coin' }[] = [
  { key: '1000', label: '1,000 AED', fils: 100000, type: 'note' },
  { key: '500', label: '500 AED', fils: 50000, type: 'note' },
  { key: '200', label: '200 AED', fils: 20000, type: 'note' },
  { key: '100', label: '100 AED', fils: 10000, type: 'note' },
  { key: '50', label: '50 AED', fils: 5000, type: 'note' },
  { key: '20', label: '20 AED', fils: 2000, type: 'note' },
  { key: '10', label: '10 AED', fils: 1000, type: 'note' },
  { key: '5', label: '5 AED', fils: 500, type: 'note' },
  { key: '1', label: '1 AED', fils: 100, type: 'coin' },
  { key: '0.50', label: '50 Fils (0.50)', fils: 50, type: 'coin' },
  { key: '0.25', label: '25 Fils (0.25)', fils: 25, type: 'coin' }
];

export const ShiftReconciliationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  state,
  store,
  lang,
  tillId = 'till-1',
  tillHardwareToken,
  onSuccess
}) => {
  const isAr = lang === 'ar';
  const effectiveTillCode = tillId === 'till-2' ? 'TILL-02' : tillId === 'till-3' ? 'TILL-03' : 'TILL-01';
  const effectiveHardwareToken = tillHardwareToken || 'POS-HW-MAIN';
  
  // Date calculation supporting both local UAE date and UTC
  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];
  const todayLocal = now.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

  // Store orders delivered today (checks both local date and UTC string)
  const storeOrders = (state.orders || []).filter((o) => o.storeId === store.id);
  const deliveredToday = storeOrders.filter((o) => {
    if (o.status !== 'delivered') return false;
    const isToday = o.createdAt.startsWith(todayIso) || o.createdAt.startsWith(todayLocal);
    return isToday;
  });

  // Calculate Shift System Totals (Calculated in integer fils to avoid floating point drift)
  const cashSalesFils = deliveredToday
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + Math.round((o.total || 0) * 100), 0);

  const cardSalesFils = deliveredToday
    .filter((o) => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + Math.round((o.total || 0) * 100), 0);

  const khataSalesFils = deliveredToday
    .filter((o) => o.paymentMethod === 'khata')
    .reduce((sum, o) => sum + Math.round((o.total || 0) * 100), 0);

  const cashSales = cashSalesFils / 100;
  const cardSales = cardSalesFils / 100;
  const khataSales = khataSalesFils / 100;

  // Opening Float & Payouts State
  const [openingFloatInput, setOpeningFloatInput] = useState<string>('200.00'); // Standard retail opening float (200 AED)
  const [payoutsInput, setPayoutsInput] = useState<string>('0.00'); // Cash expenses taken from till during shift
  const [shiftType, setShiftType] = useState<'morning' | 'evening' | 'night'>('evening');
  const [cashierName, setCashierName] = useState<string>('Rashid K. (Cashier)');

  // Denomination Counts: map key -> count
  const [denomCounts, setDenomCounts] = useState<Record<string, number>>({
    '1000': 0,
    '500': 0,
    '200': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '1': 0,
    '0.50': 0,
    '0.25': 0
  });

  const [denominationsMode, setDenominationsMode] = useState(false);
  const [physicalCountInput, setPhysicalCountInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [varianceReason, setVarianceReason] = useState<string>('counting_error');
  const [managerNotes, setManagerNotes] = useState<string>('');

  // Float and Payout calculations in fils
  const parsedFloatAED = parseFloat(openingFloatInput) || 0;
  const parsedFloatFils = Math.round(parsedFloatAED * 100);

  const parsedPayoutsAED = parseFloat(payoutsInput) || 0;
  const parsedPayoutsFils = Math.round(parsedPayoutsAED * 100);

  // Expected Cash in Drawer = Float + Cash Sales - Cash Payouts
  const expectedTotalFils = Math.max(0, parsedFloatFils + cashSalesFils - parsedPayoutsFils);
  const expectedCash = expectedTotalFils / 100;

  // Calculate sum from denominations in fils
  const notesFils = UAE_DENOMINATIONS
    .filter(d => d.type === 'note')
    .reduce((sum, d) => sum + (denomCounts[d.key] || 0) * d.fils, 0);

  const coinsFils = UAE_DENOMINATIONS
    .filter(d => d.type === 'coin')
    .reduce((sum, d) => sum + (denomCounts[d.key] || 0) * d.fils, 0);

  const totalDenomFils = notesFils + coinsFils;

  // Handle denomination count change
  const handleDenomChange = (key: string, count: number) => {
    const safeCount = Math.max(0, Math.floor(count));
    const nextCounts = { ...denomCounts, [key]: safeCount };
    setDenomCounts(nextCounts);

    const nextTotalFils = UAE_DENOMINATIONS.reduce((sum, d) => {
      return sum + (nextCounts[d.key] || 0) * d.fils;
    }, 0);

    setPhysicalCountInput((nextTotalFils / 100).toFixed(2));
  };

  const handleClearDenominations = () => {
    const cleared: Record<string, number> = {};
    UAE_DENOMINATIONS.forEach(d => { cleared[d.key] = 0; });
    setDenomCounts(cleared);
    setPhysicalCountInput('0.00');
  };

  // Physical count parsed
  const parsedPhysicalCount = physicalCountInput.trim() !== '' ? parseFloat(physicalCountInput) : null;
  const actualFils = parsedPhysicalCount !== null ? Math.round(parsedPhysicalCount * 100) : null;

  // Variance calculation in integer fils to avoid floating point drift
  const varianceFils = actualFils !== null ? actualFils - expectedTotalFils : null;
  const variance = varianceFils !== null ? varianceFils / 100 : null;

  const isBalanced = varianceFils !== null && varianceFils === 0;
  const isShort = varianceFils !== null && varianceFils < 0;
  const isOver = varianceFils !== null && varianceFils > 0;

  const handleApproveReconciliation = async () => {
    if (parsedPhysicalCount === null || varianceFils === null) return;
    setIsSubmitting(true);
    try {
      // 1. Submit Settlement API Record
      await submitSettlement({
        storeId: store.id,
        riderId: 'drawer-shift-closure',
        riderName: `Cash Drawer (${shiftType.toUpperCase()})`,
        expectedCash,
        actualCash: parsedPhysicalCount,
        status: isBalanced ? 'approved' : 'disputed',
        notes: `Shift Drawer Settlement | Till: ${effectiveTillCode} (${effectiveHardwareToken}) | ${cashierName} | Shift: ${shiftType} | Float: ${parsedFloatAED.toFixed(2)} AED | Sales: ${cashSales.toFixed(2)} AED | Payouts: ${parsedPayoutsAED.toFixed(2)} AED | Variance: ${variance! >= 0 ? '+' : ''}${variance!.toFixed(2)} AED | Reason: ${varianceReason} | Notes: ${managerNotes || 'None'}`
      });

      // 2. Persist to tenant-isolated and global localStorage for LossPrevention ROI audit logs
      try {
        const auditEntry = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          storeId: store.id,
          tillId,
          tillCode: effectiveTillCode,
          hardwareToken: effectiveHardwareToken,
          shiftType,
          cashierName,
          openingFloatFils: parsedFloatFils,
          cashSalesFils,
          payoutsFils: parsedPayoutsFils,
          expectedFils: expectedTotalFils,
          actualFils,
          varianceFils,
          reason: isBalanced 
            ? 'Shift closed — 100% exact cash drawer match' 
            : `${varianceReason.replace(/_/g, ' ')} (${variance! >= 0 ? '+' : ''}${variance!.toFixed(2)} AED)`,
          supervisorPinUsed: !isBalanced
        };

        const tenantKey = `pilot_cash_audit_trail_${store.id}`;
        const existingTenant = JSON.parse(localStorage.getItem(tenantKey) || '[]');
        existingTenant.unshift(auditEntry);
        localStorage.setItem(tenantKey, JSON.stringify(existingTenant.slice(0, 50)));

        const tillKey = `pilot_cash_audit_trail_${store.id}_${tillId}`;
        const existingTill = JSON.parse(localStorage.getItem(tillKey) || '[]');
        existingTill.unshift(auditEntry);
        localStorage.setItem(tillKey, JSON.stringify(existingTill.slice(0, 50)));

        const existingGlobal = JSON.parse(localStorage.getItem('pilot_cash_audit_trail') || '[]');
        existingGlobal.unshift(auditEntry);
        localStorage.setItem('pilot_cash_audit_trail', JSON.stringify(existingGlobal.slice(0, 50)));
      } catch (storageErr) {
        console.warn('Could not write audit trail to localStorage:', storageErr);
      }

      setIsCompleted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsCompleted(false);
        onClose();
      }, 1400);
    } catch (err) {
      notifyError(err, 'Reconciliation submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp formatted audit slip
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
        : `${variance > 0 ? '+' : ''}${variance.toFixed(2)} AED (${variance < 0 ? 'عجز / Shortage' : 'فائض / Surplus'})`
      : 'N/A';

    let text = '';
    if (isAr) {
      text = `📑 *محضر إغلاق وتدقيق صندوق الكاش (Shift Cash Reconciliation)*\n` +
        `🏪 *المتجر:* ${storeName}\n` +
        `👤 *الكاشير:* ${cashierName} | ⏰ *الوردية:* ${shiftType}\n` +
        `📅 *التاريخ:* ${dateFormatted} at ${timeFormatted}\n\n` +
        `💼 *العهدة الافتتاحية (Float):* ${parsedFloatAED.toFixed(2)} درهم\n` +
        `💵 *مبيعات الكاش المستلمة:* ${cashSales.toFixed(2)} درهم\n` +
        (parsedPayoutsAED > 0 ? `📤 *مصاريف نقدية مدفوعة من الصندوق:* ${parsedPayoutsAED.toFixed(2)} درهم\n` : '') +
        `═══════════════════\n` +
        `📥 *إجمالي النقد المتوقع في الدرج:* *${expectedCash.toFixed(2)} درهم*\n` +
        `💰 *النقد الفعلي المعدود:* *${parsedPhysicalCount !== null ? parsedPhysicalCount.toFixed(2) : '0.00'} درهم*\n` +
        `⚖️ *الفارق المالي (Variance):* *${varianceStr}*\n` +
        `═══════════════════\n` +
        `💳 *مبيعات البطاقة (POS):* ${cardSales.toFixed(2)} درهم\n` +
        `📖 *ديون الخاطة المسجلة:* ${khataSales.toFixed(2)} درهم\n` +
        `📦 *عدد الطلبات المنفذة:* ${deliveredToday.length} طلب\n` +
        (!isBalanced ? `⚠️ *سبب الفارق:* ${varianceReason}\n` : '') +
        (managerNotes ? `📝 *ملاحظات الإدارة:* ${managerNotes}\n` : '') +
        `\n✅ *الحالة:* ${isBalanced ? 'تمت المطابقة والاعتماد بنجاح' : 'تم اعتماد الفارق وقفل الوردية'}\n` +
        `_نظام ElShop للتحكم المالي للبقالات والمتاجر_`;
    } else {
      text = `📑 *Daily Cash Drawer Shift Reconciliation Audit*\n` +
        `🏪 *Store:* ${store.name}\n` +
        `👤 *Cashier:* ${cashierName} | ⏰ *Shift:* ${shiftType.toUpperCase()}\n` +
        `📅 *Date:* ${dateFormatted} at ${timeFormatted}\n\n` +
        `💼 *Opening Float:* ${parsedFloatAED.toFixed(2)} AED\n` +
        `💵 *Shift Cash Sales Collected:* ${cashSales.toFixed(2)} AED\n` +
        (parsedPayoutsAED > 0 ? `📤 *Cash Payouts / Expenses Out:* ${parsedPayoutsAED.toFixed(2)} AED\n` : '') +
        `═══════════════════\n` +
        `📥 *Expected Total in Drawer:* *${expectedCash.toFixed(2)} AED*\n` +
        `💰 *Physical Cash Counted:* *${parsedPhysicalCount !== null ? parsedPhysicalCount.toFixed(2) : '0.00'} AED*\n` +
        `⚖️ *Variance:* *${varianceStr}*\n` +
        `═══════════════════\n` +
        `💳 *Card POS Sales:* ${cardSales.toFixed(2)} AED\n` +
        `📖 *Khata Tab Orders:* ${khataSales.toFixed(2)} AED\n` +
        `📦 *Delivered Orders:* ${deliveredToday.length}\n` +
        (!isBalanced ? `⚠️ *Variance Reason:* ${varianceReason}\n` : '') +
        (managerNotes ? `📝 *Manager Notes:* ${managerNotes}\n` : '') +
        `\n✅ *Audit Status:* ${isBalanced ? 'Reconciled & Perfectly Balanced' : 'Variance Approved & Shift Closed'}\n` +
        `_ElShop Financial Control System_`;
    }

    const cleanPhone = formatWhatsAppNumber(store.phone || store.whatsappNumber || '971501234567');
    return formatWhatsAppDeepLink(cleanPhone, text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between shrink-0">
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
                {isAr ? 'تدقيق دقيق للنقد الفعلي في الدرج مع معادلة العهدة والمبيعات' : 'Precision cash drawer audit (Float + Cash Sales - Payouts vs Counted)'}
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Shift Metadata & Cashier Selection */}
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/60 px-2.5 py-1 rounded-lg">
                <span className="text-blue-400 font-bold">{effectiveTillCode}</span>
                <span className="text-[10px] text-slate-400 font-mono">({effectiveHardwareToken})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">{isAr ? 'الكاشير:' : 'Cashier:'}</span>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-semibold text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">{isAr ? 'الوردية:' : 'Shift:'}</span>
              {(['morning', 'evening', 'night'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShiftType(s)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase transition-all ${
                    shiftType === s
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Cash Drawer Balance Formula */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{isAr ? '1. معادلة الصندوق المتوقع (System Register Formula)' : '1. System Expected Cash Formula'}</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {isAr ? 'العهدة + مبيعات الكاش - المصروفات' : 'Float + Cash Sales - Payouts'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
              {/* Opening Float */}
              <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span>{isAr ? 'العهدة الافتتاحية' : 'Opening Float'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Float</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={openingFloatInput}
                    onChange={(e) => setOpeningFloatInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg py-1 px-2 text-sm font-bold text-white focus:outline-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">AED</span>
                </div>
                {/* Float quick presets */}
                <div className="flex gap-1 mt-1.5">
                  {['0', '100', '200', '500'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setOpeningFloatInput(`${f}.00`)}
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Sales Delivered Today */}
              <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span className="flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-amber-400" />
                    {isAr ? 'مبيعات الكاش' : 'Cash Sales'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">
                    {deliveredToday.filter(o => o.paymentMethod === 'cash').length} {isAr ? 'طلب' : 'orders'}
                  </span>
                </div>
                <div className="text-base font-black text-amber-400 mt-1">
                  +{cashSales.toFixed(2)} <span className="text-[10px] text-amber-500/70">AED</span>
                </div>
              </div>

              {/* Cash Payouts / Petty Cash Out */}
              <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span>{isAr ? 'مصروفات نقدية' : 'Cash Payouts'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Out</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={payoutsInput}
                    onChange={(e) => setPayoutsInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg py-1 px-2 text-sm font-bold text-rose-300 focus:outline-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">AED</span>
                </div>
              </div>

              {/* Total Expected Drawer Cash */}
              <div className="bg-amber-950/30 border-2 border-amber-500/50 p-3 rounded-xl flex flex-col justify-center">
                <div className="text-slate-400 text-[11px] font-bold">
                  {isAr ? 'إجمالي النقد المتوقع بالدرج:' : 'Expected in Drawer:'}
                </div>
                <div className="text-lg font-black text-amber-400 mt-0.5">
                  {expectedCash.toFixed(2)} <span className="text-xs text-amber-500/80">AED</span>
                </div>
              </div>
            </div>

            {/* Other Payment Channels Summary for Reference */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'بطاقات POS (خارج الدرج):' : 'Card POS (Electronic):'}</span>
                <span className="font-bold text-emerald-400">{cardSales.toFixed(2)} AED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>{isAr ? 'ديون الخاطة:' : 'Khata Ledger:'}</span>
                <span className="font-bold text-blue-400">{khataSales.toFixed(2)} AED</span>
              </div>
            </div>
          </div>

          {/* Step 2: Physical Cash Count & Denomination Breakdowns */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{isAr ? '2. النقد الفعلي المعدود في الدرج' : '2. Physical Cash Counted in Drawer'}</span>
              </label>

              <div className="flex items-center gap-3">
                {denominationsMode && (
                  <button
                    type="button"
                    onClick={handleClearDenominations}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isAr ? 'تصفير الفئات' : 'Reset Counts'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDenominationsMode(!denominationsMode)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
                >
                  {denominationsMode 
                    ? (isAr ? 'إدخال إجمالي مباشر' : 'Direct Total Mode') 
                    : (isAr ? 'عد الفئات النقدية (فئات الدرهم)' : 'Count Bill & Coin Denominations')}
                </button>
              </div>
            </div>

            {/* Direct Total Input */}
            <div className="relative">
              <input
                type="number"
                step="0.25"
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

            {/* Comprehensive UAE Denominations Calculator */}
            {denominationsMode && (
              <div className="mt-3 p-3.5 bg-slate-900/95 rounded-xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    {isAr ? 'حاسبة فئات الدرهم الإماراتي الرسمية (UAE Central Bank):' : 'UAE Currency Denominations Register:'}
                  </span>
                  <div className="text-[11px] font-bold text-slate-400 flex gap-3">
                    <span>{isAr ? 'الأوراق:' : 'Notes:'} <strong className="text-white">{(notesFils / 100).toFixed(2)} AED</strong></span>
                    <span>{isAr ? 'العملات:' : 'Coins:'} <strong className="text-amber-400">{(coinsFils / 100).toFixed(2)} AED</strong></span>
                  </div>
                </div>

                {/* Banknotes Grid */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-1.5">
                    {isAr ? 'الأوراق النقدية (Banknotes)' : 'Banknotes'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {UAE_DENOMINATIONS.filter(d => d.type === 'note').map((denom) => {
                      const count = denomCounts[denom.key] || 0;
                      const subtotalAED = ((count * denom.fils) / 100).toFixed(2);
                      return (
                        <div key={denom.key} className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 mb-1">
                            <span>{denom.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono">={subtotalAED}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDenomChange(denom.key, count - 1)}
                              disabled={count <= 0}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold flex items-center justify-center text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={count === 0 ? '' : count}
                              placeholder="0"
                              onChange={(e) => handleDenomChange(denom.key, parseInt(e.target.value) || 0)}
                              className="flex-1 bg-slate-900 text-white font-bold text-xs text-center rounded py-1 border border-slate-700 focus:border-amber-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleDenomChange(denom.key, count + 1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Coins Grid */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-1.5">
                    {isAr ? 'العملات المعدنية (Coins / Fils)' : 'Coins (Fils)'}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {UAE_DENOMINATIONS.filter(d => d.type === 'coin').map((denom) => {
                      const count = denomCounts[denom.key] || 0;
                      const subtotalAED = ((count * denom.fils) / 100).toFixed(2);
                      return (
                        <div key={denom.key} className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 mb-1">
                            <span>{denom.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono">={subtotalAED}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDenomChange(denom.key, count - 1)}
                              disabled={count <= 0}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold flex items-center justify-center text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={count === 0 ? '' : count}
                              placeholder="0"
                              onChange={(e) => handleDenomChange(denom.key, parseInt(e.target.value) || 0)}
                              className="flex-1 bg-slate-900 text-white font-bold text-xs text-center rounded py-1 border border-slate-700 focus:border-amber-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleDenomChange(denom.key, count + 1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Exact Variance & Reconciliation Status */}
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
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${isShort ? 'text-rose-400' : 'text-amber-400'}`} />
                  )}
                  <span className="font-extrabold text-sm">
                    {isBalanced 
                      ? (isAr ? 'الصندوق متطابق 100% بدون أي عجز (Balanced)' : 'Drawer Perfectly Balanced (Zero Variance)')
                      : isShort 
                        ? (isAr ? `يوجد عجز نقدي بقيمة ${Math.abs(variance!).toFixed(2)} درهم` : `Cash Shortage Detected: -${Math.abs(variance!).toFixed(2)} AED`)
                        : (isAr ? `يوجد فائض نقدي بقيمة +${variance!.toFixed(2)} درهم` : `Cash Surplus Detected: +${variance!.toFixed(2)} AED`)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{isAr ? 'الفارق المالي' : 'Net Variance'}</span>
                  <span className={`text-base font-black ${isBalanced ? 'text-emerald-400' : isShort ? 'text-rose-400' : 'text-amber-400'}`}>
                    {variance! > 0 ? `+${variance!.toFixed(2)}` : variance!.toFixed(2)} AED
                  </span>
                </div>
              </div>

              {/* Variance reason selection if variance exists */}
              {!isBalanced && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    {isAr ? 'سبب الفارق / التبرير المحاسبي للتدقيق:' : 'Mandatory Discrepancy Reason for Audit Trail:'}
                  </label>
                  <select
                    value={varianceReason}
                    onChange={(e) => setVarianceReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="counting_error">{isAr ? 'خطأ في عد النقود / تقريب كسور الفلس' : 'Counting / Coin Rounding Difference'}</option>
                    <option value="petty_cash_expense">{isAr ? 'مصاريف نثرية / مشتريات عاجلة لم تسجل' : 'Petty Cash / Unlogged Shop Expense'}</option>
                    <option value="customer_change_rounding">{isAr ? 'تسامح في باقي العميل (50-25 فلس)' : 'Customer Small Change Forgiven (25-50 Fils)'}</option>
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
              placeholder={isAr ? 'مثال: تم خصم 10 دراهم لشراء أكياس تغليف أو باقي عميل' : 'e.g. 15 AED used for grocery bag restock or customer change forgiving'}
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:border-slate-600 focus:outline-none"
            />
          </div>

          {/* Success Banner */}
          {isCompleted && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'تم اعتماد محضر الإغلاق بنجاح وحفظ السجل المالي والتدقيق' : 'Shift reconciled & audit trail successfully saved!'}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
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
