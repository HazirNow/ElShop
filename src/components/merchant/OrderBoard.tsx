import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Footprints, 
  MessageCircle, 
  X, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { useMerchantStore } from './MerchantStoreContext';
import { DailyBaqalaSummary } from '../DailyBaqalaSummary';
import { 
  generateDirectWhatsAppLink, 
  generateOrderStatusUpdateWhatsAppLink 
} from '../../lib/whatsapp';

export const OrderBoard: React.FC = () => {
  const {
    state,
    store,
    lang,
    isRtl,
    t,
    onRefresh,
    handleOpenUpgradeModal,
    newOrders,
    packingOrders,
    outForDeliveryOrders,
    batchableBuildings,
    storeRiders,
    selectedOrder,
    setSelectedOrder,
    selectedRiderId,
    setSelectedRiderId,
    handleAcceptOrder,
    handleTogglePackedItem,
    handleDispatchOrder,
    handleBatchDispatch,
  } = useMerchantStore();

  return (
    <motion.div
      key="board"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="flex-1 flex flex-col space-y-4"
    >
      {/* Daily Baqala Register Cash & Khata Summary */}
      <DailyBaqalaSummary
        state={state}
        store={store}
        lang={lang}
        onRefresh={onRefresh}
        onOpenUpgradeModal={handleOpenUpgradeModal}
      />

      {/* Smart Batch Suggestion Banner */}
      {batchableBuildings.length > 0 && (
        <div className="bg-[#FFF9E6]/10 border-2 border-[#F5A623]/40 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] font-bold text-sm">
              💡
            </div>
            <div>
              <h4 className="font-extrabold text-[#F5A623] uppercase text-[11px] tracking-wider">
                {t('batchSuggestion')}
              </h4>
              <p className="text-slate-200 text-xs">
                {t('batchText', { building: batchableBuildings[0][0] })} ({batchableBuildings[0][1].length} orders)
              </p>
            </div>
          </div>

          <button
            onClick={() => handleBatchDispatch(batchableBuildings[0][0], batchableBuildings[0][1])}
            className="bg-[#F5A623] hover:bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow"
          >
            <Footprints className="w-4 h-4" />
            <span>{t('batchBtn')}</span>
          </button>
        </div>
      )}

      {/* 3-Column Board Grid (Pinned to LTR for chronological fulfillment: Incoming -> Packing -> Out for Delivery) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4" dir="ltr">
        {/* Column 1: New Orders */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2 tracking-wider uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>{isRtl ? 'الطلبات الجديدة (1. Incoming)' : 'NEW ORDERS'} ({newOrders.length})</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {newOrders.map((ord) => (
              <div
                key={ord.id}
                dir={isRtl ? 'rtl' : 'ltr'}
                className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80 shadow-sm hover:border-[#0B6E4F] transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400">#ORD-{ord.id}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      ord.paymentMethod === 'cash'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : ord.paymentMethod === 'khata'
                        ? 'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {ord.paymentMethod}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-white leading-tight mb-1">
                  {ord.building}
                </h4>
                <p className="text-xs text-slate-300 mb-3 font-medium">
                  {ord.unit} • {ord.items.length} items
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-black text-emerald-400 text-sm">
                    {ord.total.toFixed(2)} AED
                  </span>
                  <button
                    onClick={() => handleAcceptOrder(ord.id)}
                    className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-extrabold px-4 py-1.5 rounded-lg text-xs transition-all shadow flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'قبول وبدء التجهيز' : 'ACCEPT'}</span>
                  </button>
                </div>
              </div>
            ))}

            {newOrders.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No new orders pending
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Packing */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2 tracking-wider uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]"></span>
              <span>{isRtl ? 'قيد التجهيز (2. Packing)' : 'PACKING'} ({packingOrders.length})</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {packingOrders.map((ord) => {
              return (
                <div
                  key={ord.id}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  onClick={() => setSelectedOrder(ord)}
                  className="bg-slate-900/90 rounded-xl p-4 border-2 border-[#0B6E4F] shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400">#ORD-{ord.id}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        ord.paymentMethod === 'cash'
                          ? 'bg-blue-500/20 text-blue-300'
                          : ord.paymentMethod === 'khata'
                          ? 'bg-[#F5A623]/20 text-[#F5A623]'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {ord.paymentMethod}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-white leading-tight mb-1">
                    {ord.building}
                  </h4>
                  <p className="text-xs text-slate-300 mb-3">
                    {ord.unit} • {ord.items.length} items
                  </p>

                  {/* Checklist Quick Preview */}
                  <div className="space-y-1 mb-3 bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
                    {ord.items.slice(0, 2).map((it) => {
                      const isChecked = ord.packedItems?.includes(it.productId);
                      return (
                        <div
                          key={it.productId}
                          className={`flex items-center text-xs ${
                            isChecked ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <span className="mr-2 rtl:ml-2 rtl:mr-0 font-bold">{isChecked ? '✓' : '□'}</span>
                          <span>{isRtl ? it.nameAr : it.name}</span>
                        </div>
                      );
                    })}
                    {ord.items.length > 2 && (
                      <div className="text-[10px] text-slate-500 italic pl-4 rtl:pr-4 rtl:pl-0">
                        + {ord.items.length - 2} more items...
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(ord);
                      }}
                      className="flex-1 bg-[#F5A623] hover:bg-amber-500 text-slate-950 py-2 rounded-lg text-xs font-black transition-all shadow uppercase tracking-wider"
                    >
                      {isRtl ? 'إرسال إلى السائق' : 'DISPATCH TO RIDER'}
                    </button>
                    <a
                      href={generateOrderStatusUpdateWhatsAppLink(ord, store, 'packing', lang)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Notify Customer on WhatsApp: Packing"
                      className="bg-emerald-700 hover:bg-emerald-600 text-white p-2 rounded-lg text-xs flex items-center justify-center transition-all shadow"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}

            {packingOrders.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No orders being packed
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Out for Delivery */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2 tracking-wider uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{isRtl ? 'خرج للتوصيل (3. Dispatched)' : 'OUT FOR DELIVERY'} ({outForDeliveryOrders.length})</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {outForDeliveryOrders.map((ord) => (
              <div
                key={ord.id}
                dir={isRtl ? 'rtl' : 'ltr'}
                className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80 shadow-sm opacity-95"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400">#ORD-{ord.id}</span>
                  <span className="text-xs font-bold text-emerald-400">
                    Rider: {ord.riderName || 'Assigned'}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-white leading-tight mb-1">
                  {ord.building}
                </h4>
                <p className="text-xs text-slate-300 mb-3">
                  {ord.unit} • {ord.items.length} items
                </p>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                  <div className="bg-[#0B6E4F] h-full w-3/4 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] text-emerald-400 font-extrabold uppercase">
                    In Transit • 3 mins away
                  </p>
                  <a
                    href={generateOrderStatusUpdateWhatsAppLink(ord, store, 'out_for_delivery', lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1 shadow transition-all"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Notify Status</span>
                  </a>
                </div>
              </div>
            ))}

            {outForDeliveryOrders.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No active dispatches right now
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Packing Checklist & Dispatch Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-white">
                    {t('orderDetail')} #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold">
                    {selectedOrder.building} • {selectedOrder.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={generateDirectWhatsAppLink(
                      selectedOrder.customerPhone,
                      `Hi ${selectedOrder.customerName}, regarding your ElShop order #${selectedOrder.id}...`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
                    title={t('notifyCustomerWhatsApp')}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Customer Note Callout */}
              {selectedOrder.customerNote && (
                <div className="my-3 p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-xs">
                  <span className="font-bold text-amber-300 block mb-0.5">{t('customerNoteAlert')}</span>
                  <span>"{selectedOrder.customerNote}"</span>
                </div>
              )}

              {/* Item Checklist */}
              <div className="my-3">
                <h4 className="font-bold text-xs text-slate-400 mb-2">{t('checklistTitle')}</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item) => {
                    const isChecked = selectedOrder.packedItems?.includes(item.productId);
                    return (
                      <div
                        key={item.productId}
                        onClick={() => handleTogglePackedItem(selectedOrder, item.productId)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500 shrink-0" />
                          )}
                          <span className="text-xs font-semibold">
                            {isRtl ? item.nameAr : item.name} ({item.quantity}x)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white">
                          {(item.price * item.quantity).toFixed(2)} AED
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dispatch Section */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    {t('selectRider')}
                  </label>
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  >
                    {storeRiders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.vehicle})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleDispatchOrder(selectedOrder)}
                  className="w-full bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Footprints className="w-4 h-4" />
                  <span>{t('dispatchToRider')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
