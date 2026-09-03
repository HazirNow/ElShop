import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Building, 
  MessageCircle, 
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Sliders,
  Receipt,
  FileText
} from 'lucide-react';
import { CustomerProfile, Order, Store, Language, KhataTransaction } from '../types';
import { updateCustomer, settleCustomerKhata } from '../api';
import { calculateCustomerKhataBalance } from '../khataUtils';
import { useTierAccess } from '../hooks/useTierAccess';
import { ElShopLogo } from './ElShopLogo';
import { notifyError } from '../utils/errorHandler';

interface CustomerCreditAdjustmentModalProps {
  customer: CustomerProfile;
  store: Store;
  orders: Order[];
  khataTransactions?: KhataTransaction[];
  lang: Language;
  onClose: () => void;
  onRefresh: () => void;
  onOpenUpgradeModal?: (title?: string) => void;
}

export const CustomerCreditAdjustmentModal: React.FC<CustomerCreditAdjustmentModalProps> = ({
  customer,
  store,
  orders,
  khataTransactions = [],
  lang,
  onClose,
  onRefresh,
  onOpenUpgradeModal,
}) => {
  const isRtl = lang === 'ar';
  const { canSetCreditLimits, isTier1 } = useTierAccess(store.subscriptionTier);

  // Customer orders
  const customerOrders = orders.filter(
    (o) => (o.customerId === customer.id || o.customerPhone === customer.phone) && o.status !== 'cancelled'
  );

  const khataOrders = customerOrders.filter((o) => o.paymentMethod === 'khata' && o.paymentStatus === 'khata_debited');
  const outstandingKhataBalance = calculateCustomerKhataBalance(khataTransactions, customer.id, customer.phone);

  const [isPreApproved, setIsPreApproved] = useState(customer.isKhataPreApproved);
  const [creditLimit, setCreditLimit] = useState<number>(customer.creditLimit ?? 500);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settlement tab / form
  const [activeSubTab, setActiveSubTab] = useState<'adjust' | 'history' | 'settle'>('adjust');
  const [settleAmount, setSettleAmount] = useState<string>(outstandingKhataBalance > 0 ? outstandingKhataBalance.toFixed(2) : '100');
  const [isFullSettlement, setIsFullSettlement] = useState(false);
  const [settleNote, setSettleNote] = useState<string>('Cash received at store');
  const [settleMethod, setSettleMethod] = useState<'cash' | 'card' | 'bank'>('cash');
  const [isSettling, setIsSettling] = useState(false);
  const [settleSuccess, setSettleSuccess] = useState(false);

  const remainingCredit = Math.max(0, creditLimit - outstandingKhataBalance);
  const isOverLimit = outstandingKhataBalance > creditLimit;
  const utilizationPct = Math.min(100, Math.round((outstandingKhataBalance / (creditLimit || 1)) * 100));

  const handleSaveCreditSettings = async () => {
    setIsSaving(true);
    try {
      await updateCustomer(customer.id, {
        isKhataPreApproved: isPreApproved,
        creditLimit: Number(creditLimit),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onRefresh();
    } catch (err) {
      notifyError(err, 'Failed to update customer credit limit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = parseFloat(settleAmount);
    if (!isFullSettlement && (isNaN(numericAmt) || numericAmt <= 0)) return;

    setIsSettling(true);
    try {
      await settleCustomerKhata(customer.id, {
        amount: isFullSettlement ? outstandingKhataBalance : numericAmt,
        fullSettlement: isFullSettlement,
        note: settleNote,
        method: settleMethod,
        storeId: store.id,
        customerPhone: customer.phone,
      });
      setSettleSuccess(true);
      setTimeout(() => setSettleSuccess(false), 3000);
      onRefresh();
    } catch (err) {
      notifyError(err, 'Failed to record Khata settlement');
    } finally {
      setIsSettling(false);
    }
  };

  const generateWhatsAppStatement = () => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const storeName = isRtl ? store.nameAr : store.name;
    const msg = isRtl
      ? `مرحباً ${customer.name}، إليك كشف حسابك الشهري من متجر ${storeName}.\n\nالرصيد المستحق: ${outstandingKhataBalance.toFixed(2)} درهم\nالحد الائتماني: ${creditLimit} درهم\n\nعدد الطلبات المسجلة: ${khataOrders.length}\nشكراً لتسوقك معنا عبر ElShop!`
      : `Hello ${customer.name}, here is your store credit statement from ${storeName}.\n\n*Outstanding Khata Balance:* ${outstandingKhataBalance.toFixed(2)} AED\n*Approved Credit Limit:* ${creditLimit} AED\n*Remaining Available:* ${remainingCredit.toFixed(2)} AED\n\nTotal Pending Orders: ${khataOrders.length}\nThank you for ordering with us on ElShop!`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'whatsapp://send' : 'https://wa.me';
    const target = isMobile ? `${baseUrl}?phone=${cleanPhone}&text=${encodeURIComponent(msg)}` : `${baseUrl}/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(target, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg shadow">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">{customer.name}</h3>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    isPreApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isPreApproved ? 'Khata Approved' : 'Standard'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-500" />
                  {customer.building} • Unit {customer.unit}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-400">{customer.phone}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khata Balance Snapshot Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-5 py-3 grid grid-cols-3 gap-3 text-center shrink-0">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Approved Limit</span>
            <span className="text-sm sm:text-base font-extrabold text-white">{creditLimit} AED</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Khata Balance</span>
            <span className={`text-sm sm:text-base font-extrabold ${isOverLimit ? 'text-rose-400' : 'text-amber-400'}`}>
              {outstandingKhataBalance.toFixed(2)} AED
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Available Credit</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-400">{remainingCredit.toFixed(2)} AED</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 gap-4 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('adjust')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'adjust'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Credit Limit & Approval</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Order & Payment History ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settle')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'settle'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Record Settlement</span>
          </button>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* --- SUBTAB 1: QUICK CREDIT ADJUSTMENT --- */}
          {activeSubTab === 'adjust' && (
            <div className="space-y-4">
              {/* Khata Approval Toggle Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPreApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Monthly Store Credit (Khata) Pre-Approval</h4>
                    <p className="text-[11px] text-slate-400">
                      When enabled, resident can order daily groceries without upfront payment up to their credit limit.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreApproved(!isPreApproved)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPreApproved ? 'bg-[#0B6E4F]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isPreApproved ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Credit Limit Setting */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                {!canSetCreditLimits && (
                  <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs mb-2">
                    <div className="flex items-center gap-2 text-amber-300">
                      <span className="text-sm font-bold">🔒</span>
                      <span>
                        <strong className="text-amber-200">Customer Credit Limits:</strong> Available on Mart & Franchise plans.
                      </span>
                    </div>
                    {onOpenUpgradeModal && (
                      <button
                        type="button"
                        onClick={() => onOpenUpgradeModal('Customer Credit Limit Enforcement')}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs shrink-0 transition-all"
                      >
                        Upgrade Plan
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>Maximum Credit Limit (AED)</span>
                    {!canSetCreditLimits && (
                      <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        Tier 2/3 Feature
                      </span>
                    )}
                  </label>
                  <span className="text-xs font-mono font-extrabold text-amber-400">
                    {creditLimit} AED
                  </span>
                </div>

                {/* Number Input */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">AED</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    disabled={!canSetCreditLimits}
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Math.max(0, parseFloat(e.target.value) || 0))}
                    className={`w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                      !canSetCreditLimits ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                  {[200, 350, 500, 750, 1000, 1500, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={!canSetCreditLimits}
                      onClick={() => setCreditLimit(preset)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        creditLimit === preset
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-900 hover:bg-slate-700 text-slate-300 border-slate-700'
                      } ${!canSetCreditLimits ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {preset} AED
                    </button>
                  ))}
                </div>

                {/* Credit Meter */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Credit Utilization ({utilizationPct}%)</span>
                    <span>{outstandingKhataBalance.toFixed(2)} / {creditLimit} AED</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all ${isOverLimit ? 'bg-rose-500' : 'bg-amber-400'}`}
                      style={{ width: `${utilizationPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveCreditSettings}
                  disabled={isSaving}
                  className="flex-1 bg-[#0B6E4F] hover:bg-emerald-600 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Updating Credit Settings...' : saveSuccess ? 'Updated Successfully! ✓' : 'Save Credit Limit'}</span>
                </button>

                <button
                  type="button"
                  onClick={generateWhatsAppStatement}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-600/40 font-bold py-3 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Statement</span>
                </button>
              </div>
            </div>
          )}

          {/* --- SUBTAB 2: PAYMENT & ORDER HISTORY --- */}
          {activeSubTab === 'history' && (
            <div className="space-y-3">
              {customerOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-xs font-semibold">No orders recorded yet for this customer.</p>
                </div>
              ) : (
                customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 space-y-2.5 shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-white">#{order.id}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            order.paymentMethod === 'khata'
                              ? order.paymentStatus === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : order.paymentMethod === 'card'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-700 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {order.paymentMethod === 'khata'
                            ? order.paymentStatus === 'paid'
                              ? 'Khata (Paid)'
                              : 'Khata (Unpaid Tab)'
                            : order.paymentMethod.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-xs text-emerald-400 block">{order.total.toFixed(2)} AED</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Order Items list */}
                    <div className="bg-slate-900/80 p-2 rounded-xl text-[11px] text-slate-300 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-mono text-slate-400">{(item.price * item.quantity).toFixed(2)} AED</span>
                        </div>
                      ))}
                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between items-center text-slate-500 pt-0.5 border-t border-slate-800">
                          <span>Delivery Fee</span>
                          <span>{order.deliveryFee.toFixed(2)} AED</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* --- SUBTAB 3: RECORD PAYMENT / SETTLEMENT --- */}
          {activeSubTab === 'settle' && (
            <form onSubmit={handleRecordSettlement} className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>Receive Payment & Deduct Khata Balance</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Log payments received directly from the resident via cash, card terminal, or bank transfer to clear unpaid Khata grocery tabs.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Settlement Amount (AED) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">AED</span>
                    <input
                      type="number"
                      step="0.50"
                      min="1"
                      required
                      value={settleAmount}
                      onChange={(e) => setSettleAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-3 py-2 text-sm text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cash', label: 'Cash' },
                      { id: 'card', label: 'Card POS' },
                      { id: 'bank', label: 'Bank / PayBy' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSettleMethod(m.id as any)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          settleMethod === m.id
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Notes / Receipt Reference</label>
                  <input
                    type="text"
                    value={settleNote}
                    onChange={(e) => setSettleNote(e.target.value)}
                    placeholder="e.g. Paid in full for July tab"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSettling}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSettling ? 'Recording Settlement...' : settleSuccess ? 'Payment Recorded & Settled! ✓' : 'Confirm Khata Settlement'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center shrink-0 flex items-center justify-between px-5">
          <ElShopLogo size="xs" variant="badge" showCountry />
          <span className="text-[10px] text-slate-500 font-medium">Khata Credit & Resident Account Manager</span>
        </div>

      </div>
    </div>
  );
};
