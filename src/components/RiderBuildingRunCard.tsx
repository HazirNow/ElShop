import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ChevronDown, 
  ChevronRight, 
  Banknote, 
  CreditCard, 
  BookOpen, 
  MessageCircle, 
  BellRing, 
  ArrowRight,
  Layers,
  Timer,
  Navigation,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { Order, Language } from '../types';
import { getTranslation } from '../translations';
import { generateRiderToCustomerWhatsAppLink } from '../lib/whatsapp';

export interface FloorGroup {
  floorNumber: number;
  floorLabel: string;
  floorLabelAr: string;
  orders: Order[];
}

export interface BuildingGroup {
  buildingName: string;
  totalStops: number;
  totalCash: number;
  floors: FloorGroup[];
  allOrders: Order[];
}

interface Props {
  group: BuildingGroup;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectTask: (order: Order) => void;
  isSunlightMode: boolean;
  isRtl: boolean;
  lang: Language;
  currentRiderName: string;
}

export const RiderBuildingRunCard: React.FC<Props> = ({
  group,
  isCollapsed,
  onToggleCollapse,
  onSelectTask,
  isSunlightMode,
  isRtl,
  lang,
  currentRiderName,
}) => {
  const t = (key: string, params?: Record<string, any>) => getTranslation(lang, key, params);

  const isMultiStop = group.totalStops > 1;
  const floorNumbers = group.floors.map(f => f.floorNumber);
  const floorSummary = floorNumbers.length > 0
    ? floorNumbers.map(f => (f === 0 ? 'G' : `F${f}`)).join(' → ')
    : '';

  return (
    <div
      className={`rounded-2xl border-2 transition-all shadow-md overflow-hidden ${
        isSunlightMode
          ? 'bg-white border-slate-300 shadow-slate-200'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Building Header Bar (Clickable to Collapse / Expand) */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
          isSunlightMode
            ? isCollapsed ? 'bg-slate-50 hover:bg-slate-100' : 'bg-emerald-50/80 border-b border-emerald-200/80'
            : isCollapsed ? 'bg-slate-900 hover:bg-slate-800/80' : 'bg-slate-800/90 border-b border-slate-700/80'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Building Icon Container */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isMultiStop
                ? isSunlightMode
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : isSunlightMode
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Building2 className="w-5 h-5" />
          </div>

          {/* Building Title & Meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`font-black text-sm truncate ${
                  isSunlightMode ? 'text-slate-900' : 'text-white'
                }`}
              >
                {group.buildingName}
              </h4>

              {/* Multi-Drop Run Pill */}
              {isMultiStop && (
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isSunlightMode
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <Layers className="w-3 h-3 text-amber-500" />
                  <span>{isRtl ? `${group.totalStops} طلبات مجمعة` : `${group.totalStops} Drops Run`}</span>
                </span>
              )}
            </div>

            {/* Sequence & Summary */}
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {group.floors.length} {group.floors.length === 1 ? (isRtl ? 'طابق' : 'Floor') : (isRtl ? 'طوابق' : 'Floors')} ({floorSummary})
              </span>

              {group.totalCash > 0 && (
                <>
                  <span>•</span>
                  <span
                    className={`font-bold flex items-center gap-0.5 ${
                      isSunlightMode ? 'text-amber-800' : 'text-amber-400'
                    }`}
                  >
                    <Banknote className="w-3 h-3" />
                    <span>COD {group.totalCash.toFixed(2)} AED</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Toggle Button */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-bold ${
              isSunlightMode
                ? 'bg-white border-slate-300 text-slate-700'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {group.totalStops} {group.totalStops === 1 ? 'Stop' : 'Stops'}
          </span>

          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
              isCollapsed ? '' : 'rotate-180'
            } ${
              isSunlightMode ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Collapsible Floor Breakdown Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Elevator Route Guidance Strip for Multi-Drop Runs */}
            {isMultiStop && group.floors.length > 1 && (
              <div
                className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-semibold ${
                  isSunlightMode
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {isRtl
                      ? `مسار المصعد المقترح: صعود متتالي (${floorSummary})`
                      : `Suggested Elevator Route: Stop Sequence (${floorSummary})`}
                  </span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">
                  ~{group.totalStops * 2.5}m batch
                </span>
              </div>
            )}

            {/* Grouped Floors within this Building */}
            <div className="p-3 space-y-3.5">
              {group.floors.map((floorGroup) => (
                <div key={`${group.buildingName}-f-${floorGroup.floorNumber}`} className="space-y-2">
                  
                  {/* Floor Level Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                          isSunlightMode
                            ? 'bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-slate-800 text-emerald-400 border-slate-700'
                        }`}
                      >
                        <span>🏢</span>
                        <span>{isRtl ? floorGroup.floorLabelAr : floorGroup.floorLabel}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ({floorGroup.orders.length} {floorGroup.orders.length === 1 ? (isRtl ? 'طلب' : 'delivery') : (isRtl ? 'طلبات' : 'deliveries')})
                      </span>
                    </div>

                    <div className="h-px flex-1 mx-3 bg-slate-200 dark:bg-slate-800" />

                    <span className="text-[10px] font-mono text-slate-400">
                      Level {floorGroup.floorNumber}
                    </span>
                  </div>

                  {/* Orders on this Floor */}
                  <div className="space-y-2 pl-1 sm:pl-2">
                    {floorGroup.orders.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={`rounded-xl p-3 border-2 transition-all cursor-pointer shadow-sm group ${
                          isSunlightMode
                            ? 'bg-slate-50 hover:bg-white border-slate-200 hover:border-emerald-600'
                            : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800/90 hover:border-emerald-500'
                        }`}
                      >
                        {/* Top: Unit & Payment Tag */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          {/* Unit / Apartment Oversized Display */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                                isSunlightMode
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-mono'
                                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-mono'
                              }`}
                            >
                              Unit / {task.unit}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-semibold">
                              #{task.id}
                            </span>
                          </div>

                          {/* Payment Mode Tag */}
                          <div>
                            {task.paymentMethod === 'cash' && (
                              <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Banknote className="w-3 h-3" />
                                <span>{t('collectCash')}: {task.total.toFixed(2)} AED</span>
                              </span>
                            )}
                            {task.paymentMethod === 'card' && (
                              <span className="text-[10px] font-extrabold bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                <span>{t('cardPaid')}</span>
                              </span>
                            )}
                            {task.paymentMethod === 'khata' && (
                              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{t('khataBooked')}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Note if present */}
                        {task.note && (
                          <div className="mb-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                            <BellRing className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{task.note}</span>
                          </div>
                        )}

                        {/* Bottom: Customer & Direct Deliver Action */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                isSunlightMode ? 'text-slate-800' : 'text-slate-200'
                              }`}
                            >
                              {task.customerName}
                            </span>
                            
                            {/* WhatsApp Direct Action */}
                            <a
                              href={generateRiderToCustomerWhatsAppLink(task, currentRiderName, lang)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-colors"
                              title={t('notifyCustomerWhatsApp')}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            <span className="text-[10px] text-slate-400 font-mono">
                              ({task.items?.length || 0} {isRtl ? 'أصناف' : 'items'})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform text-[11px]">
                            <span>{isRtl ? 'تسليم' : 'Deliver'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
