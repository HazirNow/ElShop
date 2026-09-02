import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PackageX,
  TrendingDown,
  AlertTriangle,
  Tag,
  DollarSign,
  Boxes,
  Percent,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Filter
} from 'lucide-react';
import { Product, Order, Language, ProductCategory } from '../types';
import { ProductImage } from './ProductImage';
import { updateProduct } from '../api';

interface DeadStockAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  lang?: Language;
  storeName?: string;
  onProductUpdated?: (updatedProduct: Product) => void;
  onOpenEditModal?: (product: Product) => void;
}

export const DeadStockAnalysisModal: React.FC<DeadStockAnalysisModalProps> = ({
  isOpen,
  onClose,
  products = [],
  orders = [],
  lang = 'en',
  storeName = 'Store',
  onProductUpdated,
  onOpenEditModal,
}) => {
  const isRtl = lang === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'zero' | 'rare'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [applyingDiscountId, setApplyingDiscountId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // --- Calculate sales velocity per product from store orders ---
  const analyzedProducts = useMemo(() => {
    const salesMap: Record<string, { totalUnitsSold: number; orderCount: number; lastSoldAt: string | null }> = {};

    orders.forEach((ord) => {
      if (ord.status === 'cancelled') return;
      ord.items.forEach((item) => {
        if (!salesMap[item.productId]) {
          salesMap[item.productId] = { totalUnitsSold: 0, orderCount: 0, lastSoldAt: null };
        }
        salesMap[item.productId].totalUnitsSold += item.quantity || 0;
        salesMap[item.productId].orderCount += 1;
        if (
          ord.createdAt &&
          (!salesMap[item.productId].lastSoldAt ||
            new Date(ord.createdAt) > new Date(salesMap[item.productId].lastSoldAt!))
        ) {
          salesMap[item.productId].lastSoldAt = ord.createdAt;
        }
      });
    });

    return products.map((prod) => {
      const sales = salesMap[prod.id] || { totalUnitsSold: 0, orderCount: 0, lastSoldAt: null };
      const currentStock = prod.stock || 0;
      const unitPrice = prod.price || 0;
      const capitalTiedUp = currentStock * unitPrice;
      const isDead = sales.totalUnitsSold === 0;
      const isRare = sales.totalUnitsSold > 0 && sales.totalUnitsSold <= 2;

      return {
        product: prod,
        totalUnitsSold: sales.totalUnitsSold,
        orderCount: sales.orderCount,
        lastSoldAt: sales.lastSoldAt,
        capitalTiedUp,
        isDead,
        isRare,
        isSlowMoving: isDead || isRare,
      };
    });
  }, [products, orders]);

  // Filter down to only slow moving & dead stock items
  const slowMoversList = useMemo(() => {
    return analyzedProducts.filter((item) => item.isSlowMoving);
  }, [analyzedProducts]);

  // Aggregate Key Dead Stock Metrics
  const summaryMetrics = useMemo(() => {
    const deadCount = slowMoversList.filter((item) => item.isDead).length;
    const rareCount = slowMoversList.filter((item) => item.isRare).length;
    const totalDeadStockCapital = slowMoversList.reduce((acc, curr) => acc + curr.capitalTiedUp, 0);
    const totalUnitsSitting = slowMoversList.reduce((acc, curr) => acc + (curr.product.stock || 0), 0);
    const deadCatalogPercent = products.length > 0 ? Math.round((slowMoversList.length / products.length) * 100) : 0;

    return {
      totalCount: slowMoversList.length,
      deadCount,
      rareCount,
      totalDeadStockCapital,
      totalUnitsSitting,
      deadCatalogPercent,
    };
  }, [slowMoversList, products]);

  // Filtered view items based on subTab, search, category
  const filteredItems = useMemo(() => {
    return slowMoversList.filter((item) => {
      if (activeSubTab === 'zero' && !item.isDead) return false;
      if (activeSubTab === 'rare' && !item.isRare) return false;

      if (selectedCategory !== 'All' && item.product.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName =
          item.product.name.toLowerCase().includes(query) ||
          item.product.nameAr.includes(query) ||
          (item.product.barcode && item.product.barcode.toLowerCase().includes(query));
        if (!matchesName) return false;
      }

      return true;
    });
  }, [slowMoversList, activeSubTab, selectedCategory, searchQuery]);

  // 1-Click Instant Clearance Sale Action
  const handleApplyDiscount = async (prod: Product, discountPercent: number) => {
    setApplyingDiscountId(prod.id);
    try {
      const regPrice = prod.regularPrice || prod.price;
      const newDiscountedPrice = parseFloat((regPrice * (1 - discountPercent / 100)).toFixed(2));
      
      const updated = await updateProduct(prod.id, {
        isOnSale: true,
        sale: true,
        regularPrice: regPrice,
        price: newDiscountedPrice,
        discountedPrice: newDiscountedPrice,
      });

      if (onProductUpdated) {
        onProductUpdated(updated);
      }

      setSuccessToast(
        isRtl
          ? `تم تفعيل خصم ${discountPercent}% على ${prod.nameAr} بسعر ${newDiscountedPrice} درهم!`
          : `Applied ${discountPercent}% discount to ${prod.name} at ${newDiscountedPrice} AED!`
      );
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.error('Failed to apply discount', err);
    } finally {
      setApplyingDiscountId(null);
    }
  };

  // Generate WhatsApp Supplier Return / Credit Request
  const handleSendSupplierReturnWhatsApp = () => {
    const deadItemsText = slowMoversList
      .slice(0, 10)
      .map(
        (i) =>
          `• ${i.product.name} (${i.product.unit || 'Units'}): ${i.product.stock} units sitting (0 sales)`
      )
      .join('\n');

    const msg = `*Slow-Moving Stock Return Request — ${storeName}*\n\nHello, we have identified non-moving catalog items at our store that we would like to return or exchange for fast-moving inventory:\n\n${deadItemsText}\n\nTotal capital value: ${summaryMetrics.totalDeadStockCapital.toFixed(2)} AED.\nPlease advise on return pickup or credit note. Thank you!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md font-sans"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
          id="dead-stock-analysis-modal"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <PackageX className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {isRtl ? 'تقرير المنتجات الراكدة وقليلة البيع' : 'Dead Stock & Slow Movers Analyzer'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-black uppercase">
                    {slowMoversList.length} {isRtl ? 'صنف غير مباع' : 'Unsold / Rare'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRtl
                    ? 'المنتجات التي لم تحقق أي مبيعات أو مبيعاتها نادرة جداً لتحرير رأس المال المجمد.'
                    : 'Identify zero-sale and rarely sold products tying up working capital and put them on liquidation sale.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-all shrink-0"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Notification for quick actions */}
          {successToast && (
            <div className="bg-emerald-950 border-y border-emerald-800/80 px-4 py-2 text-xs font-bold text-emerald-200 flex items-center justify-between gap-2 animate-fade-in shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{successToast}</span>
              </div>
              <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
                ✕
              </button>
            </div>
          )}

          {/* KPI Strip: Locked Capital & Catalog Health */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-950/70 border-b border-slate-800 shrink-0">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isRtl ? 'رأس المال المجمّد' : 'Tied-Up Working Capital'}
              </span>
              <div className="text-lg sm:text-xl font-black text-rose-400">
                {summaryMetrics.totalDeadStockCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-rose-300">AED</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {summaryMetrics.totalUnitsSitting} units sitting on shelves
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isRtl ? 'أصناف بلا مبيعات (صفر)' : 'Zero-Sales (Dead Stock)'}
              </span>
              <div className="text-lg sm:text-xl font-black text-white">
                {summaryMetrics.deadCount}{' '}
                <span className="text-xs font-normal text-slate-400">products</span>
              </div>
              <span className="text-[10px] text-rose-400 font-bold block">
                0 orders across all history
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isRtl ? 'أصناف نادرة البيع' : 'Rarely Sold (1-2 Units)'}
              </span>
              <div className="text-lg sm:text-xl font-black text-amber-400">
                {summaryMetrics.rareCount}{' '}
                <span className="text-xs font-normal text-slate-400">products</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Low velocity inventory
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isRtl ? 'نسبة الكتالوج الراكد' : 'Catalog Inactivity Ratio'}
              </span>
              <div className="text-lg sm:text-xl font-black text-purple-400">
                {summaryMetrics.deadCatalogPercent}%{' '}
                <span className="text-xs font-normal text-slate-400">of inventory</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Recommend discount liquidation
              </span>
            </div>
          </div>

          {/* Search, Filter Tabs & Bulk Actions Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 shrink-0">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSubTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'all'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isRtl ? 'الكل الراكد وقليل البيع' : 'All Slow & Dead'} ({slowMoversList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('zero')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeSubTab === 'zero'
                    ? 'bg-rose-700 text-white shadow-md'
                    : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                }`}
              >
                <PackageX className="w-3.5 h-3.5" />
                <span>{isRtl ? 'صفر مبيعات' : 'Zero Sales'} ({summaryMetrics.deadCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('rare')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeSubTab === 'rare'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{isRtl ? 'مبيعات نادرة' : 'Rarely Sold'} ({summaryMetrics.rareCount})</span>
              </button>
            </div>

            {/* Search and Supplier Action */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isRtl ? 'بحث في الأصناف الراكدة...' : 'Search non-moving items...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSendSupplierReturnWhatsApp}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
                title="Send return request to suppliers via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRtl ? 'طلب استرجاع للمورد' : 'Supplier Return Note'}</span>
              </button>
            </div>
          </div>

          {/* Product Items List Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">
                  {isRtl ? 'ممتاز! لا توجد أصناف راكدة مطابقة' : 'No Dead Stock Found in this Filter'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {isRtl
                    ? 'جميع منتجات هذا التصنيف تحقق حركة مبيعات نشطة على شبكة إل شوب.'
                    : 'All catalog items in this view are generating active sales volume across the customer base.'}
                </p>
              </div>
            ) : (
              filteredItems.map(({ product, totalUnitsSold, capitalTiedUp, isDead, isRare, lastSoldAt }) => {
                const isSale = Boolean(product.sale ?? product.isOnSale);
                const regPrice = product.regularPrice || product.price;
                const effectivePrice = product.price;

                return (
                  <div
                    key={product.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-sm"
                  >
                    {/* Left: Product Image & Details */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 relative">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {isSale && (
                          <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black px-1 rounded">
                            SALE
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-white text-sm truncate">
                            {isRtl ? product.nameAr : product.name}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {isRtl ? product.name : product.nameAr}
                          </span>
                          
                          {/* Sales Velocity Badge */}
                          {isDead ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                              <PackageX className="w-3 h-3" />
                              <span>{isRtl ? 'صفر مبيعات (راكد تماماً)' : '0 Sales (Dead Stock)'}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              <span>{isRtl ? `بيع نادر: ${totalUnitsSold} حبة فقط` : `Rarely Sold: ${totalUnitsSold} units`}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span>Category: <strong className="text-slate-200">{product.category}</strong></span>
                          <span>•</span>
                          <span>In Stock: <strong className="text-amber-300">{product.stock || 0} {product.unit}</strong></span>
                          <span>•</span>
                          <span>Current Price: <strong className="text-emerald-400">{effectivePrice.toFixed(2)} AED</strong></span>
                          {lastSoldAt && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">
                                Last sold: {new Date(lastSoldAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Locked Capital Stat */}
                    <div className="text-left md:text-right border-t md:border-t-0 md:border-l md:border-slate-800 pt-2 md:pt-0 md:pl-4 min-w-[120px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'رأس مال مجمد' : 'Tied-Up Capital'}
                      </span>
                      <div className="text-base font-black text-rose-400 font-mono">
                        {capitalTiedUp.toFixed(2)} <span className="text-xs font-bold text-rose-300">AED</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {product.stock} units × {effectivePrice.toFixed(2)} AED
                      </span>
                    </div>

                    {/* Right: Instant Clearance / Markdown Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0">
                      <button
                        type="button"
                        disabled={applyingDiscountId === product.id}
                        onClick={() => handleApplyDiscount(product, 20)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                        title="Put on 20% clearance sale"
                      >
                        <Tag className="w-3 h-3" />
                        <span>-20% Off</span>
                      </button>

                      <button
                        type="button"
                        disabled={applyingDiscountId === product.id}
                        onClick={() => handleApplyDiscount(product, 35)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                        title="Put on 35% liquidation discount"
                      >
                        <Percent className="w-3 h-3" />
                        <span>-35% Clearance</span>
                      </button>

                      {onOpenEditModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenEditModal(product);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all"
                          title="Open Full Product Editor"
                        >
                          {isRtl ? 'تعديل' : 'Edit'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Recommendation Note */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isRtl
                  ? 'نصيحة إل شوب: خصم 20% - 35% على الأصناف الراكدة يحول البضاعة البطيئة إلى سيولة نقدية فورية.'
                  : 'Baqala Pro Tip: Applying a 20%-35% discount turns dead stock into instant customer basket additions.'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all text-xs"
            >
              {isRtl ? 'إغلاق التقرير' : 'Close Analyzer'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
