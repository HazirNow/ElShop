import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  AppState, 
  Store, 
  Language, 
  Order, 
  Product, 
  Rider, 
  Supplier, 
  ProductCategory 
} from '../../types';
import { 
  updateOrder, 
  updateProduct, 
  deleteProduct, 
  createSupplier, 
  deleteSupplier, 
  submitSettlement 
} from '../../api';
import { getTranslation } from '../../translations';
import { useTierAccess } from '../../hooks/useTierAccess';
import { notifyError, notifySuccess } from '../../utils/errorHandler';
import { formatWhatsAppDeepLink } from '../../lib/whatsapp';

export interface MerchantStoreContextType {
  // Core Store & Language State
  state: AppState;
  store: Store;
  lang: Language;
  isRtl: boolean;
  t: (key: string, params?: Record<string, any>) => string;
  tierAccess: ReturnType<typeof useTierAccess>;
  onRefresh: () => Promise<void> | void;
  handleOpenUpgradeModal: (featureTitle?: string) => void;

  // Filtered Collections
  storeOrders: Order[];
  storeProducts: Product[];
  storeRiders: Rider[];
  suppliers: Supplier[];

  // --- ORDER BOARD STATE & ACTIONS ---
  newOrders: Order[];
  packingOrders: Order[];
  outForDeliveryOrders: Order[];
  batchableBuildings: [string, Order[]][];
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  selectedRiderId: string;
  setSelectedRiderId: (id: string) => void;
  handleAcceptOrder: (orderId: string) => Promise<void>;
  handleTogglePackedItem: (order: Order, productId: string) => Promise<void>;
  handleDispatchOrder: (order: Order) => Promise<void>;
  handleBatchDispatch: (buildingName: string, ordersToBatch: Order[]) => Promise<void>;

  // --- INVENTORY MANAGER STATE & ACTIONS ---
  invSearch: string;
  setInvSearch: (s: string) => void;
  invFilter: 'all' | 'sale' | 'low_stock' | 'slow_movers';
  setInvFilter: (filter: 'all' | 'sale' | 'low_stock' | 'slow_movers') => void;
  optimisticStockOverrides: Record<string, number>;
  getEffectiveStock: (p: Product) => number;
  getProductThreshold: (p: Product) => number;
  isProductLowStock: (p: Product) => boolean;
  lowStockProducts: Product[];
  productSalesVelocity: Record<string, { totalSold: number; ordersCount: number }>;
  deadStockProducts: Product[];
  slowMoversAndDeadProducts: Product[];
  showLowStockAlerts: boolean;
  setShowLowStockAlerts: (b: boolean) => void;
  isAlertDismissed: boolean;
  setIsAlertDismissed: (b: boolean) => void;
  defaultStockThreshold: number;
  setDefaultStockThreshold: (n: number) => void;
  editingThresholdProduct: Product | null;
  setEditingThresholdProduct: (p: Product | null) => void;
  thresholdInputVal: string;
  setThresholdInputVal: (s: string) => void;
  handleUpdateProductThreshold: (product: Product, threshold: number) => Promise<void>;
  handleToggleProductStock: (product: Product) => Promise<void>;
  handleProductStockDelta: (product: Product, delta: number) => Promise<void>;
  handleDeleteProductAction: (prodId: string) => Promise<void>;
  handleOpenSaleModal: (prod: Product) => void;
  handleSaveProductSale: () => Promise<void>;
  handleQuickPutOnSale: (product: Product, discountPercent: number) => Promise<void>;
  handleSendSupplierReturnWhatsApp: (product: Product, reason: string) => void;
  handleOpenReorderModal: (prod: Product) => void;
  handleSendSupplierWhatsAppOrder: (prod: Product) => void;
  handleOpenEditProduct: (prod: Product) => void;
  handleDeleteSupplierAction: (supId: string) => Promise<void>;
  handleSnapProductPhoto: (targetProduct?: Product | null, preferLiveViewfinder?: boolean) => void;

  // Inventory Modals & Temporary State
  showAddProductModal: boolean;
  setShowAddProductModal: (b: boolean) => void;
  showDeadStockModal: boolean;
  setShowDeadStockModal: (b: boolean) => void;
  showSupplierModal: boolean;
  setShowSupplierModal: (b: boolean) => void;
  editingSaleProduct: Product | null;
  setEditingSaleProduct: (p: Product | null) => void;
  salePriceInput: string;
  setSalePriceInput: (s: string) => void;
  regularPriceInput: string;
  setRegularPriceInput: (s: string) => void;
  saleIsOn: boolean;
  setSaleIsOn: (b: boolean) => void;
  reorderProduct: Product | null;
  setReorderProduct: (p: Product | null) => void;
  reorderQty: string;
  setReorderQty: (s: string) => void;
  editingFullProduct: Product | null;
  setEditingFullProduct: (p: Product | null) => void;

