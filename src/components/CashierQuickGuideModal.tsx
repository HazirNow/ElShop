import React from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Coins, 
  Banknote, 
  CreditCard, 
  BookOpen, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  KeyRound, 
  Scale, 
  Calculator, 
  Zap, 
  QrCode, 
  Layers, 
  Store as StoreIcon,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Language, Store } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  store?: Store;
}

export const CashierQuickGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  store,
}) => {
  if (!isOpen) return null;
  const isRtl = lang === 'ar';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
      id="cashier-quick-guide-modal"
    >
      {/* High-Precision Single-Page A4 Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-quick-guide, #printable-quick-guide * {
            visibility: visible !important;
          }
          #printable-quick-guide {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 6mm !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 9pt !important;
            line-height: 1.25 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
        }
      `}</style>

      <div 
        id="printable-quick-guide"
        className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto print:rounded-none print:border-none print:shadow-none"
      >
        {/* Modal Action Bar (Hidden in Print Output) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              📋
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {isRtl ? 'دليل التشغيل السريع للكاشير (A4 Printable Guide)' : 'ElShop Operational Quick Guide (Printable A4)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                1-Page counter-clipped cheat sheet with app-matching icons (Arabic & English)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isRtl ? 'طباعة الدليل A4 (Print PDF)' : 'Print 1-Page PDF (A4)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-4 sm:p-5 space-y-3 text-slate-900 font-sans print:p-0 print:space-y-2.5">
          
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-2.5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg border-2 border-emerald-500 shrink-0">
                EL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                    ElShop POS • Operational Quick Guide
                  </h1>
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    10-Store Pilot Standard
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-600">
                  دليل التشغيل السريع لموظفي الصندوق والمحاسبين (مطابقة الوردية، طباعة الفواتير، وحالات الطوارئ)
                </h2>
              </div>
            </div>

            <div className="text-right text-[10px] font-mono text-slate-700 leading-tight">
              <p className="font-bold text-slate-950 text-xs">{store?.name || 'Al Madina Fresh Grocer'}</p>
              <p>Store ID: <span className="font-bold text-slate-900">{store?.id || 'store-001'}</span></p>
              <p>Target SLA: <span className="font-bold text-emerald-700">12 Mins Max</span></p>
            </div>
          </div>

          {/* 3 Main Pillar Columns / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3">
            
            {/* PILLAR 1: Shift Cash Reconciliation & Drawer Auditing */}
            <div className="border-2 border-slate-300 rounded-xl p-2.5 bg-slate-50/70 space-y-2 flex flex-col justify-between print:bg-white print:border-slate-400">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <div className="p-1 rounded bg-amber-500/20 text-amber-800">
                    <Scale className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-slate-900">
                      1. Shift Reconciliation
                    </h3>
                    <p className="text-[10px] text-slate-600 font-bold">
                      مطابقة وإغلاق الصندوق اليومي
                    </p>
                  </div>
                </div>

                {/* Instruction Steps */}
                <div className="space-y-1.5 text-[10.5px] text-slate-800">
                  <div className="flex items-start gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Denomination Tally / عد الفئات:</strong> Count physical 100, 50, 20, 10, 5 AED notes and 1 AED/50 fils coins into the POS calculator.
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Opening Float / العهدة:</strong> Deduct standard float (<strong>200.00 AED</strong>) before comparing shift revenue.
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Zero-Variance Target (0.00 AED):</strong> If counted cash exactly matches system total, shift closes instantly.
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Manager PIN Gate / موافقة المشرف:</strong> Any shortage or surplus requires 4-digit Manager PIN + logged reason in audit trail.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5 text-[9.5px] text-amber-900 font-medium">
                ⚡ <strong>Shift Rule:</strong> Never leave register un-audited at shift change. Always hand physical cash to shift manager.
              </div>
            </div>

            {/* PILLAR 2: Receipt Printing & Payment Methods */}
            <div className="border-2 border-slate-300 rounded-xl p-2.5 bg-slate-50/70 space-y-2 flex flex-col justify-between print:bg-white print:border-slate-400">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <div className="p-1 rounded bg-indigo-500/20 text-indigo-800">
                    <Printer className="w-4 h-4 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-slate-900">
                      2. Receipt Printing & Payments
                    </h3>
                    <p className="text-[10px] text-slate-600 font-bold">
                      طباعة الفواتير وطرق الدفع
                    </p>
                  </div>
                </div>

                {/* Instruction Steps */}
                <div className="space-y-1.5 text-[10.5px] text-slate-800">
                  <div className="flex items-start gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">CASH (الدفع نقداً):</strong> Hand rider exact change if requested. Reconcile collected notes immediately upon runner return.
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">CARD (بطاقة بنكية):</strong> Verify credit card terminal slip matches exact order fils before dispatching runner.
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">KHATA (دفتر الديون الآجل):</strong> Check tenant credit limit. Have customer or rider sign merchant receipt copy.
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-slate-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Thermal 58mm/80mm:</strong> Staple printed receipt with live QR to the outer grocery delivery bag.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-1.5 text-[9.5px] text-indigo-900 font-medium">
                📄 <strong>Printing Tip:</strong> If paper roll runs out, replace 80mm roll and tap <em>"Reprint Receipt"</em> on order card.
              </div>
            </div>

            {/* PILLAR 3: Emergency Status & Offline Recovery */}
            <div className="border-2 border-slate-300 rounded-xl p-2.5 bg-slate-50/70 space-y-2 flex flex-col justify-between print:bg-white print:border-slate-400">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <div className="p-1 rounded bg-rose-500/20 text-rose-800">
                    <WifiOff className="w-4 h-4 text-rose-700" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-slate-900">
                      3. Emergency & Offline Mode
                    </h3>
                    <p className="text-[10px] text-slate-600 font-bold">
                      حالات الطوارئ وانقطاع الإنترنت
                    </p>
                  </div>
                </div>

                {/* Instruction Steps */}
                <div className="space-y-1.5 text-[10.5px] text-slate-800">
                  <div className="flex items-start gap-1.5">
                    <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Offline Auto-Detect:</strong> POS automatically activates local IndexedDB storage if store Wi-Fi disconnects.
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Quick Offline Order:</strong> Tap the lightning icon to ring up walk-in customers normally with local receipts.
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Auto-Sync on Reconnect:</strong> All queued transactions upload seamlessly once internet is restored (0 data loss).
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Elevator Batching:</strong> In rush hours, combine 2-3 bags for the same residential tower in 1 elevator run.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-1.5 text-[9.5px] text-rose-900 font-medium">
                🚨 <strong>Emergency Contact:</strong> WhatsApp SOS Hotline: <strong>+971 50 123 4567</strong> • Store Override Code: <strong>*778</strong>
              </div>
            </div>

          </div>

          {/* Quick Cashier Reference Bar */}
          <div className="border border-slate-300 rounded-xl p-2 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-2 print:bg-slate-100 print:text-slate-900 print:border-slate-400">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg font-black text-xs shrink-0">
                POS
              </div>
              <div className="text-[10px]">
                <p className="font-extrabold text-white print:text-slate-900">
                  Standard Cashier Workflow (سير العمل اليومي)
                </p>
                <p className="text-slate-300 print:text-slate-600">
                  1. Open Float (200 AED) ➔ 2. Accept Orders &lt;60s ➔ 3. Staple Thermal Receipt ➔ 4. Dispatch Runner ➔ 5. Reconcile Cash
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right text-[9.5px] text-slate-300 print:text-slate-700 font-mono">
              <div>
                <span className="text-slate-400 print:text-slate-600">Manager PIN: </span>
                <strong className="text-white print:text-slate-900 bg-slate-800 print:bg-slate-200 px-1.5 py-0.5 rounded">{store?.pin || '1234'}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Runner PIN: </span>
                <strong className="text-white print:text-slate-900 bg-slate-800 print:bg-slate-200 px-1.5 py-0.5 rounded">{store?.riderPin || '5678'}</strong>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="text-center text-[9px] text-slate-500 border-t border-slate-200 pt-1.5 flex items-center justify-between font-mono">
            <span>ElShop Operating System v1.0.0 • Dubai Pilot Edition</span>
            <span>Ref: EL-QG-2026-A4 (Cashier Cheat Sheet)</span>
            <span>Zero-PII UAE PDPL Compliant</span>
          </div>

        </div>
      </div>
    </div>
  );
};
