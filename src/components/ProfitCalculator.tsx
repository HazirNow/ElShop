import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { 
  TrendingUp, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Zap, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { Language } from '../types';

interface ProfitCalculatorProps {
  onStartTrial: () => void;
  lang?: Language;
}

// Animated Counter Component for Smooth Micro-Interactions
const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string; className?: string }> = ({
  value,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const duration = 400; // ms
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + (endValue - startValue) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        prevValueRef.current = endValue;
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ onStartTrial, lang = 'en' }) => {
  const isRtl = lang === 'ar';
  
  // State for Sliders
  const [dailyOrders, setDailyOrders] = useState<number>(50);
  const [avgBasket, setAvgBasket] = useState<number>(45);

  // Financial Calculations
  const monthlyGmv = dailyOrders * 30 * avgBasket;
  const aggregatorRate = 0.30; // 30% standard commission
  const aggregatorLossMonthly = Math.round(monthlyGmv * aggregatorRate);
  const elShopCostMonthly = 299; // Flat AED 299/mo
  const monthlySavings = Math.max(0, aggregatorLossMonthly - elShopCostMonthly);
  const annualSavings = monthlySavings * 12;
  const breakEvenOrders = Math.ceil(elShopCostMonthly / (avgBasket * aggregatorRate));

  const presets = [
    { label: isRtl ? 'بقالة صغيرة' : 'Small Baqala', orders: 25, basket: 35 },
    { label: isRtl ? 'ميني كشك برج' : 'Tower Minimart', orders: 60, basket: 45 },
    { label: isRtl ? 'سوبرماركت حي' : 'Neighborhood Mart', orders: 120, basket: 65 },
  ];

  return (
    <div 
      id="calculator" 
      className="relative rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-6 sm:p-10 shadow-2xl overflow-hidden"
    >
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? 'حاسبة توفير الأرباح التفاعلية' : 'Interactive ROI & Profit Engine'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isRtl ? 'كم تخسر شهرياً مع عمولات التطبيقات التقليدية؟' : 'See How Much Aggregator Commissions Cost You.'}
          </h3>
          <p className="text-sm text-slate-400 max-w-xl">
            {isRtl
              ? 'قارن بين اقتطاع تطبيقات التوصيل (30%) ونموذج ElShop الثابت (299 درهم/شهر). احتفظ بكامل هوامش أرباحك!'
              : 'Compare standard 30% delivery commission cuts with ElShop’s transparent flat subscription. Every extra order stays 100% in your pocket.'}
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            {isRtl ? 'نماذج جاهزة:' : 'Presets:'}
          </span>
          <div className="flex items-center gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDailyOrders(preset.orders);
                  setAvgBasket(preset.basket);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  dailyOrders === preset.orders && avgBasket === preset.basket
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-7 bg-slate-950/60 border border-slate-800/80 p-6 sm:p-7 rounded-2xl">
          
          {/* Slider 1: Daily Orders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{isRtl ? 'عدد الطلبات اليومية للمتجر:' : 'Average Daily Orders:'}</span>
              </label>
              <div className="flex items-baseline gap-1 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-xl">
                <span className="text-xl font-black text-indigo-400 font-mono">
                  {dailyOrders}
                </span>
                <span className="text-xs text-indigo-300 font-semibold">
                  {isRtl ? 'طلب/يوم' : 'orders/day'}
                </span>
              </div>
            </div>

            <input
              type="range"
              min={5}
              max={250}
              step={5}
              value={dailyOrders}
              onChange={(e) => setDailyOrders(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>5 {isRtl ? 'طلبات' : 'orders'}</span>
              <span>50 {isRtl ? 'طلب' : 'orders'}</span>
              <span>100 {isRtl ? 'طلب' : 'orders'}</span>
              <span>250+ {isRtl ? 'طلب' : 'orders'}</span>
            </div>
          </div>

          {/* Slider 2: Average Basket Value */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>{isRtl ? 'متوسط قيمة السلة (درهم):' : 'Average Basket Value (AED):'}</span>
              </label>
              <div className="flex items-baseline gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
                <span className="text-xl font-black text-amber-400 font-mono">
                  {avgBasket}
                </span>
                <span className="text-xs text-amber-300 font-semibold">
                  AED
                </span>
              </div>
            </div>

            <input
              type="range"
              min={15}
              max={150}
              step={5}
              value={avgBasket}
              onChange={(e) => setAvgBasket(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>15 AED ({isRtl ? 'سناكس وماء' : 'Quick snack'})</span>
              <span>50 AED ({isRtl ? 'مشتريات يومية' : 'Daily grocery'})</span>
              <span>150 AED ({isRtl ? 'تموين أسبوعي' : 'Pantry restock'})</span>
            </div>
          </div>

          {/* Monthly Turnover Footnote */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{isRtl ? 'إجمالي المبيعات الشهرية المقدرة:' : 'Estimated Monthly GMV:'}</span>
            <span className="font-mono font-bold text-white text-sm">
              <AnimatedNumber value={monthlyGmv} suffix=" AED" />
            </span>
          </div>

        </div>

        {/* Right Side: High-Impact ROI Comparison Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative flex flex-col justify-between space-y-6">
          
          {/* Top Pill */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'الأرباح المستردة' : '100% Retained Margins'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase">
              0% Commission
            </span>
          </div>

          {/* Main Hero Number: Net Annual Savings */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">
              {isRtl ? 'صافي التوفير السنوي في جيبك:' : 'Net Annual Savings Retained:'}
            </span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 tracking-tight font-mono">
              <AnimatedNumber value={annualSavings} prefix="+" suffix=" AED" />
            </div>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {isRtl ? 'توفير شهري قدره ' : 'Saves '}
                <strong className="text-white font-mono">
                  {monthlySavings.toLocaleString()} AED
                </strong>
                {isRtl ? ' كل شهر!' : ' / month!'}
              </span>
            </p>
          </div>

          {/* Comparison Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80 text-xs">
            <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-rose-300 uppercase block">
                {isRtl ? 'عمولة التطبيقات (30%)' : 'Aggregator Cut (30%)'}
              </span>
              <div className="text-base font-black text-rose-400 font-mono mt-1">
                -<AnimatedNumber value={aggregatorLossMonthly} suffix=" AED" />
              </div>
              <span className="text-[10px] text-rose-300/60 block mt-0.5">{isRtl ? 'شهرياً مفقودة' : '/mo lost'}</span>
            </div>

            <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-300 uppercase block">
                {isRtl ? 'اشتراك ElShop الثابت' : 'ElShop Flat Fee'}
              </span>
              <div className="text-base font-black text-indigo-300 font-mono mt-1">
                299 AED
              </div>
              <span className="text-[10px] text-indigo-200/60 block mt-0.5">{isRtl ? 'شهرياً بدون أي نسبة' : '/mo fixed'}</span>
            </div>
          </div>

          {/* Break-even Insight */}
          <div className="text-[11px] text-slate-400 flex items-start gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {isRtl
                ? `تغطي اشتراكك بالكامل بعد ${breakEvenOrders} طلب فقط في الشهر! باقي الطلبات أرباح صافية 100%.`
                : `Break-even at just ${breakEvenOrders} orders/month (~${Math.ceil(breakEvenOrders / 30)}/day). All further orders are 100% profit.`}
            </span>
          </div>

          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartTrial}
            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold py-3.5 px-6 rounded-2xl text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 group transition-all"
          >
            <span>{isRtl ? 'ابدأ الآن - أول شهر مجاناً' : 'Start First Month Free Trial'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

        </div>

      </div>
    </div>
  );
};
