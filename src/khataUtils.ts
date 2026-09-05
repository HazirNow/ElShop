import { KhataTransaction } from './types';
import { calculateKhataBalanceFromTransactions } from './utils/money';

/**
 * Single authoritative source of truth for a customer's active Khata (store credit) debt.
 * Balance = SUM(debit) - SUM(credit) over that customer's transactions calculated with decimal.js
 * to eliminate floating-point rounding errors.
 */
export function calculateCustomerKhataBalance(
  transactions: KhataTransaction[],
  customerId?: string,
  customerPhone?: string
): number {
  return calculateKhataBalanceFromTransactions(transactions, customerId, customerPhone);
}

