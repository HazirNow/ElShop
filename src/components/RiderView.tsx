import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bike,
  Store,
  Footprints, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Banknote, 
  CreditCard, 
  BookOpen, 
  Building2, 
  ChevronRight, 
  ShieldCheck,
  UserCheck,
  ArrowRight,
  MessageCircle,
  Sun,
  Moon,
  ArrowUpDown,
  Calculator,
  BellRing,
  Share2,
  Sparkles,
  Layers,
  Timer,
  ChevronsDownUp,
  ChevronsUpDown
} from 'lucide-react';
import { AppState, Order, Rider, Language } from '../types';
import { updateOrder, getBatchedRiderTasks, BatchedBuildingRun } from '../api';
import { getTranslation } from '../translations';
import { ProductImage } from './ProductImage';
import { generateRiderToCustomerWhatsAppLink, generateDeliveredReceiptWhatsAppLink } from '../lib/whatsapp';
import { RiderBuildingRunCard, BuildingGroup, FloorGroup } from './RiderBuildingRunCard';

// Helper to extract floor number from UAE unit strings (e.g. "Unit 402" -> 4, "Apt 1205" -> 12, "Floor 5" -> 5)
const extractFloorNumber = (unitStr: string): number => {
  if (!unitStr) return 0;
  const trimmed = unitStr.trim();
  const floorMatch = trimmed.match(/(?:floor|fl|level|lvl|f)\s*[:#-]?\s*(\d+)/i);
  if (floorMatch) return parseInt(floorMatch[1], 10);

  const numMatch = trimmed.match(/\d+/);
  if (!numMatch) return 0;
  const num = parseInt(numMatch[0], 10);
  if (num >= 100 && num <= 9999) {
    return Math.floor(num / 100);
  }
  return num;
};

const getFloorLabels = (floorNum: number) => {
  if (floorNum === 0) return { en: 'Ground Floor', ar: 'الطابق الأرضي' };
  if (floorNum === 1) return { en: '1st Floor', ar: 'الطابق الأول' };
  if (floorNum === 2) return { en: '2nd Floor', ar: 'الطابق الثاني' };
  if (floorNum === 3) return { en: '3rd Floor', ar: 'الطابق الثالث' };
  return { en: `Floor ${floorNum}`, ar: `الطابق ${floorNum}` };
};

interface Props {
  state: AppState;
  activeStoreId: string;
  lang: Language;
  onRefresh: () => void;
}

export const RiderView: React.FC<Props> = ({ state, activeStoreId, lang, onRefresh }) => {
  const t = (key: string, params?: Record<string, any>) => getTranslation(lang, key, params);
  const isRtl = lang === 'ar';

  const storeRiders = state.riders.filter((r) => r.storeId === activeStoreId);
  const currentStore = state.stores.find((s) => s.id === activeStoreId) || state.stores[0];
  const [activeRiderId, setActiveRiderId] = useState<string>(storeRiders[0]?.id || 'rider-1');
  const [isSunlightMode, setIsSunlightMode] = useState<boolean>(false);
  const [sortByFloorAsc, setSortByFloorAsc] = useState<boolean>(false);
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('all');
  const [batchedRuns, setBatchedRuns] = useState<BatchedBuildingRun[]>([]);

  // Cash Change Calculator state for modal
  const [tenderedAmount, setTenderedAmount] = useState<number | null>(null);

  const currentRider = storeRiders.find((r) => r.id === activeRiderId) || storeRiders[0];

  // Fetch batched tasks from /api/rider/batched-tasks
  useEffect(() => {
    let isMounted = true;
    getBatchedRiderTasks().then((res) => {
      if (isMounted && res && res.data) {
        setBatchedRuns(res.data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [state.orders]);

  // Rider's assigned dispatched orders
  let riderTasks = state.orders.filter(
    (o) => o.riderId === currentRider?.id && o.status === 'out_for_delivery'
  );

  // Filter by selected building if active
  if (selectedBuildingFilter !== 'all') {
    riderTasks = riderTasks.filter((o) => o.building === selectedBuildingFilter);
  }

  const uniqueBuildings = Array.from(new Set(state.orders.filter(o => o.riderId === currentRider?.id && o.status === 'out_for_delivery').map(o => o.building)));

  const completedRiderTasks = state.orders.filter(
    (o) => o.riderId === currentRider?.id && o.status === 'delivered'
  );

  const totalCashToCollect = riderTasks
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  // Collapsed state map for buildings
  const [collapsedBuildings, setCollapsedBuildings] = useState<Record<string, boolean>>({});

  const toggleBuildingCollapse = (buildingName: string) => {
    setCollapsedBuildings((prev) => ({
      ...prev,
      [buildingName]: !prev[buildingName],
    }));
  };

  // Group pending orders by Building > Floor
  const buildingGroups: BuildingGroup[] = useMemo(() => {
    const map = new Map<string, Order[]>();

    riderTasks.forEach((o) => {
      const bldg = o.building || 'General Delivery';
      if (!map.has(bldg)) {
        map.set(bldg, []);
      }
      map.get(bldg)!.push(o);
    });

    const groups: BuildingGroup[] = [];

    map.forEach((orders, buildingName) => {
      const totalCash = orders
        .filter((o) => o.paymentMethod === 'cash')
        .reduce((sum, o) => sum + o.total, 0);

      const floorMap = new Map<number, Order[]>();
      orders.forEach((o) => {
        const fNum = extractFloorNumber(o.unit);
        if (!floorMap.has(fNum)) {
          floorMap.set(fNum, []);
        }
        floorMap.get(fNum)!.push(o);
      });

      // Sort floors based on elevator direction (Low -> High or High -> Low)
      const sortedFloorEntries = Array.from(floorMap.entries()).sort((a, b) => {
        return sortByFloorAsc ? a[0] - b[0] : b[0] - a[0];
      });

      const floors: FloorGroup[] = sortedFloorEntries.map(([floorNumber, fOrders]) => {
        const labels = getFloorLabels(floorNumber);
        const sortedOrders = [...fOrders].sort((a, b) =>
          a.unit.localeCompare(b.unit, undefined, { numeric: true })
        );
        return {
          floorNumber,
          floorLabel: labels.en,
          floorLabelAr: labels.ar,
          orders: sortedOrders,
        };
      });

      groups.push({
        buildingName,
        totalStops: orders.length,
        totalCash,
        floors,
        allOrders: orders,
      });
    });

    // Prioritize buildings with multi-drop batches
    return groups.sort((a, b) => b.totalStops - a.totalStops);
  }, [riderTasks, sortByFloorAsc]);

  const allCollapsed = buildingGroups.length > 0 && buildingGroups.every((g) => collapsedBuildings[g.buildingName]);

  const toggleAllBuildingsCollapse = () => {
    if (allCollapsed) {
      setCollapsedBuildings({});
    } else {
      const all: Record<string, boolean> = {};
      buildingGroups.forEach((g) => {
        all[g.buildingName] = true;
      });
      setCollapsedBuildings(all);
    }
  };

  // Selected order for delivery detail modal
  const [activeTaskModal, setActiveTaskModal] = useState<Order | null>(null);
  const [selectedDoorPayment, setSelectedDoorPayment] = useState<'cash' | 'card' | 'khata'>('cash');
  const [lastDeliveredOrder, setLastDeliveredOrder] = useState<Order | null>(null);

  // Swipe slider state (percentage 0 to 100)
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDelivered, setIsDelivered] = useState(false);

  const handleConfirmDelivery = async (orderId: string, paymentMethodOverride?: 'cash' | 'card' | 'khata') => {
    try {
      const pm = paymentMethodOverride || selectedDoorPayment || activeTaskModal?.paymentMethod || 'cash';
      const updated = await updateOrder(orderId, { 
        status: 'delivered',
        paymentMethod: pm,
        paymentStatus: 'paid'
      });
      setIsDelivered(true);
      if (activeTaskModal) {
        setLastDeliveredOrder({ ...activeTaskModal, paymentMethod: pm, paymentStatus: 'paid', status: 'delivered' });
      }
      setTimeout(() => {
        setIsDelivered(false);
        setSliderPosition(0);
        setActiveTaskModal(null);
        setTenderedAmount(null);
        onRefresh();
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`flex justify-center w-full min-h-[750px] p-2 md:p-4 font-sans ${isSunlightMode ? 'bg-slate-200' : 'bg-slate-950'}`}>
      {/* Phone Frame Wrapper */}
      <div className={`w-full max-w-[420px] rounded-[32px] shadow-2xl border-4 flex flex-col overflow-hidden relative min-h-[720px] max-h-[850px] transition-colors ${
        isSunlightMode 
          ? 'bg-white border-slate-400 text-slate-900 shadow-slate-400/50' 
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        
        {/* Rider Top Header */}
        <div className={`p-4 border-b flex flex-col gap-2.5 shadow transition-colors ${
          isSunlightMode ? 'bg-emerald-700 border-emerald-800 text-white' : 'bg-slate-800 border-slate-700/80 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ProductImage
                src={currentRider?.avatar}
                alt={currentRider?.name || 'Rider'}
                fallbackType="avatar"
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">{currentRider?.name}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <p className="text-[11px] text-emerald-200 font-bold flex items-center gap-1 mt-0.5">
                  <Footprints className="w-3.5 h-3.5 text-amber-300" />
                  <span>{currentRider?.vehicle}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sunlight High Contrast Mode Toggle */}
              <button
                onClick={() => setIsSunlightMode(!isSunlightMode)}
                className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                  isSunlightMode 
                    ? 'bg-amber-300 text-slate-950 border-amber-400 shadow-md' 
                    : 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800'
                }`}
                title="Toggle Sunlight Mode for outdoor glare visibility"
              >
                {isSunlightMode ? <Sun className="w-4 h-4 fill-amber-500 text-amber-600" /> : <Moon className="w-4 h-4" />}
                <span className="text-[10px] hidden sm:inline">{isSunlightMode ? 'Sunlight' : 'Night'}</span>
              </button>

              <select
                value={activeRiderId}
                onChange={(e) => setActiveRiderId(e.target.value)}
                className="bg-slate-900 text-white rounded-xl px-2 py-1 text-xs font-bold border border-slate-700 focus:outline-none"
              >
                {storeRiders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shop Storefront Affiliation Badge */}
          {currentStore && (
            <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs ${
              isSunlightMode ? 'bg-emerald-800 border border-emerald-600' : 'bg-slate-900/90 border border-slate-700/80'
            }`}>
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-white font-bold text-[11px]">
                  {isRtl ? currentStore.nameAr : currentStore.name}
                </span>
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold">{currentStore.area}</span>
            </div>
          )}
        </div>

        {/* Stats Summary Bar & Elevator Optimization */}
        <div className={`border-b p-3 px-4 flex items-center justify-between text-xs transition-colors ${
          isSunlightMode ? 'bg-emerald-50 border-emerald-200 text-slate-800' : 'bg-emerald-950/80 border-emerald-800/80 text-white'
        }`}>
          <div>
            <span className={`text-[10px] uppercase font-bold block ${isSunlightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('activeStops')}
            </span>
            <span className={`font-extrabold text-base ${isSunlightMode ? 'text-emerald-900' : 'text-amber-400'}`}>
              {riderTasks.length} Stops
            </span>
          </div>

          {/* Floor Sequence Toggle Button */}
          {riderTasks.length > 1 && (
            <button
              onClick={() => setSortByFloorAsc(!sortByFloorAsc)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 transition-all ${
                sortByFloorAsc
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                  : isSunlightMode 
                    ? 'bg-white text-slate-700 border-slate-300' 
                    : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
              title="Sort orders by Floor number to optimize elevator transit"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortByFloorAsc ? 'Floors (Low→High)' : 'Elevator Sort'}</span>
            </button>
          )}

          <div className="text-right">
            <span className={`text-[10px] uppercase font-bold block ${isSunlightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('cashToCollect')}
            </span>
            <span className={`font-extrabold text-base ${isSunlightMode ? 'text-emerald-800 font-black' : 'text-emerald-400'}`}>
              {totalCashToCollect.toFixed(2)} AED
            </span>
          </div>
        </div>

        {/* Building Tower Batch Filter (Optimized Vertical Travel) */}
        {uniqueBuildings.length > 1 && (
          <div className={`px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-xs ${
            isSunlightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Layers className="w-3 h-3 text-emerald-400" /> Tower Batch:
            </span>
            <button
              onClick={() => setSelectedBuildingFilter('all')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all ${
                selectedBuildingFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Stops ({state.orders.filter(o => o.riderId === currentRider?.id && o.status === 'out_for_delivery').length})
            </button>
            {uniqueBuildings.map((bldg) => {
              const count = state.orders.filter(o => o.riderId === currentRider?.id && o.status === 'out_for_delivery' && o.building === bldg).length;
              return (
                <button
                  key={bldg}
                  onClick={() => setSelectedBuildingFilter(bldg)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all ${
                    selectedBuildingFilter === bldg
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {bldg} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Task List Container */}
        <div className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
          isSunlightMode ? 'bg-slate-100' : 'bg-slate-950'
        }`}>
          {/* Dispatch Queue Header & Collapse Controls */}
          <div className="flex items-center justify-between px-1 gap-2">
            <div className="flex items-center gap-2">
              <h4 className={`text-xs font-extrabold uppercase tracking-wider ${
                isSunlightMode ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {isRtl ? 'قائمة التوصيل' : 'Dispatch Queue'} ({riderTasks.length})
              </h4>
              {buildingGroups.length > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isSunlightMode ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  {buildingGroups.length} {buildingGroups.length === 1 ? (isRtl ? 'مبنى' : 'Building') : (isRtl ? 'مباني' : 'Buildings')}
                </span>
              )}
            </div>

            {/* Quick Expand / Collapse All & Route Badges */}
            {buildingGroups.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleAllBuildingsCollapse}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border flex items-center gap-1 transition-all cursor-pointer ${
                    isSunlightMode
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={allCollapsed ? 'Expand all buildings' : 'Collapse all buildings'}
                >
                  {allCollapsed ? (
                    <>
                      <ChevronsUpDown className="w-3 h-3 text-emerald-500" />
                      <span>{isRtl ? 'توسيع الكل' : 'Expand All'}</span>
                    </>
                  ) : (
                    <>
                      <ChevronsDownUp className="w-3 h-3 text-amber-500" />
                      <span>{isRtl ? 'طي الكل' : 'Collapse All'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Grouped Building Cards */}
          {buildingGroups.map((group) => (
            <RiderBuildingRunCard
              key={group.buildingName}
              group={group}
              isCollapsed={!!collapsedBuildings[group.buildingName]}
              onToggleCollapse={() => toggleBuildingCollapse(group.buildingName)}
              onSelectTask={(task) => {
                setActiveTaskModal(task);
                setSliderPosition(0);
                setTenderedAmount(null);
              }}
              isSunlightMode={isSunlightMode}
              isRtl={isRtl}
              lang={lang}
              currentRiderName={currentRider?.name || 'Runner'}
            />
          ))}

          {riderTasks.length === 0 && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto" />
              <h5 className={`font-bold text-xs ${isSunlightMode ? 'text-slate-700' : 'text-slate-400'}`}>
                {isRtl ? 'تم تسليم جميع الطلبات!' : 'All deliveries completed!'}
              </h5>
              <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                {isRtl
                  ? `لا توجد مهام توصيل معلقة لـ ${currentRider?.name}.`
                  : `No active delivery tasks assigned to ${currentRider?.name}.`}
              </p>
            </div>
          )}
        </div>

        {/* --- DELIVERY DETAIL & SWIPE SLIDER MODAL --- */}
        <AnimatePresence>
          {activeTaskModal && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`absolute inset-0 z-40 flex flex-col p-4 overflow-y-auto ${
                isSunlightMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
                isSunlightMode ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <div>
                  <h3 className={`font-extrabold text-base ${isSunlightMode ? 'text-slate-900' : 'text-white'}`}>
                    Delivery Stop #{activeTaskModal.id}
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold">
                    {activeTaskModal.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={generateRiderToCustomerWhatsAppLink(activeTaskModal, currentRider?.name || 'Runner', lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
                    title={t('notifyCustomerWhatsApp')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setActiveTaskModal(null);
                      setTenderedAmount(null);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      isSunlightMode ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Payment Method at Door Selection & Fast Action Buttons */}
              <div className={`p-3.5 rounded-2xl border mb-3 space-y-2.5 ${
                isSunlightMode ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Payment Collection at Door:</span>
                  <span className={`text-xs font-black ${isSunlightMode ? 'text-emerald-800' : 'text-emerald-400'}`}>
                    Amount: {activeTaskModal.total.toFixed(2)} AED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Option 1: Card Paid via Handheld Machine */}
                  <button
                    type="button"
                    onClick={() => handleConfirmDelivery(activeTaskModal.id, 'card')}
                    disabled={isDelivered}
                    className="p-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-black text-xs transition-all shadow-md flex flex-col items-center justify-center gap-1 text-center"
                  >
                    <CreditCard className="w-5 h-5 text-amber-300" />
                    <span>Card Paid (Handheld POS)</span>
                    <span className="text-[10px] font-normal text-emerald-100">Tap to record card swipe</span>
                  </button>

                  {/* Option 2: Cash Collected */}
                  <button
                    type="button"
                    onClick={() => handleConfirmDelivery(activeTaskModal.id, 'cash')}
                    disabled={isDelivered}
                    className="p-3 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl font-black text-xs transition-all shadow-md flex flex-col items-center justify-center gap-1 text-center"
                  >
                    <Banknote className="w-5 h-5 text-white" />
                    <span>Cash Collected</span>
                    <span className="text-[10px] font-normal text-amber-100">Exact or count cash</span>
                  </button>
                </div>
              </div>

              {/* COD Quick-Change Calculator (when cash collection is required) */}
              <div className={`p-3 rounded-2xl border mb-3 space-y-2.5 ${
                isSunlightMode ? 'bg-amber-50/90 border-amber-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <Calculator className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isRtl ? 'حاسبة الفكة والصرف النقدي:' : 'Cash Change Calculator:'}</span>
                  </span>
                  <span className="text-slate-400 font-mono">
                    Order: <span className="font-bold text-amber-400">{activeTaskModal.total.toFixed(2)} AED</span>
                  </span>
                </div>

                {/* Tendered Bill Options */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: activeTaskModal.total, label: isRtl ? 'المبلغ بالضبط' : 'Exact' },
                    ...(activeTaskModal.total <= 50 ? [{ val: 50, label: '50 AED' }] : []),
                    ...(activeTaskModal.total <= 100 ? [{ val: 100, label: '100 AED' }] : []),
                    ...(activeTaskModal.total <= 200 ? [{ val: 200, label: '200 AED' }] : []),
                    { val: 500, label: '500 AED' },
                  ].slice(0, 4).map((bill) => (
                    <button
                      key={bill.label}
                      type="button"
                      onClick={() => setTenderedAmount(bill.val)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        tenderedAmount === bill.val
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                          : isSunlightMode 
                            ? 'bg-white text-slate-800 border-slate-300 hover:bg-amber-100' 
                            : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {bill.label}
                    </button>
                  ))}
                </div>

                {/* Custom Cash Input Field */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">
                    {isRtl ? 'مبلغ مخصص:' : 'Custom:'}
                  </span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    placeholder="Enter cash given..."
                    value={tenderedAmount !== null ? tenderedAmount : ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTenderedAmount(!isNaN(val) ? val : null);
                    }}
                    className={`w-full px-2.5 py-1 rounded-lg text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                      isSunlightMode 
                        ? 'bg-white text-slate-900 border-slate-300' 
                        : 'bg-slate-900 text-white border-slate-700'
                    }`}
                  />
                </div>

                {/* Calculated Change Output */}
                {tenderedAmount !== null && (
                  tenderedAmount >= activeTaskModal.total ? (
                    <div className="bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                      <span className="font-semibold">{isRtl ? 'المبلغ المتبقي للعميل (الفكة):' : 'Return Change to Customer:'}</span>
                      <span className="font-black text-emerald-400 text-base font-mono">
                        {(tenderedAmount - activeTaskModal.total).toFixed(2)} AED
                      </span>
                    </div>
                  ) : (
                    <div className="bg-rose-950/80 border border-rose-500/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-rose-300">
                      <span className="font-semibold">{isRtl ? 'المبلغ المستلم غير كافٍ:' : 'Underpaid (Short):'}</span>
                      <span className="font-black text-rose-400 text-base font-mono">
                        -{(activeTaskModal.total - tenderedAmount).toFixed(2)} AED
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Instant WhatsApp Receipt Action Button */}
              <a
                href={generateDeliveredReceiptWhatsAppLink(
                  activeTaskModal,
                  currentStore,
                  selectedDoorPayment || activeTaskModal.paymentMethod,
                  lang
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-transform active:scale-95 mb-3"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950 text-[#25D366]" />
                <span>Send WhatsApp Digital Slip ({activeTaskModal.customerPhone})</span>
              </a>

              {/* Oversized Building & Unit Address Card */}
              <div className={`p-4 rounded-2xl border mb-3 space-y-1.5 ${
                isSunlightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="text-xs text-slate-400 uppercase font-bold">Destination Address</div>
                <div className={`text-base font-black flex items-center gap-2 ${
                  isSunlightMode ? 'text-slate-900' : 'text-white'
                }`}>
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>{activeTaskModal.building}</span>
                </div>
                <div className={`text-lg font-extrabold ml-7 ${
                  isSunlightMode ? 'text-amber-700' : 'text-amber-400'
                }`}>
                  {activeTaskModal.unit}
                </div>
                {activeTaskModal.note && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700 flex items-start gap-1.5">
                    <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">Note: {activeTaskModal.note}</span>
                  </div>
                )}
              </div>

              {/* Items Summary */}
              <div className={`flex-1 overflow-y-auto p-3 rounded-2xl border mb-3 space-y-1.5 ${
                isSunlightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  Items to Hand Over ({activeTaskModal.items.length}):
                </span>
                {activeTaskModal.items.map((it) => (
                  <div key={it.productId} className={`text-xs flex justify-between border-b pb-1 ${
                    isSunlightMode ? 'text-slate-800 border-slate-200' : 'text-slate-300 border-slate-900'
                  }`}>
                    <span>{isRtl ? it.nameAr : it.name} ({it.quantity}x)</span>
                    <span className="font-bold text-emerald-600">{(it.price * it.quantity).toFixed(2)} AED</span>
                  </div>
                ))}
              </div>

              {/* SWIPE TO CONFIRM DELIVERED SLIDER */}
              <div className="pt-2">
                <div className={`relative w-full h-16 border-2 rounded-2xl overflow-hidden p-1 flex items-center select-none ${
                  isSunlightMode ? 'bg-slate-100 border-emerald-600' : 'bg-slate-950 border-emerald-500/50'
                }`}>
                  
                  {/* Background progress fill */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-emerald-600 transition-all"
                    style={{ width: `${Math.max(10, sliderPosition)}%` }}
                  />

                  {/* Center prompt text */}
                  <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xs text-white pointer-events-none tracking-wider uppercase drop-shadow-sm">
                    {isDelivered ? '✓ DELIVERED CONFIRMED!' : t('swipeToDeliver')}
                  </div>

                  {/* Interactive Handle */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSliderPosition(val);
                      if (val >= 90 && !isDelivered) {
                        handleConfirmDelivery(activeTaskModal.id);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />

                  {/* Visual Drag Thumb */}
                  <div
                    className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg transition-transform z-10"
                    style={{ transform: `translateX(${(sliderPosition / 100) * 280}px)` }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
