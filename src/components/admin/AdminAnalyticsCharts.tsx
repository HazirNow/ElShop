import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  PieChart as PieChartIcon, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Order, Store, Language } from '../../types';

interface AdminAnalyticsChartsProps {
  orders: Order[];
  stores: Store[];
  lang?: Language;
}

export const AdminAnalyticsCharts: React.FC<AdminAnalyticsChartsProps> = ({
  orders = [],
  stores = [],
  lang = 'en',
}) => {
  const isRtl = lang === 'ar';

  // Time window filter for Daily Revenue Trend (7 days, 14 days, 30 days)
  const [revenueWindow, setRevenueWindow] = useState<'7d' | '14d' | '30d'>('7d');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'combined'>('combined');

  // Subscription view toggle: 'tier' (by plan fee) vs 'status' (paid/overdue/suspended)
  const [subDistributionType, setSubDistributionType] = useState<'tier' | 'status'>('tier');

  // --- 1. DAILY REVENUE & ORDERS AGGREGATION ---
  const revenueTrendData = useMemo(() => {
    const dayCount = revenueWindow === '7d' ? 7 : revenueWindow === '14d' ? 14 : 30;
    const dateMap: Record<string, { dateLabel: string; fullDate: string; revenue: number; ordersCount: number; aov: number }> = {};

    const now = new Date();

    // Initialize all days in the chosen window in chronological order
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isoDateKey = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', {
        weekday: dayCount <= 7 ? 'short' : undefined,
        month: 'short',
        day: 'numeric',
      });
      dateMap[isoDateKey] = {
        dateLabel,
        fullDate: isoDateKey,
        revenue: 0,
        ordersCount: 0,
        aov: 0,
      };
    }

    // Populate actual state order data
    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      let orderDateKey = '';
      try {
        if (order.createdAt) {
          orderDateKey = new Date(order.createdAt).toISOString().split('T')[0];
        }
      } catch (e) {
        orderDateKey = new Date().toISOString().split('T')[0];
      }

      if (dateMap[orderDateKey]) {
        dateMap[orderDateKey].revenue += order.total || 0;
        dateMap[orderDateKey].ordersCount += 1;
      } else {
        // If order falls outside our generated window or today is missing, map to nearest or record if within range
        const todayKey = now.toISOString().split('T')[0];
        if (dateMap[todayKey]) {
          dateMap[todayKey].revenue += order.total || 0;
          dateMap[todayKey].ordersCount += 1;
        }
      }
    });

    // Format and calculate Average Order Value
    const result = Object.values(dateMap).map((entry) => ({
      ...entry,
      revenue: parseFloat(entry.revenue.toFixed(2)),
      aov: entry.ordersCount > 0 ? parseFloat((entry.revenue / entry.ordersCount).toFixed(2)) : 0,
    }));

    return result;
  }, [orders, revenueWindow, isRtl]);

  // Aggregate stats for the revenue period
  const periodStats = useMemo(() => {
    const totalRev = revenueTrendData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalOrders = revenueTrendData.reduce((acc, curr) => acc + curr.ordersCount, 0);
    const peakDay = revenueTrendData.reduce((max, curr) => (curr.revenue > max.revenue ? curr : max), {
      dateLabel: 'N/A',
      revenue: 0,
      ordersCount: 0,
      fullDate: '',
      aov: 0,
    });
    const avgDaily = revenueTrendData.length > 0 ? totalRev / revenueTrendData.length : 0;

    return {
      totalRev,
      totalOrders,
      peakDay,
      avgDaily,
    };
  }, [revenueTrendData]);

  // --- 2. STORE SUBSCRIPTION DISTRIBUTION AGGREGATION ---
  const subscriptionDistributionData = useMemo(() => {
    if (subDistributionType === 'tier') {
      // Group by Tier: Tier 1 (299 AED), Tier 2 (599 AED), Tier 3 (899 AED)
      let tier1Count = 0;
      let tier1MRR = 0;
      let tier2Count = 0;
      let tier2MRR = 0;
      let tier3Count = 0;
      let tier3MRR = 0;

      stores.forEach((s) => {
        const fee = s.subscriptionFee ?? 299;
        const tier = s.subscriptionTier ?? (fee >= 899 ? 3 : fee >= 599 ? 2 : 1);
        if (tier === 3 || fee >= 899) {
          tier3Count++;
          tier3MRR += fee;
        } else if (tier === 2 || fee >= 599) {
          tier2Count++;
          tier2MRR += fee;
        } else {
          tier1Count++;
          tier1MRR += fee;
        }
      });

      return [
        {
          name: isRtl ? 'باقة البقالة الأساسية (Tier 1)' : 'Tier 1: Baqala Standard',
          shortName: 'Tier 1 (299 AED)',
          value: tier1Count,
          mrr: tier1MRR,
          color: '#10b981', // emerald-500
          fee: 299,
          percent: stores.length > 0 ? Math.round((tier1Count / stores.length) * 100) : 0,
        },
        {
          name: isRtl ? 'باقة السوبرماركت (Tier 2)' : 'Tier 2: Supermarket Pro',
          shortName: 'Tier 2 (599 AED)',
          value: tier2Count,
          mrr: tier2MRR,
          color: '#6366f1', // indigo-500
          fee: 599,
          percent: stores.length > 0 ? Math.round((tier2Count / stores.length) * 100) : 0,
        },
        {
          name: isRtl ? 'باقة الفرانشايز والشبكات (Tier 3)' : 'Tier 3: Enterprise Franchise',
          shortName: 'Tier 3 (899 AED)',
          value: tier3Count,
          mrr: tier3MRR,
          color: '#a855f7', // purple-500
          fee: 899,
          percent: stores.length > 0 ? Math.round((tier3Count / stores.length) * 100) : 0,
        },
      ].filter((item) => item.value > 0 || stores.length === 0);
    } else {
      // Group by Payment & Service Status: Paid, Overdue, Suspended
      let paidCount = 0;
      let overdueCount = 0;
      let suspendedCount = 0;

      stores.forEach((s) => {
        if (s.servicePaused) {
          suspendedCount++;
        } else if (s.paymentStatus === 'overdue') {
          overdueCount++;
        } else {
          paidCount++;
        }
      });

      return [
        {
          name: isRtl ? 'نشط ومدفوع' : 'Active & In Good Standing',
          shortName: isRtl ? 'مدفوع' : 'Paid Active',
          value: paidCount,
          mrr: stores.filter((s) => !s.servicePaused && s.paymentStatus !== 'overdue').reduce((acc, s) => acc + (s.subscriptionFee || 299), 0),
          color: '#10b981', // emerald-500
          percent: stores.length > 0 ? Math.round((paidCount / stores.length) * 100) : 0,
        },
        {
          name: isRtl ? 'متأخر في السداد' : 'Overdue (Dunning Notice)',
          shortName: isRtl ? 'متأخر' : 'Overdue',
          value: overdueCount,
          mrr: stores.filter((s) => s.paymentStatus === 'overdue' && !s.servicePaused).reduce((acc, s) => acc + (s.subscriptionFee || 299), 0),
          color: '#f59e0b', // amber-500
          percent: stores.length > 0 ? Math.round((overdueCount / stores.length) * 100) : 0,
        },
        {
          name: isRtl ? 'موقوف مؤقتاً' : 'Suspended (10+ Days Hold)',
          shortName: isRtl ? 'موقوف' : 'Suspended',
          value: suspendedCount,
          mrr: stores.filter((s) => s.servicePaused).reduce((acc, s) => acc + (s.subscriptionFee || 299), 0),
          color: '#f43f5e', // rose-500
          percent: stores.length > 0 ? Math.round((suspendedCount / stores.length) * 100) : 0,
        },
      ].filter((item) => item.value > 0 || stores.length === 0);
    }
  }, [stores, subDistributionType, isRtl]);

  const totalContractedMRR = useMemo(() => {
    return stores.reduce((sum, s) => sum + (s.subscriptionFee || 299), 0);
  }, [stores]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="admin-recharts-analytics-section">
      
      {/* =========================================================================
          CHART 1: DAILY REVENUE & ORDER VOLUME TREND (2 Columns on Large Screens)
         ========================================================================= */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
        
        {/* Header with Title & Interactive Window/Metric Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  {isRtl ? 'مخطط الإيرادات اليومية وحجم الطلبات' : 'Daily Revenue & Order Volume Trend'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-black uppercase">
                  Recharts
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl
                  ? 'رصد حركة الإيرادات الإجمالية ومعدل حجم السلة اليومي لشبكة البقالات'
                  : 'Real-time daily GMV throughput and order velocity across neighborhood stores.'}
              </p>
            </div>
          </div>

          {/* Controls: Time Window & Metric Toggle */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Metric Switch */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setChartMetric('combined')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMetric === 'combined'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isRtl ? 'الكل' : 'Combined'}
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('revenue')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMetric === 'revenue'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isRtl ? 'الإيرادات' : 'Revenue'}
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('orders')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMetric === 'orders'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isRtl ? 'الطلبات' : 'Orders'}
              </button>
            </div>

            {/* Time Window Switch */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setRevenueWindow('7d')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  revenueWindow === '7d' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                7D
              </button>
              <button
                type="button"
                onClick={() => setRevenueWindow('14d')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  revenueWindow === '14d' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                14D
              </button>
              <button
                type="button"
                onClick={() => setRevenueWindow('30d')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  revenueWindow === '30d' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                30D
              </button>
            </div>
          </div>
        </div>

        {/* Quick Trend Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isRtl ? 'إجمالي إيرادات الفترة' : 'Period Revenue'}
            </span>
            <div className="text-base sm:text-lg font-black text-emerald-400">
              {periodStats.totalRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-[11px] font-semibold text-emerald-300">AED</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isRtl ? 'إجمالي الطلبات' : 'Period Orders'}
            </span>
            <div className="text-base sm:text-lg font-black text-white">
              {periodStats.totalOrders}{' '}
              <span className="text-[11px] font-normal text-slate-400">orders</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isRtl ? 'المتوسط اليومي' : 'Daily Average'}
            </span>
            <div className="text-base sm:text-lg font-black text-indigo-300">
              {periodStats.avgDaily.toFixed(1)}{' '}
              <span className="text-[11px] font-semibold text-indigo-400">AED/day</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isRtl ? 'ذروة الإيراد اليومي' : 'Peak Day'}
            </span>
            <div className="text-base sm:text-lg font-black text-amber-400 truncate">
              {periodStats.peakDay.revenue.toFixed(0)} AED{' '}
              <span className="text-[10px] text-slate-400 font-normal">({periodStats.peakDay.dateLabel})</span>
            </div>
          </div>
        </div>

        {/* Recharts Area / Bar Chart Canvas */}
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueTrendData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                tickFormatter={(val) => `${val}`}
              />

              {chartMetric === 'combined' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b"
                  tick={{ fill: '#818cf8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} ord`}
                />
              )}

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl space-y-2 text-xs font-sans">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5">
                          <span className="font-black text-white">{data.dateLabel}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{data.fullDate}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span>Daily Revenue:</span>
                            </span>
                            <span className="font-mono">{data.revenue.toFixed(2)} AED</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-indigo-300 font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                              <span>Orders Placed:</span>
                            </span>
                            <span className="font-mono">{data.ordersCount} orders</span>
                          </div>
                          {data.ordersCount > 0 && (
                            <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                              <span>Average Basket (AOV):</span>
                              <span className="font-mono text-slate-200">{data.aov.toFixed(2)} AED</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11, fontWeight: 700 }}
              />

              {(chartMetric === 'combined' || chartMetric === 'revenue') && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name={isRtl ? 'الإيرادات اليومية (AED)' : 'Daily Revenue (AED)'}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
                />
              )}

              {(chartMetric === 'combined' || chartMetric === 'orders') && (
                <Area
                  yAxisId={chartMetric === 'combined' ? 'right' : 'left'}
                  type="monotone"
                  dataKey="ordersCount"
                  name={isRtl ? 'عدد الطلبات' : 'Order Count'}
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#312e81', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* =========================================================================
          CHART 2: STORE SUBSCRIPTION DISTRIBUTION (1 Column on Large Screens)
         ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
        
        {/* Header & Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                {isRtl ? 'توزيع اشتراكات المتاجر' : 'Store Subscription Distribution'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl ? 'تقسيم شبكة البقالات حسب الباقة أو حالة السداد' : 'Fleet tier mix & monthly SaaS recurring revenue.'}
              </p>
            </div>
          </div>

          {/* Toggle Tier vs Status */}
          <button
            type="button"
            onClick={() => setSubDistributionType((prev) => (prev === 'tier' ? 'status' : 'tier'))}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-indigo-300 hover:text-white transition-all flex items-center gap-1 shrink-0"
            title="Toggle between Plan Tier and Payment Status view"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{subDistributionType === 'tier' ? 'Plan Tier' : 'Status'}</span>
          </button>
        </div>

        {/* Recharts Pie / Donut Chart */}
        <div className="w-full h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subscriptionDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={74}
                paddingAngle={4}
                dataKey="value"
                nameKey="shortName"
              >
                {subscriptionDistributionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#0f172a" 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 rounded-2xl p-3 shadow-2xl text-xs space-y-1">
                        <div className="font-black text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                          <span>{data.name}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>Stores Count:</span>
                          <span className="font-black text-white">{data.value} ({data.percent}%)</span>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                          <span>MRR Contribution:</span>
                          <span className="font-mono">{data.mrr.toLocaleString()} AED</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
              {isRtl ? 'المجموع' : 'Total Fleet'}
            </span>
            <span className="text-xl font-black text-white tracking-tight">
              {stores.length}
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {totalContractedMRR.toLocaleString()} AED/mo
            </span>
          </div>
        </div>

        {/* Breakdown Badges & Cards */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          {subscriptionDistributionData.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-slate-200">{item.shortName}</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="font-mono font-bold text-slate-400">{item.value} stores</span>
                <span className="font-mono font-black text-emerald-400 text-[11px] bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-800/30">
                  {item.mrr.toLocaleString()} AED
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
