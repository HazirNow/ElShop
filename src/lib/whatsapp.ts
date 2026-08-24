import { Order, Store, CustomerProfile, Language } from '../types';

/**
 * Detect if user is on a mobile device
 */
export function isMobileUser(): boolean {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || window.navigator.vendor || '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
}

/**
 * Clean and format a phone number for WhatsApp deep link (e.g. 971501234567)
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '971501234567'; // Fallback
  // Strip non-digits
  let digits = phone.replace(/\D/g, '');
  
  // If starts with 0 (e.g. 0501234567), convert UAE prefix to 971501234567
  if (digits.startsWith('05')) {
    digits = '971' + digits.substring(1);
  } else if (!digits.startsWith('971') && digits.length === 9) {
    digits = '971' + digits;
  }
  
  return digits;
}

/**
 * Formats WhatsApp link using native whatsapp:// protocol on mobile devices or wa.me on web
 */
export function formatWhatsAppDeepLink(phoneClean: string, text?: string): string {
  const encodedText = text ? encodeURIComponent(text) : '';
  if (isMobileUser()) {
    if (encodedText) {
      return `whatsapp://send?phone=${phoneClean}&text=${encodedText}`;
    }
    return `whatsapp://send?phone=${phoneClean}`;
  }
  if (encodedText) {
    return `https://wa.me/${phoneClean}?text=${encodedText}`;
  }
  return `https://wa.me/${phoneClean}`;
}

/**
 * Generate WhatsApp checkout link containing full bilingual order summary
 */
export function generateOrderWhatsAppLink(order: Order, store: Store, lang: Language = 'en'): string {
  const storePhoneClean = formatWhatsAppNumber(store.phone);
  const isAr = lang === 'ar';

  let text = '';
  if (isAr) {
    text = `🛒 *طلب جديد عبر ElShop* (#${order.id.slice(-4)})\n` +
      `🏪 *المتجر:* ${store.nameAr || store.name}\n` +
      `👤 *الزبون:* ${order.customerName}\n` +
      `📞 *الهاتف:* ${order.customerPhone}\n` +
      `📍 *العنوان:* ${order.building} - ${order.unit}\n\n` +
      `📦 *قائمة المنتجات:*\n` +
      order.items.map(i => `• ${i.nameAr || i.name} x ${i.quantity} (${(i.price * i.quantity).toFixed(2)} درهم)`).join('\n') +
      `\n\n💵 *المجموع الفرعي:* ${order.subtotal.toFixed(2)} درهم\n` +
      `🛵 *رسوم التوصيل:* ${order.deliveryFee > 0 ? `${order.deliveryFee.toFixed(2)} درهم` : 'مجاني'}\n` +
      `💳 *الإجمالي:* *${order.total.toFixed(2)} درهم*\n` +
      `📌 *طريقة الدفع:* ${
        order.paymentMethod === 'cash'
          ? 'نقداً عند الاستلام'
          : order.paymentMethod === 'card'
          ? 'بطاقة (جهاز POS)'
          : 'مسجل على الدفتر (خاطة)'
      }\n` +
      (order.customerNote ? `📝 *ملاحظات:* ${order.customerNote}\n` : '');
  } else {
    text = `🛒 *New Order via ElShop* (#${order.id.slice(-4)})\n` +
      `🏪 *Store:* ${store.name}\n` +
      `👤 *Customer:* ${order.customerName}\n` +
      `📞 *Phone:* ${order.customerPhone}\n` +
      `📍 *Address:* ${order.building}, ${order.unit}\n\n` +
      `📦 *Item Breakdown:*\n` +
      order.items.map(i => `• ${i.name} x ${i.quantity} (${(i.price * i.quantity).toFixed(2)} AED)`).join('\n') +
      `\n\n💵 *Subtotal:* ${order.subtotal.toFixed(2)} AED\n` +
      `🛵 *Delivery Fee:* ${order.deliveryFee > 0 ? `${order.deliveryFee.toFixed(2)} AED` : 'Free'}\n` +
      `💳 *Total:* *${order.total.toFixed(2)} AED*\n` +
      `📌 *Payment Method:* ${
        order.paymentMethod === 'cash'
          ? 'Cash on Delivery'
          : order.paymentMethod === 'card'
          ? 'Card (Mobile POS)'
          : 'Khata Store Ledger'
      }\n` +
      (order.customerNote ? `📝 *Note:* ${order.customerNote}\n` : '');
  }

  return formatWhatsAppDeepLink(storePhoneClean, text);
}

