import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Send, 
  Plus, 
  Minus, 
  Check, 
  ChevronRight, 
  Search, 
  CreditCard, 
  Banknote, 
  BookOpen, 
  MapPin, 
  PhoneCall, 
  Clock, 
  AlertCircle,
  Truck,
  Sparkles,
  ArrowLeft,
  X,
  Smartphone,
  MessageCircle,
  Globe,
  User,
  Edit3,
  ShieldCheck,
  Building,
  CheckCircle2
} from 'lucide-react';
import { AppState, Order, Product, ProductCategory, CustomerProfile, Language } from '../types';
import { createOrder, sendChatMessage } from '../api';
import { calculateCustomerKhataBalance } from '../khataUtils';
import { getTranslation, getCategoryName } from '../translations';
import { ProductImage } from './ProductImage';
import { generateOrderWhatsAppLink, generateDirectWhatsAppLink } from '../lib/whatsapp';
import { ElShopLogo } from './ElShopLogo';
import { FintechSkeletonLoader } from './FintechSkeletonLoader';

interface Props {
  state: AppState;
  activeStoreId: string;
  activeCustomerId?: string;
  lang: Language;
  isLoading?: boolean;
  onRefresh: () => void;
  onToggleLang?: () => void;
  onOpenLegal?: (tab: 'terms' | 'privacy' | 'disclaimers') => void;
}

