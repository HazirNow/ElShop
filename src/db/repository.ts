import { db, withDbRetry, isPostgresAvailable } from './index.ts';
import {
  stores,
  products,
  customers,
  orders,
  khataTransactions,
  riders,
  settlements,
  suppliers,
  adminConfig,
  systemMetadata,
} from './schema.ts';
import { eq, desc, asc, sql } from 'drizzle-orm';
import {
  AppState,
  Store,
  Product,
  ProductCategory,
  CustomerProfile,
  Order,
  Rider,
  Settlement,
  Supplier,
  KhataTransaction,
} from '../types.ts';
import {
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_RIDERS,
  INITIAL_SETTLEMENTS,
  INITIAL_SUPPLIERS,
  INITIAL_APP_STATE,
} from '../seedData.ts';

// In-Memory Database Store for environments without PostgreSQL / fallback mode
class MemoryDataStore {
  public stores: Store[] = [];
  public products: Product[] = [];
  public orders: Order[] = [];
  public riders: Rider[] = [];
  public settlements: Settlement[] = [];
  public customers: CustomerProfile[] = [];
  public suppliers: Supplier[] = [];
  public khataTransactions: KhataTransaction[] = [];
  public nextOrderSeq: number = 1004;
  public adminConfig: { breakEvenOrdersThreshold: number } = { breakEvenOrdersThreshold: 139 };
  private initialized: boolean = false;

  public initIfEmpty() {
    if (this.initialized && this.stores.length > 0) return;
    this.reset();
  }

  public reset() {
    this.stores = JSON.parse(JSON.stringify(INITIAL_STORES));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.riders = JSON.parse(JSON.stringify(INITIAL_RIDERS));
    this.settlements = JSON.parse(JSON.stringify(INITIAL_SETTLEMENTS));
    this.customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
    this.suppliers = JSON.parse(JSON.stringify(INITIAL_SUPPLIERS));
    this.khataTransactions = [];
    this.nextOrderSeq = 1004;
    this.adminConfig = { breakEvenOrdersThreshold: 139 };

    // Initialize Khata transactions from initial orders
    for (const o of this.orders) {
      if (o.paymentMethod === 'khata') {
        this.khataTransactions.push({
          id: `kt-init-${o.id}`,
          customerId: o.customerId,
          customerPhone: o.customerPhone,
          storeId: o.storeId,
          orderId: o.id,
          type: 'debit',
          amount: o.total,
          timestamp: o.createdAt,
          note: `Initial order ${o.id}`,
        });
      }
    }
    this.initialized = true;
  }
}

declare global {
  var _memoryDataStore: MemoryDataStore | undefined;
}

const memoryStore = global._memoryDataStore || (global._memoryDataStore = new MemoryDataStore());
memoryStore.initIfEmpty();

/**
 * Checks if active database is connected
 */
export async function isDatabaseConnected(): Promise<{ connected: boolean; engine: 'postgresql' | 'in-memory' }> {
  const pgOk = await isPostgresAvailable();
  return {
    connected: true,
    engine: pgOk ? 'postgresql' : 'in-memory',
  };
}

/**
 * Ensures seed data exists in DB or Memory
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    return;
  }

  return withDbRetry(async () => {
    try {
      const existingStores = await db.select().from(stores).limit(1);
      if (existingStores.length > 0) {
        return;
      }

      console.log('[DB] Seeding Cloud SQL PostgreSQL with initial application state...');

      // 1. Stores
      for (const s of INITIAL_STORES) {
        await db.insert(stores).values({
          id: s.id,
          name: s.name,
          nameAr: s.nameAr,
          area: s.area,
          phone: s.phone,
          whatsappNumber: s.whatsappNumber || null,
          merchantName: s.merchantName || null,
          rating: s.rating,
          image: s.image,
          monthlyOrders: s.monthlyOrders,
          subscriptionFee: s.subscriptionFee,
          hasDispute: s.hasDispute,
          disputeNotes: s.disputeNotes || null,
          storeColor: s.storeColor || null,
          pin: s.pin || '1234',
          riderPin: s.riderPin || '5678',
          merchantEmail: s.merchantEmail || null,
          paymentStatus: s.paymentStatus || 'paid',
          overdueDays: s.overdueDays || 0,
          overdueDueDate: s.overdueDueDate || null,
          servicePaused: s.servicePaused || false,
          adminExplicitOverride: s.adminExplicitOverride || false,
          adminExplicitOverrideReason: s.adminExplicitOverrideReason || null,
          adminExplicitOverrideAt: s.adminExplicitOverrideAt || null,
          lastReminderSentAt: s.lastReminderSentAt || null,
          reminderCount: s.reminderCount || 0,
        }).onConflictDoNothing();
      }

      // 2. Customers
      for (const c of INITIAL_CUSTOMERS) {
        await db.insert(customers).values({
          id: c.id,
          name: c.name,
          phone: c.phone,
          building: c.building,
          unit: c.unit,
          isKhataPreApproved: c.isKhataPreApproved,
          creditLimit: c.creditLimit || 500,
        }).onConflictDoNothing();
      }

      // 3. Products
      for (const p of INITIAL_PRODUCTS) {
        await db.insert(products).values({
          id: p.id,
          storeId: p.storeId,
          name: p.name,
          nameAr: p.nameAr,
          category: p.category,
          price: p.price,
          regularPrice: p.regularPrice || null,
          discountedPrice: p.discountedPrice || null,
          sale: p.sale || false,
          unit: p.unit,
          unitAr: p.unitAr,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold || 5,
          inStock: p.inStock,
          image: p.image,
          supplierId: p.supplierId || null,
          supplierPhone: p.supplierPhone || null,
          expiryDate: p.expiryDate || null,
        }).onConflictDoNothing();
      }

      // 4. Riders
      for (const r of INITIAL_RIDERS) {
        await db.insert(riders).values({
          id: r.id,
          storeId: r.storeId,
          name: r.name,
          phone: r.phone,
          avatar: r.avatar,
          vehicle: r.vehicle,
          activeOrdersCount: r.activeOrdersCount,
        }).onConflictDoNothing();
      }

      // 5. Settlements
      for (const set of INITIAL_SETTLEMENTS) {
        await db.insert(settlements).values({
          id: set.id,
          storeId: set.storeId,
          riderId: set.riderId,
          riderName: set.riderName,
          expectedCash: set.expectedCash,
          actualCash: set.actualCash,
          variance: set.variance,
          status: set.status,
          notes: set.notes || null,
          shiftDate: set.shiftDate || null,
          settledBy: set.settledBy || null,
          updatedAt: set.updatedAt,
        }).onConflictDoNothing();
      }

      // 6. Suppliers
      for (const sup of INITIAL_SUPPLIERS) {
        await db.insert(suppliers).values({
          id: sup.id,
          storeId: sup.storeId,
          name: sup.name,
          nameAr: sup.nameAr || null,
          phone: sup.phone,
          category: sup.category || null,
        }).onConflictDoNothing();
      }

      // 7. Orders & Initial Khata Ledger
      for (const o of INITIAL_ORDERS) {
        await db.insert(orders).values({
          id: o.id,
          storeId: o.storeId,
          customerId: o.customerId,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          building: o.building,
          unit: o.unit,
          items: o.items as any,
          subtotal: o.subtotal,
          deliveryFee: o.deliveryFee,
          total: o.total,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          status: o.status,
          riderId: o.riderId || null,
          riderName: o.riderName || null,
          customerNote: o.customerNote || null,
          createdAt: o.createdAt,
          packedItems: o.packedItems as any,
          paidAmount: o.paidAmount || 0,
          chatMessages: o.chatMessages as any,
        }).onConflictDoNothing();

        if (o.paymentMethod === 'khata') {
          await db.insert(khataTransactions).values({
            id: `kt-init-${o.id}`,
            customerId: o.customerId,
            customerPhone: o.customerPhone,
            storeId: o.storeId,
            orderId: o.id,
            type: 'debit',
            amount: o.total,
            timestamp: o.createdAt,
            note: `Initial order ${o.id}`,
          }).onConflictDoNothing();
        }
      }

      // 8. Admin Config & Next Order Sequence
      await db.insert(adminConfig).values({
        id: 'default',
        breakEvenOrdersThreshold: 139,
      }).onConflictDoNothing();

      await db.insert(systemMetadata).values({
        key: 'next_order_seq',
        value: '1004',
      }).onConflictDoNothing();

      console.log('[DB] Seeding completed successfully.');
    } catch (error) {
      console.error('[DB] Seeding error, switching to Memory Store:', error);
      memoryStore.initIfEmpty();
    }
  });
}

/**
 * Authoritative Khata Balance from Transaction Ledger
 * Balance = SUM(debit) - SUM(credit)
 */