/**
 * Generate Rider -> Customer WhatsApp Link
 */
export function generateRiderToCustomerWhatsAppLink(order: Order, riderName: string, lang: Language = 'en'): string {
  const customerPhoneClean = formatWhatsAppNumber(order.customerPhone);
  const isAr = lang === 'ar';

  let text = '';
  if (isAr) {
    text = `مرحباً ${order.customerName}، أنا ${riderName} عامل التوصيل من ElShop 🛵\n` +
      `أنا في الطريق إليك الآن لإيصال الطلب #${order.id.slice(-4)} إلى ${order.building} (${order.unit}).\n` +
      `المبلغ المطلوب: ${order.total.toFixed(2)} درهم (${order.paymentMethod === 'cash' ? 'نقداً' : order.paymentMethod === 'card' ? 'بطاقة' : 'الدفتر'}).`;
  } else {
    text = `Hi ${order.customerName}, I'm ${riderName}, your ElShop neighborhood runner 🛵\n` +
      `I'm on my way with your Order #${order.id.slice(-4)} to ${order.building} (${order.unit}).\n` +
      `Total: ${order.total.toFixed(2)} AED (${order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod === 'card' ? 'Card' : 'Khata'}).`;
  }

  return formatWhatsAppDeepLink(customerPhoneClean, text);
}

/**
 * Generate Merchant -> Customer Khata / Ledger Statement WhatsApp Link
 */
export function generateKhataWhatsAppLink(
  customer: CustomerProfile,
  storeName: string,
  totalKhataAmount: number,
  lang: Language = 'en'
): string {
  const customerPhoneClean = formatWhatsAppNumber(customer.phone);
  const isAr = lang === 'ar';
  const limit = customer.creditLimit || 500;
  const available = Math.max(0, limit - totalKhataAmount);

  let text = '';
  if (isAr) {
    text = `مرحباً ${customer.name} 👋\n` +
      `كشف حساب دفتر الخاطة لشهر ${new Date().toLocaleDateString('ar-AE', { month: 'long', year: 'numeric' })} لدى *${storeName}* 🏪\n\n` +
      `💳 *الرصيد المستحق الحالي:* ${totalKhataAmount.toFixed(2)} درهم\n` +
      `🛡️ *الحد الائتماني المعتمد:* ${limit.toFixed(2)} درهم\n` +
      `✨ *الرصيد المتاح للشراء:* ${available.toFixed(2)} درهم\n\n` +
      `يمكنك سداد الرصيد نقداً في المتجر أو عبر المندوب عند توصيل طلبك القادم.\n` +
      `شكراً لثقتكم بنا وبمتجر الحي!`;
  } else {
    text = `Hello ${customer.name} 👋\n` +
      `Monthly Khata Store Credit Statement for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} at *${storeName}* 🏪\n\n` +
      `💳 *Current Outstanding Balance:* ${totalKhataAmount.toFixed(2)} AED\n` +
      `🛡️ *Approved Credit Limit:* ${limit.toFixed(2)} AED\n` +
      `✨ *Available Credit for Orders:* ${available.toFixed(2)} AED\n\n` +
      `You may settle your balance in cash at the counter or with the runner on your next delivery.\n` +
      `Thank you for being our valued neighborhood customer!`;
  }

  return formatWhatsAppDeepLink(customerPhoneClean, text);
}

/**
 * Generate Status Change WhatsApp Update Link for Merchant or Runner to send to Customer
 */
