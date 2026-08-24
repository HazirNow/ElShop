import { KhataTransaction } from './types';

/**
 * Single authoritative source of truth for a customer's active Khata (store credit) debt.
 * Balance = SUM(debit) - SUM(credit) over that customer's transactions. No fallback path:
 * a customer with an empty or missing transaction list simply has a balance of 0.
 */
export function calculateCustomerKhataBalance(
  transactions: KhataTransaction[],
  customerId?: string,
  customerPhone?: string
): number {
  if (!transactions || transactions.length === 0 || (!customerId && !customerPhone)) return 0;

  const relevant = transactions.filter(
    (t) =>
      (customerId && t.customerId === customerId) ||
      (customerPhone && t.customerPhone === customerPhone)
  );

  const balance = relevant.reduce(
    (sum, t) => sum + (t.type === 'debit' ? t.amount : -t.amount),
    0
  );

  return Math.max(0, parseFloat(balance.toFixed(2)));
}

