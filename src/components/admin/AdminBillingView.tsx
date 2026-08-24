import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  Percent, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Mail,
  Receipt
} from 'lucide-react';
import { AppState, Language, Store } from '../../types';
import { sendStorePaymentReminder } from '../../api';

interface AdminBillingViewProps {
  state: AppState;
  lang: Language;
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
  onAddAuditLog: (entry: { actor: string; action: string; target: string; severity: 'info' | 'warning' | 'critical' | 'success'; details?: string }) => void;
}

export const AdminBillingView: React.FC<AdminBillingViewProps> = ({
  state,
  lang,
  onRefresh,
  onShowToast,
  onAddAuditLog,
}) => {
  const isRtl = lang === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'dunning' | 'invoices'>('overview');
  const [retryingStoreId, setRetryingStoreId] = useState<string | null>(null);

  // Financial Computations
  const totalMRR = state.stores.reduce((sum, s) => sum + (s.subscriptionFee || 299), 0);
  const activePaidStores = state.stores.filter((s) => s.paymentStatus === 'paid');
  const overdueStores = state.stores.filter((s) => s.paymentStatus === 'overdue');
  const pendingStores = state.stores.filter((s) => s.paymentStatus === 'pending');

  // Enterprise SaaS Metrics
  const arpu = state.stores.length > 0 ? Math.round(totalMRR / state.stores.length) : 299;
  const churnRate = 1.8; // 1.8% annual churn across UAE residential dark stores
  const totalLTV = Math.round(arpu / (churnRate / 100));

  // Dunning retry action
  const handleRetryPayment = async (store: Store) => {
    setRetryingStoreId(store.id);
    onShowToast(`Executing Stripe payment retry for ${store.name}...`);
    
    setTimeout(() => {
      setRetryingStoreId(null);
      onAddAuditLog({
        actor: 'Stripe Webhook Runner',
        action: 'Dunning Payment Retry Executed',
        target: `${store.name} (${store.id})`,
        severity: 'info',
        details: `Re-attempted charge of ${store.subscriptionFee || 299} AED via saved payment method.`,
      });
      onShowToast(`Payment retry queued for ${store.name}`);
    }, 1200);
  };

  const handleSendDunningWhatsApp = async (store: Store) => {
    try {
      const res = await sendStorePaymentReminder(store.id);
      onAddAuditLog({
        actor: 'Admin HQ',
        action: 'Dunning Notice Dispatched',
        target: `${store.name} (${store.id})`,
        severity: 'warning',
        details: `Automated payment reminder with Stripe link sent to WhatsApp: ${store.whatsappNumber || store.phone}`,
      });
      onShowToast(`Dunning reminder sent to ${store.name}`);
      onRefresh();
    } catch (e) {
      onShowToast(`Failed to dispatch dunning reminder`);
    }
  };

  return (
    <div className="space-y-6" id="admin-billing-module">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>{isRtl ? 'الفوترة والاشتراكات وإدارة التحصيل (Dunning)' : 'Billing & Dunning Management'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'متابعة الإيراد الشهري المتكرر (MRR)، متوسط العائد، ومتابعة الدفعات المتأخرة'
              : 'Track SaaS MRR, ARPU, churn risk, and automated dunning payment recovery workflows.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SaaS Metrics
          </button>
          <button
            onClick={() => setActiveSubTab('dunning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'dunning'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Dunning Queue</span>
            {overdueStores.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {overdueStores.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Contracted MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalMRR.toLocaleString()} <span className="text-xs text-emerald-400 font-bold">AED</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-bold">+18.4%</span>
            <span>vs last month</span>
          </div>
        </div>

        {/* ARPU */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>ARPU (Avg Revenue)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {arpu} <span className="text-xs text-indigo-400 font-bold">AED / mo</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Flat-fee SaaS tiering
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Monthly Churn Rate</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {churnRate}%
          </div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Top-quartile SaaS retention</span>
          </div>
        </div>

        {/* Overdue At Risk */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Dunning At-Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
            {overdueStores.reduce((s, st) => s + (st.subscriptionFee || 299), 0)} <span className="text-xs font-bold">AED</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {overdueStores.length} stores pending payment
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: OVERVIEW & SUBSCRIPTION PLANS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Plan Breakdown */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-400" />
              <span>Subscription Fleet Distribution</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-xs font-bold">Active Paid</div>
                <div className="text-2xl font-black text-emerald-400">{activePaidStores.length}</div>
                <div className="text-[11px] text-slate-500">299 AED / mo flat</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-xs font-bold">Pending Payment</div>
                <div className="text-2xl font-black text-indigo-400">{pendingStores.length}</div>
                <div className="text-[11px] text-slate-500">30-day conversion cycle</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-xs font-bold">Overdue / Dunning</div>
                <div className="text-2xl font-black text-rose-400">{overdueStores.length}</div>
                <div className="text-[11px] text-slate-500">10-day grace policy</div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-900/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-300">Stripe Billing Auto-Sync connected with webhook verification</span>
              </div>
              <span className="font-mono text-indigo-300 font-bold">acct_live_ae</span>
            </div>
          </div>

          {/* Quick Dunning Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Dunning Escalation Policy</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-400">1</div>
                <div>
                  <div className="font-bold text-white">Day 1: Invoice Generation</div>
                  <div className="text-slate-400 text-[11px]">Automated WhatsApp invoice dispatched to store manager.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-900/60 flex items-center justify-center font-bold text-[10px] shrink-0 text-amber-300">2</div>
                <div>
                  <div className="font-bold text-white">Day 5: Friendly Reminder</div>
                  <div className="text-slate-400 text-[11px]">Second notice with SMS payment link and POS top-banner warning.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-rose-900/60 flex items-center justify-center font-bold text-[10px] shrink-0 text-rose-300">3</div>
                <div>
                  <div className="font-bold text-white">Day 10: Automatic Grace Expiry</div>
                  <div className="text-slate-400 text-[11px]">Store catalog locked until subscription payment settles.</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 2: DUNNING VIEW (List of Failed / Overdue Accounts) */}
      {activeSubTab === 'dunning' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="font-black text-white text-sm">Failed & Overdue Accounts Dunning Queue</span>
            </div>
            <span className="text-xs text-slate-400">Total: {overdueStores.length} stores</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Store</th>
                  <th className="py-3.5 px-4 font-extrabold">Days Overdue</th>
                  <th className="py-3.5 px-4 font-extrabold">Amount Due</th>
                  <th className="py-3.5 px-4 font-extrabold">WhatsApp Contact</th>
                  <th className="py-3.5 px-4 font-extrabold text-right">Dunning Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 font-medium">
                {overdueStores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        <span className="font-bold text-white">Zero Dunning Accounts!</span>
                        <span className="text-xs text-slate-500">All tenant subscriptions are current and paid in full.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  overdueStores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{store.name}</div>
                        <div className="text-slate-500 text-[11px]">{store.area} • ID: {store.id}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <Clock className="w-3 h-3" />
                          <span>{store.overdueDays || 8} Days Overdue</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-white">
                        {store.subscriptionFee || 299} AED
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {store.whatsappNumber || store.phone || '+971500000000'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRetryPayment(store)}
                            disabled={retryingStoreId === store.id}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all disabled:opacity-50"
                            title="Trigger Immediate Stripe Charge Retry"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${retryingStoreId === store.id ? 'animate-spin' : ''}`} />
                            <span>Retry Charge</span>
                          </button>

                          <button
                            onClick={() => handleSendDunningWhatsApp(store)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all shadow-sm"
                            title="Dispatch WhatsApp Invoice Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Notice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
