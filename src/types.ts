export type Role = 'customer' | 'merchant' | 'rider' | 'admin';
export type Language = 'en' | 'ar';

export interface Store {
  id: string;
  name: string;
  nameAr: string;
  area: string;
  phone: string;
  whatsappNumber?: string; // WhatsApp ordering & merchant communication number
  merchantName?: string; // Owner / Store Manager name
  rating: number;
  image: string;
  monthlyOrders: number;
  subscriptionFee: number; // 299 AED (Tier 1), 599 AED (Tier 2), 899 AED (Tier 3)
  subscriptionTier?: 1 | 2 | 3; // 1 = Baqala (299 AED), 2 = Mart (599 AED), 3 = Franchise (899 AED)
  hasDispute: boolean;
  disputeNotes?: string;
  storeColor?: string;
  pin?: string; // 4-digit security PIN for Merchant POS Terminal access (default 1234)
  managerPin?: string; // Manager PIN for Tier 2/3
  cashierPin?: string; // Cashier POS PIN for Tier 2/3
  riderPin?: string; // 4-digit security PIN for Rider courier app access (default 5678)
  merchantEmail?: string;
  
  // Billing, Payment & Service Status Fields
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  overdueDays?: number; // Days payment has been overdue (e.g. 0, 3, 11)
  overdueDueDate?: string; // ISO date string or YYYY-MM-DD
  servicePaused?: boolean; // True when service is suspended (e.g. after 10 days overdue)
  adminExplicitOverride?: boolean; // Admin explicitly allows store to operate even if overdue
  adminExplicitOverrideReason?: string; // Audited justification for administrative override
  adminExplicitOverrideAt?: string; // Timestamp when override was toggled
  lastReminderSentAt?: string; // Timestamp of last WhatsApp/SMS reminder
  reminderCount?: number; // Number of reminders dispatched
}

export type ProductCategory =
  | 'Dairy & Eggs'
  | 'Bakery'
  | 'Beverages'
  | 'Pantry'
  | 'Snacks'
  | 'Fresh Produce'
  | 'Household'
  | 'Personal Care';

export interface Product {
  id: string;
  storeId: string;
  name: string;
  nameAr: string;
  category: ProductCategory;
  price: number; // AED (effective price)
  cogs?: number; // Cost of Goods Sold wholesale cost in AED (Tier 3 Franchise P&L)
  costPrice?: number; // Alias for cogs
  regularPrice?: number; // AED (regular price before discount)
  discountedPrice?: number; // AED (discounted sale price when on sale)
  sale?: boolean; // explicit sale flag
  originalPrice?: number; // alias for regularPrice
  isOnSale?: boolean; // alias for sale
  unit: string;
  unitAr: string;
  stock: number;
  lowStockThreshold?: number; // Threshold in units before product goes red (defaults to 5)
  inStock: boolean;
  image: string;
  barcode?: string;
  sku?: string;
  supplierId?: string;
  supplierPhone?: string;
  expiryDate?: string; // e.g. YYYY-MM-DD for expiry tracking
}

export interface Supplier {
  id: string;
  storeId: string;
  name: string;
  nameAr?: string;
  phone: string;
  category?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  building: string;
  unit: string;
  isKhataPreApproved: boolean;
  creditLimit?: number; // Maximum AED allowed on Khata (e.g. 500 AED)
}

export type PaymentMethod = 'cash' | 'card' | 'khata';
export type OrderStatus = 'placed' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'failed_delivery';

export interface OrderItem {
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  cogs?: number; // Cost of Goods Sold for profit tracking
  quantity: number;
  unit: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'store' | 'system';
  text: string;
  textAr?: string;
  timestamp: string;
  isOrderSummary?: boolean;
  orderId?: string;
}

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  building: string;
  unit: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number; // 3.50 AED if subtotal < 25 else 0
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'khata_debited';
  status: OrderStatus;
  riderId?: string;
  riderName?: string;
  customerNote?: string;
  createdAt: string;
  packedItems: string[]; // array of productIds checked off by merchant
  paidAmount?: number; // amount collected so far towards order total (partial khata settlement)
  chatMessages: ChatMessage[];
}

export interface Rider {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  avatar: string;
  vehicle: string;
  activeOrdersCount: number;
}

export interface Settlement {
  id: string;
  storeId: string;
  riderId: string;
  riderName: string;
  expectedCash: number;
  actualCash: number;
  variance: number;
  status: 'pending' | 'approved' | 'disputed';
  notes?: string;
  shiftDate?: string;
  settledBy?: string;
  updatedAt: string;
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  customerPhone?: string;
  storeId?: string;
  orderId?: string;
  type: 'debit' | 'credit';
  amount: number;
  timestamp: string;
  note?: string;
}

export interface AdminConfig {
  breakEvenOrdersThreshold: number; // default 102
}

export interface AppState {
  stores: Store[];
  products: Product[];
  orders: Order[];
  riders: Rider[];
  settlements: Settlement[];
  adminConfig: AdminConfig;
  customers: CustomerProfile[];
  suppliers: Supplier[];
  khataTransactions: KhataTransaction[];
  nextOrderSeq: number;
}
