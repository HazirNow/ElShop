import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  CheckSquare, 
  Square, 
  PackageCheck, 
  Footprints,
  Bike, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Search, 
  Check, 
  X, 
  User, 
  FileText,
  Boxes,
  ShieldAlert,
  ArrowRight,
  MessageCircle,
  BookOpen,
  Trash2,
  Tag,
  PhoneCall,
  Truck,
  Edit3,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Bell,
  BellOff,
  Users,
  Palette,
  ShieldCheck,
  CreditCard,
  Send,
  Store as StoreIcon,
  QrCode,
  Sliders,
  Printer,
  Download
} from 'lucide-react';
import { AppState, Order, Product, Rider, Supplier, CustomerProfile, ProductCategory, Language } from '../types';
import { updateOrder, updateProduct, createProduct, deleteProduct, createSupplier, deleteSupplier, submitSettlement, updateCustomer, updateStore } from '../api';
import { calculateCustomerKhataBalance } from '../khataUtils';
import { getTranslation } from '../translations';
import { ProductImage } from './ProductImage';
import { CameraCaptureModal } from './CameraCaptureModal';
import { compressImageFile } from '../lib/imageUtils';
import { generateKhataWhatsAppLink, generateDirectWhatsAppLink, generateOrderStatusUpdateWhatsAppLink, formatWhatsAppDeepLink } from '../lib/whatsapp';
import { playOrderAlertChime } from '../lib/audio';
import { CustomerCreditAdjustmentModal } from './CustomerCreditAdjustmentModal';
import { ElevatorPosterModal } from './ElevatorPosterModal';
import { BatchKhataSettlementModal } from './BatchKhataSettlementModal';
import { ElShopLogo } from './ElShopLogo';
import { DailyBaqalaSummary } from './DailyBaqalaSummary';
import { FintechSkeletonLoader } from './FintechSkeletonLoader';
import { useOfflineSync } from '../lib/useOfflineSync';
import { OfflineSyncModal } from './OfflineSyncModal';
import { OfflineCounterOrderModal } from './OfflineCounterOrderModal';
import { Wifi, WifiOff } from 'lucide-react';
import { useTierAccess } from '../lib/useTierAccess';
import { MerchantHeader, MerchantTab } from './MerchantHeader';
import { UpgradePlanModal } from './UpgradePlanModal';
import { ConsolidatedPnLView } from './ConsolidatedPnLView';
import { StaffManagementView } from './StaffManagementView';
import { MerchantCameraPromptModal } from './MerchantCameraPromptModal';

interface Props {
  state: AppState;
  activeStoreId: string;
  lang: Language;
  isLoading?: boolean;
  onRefresh: () => void;
}