export async function getCustomerKhataBalanceFromDb(customerId: string): Promise<number> {
  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    const txs = memoryStore.khataTransactions.filter((t) => t.customerId === customerId);
    let debits = 0;
    let credits = 0;
    for (const t of txs) {
      if (t.type === 'debit') debits += Number(t.amount) || 0;
      if (t.type === 'credit') credits += Number(t.amount) || 0;
    }
    return Math.max(0, parseFloat((debits - credits).toFixed(2)));
  }

  return withDbRetry(async () => {
    try {
      const rows = await db
        .select({
          debits: sql<number>`COALESCE(SUM(CASE WHEN ${khataTransactions.type} = 'debit' THEN ${khataTransactions.amount} ELSE 0 END), 0)`,
          credits: sql<number>`COALESCE(SUM(CASE WHEN ${khataTransactions.type} = 'credit' THEN ${khataTransactions.amount} ELSE 0 END), 0)`,
        })
        .from(khataTransactions)
        .where(eq(khataTransactions.customerId, customerId));

      if (rows.length === 0) return 0;
      const balance = Number(rows[0].debits) - Number(rows[0].credits);
      return Math.max(0, parseFloat(balance.toFixed(2)));
    } catch (error) {
      const txs = memoryStore.khataTransactions.filter((t) => t.customerId === customerId);
      const debits = txs.filter((t) => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
      const credits = txs.filter((t) => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
      return Math.max(0, parseFloat((debits - credits).toFixed(2)));
    }
  });
}

/**
 * Fetch Full AppState with optional storeId filtering
 */
export async function getAppStateFromDb(storeFilterId?: string): Promise<AppState> {
  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    const allStores = memoryStore.stores;
    const allProducts = memoryStore.products;
    const allOrders = [...memoryStore.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const allRiders = memoryStore.riders;
    const allSettlements = [...memoryStore.settlements].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const allCustomers = memoryStore.customers;
    const allSuppliers = memoryStore.suppliers;
    const allKhataTx = [...memoryStore.khataTransactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const filteredStores = storeFilterId ? allStores.filter((s) => s.id === storeFilterId) : allStores;
    const filteredProducts = storeFilterId ? allProducts.filter((p) => p.storeId === storeFilterId) : allProducts;
    const filteredOrders = storeFilterId ? allOrders.filter((o) => o.storeId === storeFilterId) : allOrders;
    const filteredRiders = storeFilterId ? allRiders.filter((r) => r.storeId === storeFilterId) : allRiders;
    const filteredSettlements = storeFilterId ? allSettlements.filter((s) => s.storeId === storeFilterId) : allSettlements;
    const filteredSuppliers = storeFilterId ? allSuppliers.filter((s) => s.storeId === storeFilterId) : allSuppliers;
    const filteredKhataTx = storeFilterId ? allKhataTx.filter((t) => t.storeId === storeFilterId) : allKhataTx;

    return {
      stores: filteredStores,
      products: filteredProducts,
      orders: filteredOrders,
      riders: filteredRiders,
      settlements: filteredSettlements,
      customers: allCustomers,
      suppliers: filteredSuppliers,
      khataTransactions: filteredKhataTx,
      nextOrderSeq: memoryStore.nextOrderSeq,
      adminConfig: {
        breakEvenOrdersThreshold: memoryStore.adminConfig.breakEvenOrdersThreshold || 139,
      },
    };
  }

  return withDbRetry(async () => {
    try {
      await seedDatabaseIfEmpty();

      const [
        allStores,
        allProducts,
        allOrders,
        allRiders,
        allSettlements,
        allCustomers,
        allSuppliers,
        allKhataTx,
        cfg,
        seqMeta,
      ] = await Promise.all([
        db.select().from(stores),
        db.select().from(products),
        db.select().from(orders).orderBy(desc(orders.createdAt)),
        db.select().from(riders),
        db.select().from(settlements).orderBy(desc(settlements.updatedAt)),
        db.select().from(customers),
        db.select().from(suppliers),
        db.select().from(khataTransactions).orderBy(desc(khataTransactions.timestamp)),
        db.select().from(adminConfig).where(eq(adminConfig.id, 'default')),
        db.select().from(systemMetadata).where(eq(systemMetadata.key, 'next_order_seq')),
      ]);

      const nextOrderSeq = seqMeta.length > 0 ? parseInt(seqMeta[0].value, 10) || 1004 : 1004;

      const filteredStores = storeFilterId ? allStores.filter((s) => s.id === storeFilterId) : allStores;
      const filteredProducts = storeFilterId ? allProducts.filter((p) => p.storeId === storeFilterId) : allProducts;
      const filteredOrders = storeFilterId ? allOrders.filter((o) => o.storeId === storeFilterId) : allOrders;
      const filteredRiders = storeFilterId ? allRiders.filter((r) => r.storeId === storeFilterId) : allRiders;
      const filteredSettlements = storeFilterId ? allSettlements.filter((s) => s.storeId === storeFilterId) : allSettlements;
      const filteredSuppliers = storeFilterId ? allSuppliers.filter((s) => s.storeId === storeFilterId) : allSuppliers;
      const filteredKhataTx = storeFilterId ? allKhataTx.filter((t) => t.storeId === storeFilterId) : allKhataTx;

      return {
        stores: filteredStores as Store[],
        products: filteredProducts as Product[],
        orders: filteredOrders as Order[],
        riders: filteredRiders as Rider[],
        settlements: filteredSettlements as Settlement[],
        customers: allCustomers as CustomerProfile[],
        suppliers: filteredSuppliers as Supplier[],
        khataTransactions: filteredKhataTx as KhataTransaction[],
        nextOrderSeq,
        adminConfig: {
          breakEvenOrdersThreshold: cfg.length > 0 ? cfg[0].breakEvenOrdersThreshold : 139,
        },
      };
    } catch (error) {
      console.warn('[DB] Failed to fetch AppState from Postgres, falling back to memoryStore:', error);
      return getAppStateFromDb(storeFilterId);
    }
  });
}

/**
 * Atomic Order Placement with ACID consistency
 */
export async function createOrderInDb(orderInput: {
  storeId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  building: string;
  unit: string;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: 'cash' | 'card' | 'khata';
  customerNote?: string;
}): Promise<{ order: Order; balance?: number; creditLimit?: number; remainingCredit?: number }> {
  const pgOk = await isPostgresAvailable();

  // In-Memory Order Placement
  if (!pgOk) {
    memoryStore.initIfEmpty();
    const store = memoryStore.stores.find((s) => s.id === orderInput.storeId);
    if (!store) throw new Error('Store not found');

    let customer = memoryStore.customers.find((c) => c.id === orderInput.customerId);
    if (!customer) {
      customer = {
        id: orderInput.customerId || `cust-${Date.now()}`,
        name: orderInput.customerName,
        phone: orderInput.customerPhone,
        building: orderInput.building,
        unit: orderInput.unit,
        isKhataPreApproved: orderInput.paymentMethod === 'khata',
        creditLimit: 500,
      };
      memoryStore.customers.push(customer);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const enrichedItems: Array<{
      productId: string;
      name: string;
      nameAr: string;
      price: number;
      quantity: number;
      unit: string;
    }> = [];

    let subtotal = 0;
    for (const item of orderInput.items) {
      const prod = memoryStore.products.find((p) => p.id === item.productId);
      if (!prod) throw new Error(`Product ${item.productId} not found`);
      if (prod.expiryDate && prod.expiryDate < todayStr) {
        throw new Error(`Product "${prod.name}" is expired`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Requested: ${item.quantity}, Available: ${prod.stock}`);
      }

      const effPrice = prod.sale && prod.discountedPrice !== null ? prod.discountedPrice : (prod.regularPrice || prod.price);
      subtotal += effPrice * item.quantity;
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.inStock = prod.stock > 0;

      enrichedItems.push({
        productId: prod.id,
        name: prod.name,
        nameAr: prod.nameAr,
        price: effPrice,
        quantity: item.quantity,
        unit: prod.unit,
      });
    }

    const deliveryFee = subtotal < 25 ? 3.50 : 0;
    const total = parseFloat((subtotal + deliveryFee).toFixed(2));

    let customerCurrentBalance = 0;
    const creditLimit = customer.creditLimit || 500;

    if (orderInput.paymentMethod === 'khata') {
      customerCurrentBalance = await getCustomerKhataBalanceFromDb(customer.id);
      if (customerCurrentBalance + total > creditLimit) {
        const headroom = Math.max(0, parseFloat((creditLimit - customerCurrentBalance).toFixed(2)));
        const err: any = new Error(
          `Credit limit exceeded. Current balance: AED ${customerCurrentBalance.toFixed(2)}, limit: AED ${creditLimit.toFixed(2)}, available headroom: AED ${headroom.toFixed(2)}.`
        );
        err.statusCode = 400;
        err.details = {
          currentBalance: customerCurrentBalance,
          creditLimit,
          headroom,
          attemptedOrderTotal: total,
        };
        throw err;
      }
    }

    const orderSeq = memoryStore.nextOrderSeq++;
    const orderId = `ELS-${orderSeq}`;
    const nowIso = new Date().toISOString();

    const initialChat = [
      {
        id: `m-${Date.now()}-1`,
        sender: 'system' as const,
        text: orderInput.paymentMethod === 'khata'
          ? 'Order placed on Khata credit account!'
          : 'Order received by the store!',
        textAr: orderInput.paymentMethod === 'khata'
          ? 'تم تسجيل الطلب على دفتر الحساب (الخاتة)!'
          : 'تم استلام الطلب من قبل المتجر!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    const createdOrder: Order = {
      id: orderId,
      storeId: orderInput.storeId,
      customerId: customer.id,
      customerName: orderInput.customerName,
      customerPhone: orderInput.customerPhone,
      building: orderInput.building,
      unit: orderInput.unit,
      items: enrichedItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: orderInput.paymentMethod,
      paymentStatus: orderInput.paymentMethod === 'khata' ? 'khata_debited' : 'pending',
      status: 'placed',
      customerNote: orderInput.customerNote || undefined,
      createdAt: nowIso,
      packedItems: [],
      paidAmount: 0,
      chatMessages: initialChat,
    };

    memoryStore.orders.unshift(createdOrder);

    if (orderInput.paymentMethod === 'khata') {
      memoryStore.khataTransactions.push({
        id: `kt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        customerId: customer.id,
        customerPhone: orderInput.customerPhone,
        storeId: orderInput.storeId,
        orderId: orderId,
        type: 'debit',
        amount: total,
        timestamp: nowIso,
        note: `Order ${orderId}`,
      });
    }

    store.monthlyOrders = (store.monthlyOrders || 0) + 1;

    return {
      order: createdOrder,
      balance: orderInput.paymentMethod === 'khata' ? customerCurrentBalance + total : undefined,
      creditLimit: orderInput.paymentMethod === 'khata' ? creditLimit : undefined,
      remainingCredit: orderInput.paymentMethod === 'khata' ? creditLimit - (customerCurrentBalance + total) : undefined,
    };
  }

  // PostgreSQL Execution
  try {
    return await db.transaction(async (tx) => {
      const storeList = await tx.select().from(stores).where(eq(stores.id, orderInput.storeId));
      if (storeList.length === 0) throw new Error('Store not found');

      let customerList = await tx.select().from(customers).where(eq(customers.id, orderInput.customerId));
      let customer = customerList[0];

      if (!customer) {
        const newCustId = orderInput.customerId || `cust-${Date.now()}`;
        const inserted = await tx.insert(customers).values({
          id: newCustId,
          name: orderInput.customerName,
          phone: orderInput.customerPhone,
          building: orderInput.building,
          unit: orderInput.unit,
          isKhataPreApproved: orderInput.paymentMethod === 'khata',
          creditLimit: 500,
        }).returning();
        customer = inserted[0];
      }

      const enrichedItems: Array<{
        productId: string;
        name: string;
        nameAr: string;
        price: number;
        quantity: number;
        unit: string;
      }> = [];

      let subtotal = 0;
      for (const item of orderInput.items) {
        const prodRows = await tx.select().from(products).where(eq(products.id, item.productId));
        if (prodRows.length === 0) throw new Error(`Product ${item.productId} not found`);
        const prod = prodRows[0];
        const effPrice = prod.sale && prod.discountedPrice !== null ? prod.discountedPrice : (prod.regularPrice || prod.price);
        subtotal += effPrice * item.quantity;

        const updatedStock = Math.max(0, prod.stock - item.quantity);
        await tx.update(products).set({
          stock: updatedStock,
          inStock: updatedStock > 0,
        }).where(eq(products.id, prod.id));

        enrichedItems.push({
          productId: prod.id,
          name: prod.name,
          nameAr: prod.nameAr,
          price: effPrice,
          quantity: item.quantity,
          unit: prod.unit,
        });
      }

      const deliveryFee = subtotal < 25 ? 3.50 : 0;
      const total = parseFloat((subtotal + deliveryFee).toFixed(2));

      let customerCurrentBalance = 0;
      const creditLimit = customer.creditLimit || 500;

      if (orderInput.paymentMethod === 'khata') {
        const txRows = await tx
          .select({
            debits: sql<number>`COALESCE(SUM(CASE WHEN ${khataTransactions.type} = 'debit' THEN ${khataTransactions.amount} ELSE 0 END), 0)`,
            credits: sql<number>`COALESCE(SUM(CASE WHEN ${khataTransactions.type} = 'credit' THEN ${khataTransactions.amount} ELSE 0 END), 0)`,
          })
          .from(khataTransactions)
          .where(eq(khataTransactions.customerId, customer.id));

        customerCurrentBalance = txRows.length > 0 ? Number(txRows[0].debits) - Number(txRows[0].credits) : 0;
        customerCurrentBalance = Math.max(0, parseFloat(customerCurrentBalance.toFixed(2)));

        if (customerCurrentBalance + total > creditLimit) {
          const headroom = Math.max(0, parseFloat((creditLimit - customerCurrentBalance).toFixed(2)));
          const err: any = new Error(
            `Credit limit exceeded. Current balance: AED ${customerCurrentBalance.toFixed(2)}, limit: AED ${creditLimit.toFixed(2)}, available headroom: AED ${headroom.toFixed(2)}.`
          );
          err.statusCode = 400;
          err.details = {
            currentBalance: customerCurrentBalance,
            creditLimit,
            headroom,
            attemptedOrderTotal: total,
          };
          throw err;
        }
      }

      const [seqRow] = await tx
        .insert(systemMetadata)
        .values({ key: 'next_order_seq', value: '1004' })
        .onConflictDoUpdate({
          target: systemMetadata.key,
          set: { value: sql`(${systemMetadata.value}::integer + 1)::text` },
        })
        .returning({ value: systemMetadata.value });
      const orderId = `ELS-${seqRow.value}`;

      const nowIso = new Date().toISOString();
      const initialChat = [
        {
          id: `m-${Date.now()}-1`,
          sender: 'system',
          text: orderInput.paymentMethod === 'khata'
            ? 'Order placed on Khata credit account!'
            : 'Order received by the store!',
          textAr: orderInput.paymentMethod === 'khata'
            ? 'تم تسجيل الطلب على دفتر الحساب (الخاتة)!'
            : 'تم استلام الطلب من قبل المتجر!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];

      const insertedOrders = await tx.insert(orders).values({
        id: orderId,
        storeId: orderInput.storeId,
        customerId: customer.id,
        customerName: orderInput.customerName,
        customerPhone: orderInput.customerPhone,
        building: orderInput.building,
        unit: orderInput.unit,
        items: enrichedItems as any,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: orderInput.paymentMethod,
        paymentStatus: orderInput.paymentMethod === 'khata' ? 'khata_debited' : 'pending',
        status: 'placed',
        customerNote: orderInput.customerNote || null,
        createdAt: nowIso,
        packedItems: [] as any,
        paidAmount: 0,
        chatMessages: initialChat as any,
      }).returning();

      const createdOrder = insertedOrders[0] as unknown as Order;

      if (orderInput.paymentMethod === 'khata') {
        await tx.insert(khataTransactions).values({
          id: `kt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          customerId: customer.id,
          customerPhone: orderInput.customerPhone,
          storeId: orderInput.storeId,
          orderId: orderId,
          type: 'debit',
          amount: total,
          timestamp: nowIso,
          note: `Order ${orderId}`,
        });
      }

      await tx.update(stores).set({
        monthlyOrders: sql`${stores.monthlyOrders} + 1`,
      }).where(eq(stores.id, orderInput.storeId));

      return {
        order: createdOrder,
        balance: orderInput.paymentMethod === 'khata' ? customerCurrentBalance + total : undefined,
        creditLimit: orderInput.paymentMethod === 'khata' ? creditLimit : undefined,
        remainingCredit: orderInput.paymentMethod === 'khata' ? creditLimit - (customerCurrentBalance + total) : undefined,
      };
    });
  } catch (error) {
    console.error('[DB] createOrder failed on Postgres, using memoryStore fallback:', error);
    return createOrderInDb(orderInput);
  }
}

/**
 * Append items to an active order
 */
export async function addItemsToOrderInDb(
  orderId: string,
  items: Array<{ productId: string; quantity: number }>
): Promise<Order> {
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.initIfEmpty();
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'placed' && order.status !== 'packing') {
      throw new Error(`Cannot add items to order in "${order.status}" status.`);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const verifiedNewItems: any[] = [];
    let addedSubtotal = 0;

    for (const item of items) {
      const prod = memoryStore.products.find((p) => p.id === item.productId);
      if (!prod) throw new Error(`Product ${item.productId} not found`);
      if (prod.expiryDate && prod.expiryDate < todayStr) throw new Error(`Product "${prod.name}" is expired`);
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) throw new Error(`Invalid quantity for ${prod.name}`);
      if (prod.stock < qty) throw new Error(`Insufficient stock for "${prod.name}"`);

      const effPrice = prod.sale && prod.discountedPrice !== null ? prod.discountedPrice : (prod.regularPrice || prod.price);
      prod.stock = Math.max(0, prod.stock - qty);
      prod.inStock = prod.stock > 0;

      verifiedNewItems.push({
        productId: prod.id,
        name: prod.name,
        nameAr: prod.nameAr,
        price: effPrice,
        quantity: qty,
        unit: prod.unit,
      });
      addedSubtotal += effPrice * qty;
    }

    if (order.paymentMethod === 'khata') {
      const currentDebt = await getCustomerKhataBalanceFromDb(order.customerId);
      const cust = memoryStore.customers.find((c) => c.id === order.customerId);
      const limit = cust?.creditLimit || 500;
      if (currentDebt + addedSubtotal > limit) {
        throw new Error(`Adding items exceeds Khata limit (${limit} AED). Current balance: ${currentDebt.toFixed(2)} AED.`);
      }
    }

    for (const newItem of verifiedNewItems) {
      const match = order.items.find((it) => it.productId === newItem.productId);
      if (match) {
        match.quantity += newItem.quantity;
      } else {
        order.items.push(newItem);
      }
    }

    const newSubtotal = order.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const newDeliveryFee = newSubtotal < 25 ? 3.50 : 0;
    const newTotal = parseFloat((newSubtotal + newDeliveryFee).toFixed(2));

    order.subtotal = parseFloat(newSubtotal.toFixed(2));
    order.deliveryFee = parseFloat(newDeliveryFee.toFixed(2));
    order.total = newTotal;

    order.chatMessages.push({
      id: `m-${Date.now()}`,
      sender: 'system',
      text: `Added ${verifiedNewItems.length} new item(s) to order. Updated Total: ${newTotal.toFixed(2)} AED`,
      textAr: `تمت إضافة منتجات جديدة للطلب. الإجمالي المحدث: ${newTotal.toFixed(2)} درهم`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    if (order.paymentMethod === 'khata') {
      memoryStore.khataTransactions.push({
        id: `kt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        customerId: order.customerId,
        customerPhone: order.customerPhone,
        storeId: order.storeId,
        orderId: order.id,
        type: 'debit',
        amount: addedSubtotal,
        timestamp: new Date().toISOString(),
        note: `Added items to order ${order.id}`,
      });
    }

    return order;
  }

  // Postgres implementation
  const orderRows = await db.select().from(orders).where(eq(orders.id, orderId));
  if (orderRows.length === 0) throw new Error('Order not found');
  const order = orderRows[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const verifiedNewItems: any[] = [];
  let addedSubtotal = 0;

  for (const item of items) {
    const prodRows = await db.select().from(products).where(eq(products.id, item.productId));
    if (prodRows.length === 0) throw new Error(`Product ${item.productId} not found`);
    const prod = prodRows[0];
    if (prod.expiryDate && prod.expiryDate < todayStr) throw new Error(`Product "${prod.name}" is expired`);
    const qty = Number(item.quantity);
    if (prod.stock < qty) throw new Error(`Insufficient stock for "${prod.name}"`);

    const effPrice = prod.sale && prod.discountedPrice !== null ? prod.discountedPrice : (prod.regularPrice || prod.price);
    verifiedNewItems.push({
      productId: prod.id,
      name: prod.name,
      nameAr: prod.nameAr,
      price: effPrice,
      quantity: qty,
      unit: prod.unit,
    });
    addedSubtotal += effPrice * qty;

    await db.update(products).set({
      stock: Math.max(0, prod.stock - qty),
      inStock: Math.max(0, prod.stock - qty) > 0,
    }).where(eq(products.id, prod.id));
  }

  const existingItems = (order.items as any[]) || [];
  for (const newItem of verifiedNewItems) {
    const match = existingItems.find((it) => it.productId === newItem.productId);
    if (match) match.quantity += newItem.quantity;
    else existingItems.push(newItem);
  }

  const newSubtotal = existingItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const newDeliveryFee = newSubtotal < 25 ? 3.50 : 0;
  const newTotal = parseFloat((newSubtotal + newDeliveryFee).toFixed(2));

  const existingChat = (order.chatMessages as any[]) || [];
  existingChat.push({
    id: `m-${Date.now()}`,
    sender: 'system',
    text: `Added ${verifiedNewItems.length} new item(s) to order. Updated Total: ${newTotal.toFixed(2)} AED`,
    textAr: `تمت إضافة منتجات جديدة للطلب. الإجمالي المحدث: ${newTotal.toFixed(2)} درهم`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const updatedOrders = await db.update(orders).set({
    items: existingItems as any,
    subtotal: parseFloat(newSubtotal.toFixed(2)),
    deliveryFee: parseFloat(newDeliveryFee.toFixed(2)),
    total: newTotal,
    chatMessages: existingChat as any,
  }).where(eq(orders.id, orderId)).returning();

  if (order.paymentMethod === 'khata') {
    await db.insert(khataTransactions).values({
      id: `kt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId: order.customerId,
      customerPhone: order.customerPhone,
      storeId: order.storeId,
      orderId: order.id,
      type: 'debit',
      amount: addedSubtotal,
      timestamp: new Date().toISOString(),
      note: `Added items to order ${order.id}`,
    });
  }

  return updatedOrders[0] as unknown as Order;
}

/**
 * Update Order
 */
export async function updateOrderInDb(
  orderId: string,
  updateData: {
    status?: Order['status'];
    packedItems?: string[];
    riderId?: string;
    riderName?: string;
    chatMessage?: { sender?: 'customer' | 'store' | 'system'; text: string; textAr?: string };
    paymentMethod?: 'cash' | 'card' | 'khata';
    paymentStatus?: 'pending' | 'paid' | 'khata_debited';
  }
): Promise<Order> {
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.initIfEmpty();
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    if (updateData.paymentMethod) order.paymentMethod = updateData.paymentMethod;
    if (updateData.paymentStatus) order.paymentStatus = updateData.paymentStatus;
    if (updateData.packedItems !== undefined) order.packedItems = updateData.packedItems;
    if (updateData.riderId !== undefined) {
      order.riderId = updateData.riderId;
      order.riderName = updateData.riderName;
    }

    if (updateData.status) {
      const prevStatus = order.status;
      order.status = updateData.status;

      if (updateData.status === 'cancelled' && prevStatus !== 'cancelled') {
        for (const item of order.items) {
          const prod = memoryStore.products.find((p) => p.id === item.productId);
          if (prod) {
            prod.stock += item.quantity;
            prod.inStock = true;
          }
        }
      }

      let statusTextEn = `Order status updated to ${updateData.status.replace(/_/g, ' ').toUpperCase()}.`;
      let statusTextAr = `تم تحديث حالة الطلب.`;
      if (updateData.status === 'packing') {
        statusTextEn = `Store accepted your order! Packing in progress...`;
        statusTextAr = `المتجر قبل طلبك! جاري التعبئة والتجهيز...`;
      } else if (updateData.status === 'out_for_delivery') {
        statusTextEn = `Order is out for delivery with rider ${updateData.riderName || order.riderName || 'our courier'}! 🛵`;
        statusTextAr = `الطلب خرج للتوصيل مع السائق ${updateData.riderName || order.riderName || ''}! 🛵`;
      } else if (updateData.status === 'delivered') {
        statusTextEn = `Order delivered successfully! Thank you for ordering with ElShop. 🎉`;
        statusTextAr = `تم توصيل الطلب بنجاح! شكراً لطلبكم من الشوب. 🎉`;
      } else if (updateData.status === 'failed_delivery') {
        statusTextEn = `Delivery attempted by ${updateData.riderName || order.riderName || 'runner'}, but resident was unreachable.`;
        statusTextAr = `تمت محاولة التوصيل ولكن العميل غير متاح.`;
      }

      order.chatMessages.push({
        id: `m-${Date.now()}`,
        sender: 'system',
        text: statusTextEn,
        textAr: statusTextAr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    if (updateData.chatMessage) {
      order.chatMessages.push({
        id: `m-${Date.now()}`,
        sender: updateData.chatMessage.sender || 'store',
        text: updateData.chatMessage.text,
        textAr: updateData.chatMessage.textAr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    return order;
  }

  // Postgres update
  const orderRows = await db.select().from(orders).where(eq(orders.id, orderId));
  if (orderRows.length === 0) throw new Error(`Order ${orderId} not found`);
  const order = orderRows[0];

  const dbUpdate: any = {};
  if (updateData.paymentMethod) dbUpdate.paymentMethod = updateData.paymentMethod;
  if (updateData.paymentStatus) dbUpdate.paymentStatus = updateData.paymentStatus;
  if (updateData.packedItems !== undefined) dbUpdate.packedItems = updateData.packedItems;
  if (updateData.riderId !== undefined) {
    dbUpdate.riderId = updateData.riderId;
    dbUpdate.riderName = updateData.riderName;
  }

  const currentChat = ((order.chatMessages as any[]) || []).slice();

  if (updateData.status) {
    const prevStatus = order.status;
    dbUpdate.status = updateData.status;

    if (updateData.status === 'cancelled' && prevStatus !== 'cancelled') {
      const orderItems = (order.items as any[]) || [];
      for (const item of orderItems) {
        await db.update(products).set({
          stock: sql`${products.stock} + ${item.quantity}`,
          inStock: true,
        }).where(eq(products.id, item.productId));
      }
    }

    let statusTextEn = `Order status updated to ${updateData.status.replace(/_/g, ' ').toUpperCase()}.`;
    let statusTextAr = `تم تحديث حالة الطلب.`;
    if (updateData.status === 'packing') {
      statusTextEn = `Store accepted your order! Packing in progress...`;
      statusTextAr = `المتجر قبل طلبك! جاري التعبئة والتجهيز...`;
    } else if (updateData.status === 'out_for_delivery') {
      statusTextEn = `Order is out for delivery with rider ${updateData.riderName || order.riderName || 'our courier'}! 🛵`;
      statusTextAr = `الطلب خرج للتوصيل مع السائق ${updateData.riderName || order.riderName || ''}! 🛵`;
    } else if (updateData.status === 'delivered') {
      statusTextEn = `Order delivered successfully! Thank you for ordering with ElShop. 🎉`;
      statusTextAr = `تم توصيل الطلب بنجاح! شكراً لطلبكم من الشوب. 🎉`;
    }

    currentChat.push({
      id: `m-${Date.now()}`,
      sender: 'system',
      text: statusTextEn,
      textAr: statusTextAr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  if (updateData.chatMessage) {
    currentChat.push({
      id: `m-${Date.now()}`,
      sender: updateData.chatMessage.sender || 'store',
      text: updateData.chatMessage.text,
      textAr: updateData.chatMessage.textAr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  dbUpdate.chatMessages = currentChat;

  const res = await db.update(orders).set(dbUpdate).where(eq(orders.id, orderId)).returning();
  return res[0] as unknown as Order;
}

/**
 * Add chat message to order
 */
export async function addOrderChatMessageInDb(
  orderId: string,
  message: { sender: 'customer' | 'store' | 'system'; text: string; textAr?: string }
): Promise<any> {
  const newMsg = {
    id: `m-${Date.now()}`,
    sender: message.sender,
    text: message.text,
    textAr: message.textAr,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.chatMessages.push(newMsg);
    return newMsg;
  }

  const orderRows = await db.select().from(orders).where(eq(orders.id, orderId));
  if (orderRows.length === 0) throw new Error('Order not found');
  const currentChat = (orderRows[0].chatMessages as any[]) || [];
  currentChat.push(newMsg);
  await db.update(orders).set({ chatMessages: currentChat as any }).where(eq(orders.id, orderId));
  return newMsg;
}

/**
 * Settle Customer Khata Balance
 */
export async function settleCustomerKhataInDb(
  customerId: string,
  amountToSettle: number,
  note?: string,
  settledBy?: string,
  storeId?: string,
  customerPhone?: string
): Promise<{
  settledAmount: number;
  remainingDebt: number;
  settledOrderIds: string[];
}> {
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.initIfEmpty();
    let custPhone = customerPhone;
    if (!custPhone) {
      const cust = memoryStore.customers.find((c) => c.id === customerId);
      if (cust) custPhone = cust.phone;
    }

    const totalDebt = await getCustomerKhataBalanceFromDb(customerId);
    const actualSettledAmount = parseFloat(Math.min(amountToSettle, totalDebt).toFixed(2));

    if (actualSettledAmount <= 0) {
      return { settledAmount: 0, remainingDebt: totalDebt, settledOrderIds: [] };
    }

    const nowIso = new Date().toISOString();
    memoryStore.khataTransactions.push({
      id: `kt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId,
      customerPhone: custPhone || null,
      storeId: storeId || null,
      type: 'credit',
      amount: actualSettledAmount,
      timestamp: nowIso,
      note: note || (settledBy ? `Settled by ${settledBy}` : 'Cash settlement at counter'),
    });

    const openKhataOrders = memoryStore.orders
      .filter((o) => o.customerId === customerId && o.paymentMethod === 'khata' && o.paymentStatus === 'khata_debited' && o.status !== 'cancelled')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let remainingFunds = actualSettledAmount;
    const settledOrderIds: string[] = [];

    for (const ord of openKhataOrders) {
      if (remainingFunds <= 0) break;
      const currentPaid = ord.paidAmount || 0;
      const unpaidForThisOrder = ord.total - currentPaid;

      if (remainingFunds >= unpaidForThisOrder) {
        remainingFunds -= unpaidForThisOrder;
        ord.paidAmount = ord.total;
        ord.paymentStatus = 'paid';
        settledOrderIds.push(ord.id);
      } else {
        ord.paidAmount = parseFloat((currentPaid + remainingFunds).toFixed(2));
        remainingFunds = 0;
      }
    }

    const remainingDebt = Math.max(0, parseFloat((totalDebt - actualSettledAmount).toFixed(2)));
    return { settledAmount: actualSettledAmount, remainingDebt, settledOrderIds };
  }

  // Postgres Transaction
  return await db.transaction(async (tx) => {
    let custPhone = customerPhone;
    if (!custPhone) {
      const custs = await tx.select().from(customers).where(eq(customers.id, customerId));
      if (custs.length > 0) custPhone = custs[0].phone;
    }

    const txRows = await tx
      .select({
        debits: sql<number>`COALESCE(SUM(CASE WHEN ${khataTransactions.type} = 'debit' THEN ${khataTransactions.amount} ELSE 0 END), 0)`,
        credits: sql<number>`COALESCE(SUM(CASE WHEN ${khataTransactions.type} = 'credit' THEN ${khataTransactions.amount} ELSE 0 END), 0)`,
      })
      .from(khataTransactions)
      .where(eq(khataTransactions.customerId, customerId));

    const totalDebt = txRows.length > 0 ? Math.max(0, Number(txRows[0].debits) - Number(txRows[0].credits)) : 0;
    const actualSettledAmount = parseFloat(Math.min(amountToSettle, totalDebt).toFixed(2));

    if (actualSettledAmount <= 0) {
      return { settledAmount: 0, remainingDebt: totalDebt, settledOrderIds: [] };
    }

    const nowIso = new Date().toISOString();
    await tx.insert(khataTransactions).values({
      id: `kt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId: customerId,
      customerPhone: custPhone || null,
      storeId: storeId || null,
      type: 'credit',
      amount: actualSettledAmount,
      timestamp: nowIso,
      note: note || (settledBy ? `Settled by ${settledBy}` : 'Cash settlement at counter'),
    });

    const khataOrders = await tx
      .select()
      .from(orders)
      .where(
        sql`${orders.customerId} = ${customerId} AND ${orders.paymentMethod} = 'khata' AND ${orders.paymentStatus} = 'khata_debited' AND ${orders.status} != 'cancelled'`
      )
      .orderBy(asc(orders.createdAt));

    let remainingFunds = actualSettledAmount;
    const settledOrderIds: string[] = [];

    for (const ord of khataOrders) {
      if (remainingFunds <= 0) break;
      const currentPaid = ord.paidAmount || 0;
      const unpaidForThisOrder = ord.total - currentPaid;

      if (remainingFunds >= unpaidForThisOrder) {
        remainingFunds -= unpaidForThisOrder;
        await tx.update(orders).set({
          paidAmount: ord.total,
          paymentStatus: 'paid',
        }).where(eq(orders.id, ord.id));
        settledOrderIds.push(ord.id);
      } else {
        await tx.update(orders).set({
          paidAmount: parseFloat((currentPaid + remainingFunds).toFixed(2)),
        }).where(eq(orders.id, ord.id));
        remainingFunds = 0;
      }
    }

    const remainingDebt = Math.max(0, parseFloat((totalDebt - actualSettledAmount).toFixed(2)));
    return { settledAmount: actualSettledAmount, remainingDebt, settledOrderIds };
  });
}

/**
 * Upsert Product
 */
export async function upsertProductInDb(productData: Partial<Product> & { storeId: string; name: string; price: number }): Promise<Product> {
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.initIfEmpty();
    const prodId = productData.id || `p-${Date.now()}`;
    let existing = memoryStore.products.find((p) => p.id === prodId);

    if (existing) {
      Object.assign(existing, {
        name: productData.name,
        nameAr: productData.nameAr || productData.name,
        category: productData.category || existing.category,
        price: productData.price,
        regularPrice: productData.regularPrice || null,
        discountedPrice: productData.discountedPrice || null,
        sale: productData.sale || false,
        unit: productData.unit || existing.unit,
        unitAr: productData.unitAr || existing.unitAr,
        stock: productData.stock !== undefined ? productData.stock : existing.stock,
        lowStockThreshold: productData.lowStockThreshold || existing.lowStockThreshold,
        inStock: (productData.stock !== undefined ? productData.stock : existing.stock) > 0,
        image: productData.image || existing.image,
        supplierId: productData.supplierId || existing.supplierId,
        supplierPhone: productData.supplierPhone || existing.supplierPhone,
        expiryDate: productData.expiryDate || existing.expiryDate,
      });
      return existing;
    }

    const newProd: Product = {
      id: prodId,
      storeId: productData.storeId,
      name: productData.name,
      nameAr: productData.nameAr || productData.name,
      category: productData.category || 'Pantry',
      price: productData.price,
      regularPrice: productData.regularPrice || undefined,
      discountedPrice: productData.discountedPrice || undefined,
      sale: productData.sale || false,
      unit: productData.unit || '1 pc',
      unitAr: productData.unitAr || '١ حبة',
      stock: productData.stock ?? 10,
      lowStockThreshold: productData.lowStockThreshold || 5,
      inStock: (productData.stock ?? 10) > 0,
      image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      supplierId: productData.supplierId || undefined,
      supplierPhone: productData.supplierPhone || undefined,
      expiryDate: productData.expiryDate || undefined,
    };
    memoryStore.products.push(newProd);
    return newProd;
  }

  const prodId = productData.id || `p-${Date.now()}`;
  const res = await db.insert(products).values({
    id: prodId,
    storeId: productData.storeId,
    name: productData.name,
    nameAr: productData.nameAr || productData.name,
    category: productData.category || 'Pantry',
    price: productData.price,
    regularPrice: productData.regularPrice || null,
    discountedPrice: productData.discountedPrice || null,
    sale: productData.sale || false,
    unit: productData.unit || '1 pc',
    unitAr: productData.unitAr || '١ حبة',
    stock: productData.stock ?? 10,
    lowStockThreshold: productData.lowStockThreshold || 5,
    inStock: (productData.stock ?? 10) > 0,
    image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    supplierId: productData.supplierId || null,
    supplierPhone: productData.supplierPhone || null,
    expiryDate: productData.expiryDate || null,
  }).onConflictDoUpdate({
    target: products.id,
    set: {
      name: productData.name,
      nameAr: productData.nameAr || productData.name,
      category: productData.category,
      price: productData.price,
      regularPrice: productData.regularPrice || null,
      discountedPrice: productData.discountedPrice || null,
      sale: productData.sale || false,
      unit: productData.unit,
      unitAr: productData.unitAr,
      stock: productData.stock,
      lowStockThreshold: productData.lowStockThreshold,
      inStock: (productData.stock ?? 0) > 0,
      image: productData.image,
      supplierId: productData.supplierId || null,
      supplierPhone: productData.supplierPhone || null,
      expiryDate: productData.expiryDate || null,
    },
  }).returning();

  return res[0] as Product;
}

/**
 * Delete Product
 */
export async function deleteProductInDb(productId: string): Promise<boolean> {
  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    const idx = memoryStore.products.findIndex((p) => p.id === productId);
    if (idx === -1) return false;
    memoryStore.products.splice(idx, 1);
    return true;
  }

  const res = await db.delete(products).where(eq(products.id, productId)).returning();
  return res.length > 0;
}

/**
 * Update Product Stock
 */
export async function updateProductStockInDb(
  productId: string,
  stock: number,
  lowStockThreshold?: number
): Promise<Product> {
  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    const prod = memoryStore.products.find((p) => p.id === productId);
    if (!prod) throw new Error(`Product ${productId} not found`);
    prod.stock = stock;
    prod.inStock = stock > 0;
    if (lowStockThreshold !== undefined) prod.lowStockThreshold = lowStockThreshold;
    return prod;
  }

  const updateData: any = { stock, inStock: stock > 0 };
  if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;
  const res = await db.update(products).set(updateData).where(eq(products.id, productId)).returning();
  if (res.length === 0) throw new Error(`Product ${productId} not found`);
  return res[0] as Product;
}

/**
 * Toggle Order Packed Item
 */
export async function toggleOrderPackedItemInDb(orderId: string, productId: string): Promise<Order> {
  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    const order = memoryStore.orders.find((o) => o.id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    const currentPacked = order.packedItems || [];
    order.packedItems = currentPacked.includes(productId)
      ? currentPacked.filter((id) => id !== productId)
      : [...currentPacked, productId];
    return order;
  }

  const rows = await db.select().from(orders).where(eq(orders.id, orderId));
  if (rows.length === 0) throw new Error(`Order ${orderId} not found`);
  const currentPacked = (rows[0].packedItems as string[]) || [];
  const newPacked = currentPacked.includes(productId)
    ? currentPacked.filter((id) => id !== productId)
    : [...currentPacked, productId];

  const res = await db.update(orders).set({ packedItems: newPacked as any }).where(eq(orders.id, orderId)).returning();
  return res[0] as unknown as Order;
}

/**
 * Update Order Status
 */
export async function updateOrderStatusInDb(
  orderId: string,
  status: Order['status'],
  riderId?: string,
  riderName?: string
): Promise<Order> {
  return updateOrderInDb(orderId, { status, riderId, riderName });
}

/**
 * Create Supplier
 */
export async function createSupplierInDb(supplierData: {
  storeId: string;
  name: string;
  nameAr?: string;
  phone: string;
  category?: string;
}): Promise<Supplier> {
  const newSup: Supplier = {
    id: `sup-${Date.now()}`,
    storeId: supplierData.storeId,
    name: supplierData.name,
    nameAr: supplierData.nameAr || supplierData.name,
    phone: supplierData.phone,
    category: supplierData.category,
  };

  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    memoryStore.suppliers.push(newSup);
    return newSup;
  }

  const inserted = await db.insert(suppliers).values(newSup).returning();
  return inserted[0] as Supplier;
}

/**
 * Delete Supplier
 */
export async function deleteSupplierInDb(supplierId: string): Promise<boolean> {
  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    const idx = memoryStore.suppliers.findIndex((s) => s.id === supplierId);
    if (idx === -1) return false;
    memoryStore.suppliers.splice(idx, 1);
    return true;
  }

  const res = await db.delete(suppliers).where(eq(suppliers.id, supplierId)).returning();
  return res.length > 0;
}

/**
 * Create Settlement
 */
export async function createSettlementInDb(data: {
  storeId: string;
  riderId: string;
  riderName: string;
  expectedCash: number;
  actualCash: number;
  status?: string;
  notes?: string;
  shiftDate?: string;
  settledBy?: string;
}): Promise<Settlement> {
  const safeExpected = isNaN(Number(data.expectedCash)) ? 0 : Number(data.expectedCash);
  const safeActual = isNaN(Number(data.actualCash)) ? 0 : Number(data.actualCash);
  const variance = parseFloat((safeActual - safeExpected).toFixed(2));

  const settlementObj: Settlement = {
    id: `set-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    storeId: data.storeId,
    riderId: data.riderId,
    riderName: data.riderName,
    expectedCash: parseFloat(safeExpected.toFixed(2)),
    actualCash: parseFloat(safeActual.toFixed(2)),
    variance,
    status: (data.status as any) || (variance === 0 ? 'approved' : 'disputed'),
    notes: data.notes || undefined,
    shiftDate: data.shiftDate || new Date().toISOString().split('T')[0],
    settledBy: data.settledBy || 'Store Cashier / Shift Manager',
    updatedAt: new Date().toISOString(),
  };

  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    memoryStore.settlements.unshift(settlementObj);

    const disputedCount = memoryStore.settlements.filter((s) => s.storeId === data.storeId && s.status === 'disputed').length;
    const store = memoryStore.stores.find((s) => s.id === data.storeId);
    if (store) {
      store.hasDispute = disputedCount > 0;
      store.disputeNotes = disputedCount > 0 ? `Dispute flagged for rider ${data.riderName} (Variance: ${variance.toFixed(2)} AED)` : undefined;
    }
    return settlementObj;
  }

  const inserted = await db.insert(settlements).values(settlementObj).returning();

  const disputedRows = await db
    .select()
    .from(settlements)
    .where(sql`${settlements.storeId} = ${data.storeId} AND ${settlements.status} = 'disputed'`);

  const hasAnyDispute = disputedRows.length > 0;
  await db.update(stores).set({
    hasDispute: hasAnyDispute,
    disputeNotes: hasAnyDispute ? `Dispute flagged for rider ${data.riderName} (Variance: ${variance.toFixed(2)} AED)` : null,
  }).where(eq(stores.id, data.storeId));

  return inserted[0] as unknown as Settlement;
}

/**
 * Update Customer
 */
export async function updateCustomerInDb(customerId: string, updateData: Partial<CustomerProfile>): Promise<CustomerProfile> {
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.initIfEmpty();
    const cust = memoryStore.customers.find((c) => c.id === customerId);
    if (!cust) throw new Error('Customer profile not found');
    Object.assign(cust, updateData);
    return cust;
  }

  const dbUpdate: any = {};
  if (updateData.isKhataPreApproved !== undefined) dbUpdate.isKhataPreApproved = Boolean(updateData.isKhataPreApproved);
  if (updateData.creditLimit !== undefined) dbUpdate.creditLimit = Math.max(0, Number(updateData.creditLimit));
  if (updateData.name !== undefined) dbUpdate.name = updateData.name;
  if (updateData.phone !== undefined) dbUpdate.phone = updateData.phone;
  if (updateData.building !== undefined) dbUpdate.building = updateData.building;
  if (updateData.unit !== undefined) dbUpdate.unit = updateData.unit;

  const updated = await db.update(customers).set(dbUpdate).where(eq(customers.id, customerId)).returning();
  if (updated.length === 0) throw new Error('Customer profile not found');
  return updated[0] as CustomerProfile;
}

/**
 * Create Store
 */
export async function createStoreInDb(storeData: any): Promise<Store> {
  const newStoreId = `store-${Date.now()}`;
  const newStore: Store = {
    id: newStoreId,
    name: storeData.name,
    nameAr: storeData.nameAr || storeData.name,
    area: storeData.area,
    phone: storeData.phone,
    whatsappNumber: storeData.whatsappNumber || storeData.phone,
    merchantName: storeData.merchantName || 'Store Manager',
    merchantEmail: storeData.merchantEmail || undefined,
    pin: storeData.pin || '1234',
    riderPin: storeData.riderPin || '5678',
    rating: 5.0,
    image: storeData.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    monthlyOrders: 0,
    subscriptionFee: Number(storeData.subscriptionFee) || 299,
    hasDispute: false,
    paymentStatus: 'paid',
    overdueDays: 0,
    servicePaused: false,
    adminExplicitOverride: false,
    reminderCount: 0,
  };

  const defaultStarterSkus: Array<{ name: string; nameAr: string; cat: ProductCategory; price: number; stock: number; img: string }> = [
    { name: 'Fresh Milk 2L', nameAr: 'حليب طازج ٢ لتر', cat: 'Dairy & Eggs', price: 11.5, stock: 20, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Warm Arabic Pita Bread', nameAr: 'خبز عربي طازج', cat: 'Bakery', price: 3.5, stock: 30, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80' },
    { name: 'Al Ain Mineral Water 1.5L', nameAr: 'مياه العين ١٫٥ لتر', cat: 'Beverages', price: 2.0, stock: 40, img: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Basmati Rice 5kg', nameAr: 'أرز بسمتي ٥ كغ', cat: 'Pantry', price: 38.0, stock: 15, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fresh Organic Eggs (Pack of 15)', nameAr: 'بيض عضوي طازج ١٥ حبة', cat: 'Dairy & Eggs', price: 16.5, stock: 15, img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Lay\'s Classic Salt Chips 170g', nameAr: 'بطاطس ليز بالملح ١٧٠ غرام', cat: 'Snacks', price: 6.5, stock: 25, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fresh Local Bananas 1kg', nameAr: 'موز طازج ١ كغ', cat: 'Fresh Produce', price: 5.5, stock: 20, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80' },
  ];

  const pgOk = await isPostgresAvailable();
  if (!pgOk) {
    memoryStore.initIfEmpty();
    memoryStore.stores.push(newStore);

    defaultStarterSkus.forEach((sku, idx) => {
      memoryStore.products.push({
        id: `p-${newStoreId}-${idx + 1}`,
        storeId: newStoreId,
        name: sku.name,
        nameAr: sku.nameAr,
        category: sku.cat,
        price: sku.price,
        regularPrice: sku.price,
        unit: '1 Pack',
        unitAr: '١ عبوة',
        stock: sku.stock,
        lowStockThreshold: 5,
        inStock: true,
        image: sku.img,
      });
    });

    memoryStore.riders.push({
      id: `r-${newStoreId}-1`,
      storeId: newStoreId,
      name: `${storeData.name.split(' ')[0]} Runner 1`,
      phone: storeData.phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      vehicle: 'E-Scooter / Bicycle',
      activeOrdersCount: 0,
    });

    memoryStore.suppliers.push({
      id: `sup-${newStoreId}-1`,
      storeId: newStoreId,
      name: 'National Dairy & FMCG Wholesale',
      nameAr: 'شركة الألبان والتوريدات الوطنية',
      phone: '+971 50 111 2222',
      category: 'Dairy & Eggs',
    });

    return newStore;
  }

  const insertedStore = await db.insert(stores).values({
    ...newStore,
    whatsappNumber: newStore.whatsappNumber || newStore.phone,
    merchantEmail: newStore.merchantEmail || null,
  }).returning();

  for (let idx = 0; idx < defaultStarterSkus.length; idx++) {
    const sku = defaultStarterSkus[idx];
    await db.insert(products).values({
      id: `p-${newStoreId}-${idx + 1}`,
      storeId: newStoreId,
      name: sku.name,
      nameAr: sku.nameAr,
      category: sku.cat,
      price: sku.price,
      regularPrice: sku.price,
      unit: '1 Pack',
      unitAr: '١ عبوة',
      stock: sku.stock,
      lowStockThreshold: 5,
      inStock: true,
      image: sku.img,
    }).onConflictDoNothing();
  }

  await db.insert(riders).values({
    id: `r-${newStoreId}-1`,
    storeId: newStoreId,
    name: `${storeData.name.split(' ')[0]} Runner 1`,
    phone: storeData.phone,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    vehicle: 'E-Scooter / Bicycle',
    activeOrdersCount: 0,
  }).onConflictDoNothing();

  await db.insert(suppliers).values({
    id: `sup-${newStoreId}-1`,
    storeId: newStoreId,
    name: 'National Dairy & FMCG Wholesale',
    nameAr: 'شركة الألبان والتوريدات الوطنية',
    phone: '+971 50 111 2222',
    category: 'Dairy & Eggs',
  }).onConflictDoNothing();

  return insertedStore[0] as unknown as Store;
}

/**
 * Update Store Settings
 */
export async function updateStoreInDb(storeId: string, storeData: Partial<Store>): Promise<Store> {
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.initIfEmpty();
    const store = memoryStore.stores.find((s) => s.id === storeId);
    if (!store) throw new Error(`Store ${storeId} not found`);

    Object.assign(store, storeData);
    if (storeData.paymentStatus === 'paid') {
      store.overdueDays = 0;
      store.overdueDueDate = undefined;
    } else if (storeData.overdueDays !== undefined && Number(storeData.overdueDays) > 0) {
      const calculatedDue = new Date(Date.now() - Number(storeData.overdueDays) * 86400000);
      store.overdueDueDate = calculatedDue.toISOString().split('T')[0];
    }

    if (storeData.adminExplicitOverride !== undefined) {
      store.adminExplicitOverrideAt = new Date().toISOString();
    }

    return store;
  }

  const updateData: any = { ...storeData };
  if (storeData.paymentStatus === 'paid') {
    updateData.overdueDays = 0;
    updateData.overdueDueDate = null;
  } else if (storeData.overdueDays !== undefined) {
    const days = Math.max(0, Number(storeData.overdueDays));
    updateData.overdueDays = days;
    if (days > 0) {
      const calculatedDue = new Date(Date.now() - days * 86400000);
      updateData.overdueDueDate = calculatedDue.toISOString().split('T')[0];
    } else {
      updateData.overdueDueDate = null;
    }
  }

  if (storeData.adminExplicitOverride !== undefined) {
    updateData.adminExplicitOverride = Boolean(storeData.adminExplicitOverride);
    updateData.adminExplicitOverrideAt = new Date().toISOString();
  }

  const res = await db.update(stores).set(updateData).where(eq(stores.id, storeId)).returning();
  if (res.length === 0) throw new Error(`Store ${storeId} not found`);
  return res[0] as unknown as Store;
}

/**
 * Send Store Payment Reminder
 */
export async function sendStorePaymentReminderInDb(storeId: string): Promise<Store> {
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.initIfEmpty();
    const store = memoryStore.stores.find((s) => s.id === storeId);
    if (!store) throw new Error('Store not found');
    store.reminderCount = (store.reminderCount || 0) + 1;
    store.lastReminderSentAt = new Date().toISOString();
    return store;
  }

  const updated = await db.update(stores).set({
    lastReminderSentAt: new Date().toISOString(),
    reminderCount: sql`${stores.reminderCount} + 1`,
  }).where(eq(stores.id, storeId)).returning();

  if (updated.length === 0) throw new Error('Store not found');
  return updated[0] as unknown as Store;
}

/**
 * Update Admin Configuration
 */
export async function updateAdminConfigInDb(breakEvenOrdersThreshold: number): Promise<{ breakEvenOrdersThreshold: number }> {
  const val = Math.max(1, Number(breakEvenOrdersThreshold) || 139);
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.initIfEmpty();
    memoryStore.adminConfig.breakEvenOrdersThreshold = val;
    return { breakEvenOrdersThreshold: val };
  }

  await db.insert(adminConfig).values({
    id: 'default',
    breakEvenOrdersThreshold: val,
  }).onConflictDoUpdate({
    target: adminConfig.id,
    set: { breakEvenOrdersThreshold: val },
  });

  return { breakEvenOrdersThreshold: val };
}

/**
 * Reset Database / Memory Store to Seed State
 */
export async function resetDatabaseInDb(): Promise<AppState> {
  const pgOk = await isPostgresAvailable();

  if (!pgOk) {
    memoryStore.reset();
    return await getAppStateFromDb();
  }

  try {
    await db.delete(khataTransactions);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(riders);
    await db.delete(settlements);
    await db.delete(suppliers);
    await db.delete(customers);
    await db.delete(stores);
    await db.delete(adminConfig);
    await db.delete(systemMetadata);

    await seedDatabaseIfEmpty();
    return await getAppStateFromDb();
  } catch (error) {
    console.warn('[DB] Reset error on Postgres, resetting memoryStore:', error);
    memoryStore.reset();
    return await getAppStateFromDb();
  }
}
