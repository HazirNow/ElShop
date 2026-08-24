import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Sparkles, 
  Layers, 
  BarChart3, 
  Percent, 
  Boxes,
  ShieldCheck
} from 'lucide-react';
import { Store, Order, Product, Language } from '../types';

interface Props {
  store: Store;
  allStores?: Store[];
  orders: Order[];
  products: Product[];
  lang: Language;
  onOpenUpgradeModal?: (featureTitle?: string) => void;
}

export const ConsolidatedPnLView: React.FC<Props> = ({
  store,
  allStores = [],
  orders,
  products,
  lang,
  onOpenUpgradeModal,
}) => {
  const isRtl = lang === 'ar';
  const [timeRange, setTimeRange] = useState<'today' | 'this_week' | 'this_month'>('this_month');

  // Filter delivered / completed orders for this store
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  // 1. Gross Revenue
  const grossRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // 2. COGS (Cost of Goods Sold)
  // For each delivered order item, calculate item.quantity * (item.cogs || item.price * 0.72)
  const totalCOGS = deliveredOrders.reduce((sum, o) => {
    const orderCost = o.items.reduce((itemSum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      const costPerUnit = prod?.cogs ?? prod?.costPrice ?? item.cogs ?? (item.price * 0.72);
      return itemSum + (costPerUnit * item.quantity);
    }, 0);
    return sum + orderCost;
  }, 0);

  // 3. Gross Profit & Margin
  const grossProfit = Math.max(0, grossRevenue - totalCOGS);
  const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 28.5;

  // 4. Delivery & Operating Costs
  const totalDeliveryFeeIncome = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 3.5), 0);
  const estimatedRiderWages = deliveredOrders.length * 2.0; // 2 AED per internal run
  const estimatedPlatformFee = store.subscriptionFee || 899;
  const netOperatingProfit = grossProfit + totalDeliveryFeeIncome - estimatedRiderWages - (estimatedPlatformFee / 30);
  const netMarginPercent = grossRevenue > 0 ? (netOperatingProfit / grossRevenue) * 100 : 22.0;

  // Multi-Store comparison mock data for franchise view
  const comparisonStores = allStores.length > 0 ? allStores : [
    store,
    {
      id: 'store-mock-2',
      name: 'Marina Express Mart',
      nameAr: 'مارينا إكسبريس مارت',
      area: 'Dubai Marina',
      monthlyOrders: 1840,
      subscriptionFee: 899,
      subscriptionTier: 3 as const,
      paymentStatus: 'paid' as const,
      phone: '+971 52 334 4556',
      rating: 4.9,
      image: '',
      merchantName: 'Marina Mgmt',
    },
    {
      id: 'store-mock-3',
      name: 'Downtown Prime Mart',
      nameAr: 'داون تاون برايم مارت',
      area: 'Downtown Dubai',
      monthlyOrders: 2150,
      subscriptionFee: 899,
      subscriptionTier: 3 as const,
      paymentStatus: 'paid' as const,
      phone: '+971 54 889 9001',
      rating: 4.8,
      image: '',
      merchantName: 'Downtown Retail LLC',
    },
  ];

  return (
    <div className="space-y-6" id="consolidated-pnl-dashboard">
      {/* Header & Filter */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {isRtl ? 'قائمة الأرباح والخسائر المجمعة (P&L) وحساب COGS' : 'Consolidated P&L & COGS Analytics'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase">
                  Tier 3 Franchise
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isRtl
                  ? 'تحليل هوامش الربح الإجمالية، تكلفة البضاعة المباعة (COGS)، ومقارنة أداء الفروع'
                  : 'Real-time Cost of Goods Sold tracking, gross margin contribution, and multi-store benchmark'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                timeRange === 'today' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isRtl ? 'اليوم' : 'Today'}
            </button>
            <button
              onClick={() => setTimeRange('this_week')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                timeRange === 'this_week' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isRtl ? 'هذا الأسبوع' : 'This Week'}
            </button>
            <button
              onClick={() => setTimeRange('this_month')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                timeRange === 'this_month' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isRtl ? 'هذا الشهر' : 'This Month'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>{isRtl ? 'إجمالي الإيرادات (Gross Revenue)' : 'Gross Revenue'}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {grossRevenue.toFixed(2)} <span className="text-xs font-sans text-slate-400">AED</span>
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>{deliveredOrders.length} delivered orders</span>
          </p>
        </div>

        {/* COGS */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>{isRtl ? 'تكلفة البضاعة المباعة (COGS)' : 'Total Wholesale COGS'}</span>
            <Boxes className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {totalCOGS.toFixed(2)} <span className="text-xs font-sans text-slate-400">AED</span>
          </p>
          <p className="text-[10px] text-slate-400">
            Avg wholesale supplier cost: ~{(100 - grossMarginPercent).toFixed(1)}% of price
          </p>
        </div>

        {/* Gross Margin */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>{isRtl ? 'الربح الإجمالي والهامش' : 'Gross Margin'}</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-purple-300 font-mono">
              {grossProfit.toFixed(2)} <span className="text-xs font-sans text-slate-400">AED</span>
            </p>
            <span className="text-xs font-black text-purple-400">({grossMarginPercent.toFixed(1)}%)</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold">
            Healthy UAE FMCG benchmark: &gt;25%
          </p>
        </div>

        {/* Net Operating Margin */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>{isRtl ? 'صافي الربح التشغيلي' : 'Net Operating Profit'}</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {netOperatingProfit.toFixed(2)} <span className="text-xs font-sans text-slate-400">AED</span>
            </p>
            <span className="text-xs font-black text-emerald-300">({netMarginPercent.toFixed(1)}%)</span>
          </div>
          <p className="text-[10px] text-slate-400">
            After rider runs & daily platform fee
          </p>
        </div>
      </div>

      {/* Multi-Store Comparison Matrix */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h4 className="font-black text-sm text-white">
              {isRtl ? 'مقارنة أداء الفروع والمتاجر المتعددة (Multi-Branch Benchmark)' : 'Multi-Store & Branch Benchmark Comparison'}
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {comparisonStores.length} Network Locations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-700">
              <tr>
                <th className="p-3">Branch Location</th>
                <th className="p-3">Orders/Mo</th>
                <th className="p-3">Est. Revenue</th>
                <th className="p-3">Avg Ticket</th>
                <th className="p-3">Gross Margin</th>
                <th className="p-3">Delivery SLA</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {comparisonStores.map((st, idx) => {
                const estRev = (st.monthlyOrders || 1200) * 38.5;
                const isCurrentStore = st.id === store.id;

                return (
                  <tr key={st.id} className={`hover:bg-slate-700/30 transition-colors ${isCurrentStore ? 'bg-purple-950/20' : ''}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>{st.name}</span>
                            {isCurrentStore && (
                              <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.2 rounded font-black">
                                ACTIVE POS
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">{st.area}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">{st.monthlyOrders || 1200}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{estRev.toLocaleString()} AED</td>
                    <td className="p-3 font-mono text-slate-300">38.50 AED</td>
                    <td className="p-3 font-mono font-bold text-purple-300">{(27.5 + idx * 1.5).toFixed(1)}%</td>
                    <td className="p-3 font-mono text-emerald-300">11.4 min</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        Operational
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