export const MerchantView: React.FC<Props> = ({ state, activeStoreId, lang, isLoading = false, onRefresh }) => {
  const t = (key: string, params?: Record<string, any>) => getTranslation(lang, key, params);
  const isRtl = lang === 'ar';

  const store = state?.stores?.find((s) => s.id === activeStoreId) || state?.stores?.[0];
  const tierAccess = useTierAccess(store);

  const storeOrders = state?.orders ? state.orders.filter((o) => o.storeId === store?.id) : [];
  const storeProducts = state?.products ? state.products.filter((p) => p.storeId === store?.id) : [];
  const storeRiders = state?.riders ? state.riders.filter((r) => r.storeId === store?.id) : [];

  // Sub-navigation tab
  const [activeTab, setActiveTab] = useState<MerchantTab>('board');

  // Plan upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLockedFeatureTitle, setUpgradeLockedFeatureTitle] = useState<string>('');

  const handleOpenUpgradeModal = (featureTitle?: string) => {
    setUpgradeLockedFeatureTitle(featureTitle || '');
    setShowUpgradeModal(true);
  };

  // Sound alert state & tracking
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrderCountRef = useRef<number>(storeOrders.length);

  // Audio alert on new incoming orders
  React.useEffect(() => {
    if (storeOrders.length > prevOrderCountRef.current) {
      if (soundEnabled) {
        playOrderAlertChime();
      }
    }
    prevOrderCountRef.current = storeOrders.length;
  }, [storeOrders.length, soundEnabled]);

  // Customer search & editable limits
  const [custSearch, setCustSearch] = useState('');
  const [custLimitInputs, setCustLimitInputs] = useState<Record<string, string>>({});
  const [savingCustId, setSavingCustId] = useState<string | null>(null);

  // Store branding & security state
  const [brandName, setBrandName] = useState(store?.name || '');
  const [brandNameAr, setBrandNameAr] = useState(store?.nameAr || '');
  const [brandPhone, setBrandPhone] = useState(store?.phone || '');
  const [brandArea, setBrandArea] = useState(store?.area || '');
  const [brandImage, setBrandImage] = useState(store?.image || '');
  const [brandColor, setBrandColor] = useState(store?.storeColor || '#0B6E4F');
  const [brandPin, setBrandPin] = useState(store?.pin || '1234');
  const [brandRiderPin, setBrandRiderPin] = useState(store?.riderPin || '5678');
  const [brandMerchantEmail, setBrandMerchantEmail] = useState(store?.merchantEmail || '');
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [brandSaveSuccess, setBrandSaveSuccess] = useState(false);

  // Selected order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>(storeRiders[0]?.id || '');

  // Inventory search & category/filter
  const [invSearch, setInvSearch] = useState('');
  const [invFilter, setInvFilter] = useState<'all' | 'sale' | 'low_stock'>('all');

  // Suppliers state
  const suppliers = state.suppliers || [];

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingSaleProduct, setEditingSaleProduct] = useState<Product | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [reorderProduct, setReorderProduct] = useState<Product | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraTargetProduct, setCameraTargetProduct] = useState<Product | null>(null);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [showElevatorPosterModal, setShowElevatorPosterModal] = useState(false);
  const [showBatchKhataModal, setShowBatchKhataModal] = useState(false);
  const [selectedCustForAdjustment, setSelectedCustForAdjustment] = useState<CustomerProfile | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showOfflineCounterModal, setShowOfflineCounterModal] = useState(false);
  const [showCameraPromptModal, setShowCameraPromptModal] = useState(false);

  // Prompt merchant for camera access on initial POS entry if not already decided
  useEffect(() => {
    try {
      const prompted = localStorage.getItem('elshop_merchant_camera_prompted');
      if (!prompted) {
        const timer = setTimeout(() => {
          setShowCameraPromptModal(true);
        }, 900);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignore localStorage restrictions
    }
  }, []);

  // Offline Sync hook
  const { isOnline, isSimulatedOffline, isSyncing, pendingCount } = useOfflineSync();

  // Hidden native camera and gallery file inputs
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleDirectFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.85);
      await handlePhotoCaptured(compressedDataUrl);
    } catch (err) {
      console.error('Failed to process selected image file:', err);
    } finally {
      e.target.value = '';
    }
  };

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Pantry');
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

  // Low-Stock Alert System State
  const [showLowStockAlerts, setShowLowStockAlerts] = useState<boolean>(true);
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [defaultStockThreshold, setDefaultStockThreshold] = useState<number>(5);
  const [editingThresholdProduct, setEditingThresholdProduct] = useState<Product | null>(null);
  const [thresholdInputVal, setThresholdInputVal] = useState<string>('5');

  // Low-Stock Helper Functions
  const getProductThreshold = (p: Product): number => {
    return p.lowStockThreshold !== undefined ? p.lowStockThreshold : (defaultStockThreshold || 5);
  };

  const isProductLowStock = (p: Product): boolean => {
    const thresh = getProductThreshold(p);
    return p.inStock && p.stock > 0 && p.stock < thresh;
  };

  const lowStockProducts = storeProducts.filter(isProductLowStock);

  const handleUpdateProductThreshold = async (product: Product, threshold: number) => {
    const safeThreshold = Math.max(1, Math.floor(threshold));
    try {
      await updateProduct(product.id, { lowStockThreshold: safeThreshold });
      if (editingThresholdProduct?.id === product.id) {
        setEditingThresholdProduct(null);
      }
      onRefresh();
    } catch (err) {
      console.error('Failed to update product threshold:', err);
    }
  };

  // Sale Modal State
  const [salePriceInput, setSalePriceInput] = useState('');
  const [regularPriceInput, setRegularPriceInput] = useState('');
  const [saleIsOn, setSaleIsOn] = useState(false);

  // Supplier Form State
  const [newSupName, setNewSupName] = useState('');
  const [newSupNameAr, setNewSupNameAr] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupCategory, setNewSupCategory] = useState('');

  // Reorder Form State
  const [reorderQty, setReorderQty] = useState('50');

  // --- Handlers for New Features ---
  const handleOpenSaleModal = (prod: Product) => {
    setEditingSaleProduct(prod);
    const isSale = Boolean(prod.sale ?? prod.isOnSale);
    const regP = prod.regularPrice ?? prod.originalPrice ?? prod.price;
    const discP = prod.discountedPrice ?? prod.price;
    
    setRegularPriceInput(regP.toString());
    setSalePriceInput(isSale ? discP.toString() : (regP * 0.8).toFixed(2));
    setSaleIsOn(isSale);
  };

  const handleSaveProductSale = async () => {
    if (!editingSaleProduct) return;
    const regPriceNum = parseFloat(regularPriceInput) || editingSaleProduct.regularPrice || editingSaleProduct.price;
    const discPriceNum = parseFloat(salePriceInput) || (regPriceNum * 0.8);

    try {
      await updateProduct(editingSaleProduct.id, {
        regularPrice: regPriceNum,
        discountedPrice: saleIsOn ? discPriceNum : undefined,
        price: saleIsOn ? discPriceNum : regPriceNum,
        sale: saleIsOn,
        isOnSale: saleIsOn,
        originalPrice: regPriceNum,
      });
      setEditingSaleProduct(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickPutOnSale = async (product: Product, discountPercent: number) => {
    const regP = product.regularPrice ?? product.originalPrice ?? product.price;
    const discP = Number((regP * (1 - discountPercent / 100)).toFixed(2));
    try {
      await updateProduct(product.id, {
        regularPrice: regP,
        discountedPrice: discP,
        price: discP,
        sale: true,
        isOnSale: true,
        originalPrice: regP,
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendSupplierReturnWhatsApp = (product: Product, reason: string) => {
    const supplier = suppliers.find((s) => s.id === product.supplierId);
    const phone = supplier?.phone || product.supplierPhone || '+971 50 111 2222';
    const message = `Hello ${supplier?.name || 'Supplier'}, this is ${store.name}. We are requesting a Return / Exchange for item "${product.name}" (${product.stock} units in stock). Reason: ${reason}. Please confirm credit note or pickup collection. Thank you!`;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const waUrl = isMobile
      ? `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Export current month's Khata statement for all customers as a CSV file
  const handleExportKhataCSV = () => {
    const now = new Date();
    const currentMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const fileTimestamp = now.toISOString().slice(0, 10);
    const filename = `Khata_Statement_${store.name.replace(/[^a-zA-Z0-9]/g, '_')}_${fileTimestamp}.csv`;

    const headers = [
      'Customer ID',
      'Customer Name',
      'Phone Number',
      'Building Name',
      'Unit/Flat Number',
      'Khata Pre-Approved',
      'Approved Credit Limit (AED)',
      'Current Khata Balance Owed (AED)',
      'Available Remaining Credit (AED)',
      'Credit Limit Utilization (%)',
      'Total Active Khata Orders',
      'Risk/Over-Limit Status',
      'Statement Month',
      'Export Date'
    ];

    const rows = state.customers.map((cust) => {
      const custKhataOrders = storeOrders.filter(
        (o) => (o.customerId === cust.id || o.customerPhone === cust.phone) && o.paymentStatus === 'khata_debited'
      );
      const totalKhataBalance = custKhataOrders.reduce((sum, o) => sum + o.total, 0);
      const currentLimit = cust.creditLimit ?? 500;
      const remainingCredit = Math.max(0, currentLimit - totalKhataBalance);
      const utilization = currentLimit > 0 ? ((totalKhataBalance / currentLimit) * 100).toFixed(1) : '0.0';
      const status = totalKhataBalance > currentLimit ? 'OVER_LIMIT' : totalKhataBalance > 0 ? 'ACTIVE_BALANCE' : 'CLEAR';

      return [
        `"${cust.id}"`,
        `"${(cust.name || '').replace(/"/g, '""')}"`,
        `"${cust.phone}"`,
        `"${(cust.building || '').replace(/"/g, '""')}"`,
        `"${(cust.unit || '').replace(/"/g, '""')}"`,
        cust.isKhataPreApproved ? 'YES' : 'NO',
        currentLimit.toFixed(2),
        totalKhataBalance.toFixed(2),
        remainingCredit.toFixed(2),
        `"${utilization}%"`,
        custKhataOrders.length,
        status,
        `"${currentMonthName}"`,
        `"${now.toLocaleDateString()}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        price: newProdIsOnSale ? (discP ?? rawPrice) : regP,
        regularPrice: regP,
        discountedPrice: discP,
        sale: newProdIsOnSale,
        originalPrice: regP,
        isOnSale: newProdIsOnSale,
        unit: newProdUnit,
        unitAr: newProdUnitAr,
        stock: parseInt(newProdStock) || 20,
        lowStockThreshold: parseInt(newProdThreshold) || 5,
        inStock: (parseInt(newProdStock) || 20) > 0,
        image: newProdImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        supplierId: assignedSup?.id,
        supplierPhone: assignedSup?.phone,
        expiryDate: newProdExpiryDate || undefined,
      });

      // Reset form
      setNewProdName('');
      setNewProdNameAr('');
      setNewProdPrice('');
      setNewProdOriginalPrice('');
      setNewProdIsOnSale(false);
      setNewProdStock('20');
      setNewProdThreshold('5');
      setNewProdImage('');
      setNewProdExpiryDate('');
      setShowAddProductModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoCaptured = async (imageDataUrl: string) => {
    if (cameraTargetProduct) {
      try {
        await updateProduct(cameraTargetProduct.id, {
          image: imageDataUrl,
        });
        setCameraTargetProduct(null);
        onRefresh();
      } catch (err) {
        console.error('Failed to update product photo:', err);
      }
    } else {
      setNewProdImage(imageDataUrl);
    }
  };

  const handleDeleteProductAction = async (prodId: string) => {
    if (!window.confirm(isRtl ? 'هل أنت تأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product from catalog?')) return;
    try {
      await deleteProduct(prodId);
      onRefresh();
    } catch (err) {
      console.error(err);
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
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSupplierAction = async (supId: string) => {
    try {
      await deleteSupplier(supId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReorderModal = (prod: Product) => {
    setReorderProduct(prod);
    setReorderQty('50');
  };

  const handleSendSupplierWhatsAppOrder = (prod: Product) => {
    const supPhone = prod.supplierPhone || suppliers.find((s) => s.id === prod.supplierId)?.phone || suppliers[0]?.phone || '+971 50 111 2222';
    const msg = isRtl
      ? `مرحباً! أود طلب شراء إضافي لمتجر ${store.nameAr}:\n- المنتج: ${prod.nameAr} (${prod.unitAr})\n- الكمية المطلوبة: ${reorderQty} units\nشكراً لك!`
      : `Hello! I would like to place a restock order for ${store.name}:\n- Item: ${prod.name} (${prod.unit})\n- Requested Quantity: ${reorderQty} units\nPlease confirm delivery date. Thank you!`;

    const link = formatWhatsAppDeepLink(supPhone, msg);
    window.open(link, '_blank');
    setReorderProduct(null);
  };

  // Settlement tab state
  const [settlementRiderId, setSettlementRiderId] = useState<string>(storeRiders[0]?.id || '');
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [settlementNotes, setSettlementNotes] = useState<string>('');

  // Orders filtered by status column
  const newOrders = storeOrders.filter((o) => o.status === 'placed');
  const packingOrders = storeOrders.filter((o) => o.status === 'packing');
  const outForDeliveryOrders = storeOrders.filter((o) => o.status === 'out_for_delivery');

  // Helper to normalize building names for resilient smart elevator batching
  const normalizeBuilding = (b: string) => {
    if (!b) return '';
    return b
      .toLowerCase()
      .trim()
      .replace(/[,\.\-\_\#\/]/g, ' ')
      .replace(/\b(tower|towers|twr|building|bldg|block|blk|residence|residences)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Group packing orders by normalized building for smart batching suggestion
  const packingByBuilding: Record<string, { displayBuilding: string; orders: Order[] }> = {};
  packingOrders.forEach((o) => {
    const norm = normalizeBuilding(o.building);
    if (!norm) return;
    if (!packingByBuilding[norm]) {
      packingByBuilding[norm] = { displayBuilding: o.building, orders: [] };
    }
    packingByBuilding[norm].orders.push(o);
  });

  const batchableBuildings = Object.values(packingByBuilding)
    .filter((group) => group.orders.length >= 2)
    .map((group) => [group.displayBuilding, group.orders] as [string, Order[]]);

  // Handlers
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrder(orderId, { status: 'packing' });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePackedItem = async (order: Order, productId: string) => {
    const current = new Set(order.packedItems || []);
    if (current.has(productId)) {
      current.delete(productId);
    } else {
      current.add(productId);
    }
    const updated = Array.from(current);
    try {
      const res = await updateOrder(order.id, { packedItems: updated });
      setSelectedOrder(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatchOrder = async (order: Order) => {
    const rider = storeRiders.find((r) => r.id === selectedRiderId) || storeRiders[0];
    try {
      await updateOrder(order.id, {
        status: 'out_for_delivery',
        riderId: rider.id,
        riderName: rider.name,
      });
      setSelectedOrder(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchDispatch = async (buildingName: string, ordersToBatch: Order[]) => {
    const rider = storeRiders[0];
    if (!rider) return;
    try {
      for (const ord of ordersToBatch) {
        await updateOrder(ord.id, {
          status: 'out_for_delivery',
          riderId: rider.id,
          riderName: rider.name,
        });
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProductStock = async (product: Product) => {
    try {
      await updateProduct(product.id, { inStock: !product.inStock });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductStockDelta = async (product: Product, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    try {
      await updateProduct(product.id, { stock: nextStock, inStock: nextStock > 0 });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Settlement computations
  const currentSettlementRider = storeRiders.find((r) => r.id === settlementRiderId) || storeRiders[0];
  const riderCompletedOrders = storeOrders.filter(
    (o) => o.riderId === currentSettlementRider?.id && o.status === 'delivered'
  );

  // Expected cash is sum of Cash orders (Card & Khata don't require cash collection from rider)
  const expectedCashTotal = riderCompletedOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  const parsedActualCash = parseFloat(actualCashInput) || 0;
  const cashVariance = parsedActualCash - expectedCashTotal;

  const handleSubmitSettlementAction = async (statusOverride?: 'approved' | 'disputed') => {
    if (!currentSettlementRider) return;
    const finalStatus = statusOverride || (cashVariance === 0 ? 'approved' : 'disputed');
    try {
      await submitSettlement({
        storeId: store.id,
        riderId: currentSettlementRider.id,
        riderName: currentSettlementRider.name,
        expectedCash: expectedCashTotal,
        actualCash: parsedActualCash,
        status: finalStatus,
        notes: settlementNotes,
      });
      alert(`Settlement submitted (${finalStatus.toUpperCase()})`);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !store) {
    return <FintechSkeletonLoader mode="merchant" isRtl={isRtl} />;
  }

  return (
    <div className="w-full bg-slate-900 text-slate-100 min-h-[750px] p-4 font-sans rounded-3xl shadow-xl flex flex-col border border-slate-800">
      
      {/* Service Paused or Overdue Warning Banner on Merchant Terminal */}
      {store.servicePaused ? (
        <div className="bg-rose-950/80 border-2 border-rose-500 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 shadow">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">
                ACCOUNT SUSPENDED — {store.overdueDays || 10}+ DAYS OVERDUE
              </h4>
              <p className="text-xs text-rose-300 mt-0.5">
                Your monthly ElShop subscription of {store.subscriptionFee || 299} AED is overdue. Customer storefront ordering is temporarily paused. Please settle with ElShop HQ or contact Admin for assistance.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/971501234567?text=${encodeURIComponent(`Hello ElShop Support, I am inquiring about settling subscription payment for ${store.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 shadow flex items-center gap-1.5 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact ElShop Admin</span>
          </a>
        </div>
      ) : store.paymentStatus === 'overdue' ? (
        <div className="bg-amber-950/60 border border-amber-500/60 rounded-2xl p-3.5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">
                Payment Reminder ({store.overdueDays || 1} Days Overdue):
              </span>{' '}
              <span>
                Monthly subscription of {store.subscriptionFee || 299} AED is pending. Store services will automatically pause after 10 days overdue.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-lg shrink-0">
            {10 - (store.overdueDays || 1)} days until auto-pause
          </span>
        </div>
      ) : null}

      {/* Merchant Header Bar with Tier Gating & Badges */}
      <MerchantHeader
        store={store}
        lang={lang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        storeOrdersCount={storeOrders.length}
        storeProductsCount={storeProducts.length}
        lowStockCount={lowStockProducts.length}
        showLowStockAlerts={showLowStockAlerts}
        onQuickLowStockClick={() => {
          setActiveTab('inventory');
          setInvFilter('low_stock');
          setIsAlertDismissed(false);
        }}
        isOnline={isOnline}
        pendingSyncCount={pendingCount}
        onOpenOfflineModal={() => setShowOfflineModal(true)}
        onOpenQuickOrderModal={() => setShowOfflineCounterModal(true)}
        onOpenElevatorPosterModal={() => setShowElevatorPosterModal(true)}
        onOpenUpgradeModal={handleOpenUpgradeModal}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (next) playOrderAlertChime();
        }}
      />

      {/* --- TAB 1: 3-COLUMN ORDER BOARD --- */}
      {activeTab === 'board' && (
        <div className="flex-1 flex flex-col space-y-4">
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
                  <h4 className="font-extrabold text-[#F5A623] uppercase text-[11px] tracking-wider">{t('batchSuggestion')}</h4>
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

          {/* 3-Column Board Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Column 1: New Orders */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700">
                <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2 tracking-wider uppercase">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>NEW ORDERS ({newOrders.length})</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {newOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80 shadow-sm hover:border-[#0B6E4F] transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400">#ORD-{ord.id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        ord.paymentMethod === 'cash'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : ord.paymentMethod === 'khata'
                          ? 'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
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
                        <span>ACCEPT</span>
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
                  <span>PACKING ({packingOrders.length})</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {packingOrders.map((ord) => {
                  const packedCount = ord.packedItems?.length || 0;

                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="bg-slate-900/90 rounded-xl p-4 border-2 border-[#0B6E4F] shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400">#ORD-{ord.id}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          ord.paymentMethod === 'cash'
                            ? 'bg-blue-500/20 text-blue-300'
                            : ord.paymentMethod === 'khata'
                            ? 'bg-[#F5A623]/20 text-[#F5A623]'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
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
                            <div key={it.productId} className={`flex items-center text-xs ${isChecked ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                              <span className="mr-2 font-bold">{isChecked ? '✓' : '□'}</span>
                              <span>{isRtl ? it.nameAr : it.name}</span>
                            </div>
                          );
                        })}
                        {ord.items.length > 2 && (
                          <div className="text-[10px] text-slate-500 italic pl-4">
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
                          DISPATCH TO RIDER
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
                  <span>OUT FOR DELIVERY ({outForDeliveryOrders.length})</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {outForDeliveryOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80 shadow-sm opacity-95"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400">#ORD-{ord.id}</span>
                      <span className="text-xs font-bold text-emerald-400">Rider: {ord.riderName || 'Assigned'}</span>
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
        </div>
      )}

      {/* --- TAB 2: INVENTORY & CATALOG MANAGEMENT --- */}
      {activeTab === 'inventory' && (() => {
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
          <div className="flex-1 flex flex-col space-y-4">
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
                      {lowStockProducts.slice(0, 5).map((lp) => (
                        <div
                          key={lp.id}
                          className="bg-slate-900/90 border border-rose-500/60 rounded-xl px-2.5 py-1 text-[11px] flex items-center gap-2 shadow-sm"
                        >
                          <span className="font-bold text-white max-w-[130px] truncate">{isRtl ? lp.nameAr : lp.name}</span>
                          <span className="bg-rose-600 text-white font-black px-1.5 py-0.2 rounded text-[10px]">
                            {lp.stock} left (limit &lt; {getProductThreshold(lp)})
                          </span>
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
                      ))}
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
                  onChange={(e) => setDefaultStockThreshold(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-8 bg-slate-900 border border-slate-700 rounded px-1 text-center font-black text-amber-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400">units</span>
              </div>
            </div>

            {/* Merchant Action Buttons */}
            <div className="flex items-center gap-2">
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
                const matchesSearch = p.name.toLowerCase().includes(invSearch.toLowerCase()) || p.nameAr.includes(invSearch);
                if (!matchesSearch) return false;
                if (invFilter === 'sale') return Boolean(p.sale ?? p.isOnSale);
                if (invFilter === 'low_stock') return isProductLowStock(p);
                return true;
              })
              .map((p) => {
                const threshold = getProductThreshold(p);
                const isLowStock = isProductLowStock(p);
                const assignedSupplier = suppliers.find((s) => s.id === p.supplierId);
                const isSale = Boolean(p.sale ?? p.isOnSale);
                const regP = p.regularPrice ?? p.originalPrice ?? p.price;
                const discP = p.discountedPrice ?? p.price;
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
                        : !p.inStock
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
                              onClick={() => {
                                setCameraTargetProduct(p);
                                nativeCameraInputRef.current?.click();
                              }}
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

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteProductAction(p.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700 transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Badges & Alert Status Row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {isLowStock && showLowStockAlerts && (
                          <span className="bg-rose-600 text-white border border-rose-400 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-white" />
                            <span>🚨 LOW STOCK ({p.stock} units left • Alert &lt; {threshold})</span>
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
                      </div>
                    </div>

                    {/* Controls Footer */}
                    <div className="pt-2.5 border-t border-slate-700/80 space-y-2">
                      {/* Stock Stepper, Fast Restock & In Stock Toggle */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Stepper & Fast Restock */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className={`flex items-center gap-1 bg-slate-900 border rounded-lg p-1 ${
                            isLowStock && showLowStockAlerts ? 'border-rose-500/80 ring-1 ring-rose-500/50' : 'border-slate-700'
                          }`}>
                            <button
                              onClick={() => handleProductStockDelta(p, -1)}
                              className="w-5 h-5 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center text-xs font-bold text-slate-300"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span className={`text-xs font-black px-1.5 ${
                              isLowStock && showLowStockAlerts ? 'text-rose-400' : 'text-white'
                            }`}>
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleProductStockDelta(p, 1)}
                              className="w-5 h-5 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center text-xs font-bold text-slate-300"
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>

                          {/* Quick Fast Restock Pills */}
                          <div className="flex items-center gap-1">
                            {[6, 12, 24].map((addQty) => (
                              <button
                                key={addQty}
                                onClick={() => handleProductStockDelta(p, addQty)}
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                                  isLowStock && showLowStockAlerts
                                    ? 'bg-rose-950/80 hover:bg-rose-800 text-rose-200 border border-rose-500/60'
                                    : 'bg-slate-900 hover:bg-emerald-800/80 text-emerald-300 border border-slate-700 hover:border-emerald-500'
                                }`}
                                title={`Quick Restock +${addQty} Units`}
                              >
                                +{addQty}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* In Stock Toggle */}
                        <button
                          onClick={() => handleToggleProductStock(p)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                            p.inStock
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {p.inStock ? 'In Stock ✓' : 'Out of Stock ✕'}
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
                        {/* Manage Sale Price Button */}
                        <button
                          onClick={() => handleOpenSaleModal(p)}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all border border-slate-600"
                        >
                          <Tag className="w-3 h-3 text-amber-400" />
                          <span>{t('manageSale')}</span>
                        </button>

                        {/* Reorder from Supplier Button */}
                        <button
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

                        {/* WhatsApp Supplier Return Request */}
                        <button
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
        </div>
      );
    })()}

      {/* --- TAB 3: RIDER CASH SETTLEMENT --- */}
      {activeTab === 'settlement' && (
        <div className="space-y-4">
          <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>{t('cashSettlementTitle')}</span>
            </h3>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">
                {t('selectRider')}
              </label>
              <select
                value={settlementRiderId}
                onChange={(e) => {
                  setSettlementRiderId(e.target.value);
                  setActualCashInput('');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
              >
                {storeRiders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.vehicle})
                  </option>
                ))}
              </select>
            </div>

            {/* Calculations Card */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t('expectedCash')} (Completed Cash Orders):</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {expectedCashTotal.toFixed(2)} AED
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  {t('actualCashHandedIn')}:
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Enter cash handed in by rider..."
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">{t('variance')}:</span>
                <span className={`font-extrabold text-sm px-2.5 py-0.5 rounded ${
                  cashVariance === 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : cashVariance < 0
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {cashVariance.toFixed(2)} AED {cashVariance < 0 ? '(Shortage)' : cashVariance > 0 ? '(Surplus)' : '(Balanced)'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleSubmitSettlementAction('approved')}
                className="flex-1 bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t('approveSettlement')}</span>
              </button>

              <button
                onClick={() => handleSubmitSettlementAction('disputed')}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('flagDispute')}</span>
              </button>
            </div>
          </div>

          {/* Rider Orders History List */}
          <div className="w-full md:w-80 bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col">
            <h4 className="font-bold text-xs text-slate-300 mb-3 border-b border-slate-800 pb-2">
              Completed Orders by {currentSettlementRider?.name} ({riderCompletedOrders.length})
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56">
              {riderCompletedOrders.map((ord) => (
                <div key={ord.id} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">#{ord.id}</span>
                    <span className="text-[10px] text-slate-400">{ord.building}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">{ord.total.toFixed(2)} AED</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 bg-slate-700 rounded text-amber-300">
                      {ord.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}

              {riderCompletedOrders.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-6">
                  No completed deliveries recorded yet for this rider.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Store Credit Ledger WhatsApp Statements */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 mt-4 space-y-3">
          <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Customer Store Credit Ledger & WhatsApp Statements</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {state.customers.map((cust) => {
              const totalKhataBalance = calculateCustomerKhataBalance(state.khataTransactions || [], cust.id, cust.phone);

              return (
                <div key={cust.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-white">{cust.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cust.isKhataPreApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                        {cust.isKhataPreApproved ? 'Store Credit Approved' : 'Standard'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">{cust.building} • {cust.unit}</p>
                    <div className="text-xs font-bold text-amber-300 mb-3 bg-slate-800 p-2 rounded-lg border border-slate-700/80">
                      Store Credit Balance: {totalKhataBalance.toFixed(2)} AED
                    </div>
                  </div>

                  <a
                    href={generateKhataWhatsAppLink(cust, isRtl ? store.nameAr : store.name, totalKhataBalance, lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t('sendKhataWhatsApp')}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {/* --- TAB 4: CUSTOMERS & KHATA CREDIT LIMITS --- */}
      {activeTab === 'customers' && (
        <div className="flex-1 flex flex-col space-y-4">
          {/* Top Bar: Search & Metrics & Actions */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Resident Profiles & Store Credit (Khata)</h3>
                <p className="text-xs text-slate-400">
                  Manage individual approved credit limits, payment histories, and WhatsApp statements
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleExportKhataCSV}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 shrink-0 border border-emerald-600/60"
                title="Export monthly Khata statements for all customers as a CSV file"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isRtl ? 'تصدير كشف الحساب (CSV)' : "Export Month's Khata CSV"}</span>
              </button>

              <button
                onClick={() => setShowBatchKhataModal(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 shrink-0"
              >
                <Users className="w-3.5 h-3.5 text-amber-200" />
                <span>{isRtl ? 'كشوفات الحساب المجمعة' : 'Batch Khata Statements'}</span>
              </button>

              <div className="relative w-full sm:w-52">
                <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5`} />
                <input
                  type="text"
                  placeholder={isRtl ? 'ابحث عن عميل أو شقة...' : 'Search resident or unit...'}
                  value={custSearch}
                  onChange={(e) => setCustSearch(e.target.value)}
                  className={`w-full bg-slate-900 border border-slate-700 rounded-xl ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
              </div>
            </div>
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.customers
              .filter((c) => 
                !custSearch || 
                c.name.toLowerCase().includes(custSearch.toLowerCase()) || 
                c.building.toLowerCase().includes(custSearch.toLowerCase()) ||
                c.unit.toLowerCase().includes(custSearch.toLowerCase())
              )
              .map((cust) => {
                const totalKhataBalance = calculateCustomerKhataBalance(state.khataTransactions || [], cust.id, cust.phone);
                const currentLimit = cust.creditLimit ?? 500;
                const inputValue = custLimitInputs[cust.id] !== undefined ? custLimitInputs[cust.id] : currentLimit.toString();
                const isOverLimit = totalKhataBalance > currentLimit;
                const remainingCredit = Math.max(0, currentLimit - totalKhataBalance);

                const handleSaveCreditLimit = async (newLimitVal: number, preApproved: boolean) => {
                  setSavingCustId(cust.id);
                  try {
                    await updateCustomer(cust.id, {
                      creditLimit: newLimitVal,
                      isKhataPreApproved: preApproved,
                    });
                    onRefresh();
                  } catch (err) {
                    console.error('Failed to update customer credit limit:', err);
                  } finally {
                    setSavingCustId(null);
                  }
                };

                return (
                  <div
                    key={cust.id}
                    className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-lg space-y-3 relative overflow-hidden"
                  >
                    {/* Background tint if Khata active */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Customer Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-white flex items-center justify-center font-bold text-sm shadow">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white leading-tight">{cust.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            {cust.building} • Unit {cust.unit}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">{cust.phone}</p>
                        </div>
                      </div>

                      {/* Khata Approval Toggle Switch */}
                      <button
                        onClick={() => handleSaveCreditLimit(currentLimit, !cust.isKhataPreApproved)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          cust.isKhataPreApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-slate-700/80 text-slate-400 border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{cust.isKhataPreApproved ? 'Khata Approved' : 'No Khata'}</span>
                      </button>
                    </div>

                    {/* Credit Limit & Balance Status */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Outstanding Balance:</span>
                        <span className={`font-extrabold ${isOverLimit ? 'text-rose-400' : 'text-amber-400'}`}>
                          {totalKhataBalance.toFixed(2)} AED
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Available Remaining:</span>
                        <span className="font-bold text-emerald-400">
                          {remainingCredit.toFixed(2)} AED
                        </span>
                      </div>

                      {/* Limit Bar */}
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className={`h-full transition-all ${isOverLimit ? 'bg-rose-500' : 'bg-amber-400'}`}
                          style={{
                            width: `${Math.min(100, (totalKhataBalance / (currentLimit || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>

                      {/* Editable Credit Limit Input Field */}
                      <div className="pt-2 border-t border-slate-800">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Merchant Approved Credit Limit (AED)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1.5 text-[11px] text-slate-400 font-bold">AED</span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={inputValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustLimitInputs((prev) => ({ ...prev, [cust.id]: val }));
                              }}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-11 pr-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                            />
                          </div>

                          <button
                            onClick={() => {
                              const parsed = parseFloat(inputValue);
                              if (!isNaN(parsed)) {
                                handleSaveCreditLimit(parsed, cust.isKhataPreApproved);
                              }
                            }}
                            disabled={savingCustId === cust.id}
                            className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition-all shadow active:scale-95"
                          >
                            {savingCustId === cust.id ? 'Saving...' : 'Set'}
                          </button>
                        </div>

                        {/* Quick preset pills */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-[9px] text-slate-500">Presets:</span>
                          {[250, 500, 1000, 2000].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => {
                                setCustLimitInputs((prev) => ({ ...prev, [cust.id]: preset.toString() }));
                                handleSaveCreditLimit(preset, true);
                              }}
                              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-1.5 py-0.5 rounded border border-slate-700 transition-all"
                            >
                              {preset} AED
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="space-y-1.5 pt-1">
                      <button
                        onClick={() => setSelectedCustForAdjustment(cust)}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Quick Credit & Ledger Settlement</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={generateKhataWhatsAppLink(cust, isRtl ? store.nameAr : store.name, totalKhataBalance, lang)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Tab</span>
                        </a>

                        <a
                          href={generateDirectWhatsAppLink(cust.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow transition-all border border-slate-600"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                          <span>Direct Chat</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* --- TAB 5: STORE BRANDING & PROFILE SETTINGS --- */}
      {activeTab === 'branding' && (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full space-y-5">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Store White-Label Branding & Profile</h3>
                  <p className="text-xs text-slate-400">
                    Customers only see your store identity, logo, and colors throughout the app
                  </p>
                </div>
              </div>

              {brandSaveSuccess && (
                <div className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </div>
              )}
            </div>

            {/* Store Preview Mockup */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
              <div className="relative">
                <ProductImage
                  src={brandImage || store.image}
                  alt={brandName}
                  fallbackType="store"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">{brandName || store.name}</h4>
                  <span className="text-xs text-slate-400">({brandNameAr || store.nameAr})</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">📍 {brandArea || store.area}</p>
                <p className="text-[11px] text-emerald-400 font-mono mt-0.5">WhatsApp: {brandPhone || store.phone}</p>
              </div>
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-inner shrink-0"
                style={{ backgroundColor: brandColor }}
                title="Theme Color Preview"
              ></div>
            </div>

            {/* Edit Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingBrand(true);
                setBrandSaveSuccess(false);
                try {
                  await updateStore(store.id, {
                    name: brandName,
                    nameAr: brandNameAr,
                    phone: brandPhone,
                    area: brandArea,
                    image: brandImage,
                    storeColor: brandColor,
                    pin: brandPin,
                    riderPin: brandRiderPin,
                    merchantEmail: brandMerchantEmail,
                  });
                  setBrandSaveSuccess(true);
                  setTimeout(() => setBrandSaveSuccess(false), 3000);
                  onRefresh();
                } catch (err) {
                  console.error('Failed to update store branding:', err);
                } finally {
                  setIsSavingBrand(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Store Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم المتجر (العربية) *</label>
                  <input
                    type="text"
                    required
                    value={brandNameAr}
                    onChange={(e) => setBrandNameAr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">WhatsApp & Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+971501234567"
                    value={brandPhone}
                    onChange={(e) => setBrandPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Neighborhood Area</label>
                  <input
                    type="text"
                    value={brandArea}
                    onChange={(e) => setBrandArea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Merchant Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="merchant@example.com"
                    value={brandMerchantEmail}
                    onChange={(e) => setBrandMerchantEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>
              </div>

              {/* Store Access & PIN Security Configuration */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Store Access Passkeys & Isolated Multi-Tenant PINs</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Staff and couriers enter these 4-digit PINs at the staff login gateway to access this store's orders and POS.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Store Manager POS PIN</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={brandPin}
                      onChange={(e) => setBrandPin(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono tracking-widest text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Used to unlock Merchant POS terminal</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Store Courier / Rider PIN</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={brandRiderPin}
                      onChange={(e) => setBrandRiderPin(e.target.value)}
                      placeholder="5678"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono tracking-widest text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Used by building runners to open active deliveries</span>
                  </div>
                </div>
              </div>

              {/* Theme Color Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Store Theme Brand Color</label>
                <div className="flex items-center gap-3">
                  {['#0B6E4F', '#0284C7', '#7C3AED', '#D97706', '#DC2626', '#0F766E'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBrandColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full transition-all border-2 ${
                        brandColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    ></button>
                  ))}
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    title="Custom color picker"
                  />
                </div>
              </div>

              {/* Store Avatar Logo */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Store Avatar Image URL / Photo</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={brandImage}
                    onChange={(e) => setBrandImage(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCameraTargetProduct(null);
                      galleryInputRef.current?.click();
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all border border-slate-600"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Merchant Camera & Scanner Hardware Preferences */}
              <div className="pt-2 border-t border-slate-700/60">
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between text-xs">
                  <span>Merchant POS Camera & Barcode Scanner</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    Merchant Only
                  </span>
                </label>
                <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-200">Catalog Snapper & Barcode Video Stream</p>
                    <p className="text-[10px] text-slate-400">Restricted to merchant counter session. Customers and riders are never prompted.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCameraPromptModal(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Manage Access</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingBrand}
                className="w-full bg-[#0B6E4F] hover:bg-emerald-600 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingBrand ? 'Updating Store Profile...' : 'Save Store Branding Settings'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 6: CONSOLIDATED P&L & MULTI-STORE INSIGHTS (Tier 3) --- */}
      {activeTab === 'pnl' && (
        <ConsolidatedPnLView
          store={store}
          allStores={state.stores || []}
          orders={storeOrders}
          products={storeProducts}
          lang={lang}
          onOpenUpgradeModal={handleOpenUpgradeModal}
        />
      )}

      {/* --- TAB 7: STAFF ROLES & ADVANCED PIN MANAGEMENT (Tier 2+) --- */}
      {activeTab === 'staff' && (
        <StaffManagementView
          store={store}
          lang={lang}
          onRefresh={onRefresh}
          onOpenUpgradeModal={handleOpenUpgradeModal}
        />
      )}

      {/* --- MODALS FOR MERCHANT OPERATIONS --- */}
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
                          onClick={() => {
                            setCameraTargetProduct(null);
                            nativeCameraInputRef.current?.click();
                          }}
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
                          onClick={() => {
                            setCameraTargetProduct(null);
                            setShowCameraModal(true);
                          }}
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
      </AnimatePresence>
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

        {/* 6. SET CUSTOM LOW-STOCK ALERT THRESHOLD MODAL */}
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
                      const cur = parseInt(thresholdInputVal) || 5;
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
                      const cur = parseInt(thresholdInputVal) || 5;
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
                        parseInt(thresholdInputVal) === preset
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
                    const parsed = parseInt(thresholdInputVal);
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
      </AnimatePresence>

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

      {/* Quick Customer Credit Adjustment & Ledger Settlement Modal */}
      {selectedCustForAdjustment && (
        <CustomerCreditAdjustmentModal
          customer={selectedCustForAdjustment}
          orders={storeOrders}
          khataTransactions={state.khataTransactions || []}
          store={store}
          lang={lang}
          onClose={() => setSelectedCustForAdjustment(null)}
          onRefresh={onRefresh}
          onOpenUpgradeModal={handleOpenUpgradeModal}
        />
      )}

      {/* Elevator & Lobby QR Flyer Poster Generator Modal */}
      {showElevatorPosterModal && (
        <ElevatorPosterModal
          store={store}
          lang={lang}
          onClose={() => setShowElevatorPosterModal(false)}
        />
      )}

      {/* Batch Khata Settlement Reminders Modal */}
      {showBatchKhataModal && (
        <BatchKhataSettlementModal
          customers={state.customers}
          orders={storeOrders}
          khataTransactions={state.khataTransactions || []}
          store={store}
          lang={lang}
          onClose={() => setShowBatchKhataModal(false)}
          onSelectCustomer={(cust) => {
            setShowBatchKhataModal(false);
            setSelectedCustForAdjustment(cust);
          }}
        />
      )}

      {/* IndexedDB Offline Sync Queue Inspector Modal */}
      <OfflineSyncModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        lang={lang}
      />

      {/* Offline Counter POS & Quick Phone Order Modal */}
      <OfflineCounterOrderModal
        isOpen={showOfflineCounterModal}
        onClose={() => setShowOfflineCounterModal(false)}
        products={storeProducts}
        customers={state.customers || []}
        khataTransactions={state.khataTransactions || []}
        store={store}
        lang={lang}
        onOrderCreated={onRefresh}
      />

      {/* Subscription Tier Upgrade & Feature Matrix Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        store={store}
        lang={lang}
        lockedFeatureTitle={upgradeLockedFeatureTitle}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />

      {/* Merchant Camera Permission Prompt Modal */}
      <MerchantCameraPromptModal
        isOpen={showCameraPromptModal}
        onClose={() => setShowCameraPromptModal(false)}
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

    </div>
  );
};