  // --- RECONCILIATION STATE & ACTIONS ---
  settlementRiderId: string;
  setSettlementRiderId: (id: string) => void;
  actualCashInput: string;
  setActualCashInput: (s: string) => void;
  settlementNotes: string;
  setSettlementNotes: (s: string) => void;
  currentSettlementRider: Rider | undefined;
  riderCompletedOrders: Order[];
  expectedCashTotal: number;
  hasActualCashEntered: boolean;
  parsedActualCash: number;
  cashVariance: number;
  isSettlementBalanced: boolean;
  handleSubmitSettlementAction: (statusOverride?: 'approved' | 'disputed') => Promise<void>;
  handleExportKhataCSV: () => void;
  showShiftReconciliationModal: boolean;
  setShowShiftReconciliationModal: (b: boolean) => void;
}

export const MerchantStoreContext = createContext<MerchantStoreContextType | null>(null);

export interface MerchantStoreProviderProps {
  children: React.ReactNode;
  state: AppState;
  store: Store;
  lang: Language;
  onRefresh: () => Promise<void> | void;
  handleOpenUpgradeModal: (featureTitle?: string) => void;
  onSnapProductPhoto?: (targetProduct?: Product | null, preferLiveViewfinder?: boolean) => void;
  onOpenEditProductCustom?: (product: Product) => void;
}

