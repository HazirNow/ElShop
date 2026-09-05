import Decimal from 'decimal.js';

// Global configuration for accounting: 20 significant digits precision, Half-Up rounding (financial standard)
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

/**
 * Safely parse any monetary input into a Decimal instance.
 */
export function toDecimal(val: number | string | Decimal | undefined | null): Decimal {
  if (val === undefined || val === null || val === '') return new Decimal(0);
  if (val instanceof Decimal) return val;
  const num = Number(val);
  if (isNaN(num)) return new Decimal(0);
  return new Decimal(val);
}

/**
 * Round a Decimal or number to 2 decimal places (AED standard) and return a number.
 */
export function toMoneyNumber(val: number | string | Decimal): number {
  return toDecimal(val).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Format a monetary value as a fixed 2-decimal string (e.g. "12.50").
 */
export function formatMoney(val: number | string | Decimal): string {
  return toDecimal(val).toFixed(2);
}

/**
 * Calculate order subtotal, delivery fee, and grand total without floating-point precision loss.
 */
export function calculateOrderFinancials(
  items: Array<{ price: number | string; quantity: number | string }>,
  deliveryThreshold = 25,
  deliveryFeeAmount = 3.50
): {
  subtotal: number;
  deliveryFee: number;
  total: number;
} {
  let subtotalDec = new Decimal(0);
  for (const item of items) {
    const priceDec = toDecimal(item.price);
    const qtyDec = toDecimal(item.quantity);
    subtotalDec = subtotalDec.plus(priceDec.times(qtyDec));
  }

  const subtotal = toMoneyNumber(subtotalDec);
  const deliveryFeeDec = subtotalDec.lessThan(deliveryThreshold)
    ? new Decimal(deliveryFeeAmount)
    : new Decimal(0);
  const deliveryFee = toMoneyNumber(deliveryFeeDec);
  const total = toMoneyNumber(subtotalDec.plus(deliveryFeeDec));

  return { subtotal, deliveryFee, total };
}

/**
 * Add an item's price * quantity to an existing subtotal and recalculate totals.
 */
export function recalculateOrderWithAdditionalItem(
  currentSubtotal: number | string,
  addedPrice: number | string,
  addedQuantity: number | string,
  deliveryThreshold = 25,
  deliveryFeeAmount = 3.50
): {
  subtotal: number;
  deliveryFee: number;
  total: number;
} {
  const currentSubtotalDec = toDecimal(currentSubtotal);
  const addedPriceDec = toDecimal(addedPrice);
  const addedQtyDec = toDecimal(addedQuantity);

  const newSubtotalDec = currentSubtotalDec.plus(addedPriceDec.times(addedQtyDec));
  const subtotal = toMoneyNumber(newSubtotalDec);
  const deliveryFeeDec = newSubtotalDec.lessThan(deliveryThreshold)
    ? new Decimal(deliveryFeeAmount)
    : new Decimal(0);
  const deliveryFee = toMoneyNumber(deliveryFeeDec);
  const total = toMoneyNumber(newSubtotalDec.plus(deliveryFeeDec));

  return { subtotal, deliveryFee, total };
}

/**
 * Calculate customer Khata balance from transactions: SUM(debits) - SUM(credits).
 */
export function calculateKhataBalanceFromTransactions(
  transactions: Array<{ type: 'debit' | 'credit'; amount: number | string; customerId?: string; customerPhone?: string | null }>,
  customerId?: string,
  customerPhone?: string
): number {
  if (!transactions || transactions.length === 0 || (!customerId && !customerPhone)) return 0;

  const relevant = transactions.filter(
    (t) =>
      (customerId && t.customerId === customerId) ||
      (customerPhone && t.customerPhone === customerPhone)
  );

  let balanceDec = new Decimal(0);
  for (const t of relevant) {
    const amtDec = toDecimal(t.amount);
    if (t.type === 'debit') {
      balanceDec = balanceDec.plus(amtDec);
    } else if (t.type === 'credit') {
      balanceDec = balanceDec.minus(amtDec);
    }
  }

  const zero = new Decimal(0);
  return Decimal.max(zero, balanceDec).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Calculate Khata debt and available credit limits with exact precision.
 */
export function calculateKhataCreditAvailable(
  creditLimit: number | string,
  currentBalance: number | string,
  newOrderTotal: number | string = 0
): {
  currentBalance: number;
  newBalance: number;
  creditLimit: number;
  remainingCredit: number;
  isCreditApproved: boolean;
} {
  const limitDec = toDecimal(creditLimit);
  const balanceDec = toDecimal(currentBalance);
  const orderTotalDec = toDecimal(newOrderTotal);

  const newBalanceDec = balanceDec.plus(orderTotalDec);
  const remainingCreditDec = limitDec.minus(newBalanceDec);

  return {
    currentBalance: toMoneyNumber(balanceDec),
    newBalance: toMoneyNumber(newBalanceDec),
    creditLimit: toMoneyNumber(limitDec),
    remainingCredit: toMoneyNumber(remainingCreditDec),
    isCreditApproved: remainingCreditDec.greaterThanOrEqualTo(0),
  };
}

/**
 * Settle customer Khata balance against outstanding orders with zero floating point drift.
 */
export function executeKhataSettlement(
  totalDebt: number | string,
  amountToSettle: number | string,
  openOrders: Array<{ id: string; total: number | string; paidAmount?: number | string }>
): {
  settledAmount: number;
  remainingDebt: number;
  settledOrderIds: string[];
  updatedOrders: Array<{ id: string; paidAmount: number; paymentStatus: 'paid' | 'khata_debited' }>;
} {
  const totalDebtDec = toDecimal(totalDebt);
  const amountToSettleDec = toDecimal(amountToSettle);
  const zero = new Decimal(0);

  const actualSettledDec = Decimal.min(amountToSettleDec, totalDebtDec).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  if (actualSettledDec.lessThanOrEqualTo(zero)) {
    return {
      settledAmount: 0,
      remainingDebt: toMoneyNumber(totalDebtDec),
      settledOrderIds: [],
      updatedOrders: [],
    };
  }

  let remainingFundsDec = new Decimal(actualSettledDec);
  const settledOrderIds: string[] = [];
  const updatedOrders: Array<{ id: string; paidAmount: number; paymentStatus: 'paid' | 'khata_debited' }> = [];

  for (const ord of openOrders) {
    if (remainingFundsDec.lessThanOrEqualTo(zero)) break;
    const ordTotalDec = toDecimal(ord.total);
    const ordPaidDec = toDecimal(ord.paidAmount || 0);
    const unpaidDebtDec = Decimal.max(zero, ordTotalDec.minus(ordPaidDec));

    if (unpaidDebtDec.lessThanOrEqualTo(zero)) continue;

    if (remainingFundsDec.greaterThanOrEqualTo(unpaidDebtDec)) {
      remainingFundsDec = remainingFundsDec.minus(unpaidDebtDec);
      settledOrderIds.push(ord.id);
      updatedOrders.push({
        id: ord.id,
        paidAmount: toMoneyNumber(ordTotalDec),
        paymentStatus: 'paid',
      });
    } else {
      const newPaidDec = ordPaidDec.plus(remainingFundsDec);
      remainingFundsDec = new Decimal(0);
      updatedOrders.push({
        id: ord.id,
        paidAmount: toMoneyNumber(newPaidDec),
        paymentStatus: 'khata_debited',
      });
      break;
    }
  }

  const remainingDebtDec = Decimal.max(zero, totalDebtDec.minus(actualSettledDec));

  return {
    settledAmount: toMoneyNumber(actualSettledDec),
    remainingDebt: toMoneyNumber(remainingDebtDec),
    settledOrderIds,
    updatedOrders,
  };
}

/**
 * Calculate shift and courier cash settlement variance without floating-point errors.
 */
export function calculateSettlementVariance(
  actualCash: number | string,
  expectedCash: number | string
): {
  safeActual: number;
  safeExpected: number;
  variance: number;
  isDisputed: boolean;
} {
  const actualDec = toDecimal(actualCash);
  const expectedDec = toDecimal(expectedCash);
  const varianceDec = actualDec.minus(expectedDec).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    safeActual: toMoneyNumber(actualDec),
    safeExpected: toMoneyNumber(expectedDec),
    variance: varianceDec.toNumber(),
    isDisputed: !varianceDec.isZero(),
  };
}
