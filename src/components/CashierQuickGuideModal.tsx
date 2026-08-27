import React from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  QrCode, 
  Coins, 
  PackageCheck, 
  Truck, 
  WifiOff, 
  AlertCircle, 
  Clock, 
  HelpCircle,
  Sparkles,
  PhoneCall,
  CheckCircle2
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      id="cashier-quick-guide-modal"
    >
      {/* Print CSS Stylesheet for Single-Page High-Density Output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-quick-guide, #printable-quick-guide * {
            visibility: visible;
          }
          #printable-quick-guide {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 12px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div 
        id="printable-quick-guide"
        className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:rounded-none print:border-none print:shadow-none"
      >
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              📋
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {isRtl ? 'دليل التشغيل السريع للكاشير (A4 Cheat Sheet)' : 'ElShop Operational Quick Guide (Printable A4)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Print-ready single-sheet guide for cashier desk and counter clipping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isRtl ? 'طباعة الدليل (Print PDF)' : 'Print Guide (1-Page A4)'}</span>
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
        <div className="p-6 space-y-4 text-xs font-sans">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl border-2 border-emerald-500 shrink-0">
                EL
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  ElShop POS • Operational Quick Guide
                </h1>
                <h2 className="text-sm font-bold text-slate-600">
                  دليل التشغيل السريع لموظفي الصندوق والمحاسبين (10-Store Pilot Standard)
                </h2>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-600">
              <p className="font-bold text-slate-900">{store?.name || 'Al Madina Fresh Grocer'}</p>
              <p>Store ID: <span className="font-bold">{store?.id || 'store-001'}</span></p>
              <p>Standard SLA: <span className="font-bold text-emerald-700">12 Mins</span></p>
            </div>
          </div>

          {/* 6 Step Quick Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 print:grid-cols-2">
            
            {/* Step 1: Shift Opening */}
            <div className="border-2 border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/60 print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  1
                </div>
                <h4 className="font-black text-xs text-slate-900">
                  Start Shift & Float Setup / بدء الوردية والصندوق
                </h4>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-7 list-disc">
                <li>Count opening register float (default: <strong>200.00 AED</strong> in small notes & coins).</li>
                <li>Check thermal printer green light & ensure 58mm/80mm paper roll is seated.</li>
                <li>Enter your <strong>4-digit Cashier PIN</strong> to activate order terminal.</li>
              </ul>
            </div>

            {/* Step 2: Order Acceptance */}
            <div className="border-2 border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/60 print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  2
                </div>
                <h4 className="font-black text-xs text-slate-900">
                  Accept & Pack Order / استلام وتجهيز الطلب
                </h4>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-7 list-disc">
                <li>When audio chime rings, tap <strong>"Accept (قبول)"</strong> within 60 seconds.</li>
                <li>Check off each physical grocery item from the digital packing list.</li>
                <li>Write <strong>Tower Name & Flat #</strong> on paper bag (e.g. <em>Princess Tower #1402</em>).</li>
              </ul>
            </div>

            {/* Step 3: Receipt Printing */}
            <div className="border-2 border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/60 print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  3
                </div>
                <h4 className="font-black text-xs text-slate-900">
                  Thermal Receipt Printing / طباعة الفاتورة الحرارية
                </h4>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-7 list-disc">
                <li>Tap <strong>"Print Receipt (طباعة)"</strong> on the order screen.</li>
                <li>Staple customer receipt (with QR code) to outer bag.</li>
                <li>Verify payment type badge: <strong>CASH (نقدي)</strong>, <strong>CARD (بطاقة)</strong>, or <strong>KHATA (دفتر آجل)</strong>.</li>
              </ul>
            </div>

            {/* Step 4: Rider Doorstep COD */}
            <div className="border-2 border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/60 print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  4
                </div>
                <h4 className="font-black text-xs text-slate-900">
                  Rider Dispatch & Elevator Batching / تسليم السائق
                </h4>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-7 list-disc">
                <li>Combine multiple orders going to the same building for 1 elevator run.</li>
                <li>Hand exact change float to rider if customer requested large bill change.</li>
                <li>Collect and reconcile cash instantly upon runner return.</li>
              </ul>
            </div>

            {/* Step 5: End Shift Reconciliation */}
            <div className="border-2 border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/60 print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  5
                </div>
                <h4 className="font-black text-xs text-slate-900">
                  End Shift Reconciliation / إغلاق الوردية والمطابقة
                </h4>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-7 list-disc">
                <li>Tap <strong>"End-of-Shift Cash Reconciliation"</strong> in top header.</li>
                <li>Count 100, 50, 20, 10 AED notes and coins into denomination counter.</li>
                <li><strong>Zero Variance (0.00 AED)</strong> closes automatically. Discrepancy requires Manager PIN.</li>
              </ul>
            </div>

            {/* Step 6: Emergency Offline Mode */}
            <div className="border-2 border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/60 print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  6
                </div>
                <h4 className="font-black text-xs text-slate-900">
                  Offline Emergency Mode / وضع عدم الاتصال بالإنترنت
                </h4>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-7 list-disc">
                <li>If store Wi-Fi drops, system automatically activates offline mode.</li>
                <li>Tap <strong>"Quick Offline Order"</strong> to register walk-in sales normally.</li>
                <li>All sales queue locally and sync automatically when internet restores.</li>
              </ul>
            </div>

          </div>

          {/* Quick Denomination Reference & Emergency Footer */}
          <div className="border-2 border-slate-900 rounded-xl p-3 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 print:bg-slate-100 print:text-slate-900 print:border-slate-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-slate-950 rounded-lg font-black text-lg">
                ⚡
              </div>
              <div>
                <p className="font-extrabold text-xs">
                  Emergency Support & Dispatch Helpdesk
                </p>
                <p className="text-[10px] text-slate-300 print:text-slate-600">
                  WhatsApp: <strong>+971 50 123 4567</strong> • Store Hotkey: <strong>*778</strong> • Web: <strong>elshop.ae/pos</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right text-[10px] text-slate-300 print:text-slate-700 font-mono">
              <div>
                <p>Manager PIN: <span className="font-bold text-white print:text-slate-900">{store?.pin || '1234'}</span></p>
                <p>Rider PIN: <span className="font-bold text-white print:text-slate-900">{store?.riderPin || '5678'}</span></p>
              </div>
            </div>
          </div>

          {/* Verification Barcode / Footer Note */}
          <div className="text-center text-[10px] text-slate-500 border-t border-slate-200 pt-2 flex items-center justify-between font-mono">
            <span>ElShop Operating System v1.0.0 • Dubai Pilot Edition</span>
            <span>Document Code: EL-QG-2026-A4</span>
            <span>All Rights Reserved © 2026</span>
          </div>

        </div>
      </div>
    </div>
  );
};