export const MerchantStoreProvider: React.FC<MerchantStoreProviderProps> = ({
  children,
  state,
  store,
  lang,
  onRefresh,
  handleOpenUpgradeModal,
  onSnapProductPhoto,
  onOpenEditProductCustom,
}) => {
  const t = useCallback((key: string, params?: Record<string, any>) => getTranslation(lang, key, params), [lang]);
  const isRtl = lang === 'ar';
  const tierAccess = useTierAccess(store);

  const storeOrders = useMemo(() => (state?.orders ? state.orders.filter((o) => o.storeId === store?.id) : []), [state?.orders, store?.id]);
  const storeProducts = useMemo(() => (state?.products ? state.products.filter((p) => p.storeId === store?.id) : []), [state?.products, store?.id]);
  const storeRiders = useMemo(() => (state?.riders ? state.riders.filter((r) => r.storeId === store?.id) : []), [state?.riders, store?.id]);
  const suppliers = state.suppliers || [];

  // --- ORDER BOARD STATE ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>(storeRiders[0]?.id || '');

  // Keep selected rider in sync if riders change
  useEffect(() => {
    if (!selectedRiderId && storeRiders[0]?.id) {
      setSelectedRiderId(storeRiders[0].id);
    }
  }, [storeRiders, selectedRiderId]);

  const newOrders = useMemo(() => storeOrders.filter((o) => o.status === 'placed'), [storeOrders]);
  const packingOrders = useMemo(() => storeOrders.filter((o) => o.status === 'packing'), [storeOrders]);
  const outForDeliveryOrders = useMemo(() => storeOrders.filter((o) => o.status === 'out_for_delivery'), [storeOrders]);

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

  const batchableBuildings = useMemo(() => {
    const packingByBuilding: Record<string, { displayBuilding: string; orders: Order[] }> = {};
    packingOrders.forEach((o) => {
      const norm = normalizeBuilding(o.building);
      if (!norm) return;
      if (!packingByBuilding[norm]) {
        packingByBuilding[norm] = { displayBuilding: o.building, orders: [] };
      }
      packingByBuilding[norm].orders.push(o);
    });

    return Object.values(packingByBuilding)
      .filter((group) => group.orders.length >= 2)
      .map((group) => [group.displayBuilding, group.orders] as [string, Order[]]);
  }, [packingOrders]);

  // Order Handlers with Error Handling & Alerts
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrder(orderId, { status: 'packing' });
      notifySuccess(`Order #${orderId} accepted & moved to Packing.`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to accept order #${orderId}. Please retry.`);
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
      notifyError(err, `Failed to update checklist item for order #${order.id}.`);
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
      notifySuccess(`Order #${order.id} dispatched to rider ${rider.name}!`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to dispatch order #${order.id}.`);
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
      notifySuccess(`Batched ${ordersToBatch.length} orders for ${buildingName} to ${rider.name}!`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to batch dispatch orders for ${buildingName}.`);
    }
  };

  // --- INVENTORY MANAGER STATE ---
  const [invSearch, setInvSearch] = useState('');
  const [invFilter, setInvFilter] = useState<'all' | 'sale' | 'low_stock' | 'slow_movers'>('all');

  // Optimistic stock override dictionary for zero-lag UI stock updates
  const [optimisticStockOverrides, setOptimisticStockOverrides] = useState<Record<string, number>>({});
  const inFlightStockRequests = useRef<Map<string, number>>(new Map());

  // Reconcile optimistic stock overrides immediately upon receipt of a fresh polling response
  useEffect(() => {
    if (!state?.products) return;

    setOptimisticStockOverrides((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;

      let changed = false;
      const next = { ...prev };

      for (const productId of keys) {
        const serverProd = state.products.find((p) => p.id === productId);
        const inFlightTarget = inFlightStockRequests.current.get(productId);

        if (!serverProd) {
          delete next[productId];
          changed = true;
          continue;
        }

        if (serverProd.stock === prev[productId]) {
          delete next[productId];
          changed = true;
          continue;
        }

        if (inFlightTarget === undefined) {
          delete next[productId];
          changed = true;
          continue;
        }
      }

      return changed ? next : prev;
    });
  }, [state?.products]);

  // Low-Stock Alert System State
  const [showLowStockAlerts, setShowLowStockAlerts] = useState<boolean>(true);
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [defaultStockThreshold, setDefaultStockThreshold] = useState<number>(5);
  const [editingThresholdProduct, setEditingThresholdProduct] = useState<Product | null>(null);
  const [thresholdInputVal, setThresholdInputVal] = useState<string>('5');

  // Helpers
  const getEffectiveStock = useCallback((p: Product): number => {
    return optimisticStockOverrides[p.id] !== undefined ? optimisticStockOverrides[p.id] : p.stock;
  }, [optimisticStockOverrides]);

  const getProductThreshold = useCallback((p: Product): number => {
    return p.lowStockThreshold !== undefined ? p.lowStockThreshold : (defaultStockThreshold || 5);
  }, [defaultStockThreshold]);

  const isProductLowStock = useCallback((p: Product): boolean => {
    const thresh = getProductThreshold(p);
    const effectiveStock = getEffectiveStock(p);
    return (p.inStock || effectiveStock > 0) && effectiveStock > 0 && effectiveStock < thresh;
  }, [getProductThreshold, getEffectiveStock]);

  const lowStockProducts = useMemo(() => storeProducts.filter(isProductLowStock), [storeProducts, isProductLowStock]);

  // Sales Velocity & Dead Stock Calculations
  const productSalesVelocity = useMemo(() => {
    const salesMap: Record<string, { totalSold: number; ordersCount: number }> = {};
    storeOrders.forEach((o) => {
      if (o.status !== 'cancelled') {
        o.items.forEach((item) => {
          if (!salesMap[item.productId]) {
            salesMap[item.productId] = { totalSold: 0, ordersCount: 0 };
          }
          salesMap[item.productId].totalSold += item.quantity || 0;
          salesMap[item.productId].ordersCount += 1;
        });
      }
    });
    return salesMap;
  }, [storeOrders]);

  const deadStockProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      const stats = productSalesVelocity[p.id];
      return !stats || stats.totalSold === 0;
    });
  }, [storeProducts, productSalesVelocity]);

  const slowMoversAndDeadProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      const stats = productSalesVelocity[p.id];
      return !stats || stats.totalSold <= 2;
    });
  }, [storeProducts, productSalesVelocity]);

  // Inventory Modals & Editing State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showDeadStockModal, setShowDeadStockModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSaleProduct, setEditingSaleProduct] = useState<Product | null>(null);
  const [salePriceInput, setSalePriceInput] = useState('');
  const [regularPriceInput, setRegularPriceInput] = useState('');
  const [saleIsOn, setSaleIsOn] = useState(false);

  const [reorderProduct, setReorderProduct] = useState<Product | null>(null);
  const [reorderQty, setReorderQty] = useState('50');
  const [editingFullProduct, setEditingFullProduct] = useState<Product | null>(null);

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
      notifySuccess(`Promotional pricing updated for ${editingSaleProduct.name}.`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to update sale price for ${editingSaleProduct.name}.`);
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
      notifySuccess(`${discountPercent}% discount applied to ${product.name}!`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to apply quick discount to ${product.name}.`);
    }
  };

  const handleSendSupplierReturnWhatsApp = (product: Product, reason: string) => {
    const supplier = suppliers.find((s) => s.id === product.supplierId);
    const phone = supplier?.phone || product.supplierPhone || '+971 50 111 2222';
    const message = `Hello ${supplier?.name || 'Supplier'}, this is ${store.name}. We are requesting a Return / Exchange for item "${product.name}" (${product.stock} units in stock). Reason: ${reason}. Please confirm credit note or pickup collection. Thank you!`;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const waUrl = isMobile
      ? `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleUpdateProductThreshold = async (product: Product, threshold: number) => {
    const safeThreshold = Math.max(1, Math.floor(threshold));
    try {
      await updateProduct(product.id, { lowStockThreshold: safeThreshold });
      if (editingThresholdProduct?.id === product.id) {
        setEditingThresholdProduct(null);
      }
      notifySuccess(`Low-stock alert threshold set to ${safeThreshold} units for ${product.name}.`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to update low-stock threshold for ${product.name}.`);
    }
  };

  const handleToggleProductStock = async (product: Product) => {
    const nextInStock = !product.inStock;
    try {
      await updateProduct(product.id, { inStock: nextInStock });
      notifySuccess(`${product.name} is now ${nextInStock ? 'In Stock' : 'Marked Out of Stock'}.`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to update status for ${product.name}.`);
    }
  };

  const handleProductStockDelta = async (product: Product, delta: number) => {
    const currentStock = getEffectiveStock(product);
    const nextStock = Math.max(0, currentStock + delta);

    // Instant optimistic update
    setOptimisticStockOverrides((prev) => ({ ...prev, [product.id]: nextStock }));
    inFlightStockRequests.current.set(product.id, nextStock);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }

    try {
      const updatedProduct = await updateProduct(product.id, { stock: nextStock, inStock: nextStock > 0 });
      inFlightStockRequests.current.delete(product.id);

      setOptimisticStockOverrides((prev) => {
        if (!(product.id in prev)) return prev;
        if (prev[product.id] === nextStock || (updatedProduct && prev[product.id] === updatedProduct.stock)) {
          const next = { ...prev };
          delete next[product.id];
          return next;
        }
        return prev;
      });

      onRefresh();
    } catch (err) {
      // Revert optimistic state with notification
      notifyError(err, `Failed to update inventory stock for ${product.name}.`, () => {
        inFlightStockRequests.current.delete(product.id);
        setOptimisticStockOverrides((prev) => {
          const copy = { ...prev };
          delete copy[product.id];
          return copy;
        });
      });
    }
  };

  const handleDeleteProductAction = async (prodId: string) => {
    const targetProd = storeProducts.find((p) => p.id === prodId);
    if (!window.confirm(isRtl ? 'هل أنت تأكد من حذف هذا المنتج؟' : `Are you sure you want to delete "${targetProd?.name || 'this product'}" from catalog?`)) {
      return;
    }

    try {
      await deleteProduct(prodId);
      notifySuccess(`Product "${targetProd?.name || prodId}" deleted.`);
      onRefresh();
    } catch (err) {
      notifyError(err, `Failed to delete product.`);
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

  const handleOpenEditProduct = (prod: Product) => {
    if (onOpenEditProductCustom) {
      onOpenEditProductCustom(prod);
    } else {
      setEditingFullProduct(prod);
    }
  };

  const handleDeleteSupplierAction = async (supId: string) => {
    try {
      await deleteSupplier(supId);
      notifySuccess('Supplier deleted.');
      onRefresh();
    } catch (err) {
      notifyError(err, 'Failed to delete supplier.');
    }
  };

  const handleSnapProductPhoto = (targetProduct: Product | null = null, preferLiveViewfinder: boolean = false) => {
    if (onSnapProductPhoto) {
      onSnapProductPhoto(targetProduct, preferLiveViewfinder);
    }
  };

  // --- RECONCILIATION STATE & ACTIONS ---
  const [settlementRiderId, setSettlementRiderId] = useState<string>(storeRiders[0]?.id || '');
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [settlementNotes, setSettlementNotes] = useState<string>('');
  const [showShiftReconciliationModal, setShowShiftReconciliationModal] = useState<boolean>(false);

  useEffect(() => {
    if (!settlementRiderId && storeRiders[0]?.id) {
      setSettlementRiderId(storeRiders[0].id);
    }
  }, [storeRiders, settlementRiderId]);

  const currentSettlementRider = useMemo(() => {
    return storeRiders.find((r) => r.id === settlementRiderId) || storeRiders[0];
  }, [storeRiders, settlementRiderId]);

  const riderCompletedOrders = useMemo(() => {
    return storeOrders.filter(
      (o) => o.riderId === currentSettlementRider?.id && o.status === 'delivered'
    );
  }, [storeOrders, currentSettlementRider]);

  const expectedCashTotalFils = useMemo(() => {
    return riderCompletedOrders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + Math.round((o.total || 0) * 100), 0);
  }, [riderCompletedOrders]);

  const expectedCashTotal = expectedCashTotalFils / 100;
  const hasActualCashEntered = actualCashInput.trim() !== '';
  const parsedActualCash = hasActualCashEntered ? parseFloat(actualCashInput) || 0 : 0;
  const actualCashFils = hasActualCashEntered ? Math.round(parsedActualCash * 100) : 0;
  const cashVarianceFils = hasActualCashEntered ? actualCashFils - expectedCashTotalFils : 0;
  const cashVariance = cashVarianceFils / 100;
  const isSettlementBalanced = hasActualCashEntered && cashVarianceFils === 0;

  const handleSubmitSettlementAction = async (statusOverride?: 'approved' | 'disputed') => {
    if (!currentSettlementRider) return;
    const finalStatus = statusOverride || (isSettlementBalanced ? 'approved' : 'disputed');
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
      setActualCashInput('');
      setSettlementNotes('');
      notifySuccess(`Cash settlement recorded for rider ${currentSettlementRider.name} (${finalStatus.toUpperCase()}).`);
      onRefresh();
    } catch (err) {
      notifyError(err, 'Failed to submit rider cash settlement.');
    }
  };

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
      'Export Date',
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
        `"${now.toLocaleDateString()}"`,
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
    notifySuccess('Customer Khata Statement CSV exported.');
  };

  const contextValue: MerchantStoreContextType = {
    state,
    store,
    lang,
    isRtl,
    t,
    tierAccess,
    onRefresh,
    handleOpenUpgradeModal,
    storeOrders,
    storeProducts,
    storeRiders,
    suppliers,
    newOrders,
    packingOrders,
    outForDeliveryOrders,
    batchableBuildings,
    selectedOrder,
    setSelectedOrder,
    selectedRiderId,
    setSelectedRiderId,
    handleAcceptOrder,
    handleTogglePackedItem,
    handleDispatchOrder,
    handleBatchDispatch,
    invSearch,
    setInvSearch,
    invFilter,
    setInvFilter,
    optimisticStockOverrides,
    getEffectiveStock,
    getProductThreshold,
    isProductLowStock,
    lowStockProducts,
    productSalesVelocity,
    deadStockProducts,
    slowMoversAndDeadProducts,
    showLowStockAlerts,
    setShowLowStockAlerts,
    isAlertDismissed,
    setIsAlertDismissed,
    defaultStockThreshold,
    setDefaultStockThreshold,
    editingThresholdProduct,
    setEditingThresholdProduct,
    thresholdInputVal,
    setThresholdInputVal,
    handleUpdateProductThreshold,
    handleToggleProductStock,
    handleProductStockDelta,
    handleDeleteProductAction,
    handleOpenSaleModal,
    handleSaveProductSale,
    handleQuickPutOnSale,
    handleSendSupplierReturnWhatsApp,
    handleOpenReorderModal,
    handleSendSupplierWhatsAppOrder,
    handleOpenEditProduct,
    handleDeleteSupplierAction,
    handleSnapProductPhoto,
    showAddProductModal,
    setShowAddProductModal,
    showDeadStockModal,
    setShowDeadStockModal,
    showSupplierModal,
    setShowSupplierModal,
    editingSaleProduct,
    setEditingSaleProduct,
    salePriceInput,
    setSalePriceInput,
    regularPriceInput,
    setRegularPriceInput,
    saleIsOn,
    setSaleIsOn,
    reorderProduct,
    setReorderProduct,
    reorderQty,
    setReorderQty,
    editingFullProduct,
    setEditingFullProduct,
    settlementRiderId,
    setSettlementRiderId,
    actualCashInput,
    setActualCashInput,
    settlementNotes,
    setSettlementNotes,
    currentSettlementRider,
    riderCompletedOrders,
    expectedCashTotal,
    hasActualCashEntered,
    parsedActualCash,
    cashVariance,
    isSettlementBalanced,
    handleSubmitSettlementAction,
    handleExportKhataCSV,
    showShiftReconciliationModal,
    setShowShiftReconciliationModal,
  };

  return (
    <MerchantStoreContext.Provider value={contextValue}>
      {children}
    </MerchantStoreContext.Provider>
  );
};

export function useMerchantStore(): MerchantStoreContextType {
  const context = useContext(MerchantStoreContext);
  if (!context) {
    throw new Error('useMerchantStore must be used within a MerchantStoreProvider');
  }
  return context;
}
