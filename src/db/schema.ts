import { pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Stores table
export const stores = pgTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameAr: text('name_ar').notNull(),
  area: text('area').notNull(),
  phone: text('phone').notNull(),
  whatsappNumber: text('whatsapp_number'),
  merchantName: text('merchant_name'),
  rating: doublePrecision('rating').default(4.8),
  image: text('image').notNull(),
  monthlyOrders: integer('monthly_orders').default(0),
  subscriptionFee: doublePrecision('subscription_fee').default(299),
  hasDispute: boolean('has_dispute').default(false),
  disputeNotes: text('dispute_notes'),
  storeColor: text('store_color'),
  pin: text('pin').default('1234'),
  riderPin: text('rider_pin').default('5678'),
  merchantEmail: text('merchant_email'),
  paymentStatus: text('payment_status').default('paid'), // paid, pending, overdue
  overdueDays: integer('overdue_days').default(0),
  overdueDueDate: text('overdue_due_date'),
  servicePaused: boolean('service_paused').default(false),
  adminExplicitOverride: boolean('admin_explicit_override').default(false),
  adminExplicitOverrideReason: text('admin_explicit_override_reason'),
  adminExplicitOverrideAt: text('admin_explicit_override_at'),
  lastReminderSentAt: text('last_reminder_sent_at'),
  reminderCount: integer('reminder_count').default(0),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  nameAr: text('name_ar').notNull(),
  category: text('category').notNull(),
  price: doublePrecision('price').notNull(),
  regularPrice: doublePrecision('regular_price'),
  discountedPrice: doublePrecision('discounted_price'),
  sale: boolean('sale').default(false),
  unit: text('unit').notNull(),
  unitAr: text('unit_ar').notNull(),
  stock: integer('stock').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').default(5),
  inStock: boolean('in_stock').default(true),
  image: text('image').notNull(),
  supplierId: text('supplier_id'),
  supplierPhone: text('supplier_phone'),
  expiryDate: text('expiry_date'),
});

// Customers table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  building: text('building').notNull(),
  unit: text('unit').notNull(),
  isKhataPreApproved: boolean('is_khata_pre_approved').default(false),
  creditLimit: doublePrecision('credit_limit').default(500),
});

// Orders table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(), // e.g. ELS-1001
  storeId: text('store_id').notNull().references(() => stores.id),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  building: text('building').notNull(),
  unit: text('unit').notNull(),
  items: jsonb('items').notNull(), // OrderItem[]
  subtotal: doublePrecision('subtotal').notNull(),
  deliveryFee: doublePrecision('delivery_fee').notNull().default(0),
  total: doublePrecision('total').notNull(),
  paymentMethod: text('payment_method').notNull(), // cash, card, khata
  paymentStatus: text('payment_status').notNull(), // pending, paid, khata_debited
  status: text('status').notNull(), // placed, packing, out_for_delivery, delivered, cancelled, failed_delivery
  riderId: text('rider_id'),
  riderName: text('rider_name'),
  customerNote: text('customer_note'),
  createdAt: text('created_at').notNull(),
  packedItems: jsonb('packed_items').notNull().default([]), // string[]
  paidAmount: doublePrecision('paid_amount').default(0),
  chatMessages: jsonb('chat_messages').notNull().default([]), // ChatMessage[]
});

// Authoritative Khata Transactions Ledger
export const khataTransactions = pgTable('khata_transactions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  customerPhone: text('customer_phone'),
  storeId: text('store_id').references(() => stores.id),
  orderId: text('order_id'),
  type: text('type').notNull(), // 'debit' | 'credit'
  amount: doublePrecision('amount').notNull(),
  timestamp: text('timestamp').notNull(),
  note: text('note'),
});

// Riders table
export const riders = pgTable('riders', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  avatar: text('avatar').notNull(),
  vehicle: text('vehicle').notNull(),
  activeOrdersCount: integer('active_orders_count').default(0),
});

// Settlements table
export const settlements = pgTable('settlements', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  riderId: text('rider_id').notNull(),
  riderName: text('rider_name').notNull(),
  expectedCash: doublePrecision('expected_cash').notNull(),
  actualCash: doublePrecision('actual_cash').notNull(),
  variance: doublePrecision('variance').notNull(),
  status: text('status').notNull(), // pending, approved, disputed
  notes: text('notes'),
  shiftDate: text('shift_date'),
  settledBy: text('settled_by'),
  updatedAt: text('updated_at').notNull(),
});

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  phone: text('phone').notNull(),
  category: text('category'),
});

// Admin Configuration table
export const adminConfig = pgTable('admin_config', {
  id: text('id').primaryKey().default('default'),
  breakEvenOrdersThreshold: integer('break_even_orders_threshold').notNull().default(139),
});

// Sequence / Metadata table for system counters
export const systemMetadata = pgTable('system_metadata', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// Relations
export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
  orders: many(orders),
  riders: many(riders),
  settlements: many(settlements),
  suppliers: many(suppliers),
}));

export const productsRelations = relations(products, ({ one }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  khataTransactions: many(khataTransactions),
}));

export const khataTransactionsRelations = relations(khataTransactions, ({ one }) => ({
  customer: one(customers, {
    fields: [khataTransactions.customerId],
    references: [customers.id],
  }),
}));