export function generateOrderStatusUpdateWhatsAppLink(
  order: Order,
  store: Store,
  status: 'packing' | 'out_for_delivery' | 'delivered',
  riderName?: string,
  lang: Language = 'en'
): string {
  const customerPhoneClean = formatWhatsAppNumber(order.customerPhone);
  const isAr = lang === 'ar';
  const storeName = isAr ? store.nameAr || store.name : store.name;

  let text = '';
  if (status === 'packing') {
    text = isAr
      ? `مرحباً ${order.customerName}! 🛍️\nطلبك رقم #${order.id.slice(-4)} قيد التجهيز والتغليف الآن في *${storeName}* وسينطلق إليك قريباً في ${order.building} (${order.unit}).`
      : `Hi ${order.customerName}! 🛍️\nYour Order #${order.id.slice(-4)} is being packed fresh at *${storeName}* and will be dispatched shortly to ${order.building}, ${order.unit}.`;
  } else if (status === 'out_for_delivery') {
    text = isAr
      ? `طلبك في الطريق! 🛵\nالمندوب ${riderName || 'سريع'} متوجه الآن إلى ${order.building} (${order.unit}) لإيصال طلبك #${order.id.slice(-4)}.\nالمبلغ المطلوب: ${order.total.toFixed(2)} درهم (${order.paymentMethod === 'cash' ? 'نقداً' : order.paymentMethod === 'card' ? 'بطاقة POS' : 'مسجل بالدفتر'}).`
      : `Your order is on the way! 🛵\nRunner ${riderName || 'Fast'} is heading to ${order.building}, ${order.unit} with Order #${order.id.slice(-4)}.\nAmount due: ${order.total.toFixed(2)} AED (${order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod === 'card' ? 'Mobile POS' : 'On Khata'}).`;
  } else {
    text = isAr
      ? `تم التسليم بنجاح! ✅\nشكراً لتسوقك من *${storeName}* (#${order.id.slice(-4)}). نتمنى لك يوماً سعيداً!`
      : `Delivered successfully! ✅\nThank you for shopping with *${storeName}* (#${order.id.slice(-4)}). Enjoy your fresh groceries!`;
  }

  return formatWhatsAppDeepLink(customerPhoneClean, text);
}

/**
 * Generate Instant Digital WhatsApp Receipt on Delivery Completion (for Cash or Handheld Card POS)
 */
export function generateDeliveredReceiptWhatsAppLink(
  order: Order,
  store: Store,
  paymentMethod: 'cash' | 'card' | 'khata',
  lang: Language = 'en'
): string {
  const customerPhoneClean = formatWhatsAppNumber(order.customerPhone);
  const isAr = lang === 'ar';
  const storeName = isAr ? store.nameAr || store.name : store.name;
  const paymentLabel = isAr
    ? paymentMethod === 'card'
      ? 'بطاقة عند الباب (جهاز POS)'
      : paymentMethod === 'cash'
      ? 'نقداً عند الاستلام'
      : 'مسجل على دفتر الخاطة'
    : paymentMethod === 'card'
    ? 'Card at Door (Handheld POS)'
    : paymentMethod === 'cash'
    ? 'Cash on Delivery'
    : 'Khata Store Ledger Tab';

  let text = '';
  if (isAr) {
    text = `✅ *تم التوصيل واستلام الدفع بنجاح!*\n` +
      `🏪 *المتجر:* ${storeName}\n` +
      `🧾 *رقم الإيصال:* #${order.id}\n` +
      `📍 *العنوان:* ${order.building} (${order.unit})\n` +
      `💳 *طريقة الدفع:* ${paymentLabel}\n` +
      `💵 *المبلغ المدفوع:* *${order.total.toFixed(2)} درهم*\n\n` +
      `📦 *الأصناف المستلمة:*\n` +
      order.items.map(i => `• ${i.nameAr || i.name} x${i.quantity}`).join('\n') +
      `\n\nشكراً لتسوقك من متجر الحي! نتشرف بخدمتك دائماً 🛒✨`;
  } else {
    text = `✅ *Order #${order.id} Delivered & Paid*\n` +
      `🏪 *Store:* ${storeName}\n` +
      `📍 *Address:* ${order.building}, ${order.unit}\n` +
      `💳 *Payment:* ${paymentLabel}\n` +
      `💵 *Total Paid:* *${order.total.toFixed(2)} AED*\n\n` +
      `📦 *Items Delivered:*\n` +
      order.items.map(i => `• ${i.name} x${i.quantity}`).join('\n') +
      `\n\nThank you for shopping with your local baqala! 🛒✨`;
  }

  return formatWhatsAppDeepLink(customerPhoneClean, text);
}

/**
 * Direct WhatsApp chat with store or customer
 */
export function generateDirectWhatsAppLink(phone: string, initialText?: string): string {
  const cleanPhone = formatWhatsAppNumber(phone);
  return formatWhatsAppDeepLink(cleanPhone, initialText);
}

