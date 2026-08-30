import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Search, 
  User, 
  Building2, 
  CreditCard, 
  DollarSign, 
  BookOpen, 
  CheckCircle2, 
  WifiOff, 
  Sparkles,
  Phone,
  AlertCircle,
  Camera,
  Scan,
  List
} from 'lucide-react';
import { Product, CustomerProfile, Store, Language } from '../types';
import { useOfflineSync } from '../lib/useOfflineSync';
import { calculateCustomerKhataBalance } from '../khataUtils';
import { CameraBarcodeScanner } from './CameraBarcodeScanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: CustomerProfile[];
  khataTransactions?: any[];
  store: Store;
  lang: Language;
  onOrderCreated: () => void;
  initialScannerOpen?: boolean;
}

export const OfflineCounterOrderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  products,
  customers,
  khataTransactions = [],
  store,
  lang,
  onOrderCreated,
  initialScannerOpen = false,
}) => {
  const isRtl = lang === 'ar';
  const { isOnline, enqueueOrder } = useOfflineSync();

  // Resident / Customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customBuilding, setCustomBuilding] = useState<string>(store.area || 'Princess Tower');
  const [customUnit, setCustomUnit] = useState<string>('Apt 1402');
  const [customPhone, setCustomPhone] = useState<string>('+971 50 123 4567');
  const [customName, setCustomName] = useState<string>('Resident Customer');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'khata'>('cash');
  const [customerNote, setCustomerNote] = useState<string>('Counter / Walk-in POS Order');

  // Scanner & Product search & Cart
  const [isScannerOpen, setIsScannerOpen] = useState(initialScannerOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [forceDebitAuthorized, setForceDebitAuthorized] = useState(false);
  const [overrideReason, setOverrideReason] = useState('VIP Resident / Counter Approved');

  // Sync localProducts when prop updates
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleNewProductCreated = (newProd: Product) => {
    setLocalProducts((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
  };

  const filteredProducts = localProducts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  });

  const handleAddToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleProductScanned = (product: Product) => {
    handleAddToCart(product.id);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[productId] > 1) {
        next[productId] -= 1;
      } else {
        delete next[productId];
      }
      return next;
    });
  };

  // Selected customer details
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentKhataBalance = currentCustomer 
    ? calculateCustomerKhataBalance(khataTransactions, currentCustomer.id, currentCustomer.phone)
    : 0;
  const currentCreditLimit = currentCustomer?.creditLimit || 500;
  const availableCredit = Math.max(0, currentCreditLimit - currentKhataBalance);

  // Cart total calculations
  const cartItemsList = Object.entries(cart).map(([productId, quantity]) => {
    const prod = localProducts.find((p) => p.id === productId);
    const isSale = Boolean(prod?.sale ?? prod?.isOnSale);
    const rawPrice = isSale && prod?.discountedPrice ? prod.discountedPrice : (prod?.regularPrice ?? prod?.price ?? 10);
    const price = Number(rawPrice) || 10;
    const qty = Number(quantity) || 1;
    return {
      productId,
      name: prod?.name || 'Item',
      nameAr: prod?.nameAr || prod?.name || 'منتج',
      price,
      quantity: qty,
      unit: prod?.unit || '1 Unit',
    };
  });

  const subtotal = cartItemsList.reduce((sum: number, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const total = subtotal;

  // Khata over-limit calculations
  const projectedBalance = currentKhataBalance + total;
  const isKhataOverLimit = paymentMethod === 'khata' && projectedBalance > currentCreditLimit;
  const overLimitAmount = Math.max(0, projectedBalance - currentCreditLimit);

  if (!isOpen) return null;

  const handleProcessOrder = async () => {
    if (cartItemsList.length === 0) return;
    if (isKhataOverLimit && !forceDebitAuthorized) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        storeId: store.id,
        customerId: currentCustomer ? currentCustomer.id : undefined,
        customerName: currentCustomer ? currentCustomer.name : customName,
        customerPhone: currentCustomer ? currentCustomer.phone : customPhone,
        building: currentCustomer ? currentCustomer.building : customBuilding,
        unit: currentCustomer ? currentCustomer.unit : customUnit,
        items: cartItemsList,
        paymentMethod,
        customerNote: isKhataOverLimit 
          ? `${customerNote} [Force Debit: ${overrideReason}]` 
          : customerNote,
      };

      const queued = await enqueueOrder(payload, store.id);
      setOrderSuccess(queued.idempotencyKey);
      setTimeout(() => {
        onOrderCreated();
        onClose();
      }, 1400);
    } catch (err) {
      console.error('[OfflineOrderModal] Order processing error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">
                    {isRtl ? 'تسجيل طلب فوري / كاونتر (دون اتصال)' : 'Counter POS & Phone Order'}
                  </h3>
                  {!isOnline && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                      <WifiOff className="w-3 h-3" />
                      <span>Offline Mode</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {isRtl ? 'تسجيل طلب سريع للعملاء أو سكان البرج مع الخصم الفوري من الدفتر' : 'Instant walk-in/call order entry with offline-first IndexedDB persistence'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner */}
          {orderSuccess && (
            <div className="p-4 bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 flex items-center justify-center gap-2 text-sm font-bold animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>
                {isRtl ? 'تم حفظ الطلب محليًا في سجل المتجر وجدولته للتسليم!' : 'Order recorded in local IndexedDB ledger! Auto-sync scheduled.'}
              </span>
            </div>
          )}

          {/* Main Content: 2-Column POS */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Product Picker / Live Camera Scanner (7 Cols) */}
            <div className="lg:col-span-7 p-5 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col overflow-hidden">
              
              {/* POS Mode Switch Tabs (Catalog vs. Live Camera Scanner) */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !isScannerOpen
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'قائمة المنتجات' : 'Catalog List'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isScannerOpen
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/50'
                        : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <Scan className="w-3.5 h-3.5 animate-pulse" />
                    <span>{isRtl ? 'كاميرا الباركود وQR' : 'Live Camera Barcode/QR'}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-200 uppercase font-mono">
                      Fast
                    </span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  {isScannerOpen ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Scanner Active
                    </span>
                  ) : (
                    `${filteredProducts.length} Items`
                  )}
                </span>
              </div>

              {isScannerOpen ? (
                <div className="flex-1 overflow-y-auto">
                  <CameraBarcodeScanner
                    products={localProducts}
                    cart={cart}
                    onProductScanned={handleProductScanned}
                    onNewProductCreated={handleNewProductCreated}
                    storeId={store.id}
                    lang={lang}
                    isInline={true}
                  />
                </div>
              ) : (
                <>
                  {/* Product Search */}
                  <div className="relative mb-3 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isRtl ? 'ابحث عن منتج، باركود، أو تصنيف...' : 'Search product catalog or barcode...'}
                        className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="px-3 py-2 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                      title="Open Live Camera Scanner"
                    >
                      <Scan className="w-4 h-4" />
                      <span className="hidden sm:inline">{isRtl ? 'ماسح الكاميرا' : 'Camera Scan'}</span>
                    </button>
                  </div>

                  {/* Product List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredProducts.map((prod) => {
                  const isSale = Boolean(prod.sale ?? prod.isOnSale);
                  const price = isSale && prod.discountedPrice ? prod.discountedPrice : (prod.regularPrice ?? prod.price);
                  const inCartQty = cart[prod.id] || 0;

                  return (
                    <div
                      key={prod.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                        inCartQty > 0
                          ? 'bg-indigo-950/30 border-indigo-500/40'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white truncate">{isRtl ? prod.nameAr : prod.name}</h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{prod.category}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">{price.toFixed(2)} AED</span>
                            <span>•</span>
                            <span className="text-slate-500">Stock: {prod.stock}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {inCartQty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-1">
                            <button
                              onClick={() => handleRemoveFromCart(prod.id)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-white font-mono px-1.5 text-xs">{inCartQty}</span>
                            <button
                              onClick={() => handleAddToCart(prod.id)}
                              className="p-1 text-indigo-400 hover:text-white rounded hover:bg-slate-800"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(prod.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

            {/* Right Column: Customer & Checkout (5 Cols) */}
            <div className="lg:col-span-5 p-5 bg-slate-950/40 flex flex-col justify-between overflow-y-auto space-y-4">
              
              <div className="space-y-4">
                {/* Customer Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{isRtl ? 'بيانات الساكن / العميل' : 'Resident Profile'}</span>
                    <span className="text-indigo-400 font-bold text-[10px]">Tower Resident Tab</span>
                  </label>
                  
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} • {c.building} ({c.unit})
                      </option>
                    ))}
                    <option value="">+ Custom / Walk-in Customer</option>
                  </select>

                  {!selectedCustomerId && (
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Customer Name"
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                      <input
                        type="text"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        placeholder="Unit e.g. Apt 1402"
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {isRtl ? 'طريقة الدفع' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Cash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Card POS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('khata')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'khata'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Khata Tab</span>
                    </button>
                  </div>
                </div>

                {/* Khata Status Box if Khata selected */}
                {paymentMethod === 'khata' && (
                  <div className={`p-3 rounded-xl space-y-2 text-xs border ${
                    isKhataOverLimit
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                      : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                  }`}>
                    <div className="flex justify-between font-bold">
                      <span>Current Debt: {currentKhataBalance.toFixed(2)} AED</span>
                      <span>Credit Limit: {currentCreditLimit} AED</span>
                    </div>

                    {isKhataOverLimit ? (
                      <div className="space-y-2 pt-1 border-t border-rose-800/60">
                        <div className="flex items-center gap-1.5 text-rose-300 font-extrabold">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>⚠️ Over limit by {overLimitAmount.toFixed(2)} AED!</span>
                        </div>
                        <p className="text-[10px] text-rose-300/90 leading-tight">
                          Projected balance ({projectedBalance.toFixed(2)} AED) exceeds approved limit.
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition-all text-center"
                          >
                            Switch to Cash
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-all text-center"
                          >
                            Switch to Card
                          </button>
                        </div>

                        {/* Force Debit Option */}
                        <div className="pt-2 border-t border-rose-800/40 space-y-1.5">
                          <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-amber-300">
                            <input
                              type="checkbox"
                              checked={forceDebitAuthorized}
                              onChange={(e) => setForceDebitAuthorized(e.target.checked)}
                              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                            />
                            <span>Authorize Force Debit Override</span>
                          </label>
                          {forceDebitAuthorized && (
                            <input
                              type="text"
                              value={overrideReason}
                              onChange={(e) => setOverrideReason(e.target.value)}
                              placeholder="Reason (e.g. VIP resident approved)"
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-white"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-amber-400">
                        Available Credit: {availableCredit.toFixed(2)} AED • Order will be debited to resident notebook ledger.
                      </p>
                    )}
                  </div>
                )}

                {/* Selected Items Summary */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-400 pb-1 border-b border-slate-800 text-[11px]">
                    <span>Cart Items ({cartItemsList.length})</span>
                    <span>Subtotal</span>
                  </div>
                  
                  {cartItemsList.length === 0 ? (
                    <p className="text-slate-500 text-center py-2 text-xs italic">
                      Click "Add" on products to build the order
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {cartItemsList.map((it) => (
                        <div key={it.productId} className="flex justify-between text-slate-200 text-xs">
                          <span className="truncate">{it.quantity}x {it.name}</span>
                          <span className="font-mono text-emerald-400 font-bold">{(it.price * it.quantity).toFixed(2)} AED</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black text-white">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400 text-base font-mono">{total.toFixed(2)} AED</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleProcessOrder}
                disabled={isSubmitting || cartItemsList.length === 0}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                  cartItemsList.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950 active:scale-[0.99]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isSubmitting 
                    ? 'Recording to Ledger...' 
                    : `Charge ${total.toFixed(2)} AED & Print`}
                </span>
              </button>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
