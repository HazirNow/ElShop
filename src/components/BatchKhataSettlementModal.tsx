import React, { useState } from 'react';
import { 
  X, 
  Users, 
  MessageCircle, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Building, 
  Copy, 
  Check, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { CustomerProfile, Order, Store, Language, KhataTransaction } from '../types';
import { calculateCustomerKhataBalance } from '../khataUtils';
import { ElShopLogo } from './ElShopLogo';

interface BatchKhataSettlementModalProps {
  customers: CustomerProfile[];
  orders: Order[];
  khataTransactions?: KhataTransaction[];
  store: Store;
  lang: Language;
  onClose: () => void;
  onSelectCustomer: (cust: CustomerProfile) => void;
}

export const BatchKhataSettlementModal: React.FC<BatchKhataSettlementModalProps> = ({
  customers,
  orders,
  khataTransactions = [],
  store,
  lang,
  onClose,
  onSelectCustomer,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [sentCustomerIds, setSentCustomerIds] = useState<Record<string, boolean>>({});

  const isRtl = lang === 'ar';

  // Compute pending Khata balance per customer
  const customerLedgers = customers
    .map((cust) => {
      const custOrders = orders.filter(
        (o) =>
          (o.customerId === cust.id || o.customerPhone === cust.phone) &&
          o.paymentMethod === 'khata' &&
          o.paymentStatus === 'khata_debited' &&
          o.status !== 'cancelled'
      );
      const balance = calculateCustomerKhataBalance(khataTransactions, cust.id, cust.phone);
      return {
        customer: cust,
        orders: custOrders,
        balance,
      };
    })
    .filter((item) => item.balance > 0);

  const totalOutstanding = customerLedgers.reduce((sum, item) => sum + item.balance, 0);

  const handleSendStatement = (item: typeof customerLedgers[0]) => {
    const cleanPhone = item.customer.phone.replace(/[^0-9]/g, '');
    const storeName = isRtl ? store.nameAr : store.name;
    const msg = isRtl
      ? `مرحباً ${item.customer.name}، نود تذكيركم بكشف حساب البقالة الشهري (Khata) من متجر ${storeName}.\n\nالرصيد المستحق: ${item.balance.toFixed(2)} درهم\nعدد الطلبات: ${item.orders.length}\n\nيمكنكم السداد عند التوصيل القادم أو نقداً/بطاقة. شكراً لتسوقكم معنا عبر ElShop!`
      : `Hello ${item.customer.name}, friendly reminder of your monthly grocery store credit (Khata) with ${storeName}.\n\n*Outstanding Balance:* ${item.balance.toFixed(2)} AED\n*Unsettled Orders:* ${item.orders.length}\n\nYou can settle via card/cash on your next delivery. Thank you for shopping with us on ElShop!`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'whatsapp://send' : 'https://wa.me';
    const target = isMobile ? `${baseUrl}?phone=${cleanPhone}&text=${encodeURIComponent(msg)}` : `${baseUrl}/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    
    setSentCustomerIds((prev) => ({ ...prev, [item.customer.id]: true }));
    window.open(target, '_blank');
  };

  const handleCopyLedgerSummary = () => {
    const summaryLines = [
      `=== ${store.name} KHATA LEDGER AUDIT ===`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Outstanding: ${totalOutstanding.toFixed(2)} AED across ${customerLedgers.length} residents\n`,
      ...customerLedgers.map(
        (item) => `• ${item.customer.name} (${item.customer.building} - Unit ${item.customer.unit}): ${item.balance.toFixed(2)} AED [${item.orders.length} orders]`
      ),
    ];
    navigator.clipboard.writeText(summaryLines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                Batch Khata Settlement Reminders
              </h3>
              <p className="text-xs text-slate-400">
                Audit all residents with outstanding balances and send 1-click WhatsApp statements
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

        {/* Aggregate KPI Header */}
        <div className="bg-slate-950/70 border-b border-slate-800 p-4 grid grid-cols-2 gap-3 text-center shrink-0">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Total Outstanding Khata
            </span>
            <span className="text-xl font-black text-amber-400">{totalOutstanding.toFixed(2)} AED</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Residents with Unpaid Balances
            </span>
            <span className="text-xl font-black text-white">{customerLedgers.length} Accounts</span>
          </div>
        </div>

        {/* Customers Ledger List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {customerLedgers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
              <p className="text-sm font-bold text-white">All Khata accounts are settled!</p>
              <p className="text-xs text-slate-500">There are no unpaid resident grocery tabs at this time.</p>
            </div>
          ) : (
            customerLedgers.map((item) => (
              <div
                key={item.customer.id}
                className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow transition-all hover:border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700/60 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                    {item.customer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">{item.customer.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {item.customer.building} • Unit {item.customer.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-amber-400 font-extrabold">
                        {item.balance.toFixed(2)} AED Pending
                      </span>
                      <span className="text-slate-600 text-[10px]">•</span>
                      <span className="text-[10px] text-slate-400">
                        {item.orders.length} Unpaid Orders
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectCustomer(item.customer)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs transition-all"
                  >
                    Adjust / Settle
                  </button>

                  <button
                    onClick={() => handleSendStatement(item)}
                    className={`font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all ${
                      sentCustomerIds[item.customer.id]
                        ? 'bg-emerald-700 text-emerald-100 border border-emerald-500'
                        : 'bg-[#0B6E4F] hover:bg-emerald-600 text-white active:scale-95'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{sentCustomerIds[item.customer.id] ? 'Statement Sent ✓' : 'Send WhatsApp'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={handleCopyLedgerSummary}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedSummary ? 'Ledger Report Copied!' : 'Copy Summary Report'}</span>
          </button>

          <ElShopLogo size="xs" variant="badge" showCountry />
        </div>

      </div>
    </div>
  );
};