export const CustomerView: React.FC<Props> = ({ 
  state, 
  activeStoreId, 
  activeCustomerId = 'cust-1', 
  lang, 
  isLoading = false,
  onRefresh, 
  onToggleLang, 
  onOpenLegal 
}) => {
  const t = (key: string, params?: Record<string, any>) => getTranslation(lang, key, params);
  const isRtl = lang === 'ar';

  const todayStr = new Date().toISOString().split('T')[0];
  const store = state?.stores?.find((s) => s.id === activeStoreId) || state?.stores?.[0];

  // Automatically exclude out of stock AND expired products from customer catalogue
  const storeProducts = state?.products ? state.products.filter((p) => {
    if (p.storeId !== store?.id || !p.inStock) return false;
    if (p.expiryDate && p.expiryDate < todayStr) return false;
    return true;
  }) : [];

  // Current customer profile is strictly private to the authenticated resident
  const currentCustomer = state?.customers?.find((c) => c.id === activeCustomerId) || state?.customers?.[0] || {
    id: 'cust-1',
    name: 'Resident',
    phone: '+971 50 123 4567',
    building: 'Marina Pinnacle',
    unit: '1402',
    isKhataPreApproved: true,
    khataLimit: 500,
  };

  // Active tracking order or new chat order
  const storeOrders = state?.orders ? state.orders.filter((o) => o.storeId === store?.id) : [];
  const activeOrder = storeOrders[0]; // most recent order

  const currentCustKhataBalance = calculateCustomerKhataBalance(
    state.khataTransactions || [],
    currentCustomer.id,
    currentCustomer.phone
  );

  // UI state
  const [showCatalog, setShowCatalog] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCardTerminalModal, setShowCardTerminalModal] = useState(false);
  const [showPwaInstallModal, setShowPwaInstallModal] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const [showQuickReorder, setShowQuickReorder] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state: map of productId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});

  // Checkout & Resident address inputs
  const [building, setBuilding] = useState(currentCustomer.building);
  const [unit, setUnit] = useState(currentCustomer.unit);
  const [customerPhone, setCustomerPhone] = useState(currentCustomer.phone);
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'khata'>(
    currentCustomer.isKhataPreApproved ? 'khata' : 'card'
  );

  // Sync inputs when active resident changes
  useEffect(() => {
    setBuilding(currentCustomer.building);
    setUnit(currentCustomer.unit);
    setCustomerPhone(currentCustomer.phone);
    if (!currentCustomer.isKhataPreApproved && paymentMethod === 'khata') {
      setPaymentMethod('card');
    }
  }, [currentCustomer.id]);

  // Chat message input
  const [chatInput, setChatInput] = useState('');

  const cartItems = Object.entries(cart).map(([productId, qty]) => {
    const product = storeProducts.find((p) => p.id === productId);
    return { product, qty };
  }).filter((item): item is { product: Product; qty: number } => item.product !== undefined);

  const cartSubtotal = cartItems.reduce((sum, item) => {
    const isSale = Boolean(item.product.sale ?? item.product.isOnSale);
    const regP = item.product.regularPrice ?? item.product.originalPrice;
    const discP = item.product.discountedPrice ?? item.product.price;
    const effectiveP = isSale && discP !== undefined ? discP : (regP ?? item.product.price);
    return sum + effectiveP * item.qty;
  }, 0);
  const requiresDeliveryFee = cartSubtotal > 0 && cartSubtotal < 25;
  const deliveryFee = requiresDeliveryFee ? 3.50 : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  // Credit Limit Calculations
  const customerCreditLimit = currentCustomer.creditLimit ?? 500;
  const isKhataLimitExceeded = (currentCustKhataBalance + cartTotal) > customerCreditLimit;
  const remainingKhataCredit = Math.max(0, customerCreditLimit - currentCustKhataBalance);

  // Categories list
  const categories: string[] = [
    'All',
    '🔥 Special Offers',
    'Dairy & Eggs',
    'Bakery',
    'Beverages',
    'Pantry',
    'Snacks',
    'Fresh Produce',
    'Household',
    'Personal Care',
  ];

  const filteredProducts = storeProducts.filter((p) => {
    let matchesCategory = false;
    const normCategory = selectedCategory.trim().toLowerCase();
    if (normCategory === 'all' || selectedCategory === 'الكل') {
      matchesCategory = true;
    } else if (
      selectedCategory === '🔥 Special Offers' ||
      selectedCategory === '🔥 العروض الخاصّة' ||
      normCategory === 'on sale'
    ) {
      matchesCategory = Boolean(p.sale ?? p.isOnSale);
    } else {
      matchesCategory = p.category.toLowerCase() === selectedCategory.toLowerCase();
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.nameAr || '').toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const updateCartQty = (productId: string, delta: number) => {
    const prod = storeProducts.find((p) => p.id === productId);
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (delta > 0 && prod) {
        if (prod.inStock === false || (prod.stock !== undefined && prod.stock <= 0)) {
          return prev;
        }
        if (prod.stock !== undefined && current >= prod.stock) {
          return prev;
        }
      }
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handlePlaceOrderSubmit = async () => {
    if (!cartItems.length) return;

    // Check Khata credit limit
    if (paymentMethod === 'khata' && isKhataLimitExceeded) {
      alert(
        isRtl
          ? `عذراً! تم تجاوز الحد الائتماني المعتمد (${customerCreditLimit.toFixed(2)} درهم). رصيدك الحالي: ${currentCustKhataBalance.toFixed(2)} درهم. يرجى اختيار الدفع بالبطاقة أو نقداً.`
          : `Khata Credit Limit Exceeded! Your approved limit is ${customerCreditLimit.toFixed(2)} AED (Current Balance: ${currentCustKhataBalance.toFixed(2)} AED). Please choose Card or Cash.`
      );
      return;
    }

    if (paymentMethod === 'card') {
      setShowCardTerminalModal(true);
      setIsProcessingPayment(true);
      setTimeout(async () => {
        setIsProcessingPayment(false);
        setTimeout(async () => {
          setShowCardTerminalModal(false);
          await finalizeOrderPlacement();
        }, 1200);
      }, 1800);
    } else {
      await finalizeOrderPlacement();
    }
  };

  const finalizeOrderPlacement = async () => {
    try {
      const orderItems = cartItems.map((ci) => {
        const isSale = Boolean(ci.product.sale ?? ci.product.isOnSale);
        const regP = ci.product.regularPrice ?? ci.product.originalPrice;
        const discP = ci.product.discountedPrice ?? ci.product.price;
        const effectiveP = isSale && discP !== undefined ? discP : (regP ?? ci.product.price);
        return {
          productId: ci.product.id,
          name: ci.product.name,
          nameAr: ci.product.nameAr,
          price: effectiveP,
          quantity: ci.qty,
          unit: ci.product.unit,
        };
      });

      const createdOrder = await createOrder({
        storeId: store.id,
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        customerPhone: currentCustomer.phone,
        building,
        unit,
        items: orderItems,
        paymentMethod,
        customerNote,
      });

      // Launch WhatsApp Deep Link with order details
      const waUrl = generateOrderWhatsAppLink(createdOrder, store, lang);
      window.open(waUrl, '_blank');

      setCart({});
      setShowCheckout(false);
      setShowCart(false);
      setShowCatalog(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !activeOrder) return;
    try {
      await sendChatMessage(activeOrder.id, {
        sender: 'customer',
        text: chatInput,
      });
      setChatInput('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !store) {
    return <FintechSkeletonLoader mode="customer" isRtl={isRtl} />;
  }

  return (
    <div className="flex justify-center w-full min-h-[750px] p-2 md:p-4 bg-slate-100 font-sans">
      {/* Phone Frame Outer Wrapper */}
      <div className="w-full max-w-[440px] bg-white rounded-[32px] shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden relative min-h-[720px] max-h-[850px]">
        
        {/* WhatsApp-style Header Bar */}
        <div className="bg-[#0B6E4F] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="relative">
              <ProductImage
                src={store.image}
                alt={store.name}
                fallbackType="store"
                className="w-10 h-10 rounded-full object-cover border-2 border-white/80"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${store.servicePaused ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide leading-snug">
                {isRtl ? store.nameAr : store.name}
              </h2>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                {store.servicePaused ? (
                  <span className="text-rose-200 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Service Suspended
                  </span>
                ) : (
                  <>
                    <Clock className="w-3 h-3 inline" /> {t('online')}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-2 py-1.5 rounded-full text-xs flex items-center gap-1 border border-emerald-600/70 shadow transition-all active:scale-95"
                title="Toggle Language"
              >
                <Globe className="w-3 h-3 text-amber-300" />
                <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
              </button>
            )}

            <a
              href={generateDirectWhatsAppLink(store.whatsappNumber || store.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold p-2 sm:px-2.5 sm:py-1.5 rounded-full text-xs flex items-center gap-1 shadow transition-all active:scale-95 border border-emerald-500/40"
              title={t('chatOnWhatsApp')}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('chatOnWhatsApp')}</span>
            </a>

            {!store.servicePaused && (
              <button
                onClick={() => setShowCatalog(true)}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow transition-all active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('catalogBtn')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Service Suspended Customer Alert Banner */}
        {store.servicePaused && (
          <div className="bg-rose-600 text-white p-3 text-xs flex items-center gap-2 shadow-md z-10 border-b border-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold">Store Temporarily Unavailable</p>
              <p className="text-[10px] text-rose-100">
                This store is temporarily undergoing administrative maintenance. Please check back shortly or reach out via WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* Chat Thread Container */}
        <div className="flex-1 bg-[#E5DDD5] bg-opacity-40 p-3 overflow-y-auto space-y-3 relative">
          {/* Subtle WhatsApp wallpaper pattern placeholder background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0B6E4F_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {activeOrder ? (
            <>
              {/* Live Order Status Badge Banner */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-800">
                    Order #{activeOrder.id}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    {t(`status${activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}`)}
                  </span>
                </div>

                {/* Progress Stepper */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 relative mt-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${activeOrder.status === 'placed' || activeOrder.status === 'packing' || activeOrder.status === 'out_for_delivery' || activeOrder.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                      1
                    </div>
                    <span className="mt-1">{t('statusPlaced')}</span>
                  </div>

                  <div className={`flex-1 h-1 mx-1 ${activeOrder.status === 'packing' || activeOrder.status === 'out_for_delivery' || activeOrder.status === 'delivered' ? 'bg-emerald-600' : 'bg-slate-200'}`} />

                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${activeOrder.status === 'packing' || activeOrder.status === 'out_for_delivery' || activeOrder.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                      2
                    </div>
                    <span className="mt-1">{t('statusPacking')}</span>
                  </div>

                  <div className={`flex-1 h-1 mx-1 ${activeOrder.status === 'out_for_delivery' || activeOrder.status === 'delivered' ? 'bg-emerald-600' : 'bg-slate-200'}`} />

                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${activeOrder.status === 'out_for_delivery' || activeOrder.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                      3
                    </div>
                    <span className="mt-1">{t('statusOutForDelivery')}</span>
                  </div>

                  <div className={`flex-1 h-1 mx-1 ${activeOrder.status === 'delivered' ? 'bg-emerald-600' : 'bg-slate-200'}`} />

                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${activeOrder.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                      4
                    </div>
                    <span className="mt-1">{t('statusDelivered')}</span>
                  </div>
                </div>

                {activeOrder.riderName && activeOrder.status === 'out_for_delivery' && (
                  <div className="mt-2 text-xs bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-center justify-between text-amber-900">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-600" />
                      <span>Rider: <strong>{activeOrder.riderName}</strong></span>
                    </div>
                    <span className="font-semibold text-emerald-700">En route 🛵</span>
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setShowCatalog(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إضافة منتجات أخرى' : 'Add More Items'}</span>
                  </button>

                  <a
                    href={generateOrderWhatsAppLink(activeOrder, store, lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t('sendWhatsAppOrder')}</span>
                  </a>
                </div>
              </div>

              {/* Chat messages */}
              {activeOrder.chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'customer'
                      ? 'ml-auto items-end'
                      : msg.sender === 'store'
                      ? 'mr-auto items-start'
                      : 'mx-auto items-center'
                  }`}
                >
                  {msg.sender === 'system' ? (
                    <div className="bg-amber-100/90 border border-amber-200/80 text-amber-900 text-[11px] px-3 py-1.5 rounded-full my-1 shadow-sm text-center">
                      {isRtl && msg.textAr ? msg.textAr : msg.text}
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                        msg.sender === 'customer'
                          ? 'bg-[#DCF8C6] text-slate-900 rounded-tr-none'
                          : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                      }`}
                    >
                      <p className="leading-relaxed">{isRtl && msg.textAr ? msg.textAr : msg.text}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block text-right font-medium">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-[#0B6E4F] mb-3 shadow">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                {isRtl ? 'مرحباً بكم في بقالة الحي!' : 'Welcome to Your Neighborhood Store!'}
              </h3>
              <p className="text-xs text-slate-600 max-w-[240px] mb-4">
                {isRtl ? 'تصفح الكتالوج واطلب احتياجاتك المنزلية بسهولة عبر الواتساب.' : 'Browse the catalog or message us to order fresh groceries delivered in minutes.'}
              </p>
              <button
                onClick={() => setShowCatalog(true)}
                className="bg-[#0B6E4F] hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('catalogBtn')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Floating Cart Launcher Button (if cart has items) */}
        {Object.keys(cart).length > 0 && !showCatalog && !showCart && (
          <div className="p-2 bg-emerald-900 border-t border-emerald-800">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
                </span>
                <span>{t('cartTitle')}</span>
              </div>
              <div className="flex items-center gap-1 font-extrabold text-sm">
                <span>{cartTotal.toFixed(2)} {t('currency')}</span>
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </div>
        )}

        {/* WhatsApp Chat Input Bar */}
        <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder={t('typeMessage')}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
          />
          <button
            onClick={handleSendChat}
            disabled={!chatInput.trim() || !activeOrder}
            className="w-9 h-9 bg-[#0B6E4F] hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-all shadow-sm"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {/* --- CATALOG SLIDE-OVER MODAL --- */}
        <AnimatePresence>
          {showCatalog && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-0 bg-white z-20 flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#0B6E4F] text-white px-4 py-3 flex items-center justify-between shadow">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCatalog(false)}
                    className="p-1 hover:bg-emerald-800 rounded-full"
                  >
                    <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                  <h3 className="font-bold text-sm">{t('catalogBtn')}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {onToggleLang && (
                    <button
                      onClick={onToggleLang}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-2 py-1 rounded-full text-[11px] flex items-center gap-1 border border-emerald-600/70 shadow transition-all active:scale-95"
                      title="Toggle Language"
                    >
                      <Globe className="w-3 h-3 text-amber-300" />
                      <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
                    </button>
                  )}

                  {Object.keys(cart).length > 0 && (
                    <button
                      onClick={() => {
                        setShowCatalog(false);
                        setShowCart(true);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{cartTotal.toFixed(2)} {t('currency')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search & Categories */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
                <div className="relative">
                  <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5`} />
                  <input
                    type="text"
                    placeholder={isRtl ? 'ابحث عن حليب، خبز، بيض، زيت...' : 'Search milk, bread, eggs, oil...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-white border border-slate-300 rounded-xl ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]`}
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#0B6E4F] text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {getCategoryName(cat, lang)}
                    </button>
                  ))}
                </div>

                {/* PWA "Save to Home Screen" Banner */}
                {showPwaBanner && (
                  <div className="bg-emerald-950 text-white p-2.5 rounded-2xl border border-emerald-700/60 flex items-center justify-between shadow-sm text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-emerald-800 rounded-xl flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                        📱
                      </div>
                      <div>
                        <span className="font-extrabold text-[11px] block leading-tight text-emerald-100">
                          {isRtl ? `تثبيت ${store.nameAr} على الشاشة الرئيسية` : `Add ${store.name} to Home Screen`}
                        </span>
                        <span className="text-[10px] text-emerald-300">
                          {isRtl ? 'للوصول الفوري وطلب البقالة بلمسة واحدة' : 'Instant 1-tap grocery re-ordering'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setShowPwaInstallModal(true)}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg transition-all shadow-sm"
                      >
                        {isRtl ? 'تثبيت' : 'Install'}
                      </button>
                      <button
                        onClick={() => setShowPwaBanner(false)}
                        className="text-emerald-400 hover:text-white p-1"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Private Resident Delivery Profile & Khata Account Header (Strictly Single-Account, No other customers exposed) */}
                <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center text-emerald-900 font-black text-xs shadow-inner">
                        {currentCustomer.name.charAt(0)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {currentCustomer.name}
                        </span>
                        <button
                          onClick={() => setShowProfileModal(true)}
                          className="text-emerald-700 hover:text-emerald-900 p-0.5 hover:bg-emerald-50 rounded transition-colors"
                          title={isRtl ? 'تعديل العنوان وتفاصيل التوصيل' : 'Edit delivery address & preferences'}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        <span>{building || currentCustomer.building} • {unit || currentCustomer.unit}</span>
                      </p>
                    </div>
                  </div>

                  {/* Customer Private Khata Balance Owed Pill (Only displays amount owed to shop, no limits/progress bars) */}
                  <div className="text-right flex items-center gap-1.5">
                    {currentCustomer.isKhataPreApproved ? (
                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="bg-amber-50 hover:bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-xl text-[10px] text-right shadow-xs transition-all text-left"
                        title="Click to view Khata statement details"
                      >
                        <span className="text-slate-500 block text-[9px] font-bold">
                          {isRtl ? 'الرصيد المستحق للبقالة' : 'Khata Balance Owed'}
                        </span>
                        <span className="font-black text-amber-900 text-xs">
                          {currentCustKhataBalance.toFixed(2)} AED
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="text-[10px] text-slate-500 bg-slate-100 hover:bg-slate-200/80 px-2 py-1 rounded-xl font-medium border border-slate-200 transition-all flex items-center gap-1"
                      >
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{isRtl ? 'حساب بطاقة / نقد' : 'Card / Cash'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ⚡ Smart Reorder Bar (Neighborhood Staples) with Close / Toggle */}
                {showQuickReorder ? (
                  <div className="bg-emerald-900/90 text-white p-3 rounded-2xl border border-emerald-700/60 shadow-sm space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'إعادة طلب سريعة بلمسة واحدة' : '⚡ Quick 1-Tap Reorder (Staples)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-300 font-medium hidden sm:inline">
                          {isRtl ? 'الأساسيات اليومية' : 'Daily Essentials'}
                        </span>
                        <button
                          onClick={() => setShowQuickReorder(false)}
                          className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors"
                          title={isRtl ? 'إغلاق إعادة الطلب السريع' : 'Close 1-tap reorder'}
                          aria-label="Close 1-tap reorder"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {storeProducts.slice(0, 5).map((staple) => (
                        <div
                          key={staple.id}
                          className="bg-emerald-950/90 border border-emerald-600/40 rounded-xl p-2 min-w-[130px] flex-shrink-0 flex items-center justify-between gap-2 shadow"
                        >
                          <ProductImage
                            src={staple.image}
                            alt={isRtl ? staple.nameAr : staple.name}
                            fallbackType="grocery"
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-white block truncate">
                              {isRtl ? staple.nameAr : staple.name}
                            </span>
                            <span className="text-[9px] text-amber-300 font-mono">
                              {staple.price.toFixed(2)} AED
                            </span>
                          </div>
                          <button
                            onClick={() => updateCartQty(staple.id, 1)}
                            className="w-6 h-6 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow active:scale-95 transition-all"
                            title="Quick add to cart"
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowQuickReorder(true)}
                      className="text-[10px] font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200/90 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{isRtl ? 'إظهار إعادة الطلب السريع ⚡' : 'Show 1-Tap Reorder ⚡'}</span>
                    </button>
                  </div>
                )}

                {/* Active Order Live Tracker Banner in Catalog */}
                {activeOrder && activeOrder.status !== 'delivered' && (
                  <div 
                    onClick={() => setShowCatalog(false)}
                    className="cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 p-2.5 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <div>
                        <div className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1">
                          <span>Active Order #{activeOrder.id}</span>
                          <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded-full uppercase">
                            {activeOrder.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700">
                          {activeOrder.status === 'out_for_delivery'
                            ? `🛵 Rider ${activeOrder.riderName || ''} is delivering to ${activeOrder.building} Unit ${activeOrder.unit}`
                            : 'Baqala is packing your fresh items'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 underline">Track & Chat ➔</span>
                  </div>
                )}
              </div>

              {/* 2-Column Product Grid */}
              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 bg-slate-50">
                {filteredProducts.map((p) => {
                  const qty = cart[p.id] || 0;
                  const isSale = Boolean(p.sale ?? p.isOnSale);
                  const regP = p.regularPrice ?? p.originalPrice;
                  const discP = p.discountedPrice ?? p.price;
                  const effectiveP = isSale && discP !== undefined ? discP : (regP ?? p.price);
                  const isOutOfStock = p.inStock === false || (p.stock !== undefined && p.stock <= 0);
                  const isMaxStockReached = p.stock !== undefined && qty >= p.stock;

                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-2xl p-2.5 border shadow-sm flex flex-col justify-between transition-all ${
                        isOutOfStock ? 'border-slate-200 opacity-75' : 'border-slate-200/80 hover:border-emerald-300'
                      }`}
                    >
                      <div>
                        <div className="relative mb-2">
                          <ProductImage
                            src={p.image}
                            alt={isRtl ? p.nameAr : p.name}
                            fallbackType="grocery"
                            className={`w-full h-24 object-cover rounded-xl ${isOutOfStock ? 'grayscale-[50%]' : ''}`}
                          />
                          <span className={`absolute top-1 ${isRtl ? 'left-1' : 'right-1'} bg-slate-900/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md`}>
                            {isRtl ? (p.unitAr || p.unit) : p.unit}
                          </span>
                          {isOutOfStock ? (
                            <span className={`absolute top-1 ${isRtl ? 'right-1' : 'left-1'} bg-slate-800 text-slate-200 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm`}>
                              {isRtl ? 'غير متوفر' : 'Out of Stock'}
                            </span>
                          ) : isSale ? (
                            <span className={`absolute top-1 ${isRtl ? 'right-1' : 'left-1'} bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm animate-pulse`}>
                              {isRtl ? 'عرض خاص' : 'SALE'}
                            </span>
                          ) : null}
                        </div>
                        <h4 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-tight">
                          {isRtl ? p.nameAr : p.name}
                        </h4>
                        <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                          <div className="text-[#0B6E4F] font-bold text-xs">
                            {effectiveP.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">{t('currency')}</span>
                          </div>
                          {isSale && regP && regP > effectiveP && (
                            <div className="text-slate-400 text-[10px] line-through font-normal">
                              {regP.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100">
                        {isOutOfStock ? (
                          <div className="w-full bg-slate-100 text-slate-400 font-bold py-1.5 rounded-xl text-[11px] text-center">
                            {isRtl ? 'غير متوفر حالياً' : 'Out of Stock'}
                          </div>
                        ) : qty === 0 ? (
                          <button
                            onClick={() => updateCartQty(p.id, 1)}
                            className="w-full bg-emerald-50 hover:bg-[#0B6E4F] text-[#0B6E4F] hover:text-white font-semibold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all border border-emerald-200 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('addToCart')}</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-emerald-700 text-white rounded-xl p-1 shadow-inner">
                            <button
                              onClick={() => updateCartQty(p.id, -1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded-lg text-white font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-xs">{qty}</span>
                            <button
                              onClick={() => updateCartQty(p.id, 1)}
                              disabled={isMaxStockReached}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg text-white font-bold ${
                                isMaxStockReached ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-800'
                              }`}
                              title={isMaxStockReached ? (isRtl ? 'الحد الأقصى للكمية المتوفرة' : 'Max stock reached') : undefined}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-2 py-10 px-4 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-800">
                        {isRtl ? 'لم نتمكن من العثور على هذا المنتج' : 'Item Not Found in Catalog'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-[260px] mx-auto">
                        {isRtl
                          ? `لم نجد نتائج مطابقة لـ "${searchQuery}". يمكنك سؤال البقالة مباشرة وتوفيرها لك فورا!`
                          : `No results found for "${searchQuery}". Send a quick message to the grocery to check backroom stock!`}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                      <a
                        href={generateDirectWhatsAppLink(
                          store.phone,
                          `Hello ${store.name}, do you have "${searchQuery}" available? I am in ${building || currentCustomer.building} (${unit || currentCustomer.unit}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{isRtl ? 'اسأل البقالة على واتساب' : 'Ask Shopkeeper on WhatsApp'}</span>
                      </a>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                      >
                        {isRtl ? 'عرض كل المنتجات' : 'Clear Search'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ElShop Catalog Footer Disclaimer */}
                <div className="col-span-2 py-4 px-2 text-center border-t border-slate-200 mt-2 space-y-1.5 bg-slate-50/80 rounded-2xl">
                  <div className="flex items-center justify-center">
                    <ElShopLogo size="xs" variant="light-badge" showCountry />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Hyperlocal Grocery Delivery & Zero-Install Commerce
                  </p>
                  {onOpenLegal && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-0.5">
                      <button onClick={() => onOpenLegal('terms')} className="underline hover:text-emerald-700">
                        {isRtl ? 'الشروط والأحكام' : 'Terms & Conditions'}
                      </button>
                      <span>•</span>
                      <button onClick={() => onOpenLegal('privacy')} className="underline hover:text-emerald-700">
                        {isRtl ? 'الخصوصية' : 'Privacy'}
                      </button>
                      <span>•</span>
                      <button onClick={() => onOpenLegal('disclaimers')} className="underline hover:text-emerald-700">
                        {isRtl ? 'إخلاء المسؤولية' : 'Disclaimers'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* View Cart Bottom Drawer */}
              {Object.keys(cart).length > 0 && (
                <div className="p-3 bg-white border-t border-slate-200 shadow-lg">
                  <button
                    onClick={() => {
                      setShowCatalog(false);
                      setShowCart(true);
                    }}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2.5 px-4 rounded-xl shadow flex items-center justify-between text-xs"
                  >
                    <span>
                      {Object.values(cart).reduce((a: number, b: number) => a + b, 0)} {isRtl ? 'عناصر مختارة' : 'Items Selected'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span>{isRtl ? 'المتابعة للشراء' : 'Checkout'} ({cartTotal.toFixed(2)} {t('currency')})</span>
                      <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CART SCREEN MODAL --- */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-0 bg-white z-30 flex flex-col"
            >
              <div className="bg-[#0B6E4F] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-1 hover:bg-emerald-800 rounded-full"
                  >
                    <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                  <h3 className="font-bold text-sm">{t('cartTitle')}</h3>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-1 hover:bg-emerald-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Item List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {cartItems.map(({ product, qty }) => (
                  <div
                    key={product.id}
                    className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        fallbackType="grocery"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h5 className="font-semibold text-xs text-slate-800">
                          {isRtl ? product.nameAr : product.name}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {product.price.toFixed(2)} AED / {product.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
                      <button
                        onClick={() => updateCartQty(product.id, -1)}
                        className="w-6 h-6 bg-white hover:bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs text-slate-800 px-1">{qty}</span>
                      <button
                        onClick={() => updateCartQty(product.id, 1)}
                        className="w-6 h-6 bg-white hover:bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {/* Delivery Fee Line & Explanation Banner */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 mt-4 shadow-sm">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{t('subtotal')}</span>
                    <span className="font-semibold">{cartSubtotal.toFixed(2)} {t('currency')}</span>
                  </div>

                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-600">{t('deliveryFee')}</span>
                    {requiresDeliveryFee ? (
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        + 3.50 {t('currency')}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {t('freeDeliveryUnlocked')}
                      </span>
                    )}
                  </div>

                  {requiresDeliveryFee && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <span>{t('deliveryFeeNotice')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total</span>
                    <span className="text-[#0B6E4F]">{cartTotal.toFixed(2)} {t('currency')}</span>
                  </div>
                </div>

                {/* ElShop Disclaimer in Cart */}
                <div className="py-3 px-2 text-center border-t border-slate-200 mt-3 space-y-1 bg-slate-50/80 rounded-2xl">
                  <div className="flex items-center justify-center">
                    <ElShopLogo size="xs" variant="light-badge" showCountry />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Hyperlocal Grocery Delivery & Zero-Install Commerce
                  </p>
                  {onOpenLegal && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-0.5">
                      <button onClick={() => onOpenLegal('terms')} className="underline hover:text-emerald-700">
                        {isRtl ? 'الشروط والأحكام' : 'Terms'}
                      </button>
                      <span>•</span>
                      <button onClick={() => onOpenLegal('disclaimers')} className="underline hover:text-emerald-700">
                        {isRtl ? 'إخلاء المسؤولية' : 'Disclaimers'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Proceed to Checkout Action */}
              <div className="p-3 bg-white border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                  className="w-full bg-[#0B6E4F] hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg text-xs flex items-center justify-center gap-2"
                >
                  <span>{t('checkout')}</span>
                  <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CHECKOUT MODAL --- */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-0 bg-white z-40 flex flex-col"
            >
              <div className="bg-[#0B6E4F] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="p-1 hover:bg-emerald-800 rounded-full"
                  >
                    <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                  <h3 className="font-bold text-sm">{t('checkout')}</h3>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-1 hover:bg-emerald-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-slate-800">
                {/* Delivery Address Section */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#0B6E4F]" />
                    <span>{t('deliveryAddress')}</span>
                  </h4>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">
                      {t('buildingName')}
                    </label>
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="e.g. Bay Square Tower 3"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">
                      {t('unitNumber')}
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. Apt 402"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">
                      {t('customerNotes')}
                    </label>
                    <input
                      type="text"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="e.g. Call when downstairs / leave at door"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                    {/* Quick-Tap Delivery Instruction Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { labelEn: 'Leave at Door 🚪', labelAr: 'اترك عند الباب 🚪' },
                        { labelEn: 'Ring Doorbell 🔔', labelAr: 'رن الجرس 🔔' },
                        { labelEn: 'Don\'t Ring (Baby Sleeping) 🤫', labelAr: 'لا ترن الجرس 🤫' },
                        { labelEn: 'Leave with Security 🏢', labelAr: 'مع الأمن 🏢' },
                        { labelEn: 'Call when Downstairs 📞', labelAr: 'اتصل عند الوصول 📞' },
                      ].map((chip) => {
                        const label = isRtl ? chip.labelAr : chip.labelEn;
                        const isSelected = customerNote.includes(label);
                        return (
                          <button
                            key={chip.labelEn}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setCustomerNote(customerNote.replace(label, '').trim());
                              } else {
                                setCustomerNote(customerNote ? `${customerNote} • ${label}` : label);
                              }
                            }}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                              isSelected
                                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Payment Selector */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
                  <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#0B6E4F]" />
                    <span>{t('paymentMethod')}</span>
                  </h4>

                  {/* Cash */}
                  <label
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#0B6E4F] bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-semibold">{t('cashOnDelivery')}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cash' ? 'border-[#0B6E4F] bg-[#0B6E4F]' : 'border-slate-300'}`}>
                      {paymentMethod === 'cash' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                  </label>

                  {/* Card Terminal */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#0B6E4F] bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-semibold">{t('cardTerminal')}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#0B6E4F] bg-[#0B6E4F]' : 'border-slate-300'}`}>
                      {paymentMethod === 'card' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                  </label>

                  {/* Khata / Book (Visible ONLY to pre-approved customers) */}
                  {currentCustomer.isKhataPreApproved && (
                    <div
                      onClick={() => setPaymentMethod('khata')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'khata'
                          ? isKhataLimitExceeded
                            ? 'border-rose-500 bg-rose-50/70'
                            : 'border-[#0B6E4F] bg-emerald-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-amber-700" />
                          <div>
                            <span className="text-xs font-semibold block">{t('khataBook')}</span>
                            <span className="text-[10px] text-emerald-700 font-medium">Merchant Pre-Approved Credit</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'khata' ? isKhataLimitExceeded ? 'border-rose-600 bg-rose-600' : 'border-[#0B6E4F] bg-[#0B6E4F]' : 'border-slate-300'}`}>
                          {paymentMethod === 'khata' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px]">
                        <div className="flex justify-between items-center text-slate-600">
                          <span>{isRtl ? 'الرصيد المستحق الحالي:' : 'Current Balance Owed:'}</span>
                          <span className="font-bold text-slate-800">{currentCustKhataBalance.toFixed(2)} AED</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-700 font-bold">
                          <span>{isRtl ? 'الرصيد المستحق بعد الطلب:' : 'Projected Balance Owed:'}</span>
                          <span className="text-amber-800 font-black">{(currentCustKhataBalance + cartTotal).toFixed(2)} AED</span>
                        </div>
                        {isKhataLimitExceeded && (
                          <div className="bg-rose-100/90 text-rose-800 text-[10px] p-2 rounded-lg border border-rose-300 flex items-start gap-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>
                              {isRtl
                                ? 'تم الوصول للحد الائتماني المسموح به في المتجر. يرجى اختيار الدفع عند الاستلام أو بالبطاقة.'
                                : 'Khata credit limit reached for this account. Please select Cash on Delivery or Card Terminal.'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Summary */}
                <div className="bg-emerald-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[11px] opacity-80 block">Total Payable</span>
                    <span className="text-xs font-medium text-amber-300">
                      {paymentMethod === 'khata' ? 'Debited to Store Ledger' : paymentMethod === 'cash' ? 'Cash on Delivery' : 'Contactless POS Tap'}
                    </span>
                  </div>
                  <span className="text-lg font-extrabold text-amber-400">
                    {cartTotal.toFixed(2)} {t('currency')}
                  </span>
                </div>

                {/* ElShop Disclaimer in Checkout */}
                <div className="py-3 px-2 text-center border-t border-slate-200 mt-2 space-y-1 bg-slate-50/80 rounded-2xl">
                  <div className="flex items-center justify-center">
                    <ElShopLogo size="xs" variant="light-badge" showCountry />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Zero-Install Hyperlocal Commerce
                  </p>
                  {onOpenLegal && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-0.5">
                      <button onClick={() => onOpenLegal('terms')} className="underline hover:text-emerald-700">
                        {isRtl ? 'الشروط والأحكام' : 'Terms'}
                      </button>
                      <span>•</span>
                      <button onClick={() => onOpenLegal('disclaimers')} className="underline hover:text-emerald-700">
                        {isRtl ? 'إخلاء المسؤولية' : 'Disclaimers'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Order Action */}
              <div className="p-3 bg-white border-t border-slate-200">
                <button
                  onClick={handlePlaceOrderSubmit}
                  className="w-full bg-[#0B6E4F] hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 rtl:rotate-180" />
                  <span>{t('placeOrder')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SIMULATED CARD TAP POS MODAL --- */}
        <AnimatePresence>
          {showCardTerminalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <div className="bg-white rounded-3xl p-6 text-center max-w-xs shadow-2xl border border-slate-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-[#0B6E4F] mb-3 animate-pulse">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">
                  {t('simulatedCardTitle')}
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  {t('simulatedCardDesc')}
                </p>

                <div className="bg-slate-100 rounded-xl p-3 w-full mb-4">
                  <span className="text-[11px] text-slate-500 block">Amount</span>
                  <span className="text-xl font-extrabold text-emerald-800">
                    {cartTotal.toFixed(2)} {t('currency')}
                  </span>
                </div>

                {isProcessingPayment ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('simulatingPayment')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <Check className="w-4 h-4" />
                    <span>{t('paymentSuccess')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PWA INSTALL GUIDE MODAL --- */}
        <AnimatePresence>
          {showPwaInstallModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <div className="bg-white rounded-3xl p-5 text-slate-900 max-w-xs shadow-2xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-[#0B6E4F] mb-3 shadow-inner">
                  <ProductImage
                    src={store.image}
                    alt={store.name}
                    fallbackType="store"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                  {isRtl ? `تثبيت متجر ${store.nameAr}` : `Install ${store.name}`}
                </h4>
                <p className="text-xs text-slate-600 mb-4">
                  {isRtl
                    ? 'احصل على تجربة تطبيق أصيل وسريع دون الحاجة لتنزيل شيء من متجر التطبيقات.'
                    : 'Get an instant, zero-install grocery app right on your home screen.'}
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left w-full text-xs space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    <span className="text-slate-700 text-[11px]">
                      {isRtl ? 'اضغط على زر المشاركة (Share) في المتصفح' : 'Tap the Share / Menu button in your browser'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    <span className="text-slate-700 text-[11px]">
                      {isRtl ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                      3
                    </span>
                    <span className="text-slate-700 text-[11px]">
                      {isRtl ? 'افتح المتجر بلمسة واحدة في أي وقت!' : 'Launch anytime with 1-tap re-ordering!'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPwaInstallModal(false)}
                  className="w-full bg-[#0B6E4F] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  {isRtl ? 'فهمت، شكراً' : 'Got it!'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- RESIDENT PROFILE & KHATA ACCOUNT DETAILS MODAL --- */}
        <AnimatePresence>
          {showProfileModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <div className="bg-white rounded-3xl p-5 text-slate-900 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-[#0B6E4F] font-black text-xs">
                      {currentCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {isRtl ? 'ملفي الشخصي وعنوان التوصيل' : 'My Delivery Profile & Account'}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {isRtl ? 'حساب خاص بالمقيم' : 'Private Resident Account'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4 space-y-3.5 text-xs text-slate-700">
                  {/* Verified Resident Info */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{currentCustomer.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{isRtl ? 'مقيم موثق' : 'Verified Resident'}</span>
                      </span>
                    </div>
                    <p className="text-slate-500 font-mono text-[11px]">
                      {currentCustomer.phone}
                    </p>
                  </div>

                  {/* Delivery Location Preferences */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-900 text-[11px] block">
                      {isRtl ? 'مبنى الإقامة والبرج' : 'Building & Tower'}
                    </label>
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="e.g. Burj Views Tower A"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />

                    <label className="font-bold text-slate-900 text-[11px] block pt-1">
                      {isRtl ? 'رقم الشقة / الجناح' : 'Apartment / Unit Number'}
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. Apt 1402"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  {/* Khata Status Breakdown */}
                  <div className="bg-amber-50/90 border border-amber-200/90 p-3 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isRtl ? 'حالة دفتر الخاتة (الحساب الآجل)' : 'Neighborhood Khata Account'}</span>
                      </span>
                      {currentCustomer.isKhataPreApproved ? (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                          {isRtl ? 'نشط ومعتمد' : 'ACTIVE'}
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md">
                          {isRtl ? 'غير مفعل' : 'INACTIVE'}
                        </span>
                      )}
                    </div>

                    {currentCustomer.isKhataPreApproved ? (
                      <div className="space-y-1 text-slate-700">
                        <div className="flex justify-between items-baseline pt-1">
                          <span className="text-[11px] text-slate-600">
                            {isRtl ? 'الرصيد المستحق للبقالة حالياً:' : 'Current Balance Owed to Grocery:'}
                          </span>
                          <span className="font-black text-amber-900 text-sm">
                            {currentCustKhataBalance.toFixed(2)} AED
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal pt-1">
                          {isRtl
                            ? 'يتم تسوية الرصيد تلقائياً أو يدوياً مع المتجر في نهاية كل شهر ميلادي.'
                            : 'Orders on Khata are added to your monthly grocery tab. Settle your balance at the end of the month via Card or Cash.'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-600 leading-normal">
                        {isRtl
                          ? 'يمكنك الشراء بالدفع عند الاستلام (بطاقة أو نقداً). لطلب فتح حساب دفتر خاتة شهري، تحدث مع صاحب البقالة.'
                          : 'You can order with Card on Delivery or Cash on Delivery. To open a monthly Khata tab, send a request to the shopkeeper.'}
                      </p>
                    )}

                    {/* WhatsApp Inquiries with Merchant */}
                    <a
                      href={generateDirectWhatsAppLink(
                        store.phone,
                        `Hello ${store.name}, I am resident ${currentCustomer.name} in ${building} (${unit}). I have a question regarding my account and grocery delivery.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-2 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'محادثة البقالة عبر واتساب' : 'Chat with Grocery on WhatsApp'}</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="w-full bg-[#0B6E4F] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    {isRtl ? 'حفظ وإغلاق' : 'Save & Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
