import React from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  Check, 
  ShieldAlert, 
  BookOpen, 
  MessageCircle, 
  Download, 
  Scale 
} from 'lucide-react';
import { useMerchantStore } from './MerchantStoreContext';
import { ShiftReconciliationModal } from '../ShiftReconciliationModal';
import { calculateCustomerKhataBalance } from '../../khataUtils';
import { generateKhataWhatsAppLink } from '../../lib/whatsapp';

export const ReconciliationSection: React.FC = () => {
  const {
    state,
    store,
    lang,
    isRtl,
    t,
    onRefresh,
    storeRiders,
    settlementRiderId,
    setSettlementRiderId,
    actualCashInput,
    setActualCashInput,
    settlementNotes,
    setSettlementNotes,
    currentSettlementRider,
    riderCompletedOrders,
    expectedCashTotal,
    hasActualCashEntered,
    cashVariance,
    isSettlementBalanced,
    handleSubmitSettlementAction,
    handleExportKhataCSV,
    showShiftReconciliationModal,
    setShowShiftReconciliationModal,
  } = useMerchantStore();

  return (
    <motion.div
      key="settlement"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Top Action Ribbon for Reconciliation & Ledger Export */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'مطابقة الصندوق والديون (Khata)' : 'End-of-Day Register & Khata Reconciliation'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl
                ? 'تدقيق النقدية اليومية، وحساب فروقات السائقين، وسجل ديون الزبائن'
                : 'Audit physical drawer cash, rider deliveries, and export monthly Khata statements'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowShiftReconciliationModal(true)}
            className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition-all active:scale-95"
          >
            <Scale className="w-4 h-4" />
            <span>{isRtl ? 'مطابقة وردية الكاشير' : 'Open Shift Cash Audit'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportKhataCSV}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'تصدير كشف الديون (CSV)' : 'Export Khata CSV'}</span>
          </button>
        </div>
      </div>

      {/* Main Rider Cash Settlement Row */}
      <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>{t('cashSettlementTitle')}</span>
          </h3>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">
              {t('selectRider')}
            </label>
            <select
              value={settlementRiderId}
              onChange={(e) => {
                setSettlementRiderId(e.target.value);
                setActualCashInput('');
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
            >
              {storeRiders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.vehicle})
                </option>
              ))}
            </select>
          </div>

          {/* Calculations Card */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{t('expectedCash')} (Completed Cash Orders):</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {expectedCashTotal.toFixed(2)} AED
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                {t('actualCashHandedIn')}:
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="Enter cash handed in by rider..."
                value={actualCashInput}
                onChange={(e) => setActualCashInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">{t('variance')}:</span>
              {!hasActualCashEntered ? (
                <span className="text-xs font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                  Awaiting Cash Count
                </span>
              ) : (
                <span
                  className={`font-extrabold text-sm px-2.5 py-0.5 rounded ${
                    isSettlementBalanced
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : cashVariance < 0
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {cashVariance > 0 ? `+${cashVariance.toFixed(2)}` : cashVariance.toFixed(2)} AED{' '}
                  {cashVariance < 0 ? '(Shortage)' : cashVariance > 0 ? '(Surplus)' : '(Balanced)'}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">
                Settlement Audit Notes:
              </label>
              <input
                type="text"
                placeholder="Optional explanation (e.g. float adjustment, coin shortage)..."
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleSubmitSettlementAction('approved')}
              className="flex-1 bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('approveSettlement')}</span>
            </button>

            <button
              onClick={() => handleSubmitSettlementAction('disputed')}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('flagDispute')}</span>
            </button>
          </div>
        </div>

        {/* Rider Orders History List */}
        <div className="w-full md:w-80 bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col">
          <h4 className="font-bold text-xs text-slate-300 mb-3 border-b border-slate-800 pb-2">
            Completed Orders by {currentSettlementRider?.name} ({riderCompletedOrders.length})
          </h4>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56">
            {riderCompletedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 text-xs flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-white block">#{ord.id}</span>
                  <span className="text-[10px] text-slate-400">{ord.building}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">{ord.total.toFixed(2)} AED</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 bg-slate-700 rounded text-amber-300">
                    {ord.paymentMethod}
                  </span>
                </div>
              </div>
            ))}

            {riderCompletedOrders.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-6">
                No completed deliveries recorded yet for this rider.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Customer Store Credit Ledger WhatsApp Statements */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 mt-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Customer Store Credit Ledger & WhatsApp Statements</span>
          </h3>
          <span className="text-xs text-slate-400">
            {state.customers.length} registered customer accounts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {state.customers.map((cust) => {
            const totalKhataBalance = calculateCustomerKhataBalance(
              state.khataTransactions || [],
              cust.id,
              cust.phone
            );

            return (
              <div
                key={cust.id}
                className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-white">{cust.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        cust.isKhataPreApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cust.isKhataPreApproved ? 'Store Credit Approved' : 'Standard'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    {cust.building} • {cust.unit}
                  </p>
                  <div className="text-xs font-bold text-amber-300 mb-3 bg-slate-800 p-2 rounded-lg border border-slate-700/80">
                    Store Credit Balance: {totalKhataBalance.toFixed(2)} AED
                  </div>
                </div>

                <a
                  href={generateKhataWhatsAppLink(
                    cust,
                    isRtl ? store.nameAr : store.name,
                    totalKhataBalance,
                    lang
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{t('sendKhataWhatsApp')}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Shift & Cash Drawer Reconciliation Modal */}
      {showShiftReconciliationModal && (
        <ShiftReconciliationModal
          isOpen={showShiftReconciliationModal}
          onClose={() => setShowShiftReconciliationModal(false)}
          state={state}
          store={store}
          lang={lang}
          onSuccess={onRefresh}
        />
      )}
    </motion.div>
  );
};
