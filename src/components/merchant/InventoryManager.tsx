import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Tag,
  MessageCircle,
  Trash2,
  Sliders,
  Search,
  Plus,
  Truck,
  PackageX,
  TrendingDown,
  Camera,
  Edit3,
  Scan,
  Barcode,
  Sparkles,
  Check,
  X,
  PhoneCall,
  Upload,
  Bell,
  BellOff
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { createProduct, updateProduct, createSupplier } from '../../api';
import { ProductImage } from '../ProductImage';
import { formatWhatsAppDeepLink } from '../../lib/whatsapp';
import { compressImageFile } from '../../lib/imageUtils';
import { notifyError, notifySuccess } from '../../utils/errorHandler';
import { DeadStockAnalysisModal } from '../DeadStockAnalysisModal';
import { CameraCaptureModal } from '../CameraCaptureModal';
import { MerchantCameraPromptModal } from '../MerchantCameraPromptModal';
import { useMerchantStore } from './MerchantStoreContext';

export const InventoryManager: React.FC = () => {
  const {
    store,
    lang,
    isRtl,
    t,
    onRefresh,
    storeProducts,
    storeOrders,
    suppliers,
    invSearch,
    setInvSearch,
    invFilter,
    setInvFilter,
    showLowStockAlerts,
    setShowLowStockAlerts,
    isAlertDismissed,
    setIsAlertDismissed,
    defaultStockThreshold,
    setDefaultStockThreshold,
    getEffectiveStock,
    getProductThreshold,
    isProductLowStock,
    lowStockProducts,
    productSalesVelocity,
    deadStockProducts,
    slowMoversAndDeadProducts,
    // Add product modal visibility
    showAddProductModal,
    setShowAddProductModal,
    // Full Edit product modal
    editingFullProduct,
    setEditingFullProduct,
    // Sale modal
    editingSaleProduct,
    setEditingSaleProduct,
    salePriceInput,
    setSalePriceInput,
    regularPriceInput,
    setRegularPriceInput,
    saleIsOn,
    setSaleIsOn,
    handleOpenSaleModal,
    handleSaveProductSale,
    // Reorder modal
    reorderProduct,
    setReorderProduct,
    reorderQty,
    setReorderQty,
    handleOpenReorderModal,
    handleSendSupplierWhatsAppOrder,
    // Supplier modal
    showSupplierModal,
    setShowSupplierModal,
    handleDeleteSupplierAction,
    // Threshold modal
    editingThresholdProduct,
    setEditingThresholdProduct,
    thresholdInputVal,
    setThresholdInputVal,
    // Dead stock modal
    showDeadStockModal,
    setShowDeadStockModal,
    // Product Actions
    handleProductStockDelta,
    handleToggleProductStock,
    handleUpdateProductThreshold,
    handleDeleteProductAction,
    handleQuickPutOnSale,
    handleSendSupplierReturnWhatsApp,
  } = useMerchantStore();

  // New Product Form Local State
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Pantry');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdIsOnSale, setNewProdIsOnSale] = useState(false);
  const [newProdUnit, setNewProdUnit] = useState('1 Unit');
  const [newProdUnitAr, setNewProdUnitAr] = useState('١ حبة');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdThreshold, setNewProdThreshold] = useState('5');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdSupplierId, setNewProdSupplierId] = useState('');
  const [newProdExpiryDate, setNewProdExpiryDate] = useState('');
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);

  // Full Edit Product Modal Local State
  const [editProdName, setEditProdName] = useState('');
  const [editProdNameAr, setEditProdNameAr] = useState('');
  const [editProdBarcode, setEditProdBarcode] = useState('');
  const [editProdSku, setEditProdSku] = useState('');
  const [editProdCategory, setEditProdCategory] = useState<ProductCategory>('Pantry');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdOriginalPrice, setEditProdOriginalPrice] = useState('');
  const [editProdCogs, setEditProdCogs] = useState('');
  const [editProdStock, setEditProdStock] = useState('0');
  const [editProdThreshold, setEditProdThreshold] = useState('5');
  const [editProdUnit, setEditProdUnit] = useState('');
  const [editProdUnitAr, setEditProdUnitAr] = useState('');
  const [editProdImage, setEditProdImage] = useState('');
  const [editProdSupplierId, setEditProdSupplierId] = useState('');
  const [editProdExpiryDate, setEditProdExpiryDate] = useState('');
  const [editProdIsOnSale, setEditProdIsOnSale] = useState(false);
  const [editProdInStock, setEditProdInStock] = useState(true);

  // Synchronize Edit form fields when editingFullProduct changes
  useEffect(() => {
    if (!editingFullProduct) return;
    const isSale = Boolean(editingFullProduct.sale ?? editingFullProduct.isOnSale);
    const regP = editingFullProduct.regularPrice ?? editingFullProduct.originalPrice ?? editingFullProduct.price;
    const discP = editingFullProduct.discountedPrice ?? editingFullProduct.price;

    setEditProdName(editingFullProduct.name);
    setEditProdNameAr(editingFullProduct.nameAr || '');
    setEditProdBarcode(editingFullProduct.barcode || '');
    setEditProdSku(editingFullProduct.sku || '');
    setEditProdCategory(editingFullProduct.category);
    setEditProdPrice(isSale && discP ? discP.toString() : regP.toString());
    setEditProdOriginalPrice(regP ? regP.toString() : '');
    setEditProdCogs(editingFullProduct.cogs !== undefined ? editingFullProduct.cogs.toString() : '');
    setEditProdStock(editingFullProduct.stock.toString());
    setEditProdThreshold((editingFullProduct.lowStockThreshold ?? 5).toString());
    setEditProdUnit(editingFullProduct.unit || '1 Unit');
    setEditProdUnitAr(editingFullProduct.unitAr || '١ حبة');
    setEditProdImage(editingFullProduct.image || '');
    setEditProdSupplierId(editingFullProduct.supplierId || '');
    setEditProdExpiryDate(editingFullProduct.expiryDate || '');
    setEditProdIsOnSale(isSale);
    setEditProdInStock(editingFullProduct.inStock);
  }, [editingFullProduct]);

  // Supplier Form State
  const [newSupName, setNewSupName] = useState('');
  const [newSupNameAr, setNewSupNameAr] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupCategory, setNewSupCategory] = useState('');

  // Camera capture & prompt modals state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraTargetProduct, setCameraTargetProduct] = useState<Product | null>(null);
  const [showCameraPromptModal, setShowCameraPromptModal] = useState(false);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleSnapProductPhoto = (targetProduct: Product | null = null, preferLiveViewfinder: boolean = false) => {
    setCameraTargetProduct(targetProduct);
    let prompted = false;
    try {
      prompted = localStorage.getItem('elshop_merchant_camera_prompted') === 'true';
    } catch {
      // Ignore localStorage restriction
    }

    if (!prompted) {
      setShowCameraPromptModal(true);
      return;
    }

    if (preferLiveViewfinder) {
      setShowCameraModal(true);
    } else {
      nativeCameraInputRef.current?.click();
    }
  };

  const handlePhotoCaptured = async (imageDataUrl: string) => {
    if (cameraTargetProduct) {
      try {
        await updateProduct(cameraTargetProduct.id, {
          image: imageDataUrl,
        });
        setCameraTargetProduct(null);
        notifySuccess(`Photo updated for ${cameraTargetProduct.name}.`);
        onRefresh();
      } catch (err) {
        notifyError(err, 'Failed to update product photo.');
      }
    } else {
      setNewProdImage(imageDataUrl);
    }
  };

  const handleDirectFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.85);
      await handlePhotoCaptured(compressedDataUrl);
    } catch (err) {
      notifyError(err, 'Failed to process selected image file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    const assignedSup = suppliers.find((s) => s.id === newProdSupplierId);
    const rawPrice = parseFloat(newProdPrice);
    const regP = newProdOriginalPrice ? parseFloat(newProdOriginalPrice) : rawPrice;
    const discP = newProdIsOnSale ? rawPrice : undefined;

    try {
      await createProduct({
        storeId: store.id,
        name: newProdName,
        nameAr: newProdNameAr || newProdName,
        category: newProdCategory,
        barcode: newProdBarcode.trim() || undefined,
        sku: newProdSku.trim() || undefined,
        price: newProdIsOnSale ? (discP ?? rawPrice) : regP,
        regularPrice: regP,
        discountedPrice: discP,
        sale: newProdIsOnSale,
        originalPrice: regP,
        isOnSale: newProdIsOnSale,
        unit: newProdUnit,
        unitAr: newProdUnitAr,
        stock: parseInt(newProdStock, 10) || 20,
        lowStockThreshold: parseInt(newProdThreshold, 10) || 5,
        inStock: (parseInt(newProdStock, 10) || 20) > 0,
        image: newProdImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        supplierId: assignedSup?.id,
        supplierPhone: assignedSup?.phone,
        expiryDate: newProdExpiryDate || undefined,
      });

      // Reset form
      setNewProdName('');
      setNewProdNameAr('');
      setNewProdBarcode('');
      setNewProdSku('');
      setNewProdPrice('');
      setNewProdOriginalPrice('');
      setNewProdIsOnSale(false);
      setNewProdStock('20');
      setNewProdThreshold('5');
      setNewProdImage('');
      setNewProdExpiryDate('');
      setShowAddProductModal(false);
      notifySuccess(`Product "${newProdName}" added to catalog.`);
      onRefresh();
    } catch (err) {
      notifyError(err, 'Failed to add product to catalog.');
    }
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFullProduct) return;
    const priceNum = parseFloat(editProdPrice) || 0;
    const regPriceNum = parseFloat(editProdOriginalPrice) || priceNum;
    const cogsNum = editProdCogs ? parseFloat(editProdCogs) : undefined;
    const stockNum = parseInt(editProdStock, 10) || 0;
    const thresholdNum = parseInt(editProdThreshold, 10) || 5;

    try {
      await updateProduct(editingFullProduct.id, {
        name: editProdName,
        nameAr: editProdNameAr || editProdName,
        barcode: editProdBarcode.trim() || undefined,
        sku: editProdSku.trim() || undefined,
        category: editProdCategory,
        price: editProdIsOnSale ? priceNum : regPriceNum,
        regularPrice: regPriceNum,
        discountedPrice: editProdIsOnSale ? priceNum : undefined,
        sale: editProdIsOnSale,
        isOnSale: editProdIsOnSale,
        cogs: cogsNum,
        stock: stockNum,
        inStock: editProdInStock && stockNum > 0,
        lowStockThreshold: thresholdNum,
        unit: editProdUnit || '1 Unit',
        unitAr: editProdUnitAr || '١ حبة',
        image: editProdImage || editingFullProduct.image,
        supplierId: editProdSupplierId || undefined,
        expiryDate: editProdExpiryDate || undefined,
      });

      setEditingFullProduct(null);
      notifySuccess(`Product "${editProdName}" updated successfully.`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to update product "${editingFullProduct.name}".`);
    }
  };

  const handleSaveNewSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim() || !newSupPhone.trim()) return;

    try {
      await createSupplier({
        storeId: store.id,
        name: newSupName,
        nameAr: newSupNameAr || newSupName,
        phone: newSupPhone,
        category: newSupCategory || 'General Groceries',
      });

      setNewSupName('');
      setNewSupNameAr('');
      setNewSupPhone('');
      setNewSupCategory('');
      notifySuccess(`Supplier "${newSupName}" added successfully.`);
      onRefresh();
    } catch (err) {
      notifyError(err, 'Failed to save new supplier.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  const expiringSoonProducts = storeProducts.filter((p) => {
    if (!p.expiryDate) return false;
    if (p.expiryDate < todayStr) return false;
    const expDate = new Date(p.expiryDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 7;
  });

  const expiredProducts = storeProducts.filter((p) => {
    if (!p.expiryDate) return false;
    return p.expiryDate < todayStr;
  });

  return (
    <motion.div
      key="inventory"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="flex-1 flex flex-col space-y-4"
    >
      {/* Expiring Soon Warning Banner */}
      {expiringSoonProducts.length > 0 && (
        <div className="bg-amber-950/50 border border-amber-500/60 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
              <span>⚠️ Prompt: {expiringSoonProducts.length} Product(s) Nearing Expiration!</span>
            </div>
            <span className="text-xs bg-amber-900/80 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-700 font-semibold">
              Put on sale to clear before expiry
            </span>
          </div>
          <p className="text-xs text-slate-300">
            These items will expire within 7 days. Put them on sale at a discount to sell quickly, or send a return request to your supplier.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {expiringSoonProducts.map((p) => {
              const expDate = new Date(p.expiryDate!);
              const diffDays = Math.max(0, Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));
              const isSale = Boolean(p.sale ?? p.isOnSale);
              const regP = p.regularPrice ?? p.originalPrice ?? p.price;
              const discP = p.discountedPrice ?? p.price;

              return (
                <div key={p.id} className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs text-white line-clamp-1">{isRtl ? p.nameAr : p.name}</h5>
                      <p className="text-[10px] text-amber-300 font-bold mt-0.5">
                        📅 Expiring in {diffDays === 0 ? 'Today!' : `${diffDays} days`} ({p.expiryDate})
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Stock: {p.stock} units • Regular: {regP.toFixed(2)} AED
                      </p>
                    </div>
                    {isSale && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                        On Sale ({discP.toFixed(2)} AED)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-800">
                    {!isSale ? (
                      <>
                        <button
                          onClick={() => handleQuickPutOnSale(p, 30)}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all"
                        >
                          <Tag className="w-3 h-3" />
                          <span>Put 30% Off</span>
                        </button>
                        <button
                          onClick={() => handleQuickPutOnSale(p, 50)}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all"
                        >
                          <Tag className="w-3 h-3" />
                          <span>Put 50% Off</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenSaleModal(p)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2 py-1 rounded-lg text-[10px] border border-amber-500/30"
                      >
                        Edit Sale Price
                      </button>
                    )}
                    <button
                      onClick={() => handleSendSupplierReturnWhatsApp(p, `Expiring in ${diffDays} day(s) on ${p.expiryDate}`)}
                      className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 font-semibold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 ml-auto"
                      title="Send Return request to supplier on WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-400" />
                      <span>Supplier Return</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expired Items Auto-Removed Banner */}
      {expiredProducts.length > 0 && (
        <div className="bg-rose-950/50 border border-rose-500/60 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>🚫 Auto-Removed from Catalogue: {expiredProducts.length} Expired Item(s)</span>
            </div>
            <span className="text-[10px] bg-rose-900/80 text-rose-200 px-2 py-0.5 rounded-full border border-rose-700 font-bold uppercase">
              Hidden from Customer View
            </span>
          </div>
          <p className="text-xs text-slate-300">
            These items passed their expiration date and were automatically removed from the resident store front. Send a return request to your supplier or delete them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {expiredProducts.map((p) => (
              <div key={p.id} className="bg-slate-900/90 border border-rose-500/40 rounded-xl p-3 flex flex-col justify-between gap-2.5">
                <div>
                  <h5 className="font-bold text-xs text-white line-clamp-1">{isRtl ? p.nameAr : p.name}</h5>
                  <p className="text-[10px] text-rose-400 font-bold mt-0.5">
                    ❌ Expired on {p.expiryDate} ({p.stock} units)
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800">
                  <button
                    onClick={() => handleDeleteProductAction(p.id)}
                    className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 font-semibold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => handleSendSupplierReturnWhatsApp(p, `Expired on ${p.expiryDate}`)}
                    className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 font-semibold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-400" />
                    <span>Supplier Return Request</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prominent Low-Stock Alert Banner */}
      {showLowStockAlerts && !isAlertDismissed && lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/90 via-red-950/75 to-slate-900 border-2 border-rose-500/80 rounded-2xl p-4 shadow-xl text-rose-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/25 border border-rose-500/50 flex items-center justify-center shrink-0 text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>{t('lowStockAlertTitle')}</span>
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    {lowStockProducts.length} {t('unitsCount')}
                  </span>
                </h4>
                <span className="text-[10px] bg-rose-900/80 text-rose-300 px-2 py-0.5 rounded-md border border-rose-700 font-semibold">
                  Default: &lt; {defaultStockThreshold} units
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                {t('lowStockAlertDesc', { count: lowStockProducts.length, threshold: defaultStockThreshold })}
              </p>

              {/* Low stock SKU pills with 1-click Quick Restock */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {lowStockProducts.slice(0, 5).map((lp) => {
                  const lpStock = getEffectiveStock(lp);
                  return (
                    <div
                      key={lp.id}
                      className="bg-slate-900/90 border border-rose-500/60 rounded-xl px-2.5 py-1 text-[11px] flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="font-bold text-white max-w-[120px] truncate">{isRtl ? lp.nameAr : lp.name}</span>
                      <span className="bg-rose-600 text-white font-black px-1.5 py-0.2 rounded text-[10px]">
                        {lpStock} left
                      </span>
                      <button
                        disabled={lpStock <= 0}
                        onClick={() => handleProductStockDelta(lp, -1)}
                        className="text-[9px] bg-slate-800 hover:bg-rose-900 text-rose-300 disabled:opacity-30 border border-slate-700 font-black px-1.5 py-0.5 rounded transition-all"
                        title="Decrease stock by 1 (-1)"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleProductStockDelta(lp, 1)}
                        className="text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded transition-all shadow-sm"
                        title="Increase stock by 1 (+1)"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleProductStockDelta(lp, 12)}
                        className="text-[9px] bg-emerald-900/90 hover:bg-emerald-700 text-emerald-200 border border-emerald-500/50 font-bold px-1.5 py-0.5 rounded transition-all"
                        title="Quick +12 Restock"
                      >
                        +12
                      </button>
                      <button
                        onClick={() => handleOpenReorderModal(lp)}
                        className="text-[9px] bg-amber-600 hover:bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded transition-all"
                        title="Reorder on WhatsApp"
                      >
                        Reorder
                      </button>
                    </div>
                  );
                })}
                {lowStockProducts.length > 5 && (
                  <button
                    onClick={() => setInvFilter('low_stock')}
                    className="text-[11px] text-rose-300 hover:text-white font-bold underline"
                  >
                    +{lowStockProducts.length - 5} more items
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Banner Actions */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={() => setInvFilter('low_stock')}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Filter ({lowStockProducts.length})</span>
            </button>
            <button
              onClick={() => setIsAlertDismissed(true)}
              className="p-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-300 hover:text-white rounded-xl border border-rose-500/40 transition-all flex items-center gap-1 text-xs font-semibold px-2.5"
              title={t('dismissAlert')}
            >
              <X className="w-4 h-4" />
              <span>{t('dismissAlert')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Dismissed Banner Indicator */}
      {isAlertDismissed && lowStockProducts.length > 0 && showLowStockAlerts && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{lowStockProducts.length} product(s) currently below low-stock limit. Alert banner is closed.</span>
          </div>
          <button
            onClick={() => setIsAlertDismissed(false)}
            className="text-xs text-rose-300 hover:text-white font-bold underline transition-all"
          >
            {t('reopenAlert')}
          </button>
        </div>
      )}

      {/* Top Controls Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
        {/* Search Box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search catalog by name or Arabic..."
            value={invSearch}
            onChange={(e) => setInvSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
          />
        </div>

        {/* Filter Pills & Alert Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setInvFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              invFilter === 'all'
                ? 'bg-[#0B6E4F] text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Items ({storeProducts.length})
          </button>
          <button
            onClick={() => setInvFilter('sale')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              invFilter === 'sale'
                ? 'bg-red-600 text-white shadow'
                : 'bg-slate-800 text-red-400 hover:bg-slate-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>On Sale ({storeProducts.filter((p) => p.isOnSale).length})</span>
          </button>
          <button
            onClick={() => setInvFilter('low_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              invFilter === 'low_stock'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({lowStockProducts.length})</span>
          </button>

          <button
            onClick={() => setInvFilter('slow_movers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              invFilter === 'slow_movers'
                ? 'bg-rose-700 text-white shadow'
                : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
            }`}
            title="Filter products that are not selling or rarely selling"
          >
            <PackageX className="w-3.5 h-3.5" />
            <span>{isRtl ? `الراكد / نادر (${slowMoversAndDeadProducts.length})` : `Zero / Rare Sales (${slowMoversAndDeadProducts.length})`}</span>
          </button>

          {/* Master Low-Stock Alerts Switch */}
          <button
            onClick={() => setShowLowStockAlerts(!showLowStockAlerts)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
              showLowStockAlerts
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
            title="Toggle Low Stock Red Alerts & Badges"
          >
            {showLowStockAlerts ? (
              <Bell className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : (
              <BellOff className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden sm:inline">
              {showLowStockAlerts ? t('alertsActive') : t('alertsMuted')}
            </span>
          </button>

          {/* Default Store Threshold Adjuster */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-300" title="Set default unit count threshold before products go red">
            <Sliders className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-slate-400 whitespace-nowrap">Def: &lt;</span>
            <input
              type="number"
              min="1"
              max="99"
              value={defaultStockThreshold}
              onChange={(e) => setDefaultStockThreshold(Math.max(1, parseInt(e.target.value, 10) || 5))}
              className="w-8 bg-slate-900 border border-slate-700 rounded px-1 text-center font-black text-amber-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-400">units</span>
          </div>
        </div>

        {/* Merchant Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeadStockModal(true)}
            className="bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 hover:text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all whitespace-nowrap active:scale-95"
            title="Open Dead Stock & Non-Selling Products Analytics"
          >
            <PackageX className="w-4 h-4 text-rose-400" />
            <span>{isRtl ? `المنتجات الراكدة (${deadStockProducts.length})` : `Dead Stock (${deadStockProducts.length})`}</span>
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProduct')}</span>
          </button>
          <button
            onClick={() => setShowSupplierModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all whitespace-nowrap"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>{t('suppliersTitle')}</span>
          </button>
        </div>
      </div>

      {/* Product Catalog Cards Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {storeProducts
          .filter((p) => {
            const searchLower = invSearch.toLowerCase();
            const matchesSearch =
              p.name.toLowerCase().includes(searchLower) ||
              p.nameAr.includes(invSearch) ||
              (p.barcode && p.barcode.toLowerCase().includes(searchLower)) ||
              (p.sku && p.sku.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;
            if (invFilter === 'sale') return Boolean(p.sale ?? p.isOnSale);
            if (invFilter === 'low_stock') return isProductLowStock(p);
            if (invFilter === 'slow_movers') {
              const sold = productSalesVelocity[p.id]?.totalSold || 0;
              return sold <= 2;
            }
            return true;
          })
          .map((p) => {
            const pStock = getEffectiveStock(p);
            const threshold = getProductThreshold(p);
            const isLowStock = (p.inStock || pStock > 0) && pStock > 0 && pStock < threshold;
            const isOutOfStock = !p.inStock || pStock === 0;
            const assignedSupplier = suppliers.find((s) => s.id === p.supplierId);
            const isSale = Boolean(p.sale ?? p.isOnSale);
            const regP = p.regularPrice ?? p.originalPrice ?? p.price;
            const discP = p.discountedPrice ?? p.price;
            const unitsSold = productSalesVelocity[p.id]?.totalSold || 0;
            const isDead = unitsSold === 0;
            const isRare = unitsSold > 0 && unitsSold <= 2;
            const effectiveP = isSale && discP !== undefined ? discP : regP;

            // Expiry calculations
            const isExpired = p.expiryDate ? p.expiryDate < todayStr : false;
            const isExpiringSoon = (() => {
              if (!p.expiryDate || isExpired) return false;
              const expDate = new Date(p.expiryDate);
              const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              return diffDays <= 7;
            })();

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-3.5 border transition-all flex flex-col justify-between shadow-sm relative ${
                  isExpired
                    ? 'border-rose-500/80 bg-rose-950/20'
                    : isExpiringSoon
                    ? 'border-amber-500/80 bg-amber-950/20'
                    : isOutOfStock
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : isLowStock && showLowStockAlerts
                    ? 'border-2 border-rose-500 bg-rose-950/25 ring-2 ring-rose-500/25 shadow-lg shadow-rose-950/40'
                    : isLowStock
                    ? 'border-amber-500/50 bg-amber-950/10'
                    : 'bg-slate-800/90 border-slate-700 hover:border-emerald-600/50'
                }`}
              >
                <div>
                  {/* Product Header & Image */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <ProductImage
                          src={p.image}
                          alt={p.name}
                          fallbackType="grocery"
                          className={`w-14 h-14 rounded-xl object-cover shrink-0 border ${
                            isLowStock && showLowStockAlerts ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-slate-700'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleSnapProductPhoto(p, false)}
                          className="absolute -bottom-1 -right-1 bg-slate-900/95 hover:bg-emerald-600 text-slate-300 hover:text-white p-1 rounded-lg border border-slate-700 shadow-md transition-all active:scale-95"
                          title="Snap Photo with Phone Camera (Direct)"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">
                          {isRtl ? p.nameAr : p.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {p.category} • {isRtl ? p.unitAr : p.unit}
                        </p>

                        {/* Price display with sale indicator */}
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-emerald-400 font-extrabold text-xs">
                            {effectiveP.toFixed(2)} {t('currency')}
                          </span>
                          {isSale && regP > effectiveP && (
                            <span className="text-slate-500 text-[10px] line-through">
                              {regP.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit Full Product + Delete Button */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingFullProduct(p)}
                        className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-700 transition-all"
                        title="Edit Product Details (Full Modal)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProductAction(p.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700 transition-all"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges & Alert Status Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {isDead && (
                      <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                        <PackageX className="w-3 h-3 text-rose-400" />
                        <span>0 SOLD (DEAD STOCK)</span>
                      </span>
                    )}

                    {isRare && !isDead && (
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-amber-400" />
                        <span>RARE SALES ({unitsSold} sold)</span>
                      </span>
                    )}

                    {isLowStock && showLowStockAlerts && (
                      <span className="bg-rose-600 text-white border border-rose-400 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-white" />
                        <span>🚨 LOW STOCK ({pStock} units left • Alert &lt; {threshold})</span>
                      </span>
                    )}

                    {isSale && (
                      <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>ON SALE</span>
                      </span>
                    )}

                    {isExpired && (
                      <span className="bg-rose-500/30 text-rose-200 border border-rose-500/60 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>EXPIRED ({p.expiryDate})</span>
                      </span>
                    )}

                    {isExpiringSoon && !isExpired && (
                      <span className="bg-amber-500/30 text-amber-200 border border-amber-500/60 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>EXPIRING ({p.expiryDate})</span>
                      </span>
                    )}

                    {p.expiryDate && !isExpired && !isExpiringSoon && (
                      <span className="bg-slate-900/80 text-slate-400 border border-slate-700 text-[9px] px-2 py-0.5 rounded-md">
                        Exp: {p.expiryDate}
                      </span>
                    )}

                    {assignedSupplier && (
                      <span className="bg-slate-900/80 text-slate-300 border border-slate-700 text-[9px] px-2 py-0.5 rounded-md">
                        Supplier: {assignedSupplier.name}
                      </span>
                    )}

                    {p.barcode && (
                      <span className="bg-slate-900/90 text-emerald-400 font-mono border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold" title={`Barcode: ${p.barcode}`}>
                        <Scan className="w-2.5 h-2.5 text-emerald-400" />
                        <span>#{p.barcode}</span>
                      </span>
                    )}

                    {p.sku && !p.barcode && (
                      <span className="bg-slate-900/90 text-sky-400 font-mono border border-sky-500/30 text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold" title={`SKU: ${p.sku}`}>
                        <span>SKU: {p.sku}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls Footer */}
                <div className="pt-2.5 border-t border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center bg-slate-950/90 border rounded-xl p-1 gap-1 shadow-inner ${
                        isLowStock && showLowStockAlerts ? 'border-rose-500/80 ring-1 ring-rose-500/50' : 'border-slate-700'
                      }`}>
                        <button
                          type="button"
                          disabled={pStock <= 0}
                          onClick={() => handleProductStockDelta(p, -1)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/60 disabled:opacity-25 disabled:hover:bg-slate-800 text-rose-300 hover:text-white rounded-lg flex items-center justify-center text-xs font-black transition-all active:scale-95 shadow-sm border border-slate-700 disabled:cursor-not-allowed"
                          title="Quick decrease stock by 1 (-1)"
                        >
                          -1
                        </button>

                        <div className="px-2 text-center min-w-[52px]">
                          <span className={`text-sm font-black ${
                            pStock === 0
                              ? 'text-rose-400'
                              : isLowStock && showLowStockAlerts
                              ? 'text-rose-400 animate-pulse'
                              : 'text-emerald-400'
                          }`}>
                            {pStock}
                          </span>
                          <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-400">
                            {pStock === 1 ? 'unit' : 'units'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleProductStockDelta(p, 1)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs font-black transition-all active:scale-95 shadow-sm shadow-emerald-950/50 border border-emerald-500"
                          title="Quick increase stock by 1 (+1)"
                        >
                          +1
                        </button>
                      </div>

                      {/* Fast Restock Pills */}
                      <div className="flex items-center gap-1">
                        {[6, 12, 24].map((addQty) => (
                          <button
                            key={addQty}
                            type="button"
                            onClick={() => handleProductStockDelta(p, addQty)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                              isLowStock && showLowStockAlerts
                                ? 'bg-rose-950/80 hover:bg-rose-800 text-rose-200 border border-rose-500/60'
                                : 'bg-slate-900 hover:bg-emerald-900/60 text-emerald-300 border border-slate-700 hover:border-emerald-500'
                            }`}
                            title={`Quick Restock +${addQty} Units`}
                          >
                            +{addQty}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleProductStock(p)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition-all ${
                        p.inStock && pStock > 0
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                    >
                      {p.inStock && pStock > 0 ? 'In Stock ✓' : 'Out of Stock ✕'}
                    </button>
                  </div>

                  {/* Per-Item Threshold Tuner Row */}
                  <div className="flex items-center justify-between gap-2 bg-slate-900/80 border border-slate-700/80 rounded-xl px-2.5 py-1 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Sliders className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Alert Threshold: &lt;</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateProductThreshold(p, Math.max(1, threshold - 1))}
                        className="w-4 h-4 bg-slate-800 hover:bg-rose-900 rounded flex items-center justify-center font-bold text-slate-300 hover:text-white"
                        title="Lower alert threshold by 1 unit"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingThresholdProduct(p);
                          setThresholdInputVal(threshold.toString());
                        }}
                        className="font-black px-1 text-amber-300 hover:text-amber-200 underline decoration-dotted text-[11px]"
                        title="Click to customize alert threshold"
                      >
                        {threshold} units
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateProductThreshold(p, threshold + 1)}
                        className="w-4 h-4 bg-slate-800 hover:bg-emerald-900 rounded flex items-center justify-center font-bold text-slate-300 hover:text-white"
                        title="Raise alert threshold by 1 unit"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditingFullProduct(p)}
                      className="bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white font-bold py-1.5 px-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all border border-slate-600"
                      title="Open Full Edit Product Modal"
                    >
                      <Edit3 className="w-3 h-3 text-emerald-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenSaleModal(p)}
                      className="flex-1 bg-slate-700/80 hover:bg-slate-600 text-amber-300 font-bold py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all border border-slate-600"
                    >
                      <Tag className="w-3 h-3 text-amber-400" />
                      <span>{t('manageSale')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReorderModal(p)}
                      className={`flex-1 font-bold py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all border ${
                        isLowStock && showLowStockAlerts
                          ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border-rose-500 shadow-md shadow-rose-950/50'
                          : 'bg-slate-900 hover:bg-slate-700 text-emerald-400 border-slate-700'
                      }`}
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{t('reorderSupplier')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendSupplierReturnWhatsApp(p, isExpired ? `Product expired on ${p.expiryDate}` : isExpiringSoon ? `Product expiring on ${p.expiryDate}` : 'Return / Stock Adjustment')}
                      className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-semibold px-2 py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all"
                      title="Send WhatsApp Return/Exchange message to supplier"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-400" />
                      <span>Return</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* --- INVENTORY MODALS --- */}
      <AnimatePresence>
        {/* 1. ADD NEW PRODUCT MODAL */}
        {showAddProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span>{t('addProduct')}</span>
                </h3>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNewProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Rawabi Fresh Milk 1L"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">اسم المنتج (العربية)</label>
                  <input
                    type="text"
                    placeholder="مثال: حليب الروابي طازج ١ لتر"
                    value={newProdNameAr}
                    onChange={(e) => setNewProdNameAr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                  />
                </div>

                {/* Manual Barcode & SKU Entry for Counter Scanning */}
                <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold text-xs flex items-center gap-1.5">
                      <Barcode className="w-4 h-4 text-emerald-400" />
                      <span>{isRtl ? 'الباركود الفعلي ورمز SKU (للمسح الضوئي)' : 'Physical SKU Barcode (For Future Scanning)'}</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {isRtl ? 'قارئ الليزر والكاميرا' : 'POS Scanner Ready'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Scan className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <input
                        type="text"
                        placeholder={isRtl ? 'أدخل أو امسح الباركود (مثل 6281007001254)...' : 'Type or scan barcode (e.g. 6281007001254)...'}
                        value={newProdBarcode}
                        onChange={(e) => setNewProdBarcode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder={isRtl ? 'رمز SKU (اختياري)...' : 'SKU Code (Optional)...'}
                        value={newProdSku}
                        onChange={(e) => setNewProdSku(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Helper Actions: EAN-13 Generator */}
                  <div className="flex items-center justify-between flex-wrap gap-1.5 pt-1 border-t border-slate-700/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const random9 = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
                          const partial = `629${random9}`;
                          let sum = 0;
                          for (let i = 0; i < 12; i++) {
                            sum += parseInt(partial[i], 10) * (i % 2 === 0 ? 1 : 3);
                          }
                          const checksum = (10 - (sum % 10)) % 10;
                          const generatedBarcode = `${partial}${checksum}`;
                          setNewProdBarcode(generatedBarcode);
                          if (!newProdSku) {
                            setNewProdSku(`SKU-${generatedBarcode.slice(-6)}`);
                          }
                        }}
                        className="text-[10px] bg-slate-900 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{isRtl ? 'توليد باركود تلقائي (EAN-13)' : 'Auto-Generate EAN-13'}</span>
                      </button>

                      {newProdBarcode && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewProdBarcode('');
                            setNewProdSku('');
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 underline px-1"
                        >
                          {isRtl ? 'مسح' : 'Clear'}
                        </button>
                      )}
                    </div>

                    {newProdBarcode ? (
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{isRtl ? 'تم ربط الباركود بنجاح' : 'Barcode Linked'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {isRtl ? 'يمكّن الكاشير من مسح السلعة فوراً بالليزر' : 'Allows counter scanner gun & camera auto-recognition'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                    >
                      <option value="Dairy & Eggs">Dairy & Eggs</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Pantry">Pantry</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Fresh Produce">Fresh Produce</option>
                      <option value="Household">Household</option>
                      <option value="Personal Care">Personal Care</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Initial Stock</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-semibold mb-1 flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-amber-400" />
                      <span>{t('alertThresholdUnits')}</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Default: 5"
                      value={newProdThreshold}
                      onChange={(e) => setNewProdThreshold(e.target.value)}
                      className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Sale / Effective Price (AED) *</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      placeholder="12.50"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Regular Price (AED)</label>
                    <input
                      type="number"
                      step="0.25"
                      placeholder="Optional (e.g. 15.00)"
                      value={newProdOriginalPrice}
                      onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="newProdIsOnSale"
                    checked={newProdIsOnSale}
                    onChange={(e) => setNewProdIsOnSale(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0B6E4F] focus:ring-[#0B6E4F]"
                  />
                  <label htmlFor="newProdIsOnSale" className="text-slate-300 font-medium cursor-pointer">
                    Mark as "On Sale" item (Highlights in Special Offers tab)
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Unit Label (EN)</label>
                    <input
                      type="text"
                      placeholder="500g, Pack of 6..."
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Unit Label (AR)</label>
                    <input
                      type="text"
                      placeholder="٥٠٠ غم، عبوة ٦..."
                      value={newProdUnitAr}
                      onChange={(e) => setNewProdUnitAr(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assigned Supplier</label>
                  <select
                    value={newProdSupplierId}
                    onChange={(e) => setNewProdSupplierId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                  >
                    <option value="">Select Supplier (Optional)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={newProdExpiryDate}
                    onChange={(e) => setNewProdExpiryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                  />
                </div>

                {/* Product Photo & Phone Camera Snapper */}
                <div className="space-y-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold text-xs">
                      {isRtl ? 'صورة المنتج والكاميرا' : 'Product Photo'}
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Phone Camera Supported</span>
                    </span>
                  </div>

                  {newProdImage ? (
                    <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-emerald-500/50">
                      <img
                        src={newProdImage}
                        alt="New Product Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'تم التقاط / اختيار الصورة' : 'Photo Attached'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {newProdImage.startsWith('data:') ? '📸 Snapped with Phone Camera' : newProdImage}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCameraTargetProduct(null);
                              nativeCameraInputRef.current?.click();
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Camera className="w-3 h-3" />
                            <span>{isRtl ? 'إعادة التصوير' : 'Retake'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewProdImage('')}
                            className="text-rose-400 hover:text-rose-300 text-[10px] font-semibold px-1"
                          >
                            {isRtl ? 'إزالة' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleSnapProductPhoto(null, false)}
                          className="w-full bg-gradient-to-r from-[#0B6E4F] to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold py-2.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all border border-emerald-400/30"
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
                          <span>{isRtl ? 'كاميرا الهاتف' : 'Snap Photo'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCameraTargetProduct(null);
                            galleryInputRef.current?.click();
                          }}
                          className="w-full bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all border border-slate-600"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          <span>{isRtl ? 'اختيار من الصور' : 'Upload Image'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                          className="text-slate-400 hover:text-emerald-400 underline underline-offset-2 transition-all"
                        >
                          {showManualUrlInput ? 'Hide image URL' : 'Or enter image web URL'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSnapProductPhoto(null, true)}
                          className="text-slate-400 hover:text-emerald-400 underline underline-offset-2 transition-all"
                        >
                          Live Viewfinder
                        </button>
                      </div>
                    </div>
                  )}

                  {showManualUrlInput && !newProdImage && (
                    <div className="pt-2 border-t border-slate-700/80">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-[11px] focus:ring-2 focus:ring-[#0B6E4F] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg mt-2 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product to Store Catalog</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* 2. MANAGE SALE / PRICE MODAL */}
        {editingSaleProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{t('manageSale')}</h3>
                    <p className="text-[11px] text-slate-400">{editingSaleProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSaleProduct(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span className="font-bold text-slate-300">Enable Discounted Sale Price?</span>
                  <button
                    type="button"
                    onClick={() => setSaleIsOn(!saleIsOn)}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${
                      saleIsOn ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {saleIsOn ? 'SALE ACTIVE 🔥' : 'OFF'}
                  </button>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Regular List Price (AED)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={regularPriceInput}
                    onChange={(e) => setRegularPriceInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {saleIsOn ? 'Discounted Sale Price (AED) *' : 'Effective Price (AED) *'}
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={salePriceInput}
                    onChange={(e) => setSalePriceInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                {saleIsOn && parseFloat(regularPriceInput) > parseFloat(salePriceInput) && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl text-emerald-300 text-[11px] font-semibold text-center">
                    🎉 Discount: {(((parseFloat(regularPriceInput) - parseFloat(salePriceInput)) / parseFloat(regularPriceInput)) * 100).toFixed(0)}% OFF for customers!
                  </div>
                )}

                <button
                  onClick={handleSaveProductSale}
                  className="w-full bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Pricing & Sale Status</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. SUPPLIER MANAGEMENT MODAL */}
        {showSupplierModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">{t('suppliersTitle')}</h3>
                </div>
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Add New Supplier Form */}
                <form onSubmit={handleSaveNewSupplier} className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 space-y-2 text-xs">
                  <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('addSupplier')}</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Supplier Name (e.g. Al Rawabi Dairy)"
                      value={newSupName}
                      onChange={(e) => setNewSupName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                    <input
                      type="text"
                      placeholder="الاسم بالعربية"
                      value={newSupNameAr}
                      onChange={(e) => setNewSupNameAr(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Phone / WhatsApp (+971 50...)"
                      value={newSupPhone}
                      onChange={(e) => setNewSupPhone(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g. Dairy, Beverages)"
                      value={newSupCategory}
                      onChange={(e) => setNewSupCategory(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs mt-1 transition-all"
                  >
                    Save Supplier Contact
                  </button>
                </form>

                {/* Suppliers List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-400 border-b border-slate-800 pb-1">
                    Registered Suppliers ({suppliers.length})
                  </h4>

                  {suppliers.map((sup) => (
                    <div
                      key={sup.id}
                      className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-white">
                          {isRtl ? sup.nameAr : sup.name}
                        </div>
                        <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                          {sup.phone}
                        </p>
                        {sup.category && (
                          <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {sup.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={formatWhatsAppDeepLink(sup.phone, `Hello ${sup.name}, this is ${store.name}...`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg text-xs"
                          title="Contact Supplier on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteSupplierAction(sup.id)}
                          className="text-slate-500 hover:text-rose-400 p-2 hover:bg-slate-700 rounded-lg"
                          title={t('removeSupplier')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. REORDER FROM SUPPLIER MODAL */}
        {reorderProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{t('reorderSupplier')}</h3>
                    <p className="text-[11px] text-slate-400">{reorderProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReorderProduct(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current In-Store Stock:</span>
                    <span className="font-extrabold text-amber-400 text-sm">
                      {reorderProduct.stock} units remaining
                    </span>
                  </div>
                  <ProductImage
                    src={reorderProduct.image}
                    alt={reorderProduct.name}
                    fallbackType="grocery"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Restock Quantity Needed (Units)
                  </label>
                  <input
                    type="number"
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-[11px] space-y-1">
                  <div className="text-slate-400 font-semibold">Supplier Details:</div>
                  <div className="text-white font-bold">
                    {suppliers.find((s) => s.id === reorderProduct.supplierId)?.name || 'Default Regional Distributor'}
                  </div>
                  <div className="text-emerald-400 font-mono">
                    {reorderProduct.supplierPhone || suppliers.find((s) => s.id === reorderProduct.supplierId)?.phone || '+971 50 111 2222'}
                  </div>
                </div>

                <button
                  onClick={() => handleSendSupplierWhatsAppOrder(reorderProduct)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Purchase Order to Supplier</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. SET CUSTOM LOW-STOCK ALERT THRESHOLD MODAL */}
        {editingThresholdProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{t('setCustomThreshold')}</h3>
                    <p className="text-[10px] text-slate-400">Configure low-stock alert limit</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingThresholdProduct(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
                <ProductImage
                  src={editingThresholdProduct.image}
                  alt={editingThresholdProduct.name}
                  fallbackType="grocery"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">
                    {isRtl ? editingThresholdProduct.nameAr : editingThresholdProduct.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Current Stock: <span className="font-bold text-white">{editingThresholdProduct.stock}</span> units
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-300 font-bold">
                  {t('alertThresholdUnits')}
                </label>
                <p className="text-[11px] text-slate-400">
                  When inventory falls below this number, the product will be highlighted in red with alert badges.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(thresholdInputVal, 10) || 5;
                      setThresholdInputVal(Math.max(1, cur - 1).toString());
                    }}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center text-base font-black text-slate-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={thresholdInputVal}
                    onChange={(e) => setThresholdInputVal(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(thresholdInputVal, 10) || 5;
                      setThresholdInputVal((cur + 1).toString());
                    }}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center text-base font-black text-slate-200"
                  >
                    +
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Quick presets:</span>
                  {[3, 5, 10, 15, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setThresholdInputVal(preset.toString())}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition-all ${
                        parseInt(thresholdInputVal, 10) === preset
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingThresholdProduct(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseInt(thresholdInputVal, 10);
                    if (editingThresholdProduct && !isNaN(parsed) && parsed > 0) {
                      handleUpdateProductThreshold(editingThresholdProduct, parsed);
                    }
                  }}
                  className="flex-1 bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Limit</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. FULL EDIT PRODUCT MODAL */}
        {editingFullProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditingFullProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-200 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">Edit Product</h3>
                    <p className="text-xs text-slate-400">Update pricing, inventory, barcode, and catalog details</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingFullProduct(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
                {/* Product Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Product Name (EN) *</label>
                    <input
                      type="text"
                      required
                      value={editProdName}
                      onChange={(e) => setEditProdName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Product Name (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={editProdNameAr}
                      onChange={(e) => setEditProdNameAr(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Category</label>
                    <select
                      value={editProdCategory}
                      onChange={(e) => setEditProdCategory(e.target.value as ProductCategory)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {[
                        'Dairy & Eggs',
                        'Bakery',
                        'Beverages',
                        'Pantry',
                        'Snacks',
                        'Fresh Produce',
                        'Household',
                        'Personal Care',
                      ].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Unit (EN)</label>
                    <input
                      type="text"
                      value={editProdUnit}
                      onChange={(e) => setEditProdUnit(e.target.value)}
                      placeholder="e.g. 1 pc, 500g"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Unit (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={editProdUnitAr}
                      onChange={(e) => setEditProdUnitAr(e.target.value)}
                      placeholder="مثال: ١ حبة"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Barcode & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 flex items-center justify-between">
                      <span>Barcode / EAN</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Scanner ready</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editProdBarcode}
                        onChange={(e) => setEditProdBarcode(e.target.value)}
                        placeholder="Scan or enter barcode..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <Scan className="w-4 h-4 text-emerald-400 absolute left-2.5 top-3" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Internal SKU</label>
                    <input
                      type="text"
                      value={editProdSku}
                      onChange={(e) => setEditProdSku(e.target.value)}
                      placeholder="Optional SKU code"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Pricing & Cost */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Pricing & Cost ({t('currency')})</span>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-amber-400">
                      <input
                        type="checkbox"
                        checked={editProdIsOnSale}
                        onChange={(e) => setEditProdIsOnSale(e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-500 rounded"
                      />
                      <span>Mark on Sale / Discount</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        {editProdIsOnSale ? 'Regular Price' : 'Selling Price *'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={editProdOriginalPrice}
                        onChange={(e) => setEditProdOriginalPrice(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    {editProdIsOnSale && (
                      <div>
                        <label className="block text-amber-400 font-bold mb-1">Sale Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={editProdPrice}
                          onChange={(e) => setEditProdPrice(e.target.value)}
                          className="w-full bg-amber-950/30 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Cost / COGS (AED)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editProdCogs}
                        onChange={(e) => setEditProdCogs(e.target.value)}
                        placeholder="For margin %"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock, Low Stock Limit, In Stock Status */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Inventory Levels</span>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold">
                      <input
                        type="checkbox"
                        checked={editProdInStock}
                        onChange={(e) => setEditProdInStock(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded"
                      />
                      <span className={editProdInStock ? 'text-emerald-400' : 'text-rose-400'}>
                        {editProdInStock ? 'Active & Available' : 'Mark Out of Stock'}
                      </span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Stock on Hand</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseInt(editProdStock, 10) || 0;
                            setEditProdStock(Math.max(0, cur - 1).toString());
                          }}
                          className="w-9 h-9 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-black text-rose-300 text-sm"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          min="0"
                          required
                          value={editProdStock}
                          onChange={(e) => setEditProdStock(e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center text-white font-black text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseInt(editProdStock, 10) || 0;
                            setEditProdStock((cur + 1).toString());
                          }}
                          className="w-9 h-9 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-black text-emerald-300 text-sm"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Low Stock Alert Limit (&lt;)</label>
                      <input
                        type="number"
                        min="1"
                        value={editProdThreshold}
                        onChange={(e) => setEditProdThreshold(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Supplier & Expiry Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Assigned Supplier</label>
                    <select
                      value={editProdSupplierId}
                      onChange={(e) => setEditProdSupplierId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- No Supplier Assigned --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.category || 'Supplier'})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Expiry Date (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={editProdExpiryDate}
                      onChange={(e) => setEditProdExpiryDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Image URL & Quick Direct Camera Capture */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Image URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editProdImage}
                      onChange={(e) => setEditProdImage(e.target.value)}
                      placeholder="https://... or upload photo"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSnapProductPhoto(editingFullProduct, false)}
                      className="bg-slate-800 hover:bg-emerald-600 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all"
                      title="Snap photo with camera"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Snap</span>
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingFullProduct(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0B6E4F] hover:bg-emerald-600 text-white font-extrabold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Product Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dead Stock & Slow Movers Analyzer Modal */}
      <DeadStockAnalysisModal
        isOpen={showDeadStockModal}
        onClose={() => setShowDeadStockModal(false)}
        products={storeProducts}
        orders={storeOrders}
        lang={lang}
        storeName={store?.name}
        onProductUpdated={() => onRefresh()}
        onOpenEditModal={(p) => setEditingFullProduct(p)}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => {
          setShowCameraModal(false);
          setCameraTargetProduct(null);
        }}
        onCapture={handlePhotoCaptured}
        isRtl={isRtl}
      />

      {/* Merchant Camera Permission Prompt Modal */}
      <MerchantCameraPromptModal
        isOpen={showCameraPromptModal}
        onClose={() => {
          setShowCameraPromptModal(false);
          if (nativeCameraInputRef.current) {
            nativeCameraInputRef.current.click();
          }
        }}
        onPermissionGranted={() => {
          setShowCameraPromptModal(false);
          setShowCameraModal(true);
        }}
        lang={lang}
      />

      {/* Hidden native camera and gallery file inputs */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={nativeCameraInputRef}
        onChange={handleDirectFileSelected}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={handleDirectFileSelected}
        className="hidden"
      />
    </motion.div>
  );
};
