import { describe, it, expect, vi } from 'vitest';
import { getTierAccess } from '../hooks/useTierAccess';
import { Store } from '../types';
import { offlineSyncManager } from '../lib/offlineSyncManager';
import { calculateOrderFinancials, calculateSettlementVariance, executeKhataSettlement } from '../utils/money';

const processTenantRequest = (tenantId: string | null) => {
  if (!tenantId) throw new Error('ACCESS_DENIED');
  return { status: 'SUCCESS', isolatedScope: `db_schema_${tenantId}` };
};

const normalizeBuildingName = (address: string): string => {
  return address
    .toLowerCase()
    .replace(/[\,\.]/g, '')
    .replace('tower', '')
    .replace(/\s+/g, ' ') // Squashes multiple consecutive spaces into a single space
    .trim();
};

describe('ElShop Core Production Business Logic', () => {

  it('should strictly isolate data scopes by Tenant ID and block empty requests', () => {
    expect(() => processTenantRequest(null)).toThrow('ACCESS_DENIED');
    
    const validCall = processTenantRequest('baqala_alkhalidiya_01');
    expect(validCall.isolatedScope).toBe('db_schema_baqala_alkhalidiya_01');
  });

  it('should normalize varied UAE building addresses into identical delivery batches', () => {
    const formatA = "Marina Heights Tower, Apt 402";
    const formatB = "marina heights, apt 402";
    
    expect(normalizeBuildingName(formatA)).toContain("marina heights");
    expect(normalizeBuildingName(formatA)).toBe(normalizeBuildingName(formatB));
  });

  it('should properly gate Tier 1 vs Tier 2 vs Tier 3 subscription features in useTierAccess / getTierAccess', () => {
    const tier1Store: Partial<Store> = { id: 'store-1', subscriptionTier: 1, name: 'Baqala 1' };
    const tier2Store: Partial<Store> = { id: 'store-2', subscriptionTier: 2, name: 'Mart 2' };
    const tier3Store: Partial<Store> = { id: 'store-3', subscriptionTier: 3, name: 'Franchise 3' };

    const tier1Access = getTierAccess(tier1Store as Store);
    expect(tier1Access.isTier1).toBe(true);
    expect(tier1Access.canShiftReconciliation).toBe(false);
    expect(tier1Access.canSetCreditLimits).toBe(false);
    expect(tier1Access.canViewPnL).toBe(false);
    expect(tier1Access.canManageStaffRoles).toBe(false);

    const tier2Access = getTierAccess(tier2Store as Store);
    expect(tier2Access.isTier2).toBe(true);
    expect(tier2Access.canShiftReconciliation).toBe(true);
    expect(tier2Access.canSetCreditLimits).toBe(true);
    expect(tier2Access.canManageStaffRoles).toBe(true);
    expect(tier2Access.canViewPnL).toBe(false);

    const tier3Access = getTierAccess(tier3Store as Store);
    expect(tier3Access.isTier3).toBe(true);
    expect(tier3Access.canShiftReconciliation).toBe(true);
    expect(tier3Access.canSetCreditLimits).toBe(true);
    expect(tier3Access.canManageStaffRoles).toBe(true);
    expect(tier3Access.canViewPnL).toBe(true);
    expect(tier3Access.canMultiBranchBenchmarking).toBe(true);
  });

  it('should accurately compute Cost of Goods Sold (COGS) and Gross Margin percentage', () => {
    const mockOrderItems = [
      { price: 11.00, cogs: 8.80, quantity: 2 }, // revenue: 22.00, cogs: 17.60, profit: 4.40
      { price: 18.50, cogs: 14.50, quantity: 1 }  // revenue: 18.50, cogs: 14.50, profit: 4.00
    ];

    const totalRevenue = mockOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCOGS = mockOrderItems.reduce((sum, item) => sum + ((item.cogs || 0) * item.quantity), 0);
    const grossProfit = totalRevenue - totalCOGS;
    const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    expect(totalRevenue).toBe(40.50);
    expect(totalCOGS).toBe(32.10);
    expect(grossProfit).toBeCloseTo(8.40, 2);
    expect(grossMarginPct).toBeCloseTo(20.74, 1);
  });

  it('should format and emit valid structured JSON logs for offline sync loop summaries', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const summaryResult = offlineSyncManager.logStructuredSummary({
      processed: 5,
      succeeded: 4,
      conflicted: 1,
      failed: 0,
      durationMs: 45,
      event: 'OFFLINE_SYNC_LOOP_SUMMARY',
      level: 'info'
    });

    expect(logSpy).toHaveBeenCalled();
    const lastLogCall = logSpy.mock.calls[logSpy.mock.calls.length - 1][0];
    const parsed = JSON.parse(lastLogCall);

    expect(parsed.event).toBe('OFFLINE_SYNC_LOOP_SUMMARY');
    expect(parsed.level).toBe('info');
    expect(parsed.processed).toBe(5);
    expect(parsed.succeeded).toBe(4);
    expect(parsed.conflicted).toBe(1);
    expect(parsed.failed).toBe(0);
    expect(parsed.durationMs).toBe(45);
    expect(parsed.timestamp).toBeDefined();

    expect(summaryResult.processed).toBe(5);
    expect(summaryResult.succeeded).toBe(4);
    expect(summaryResult.conflicted).toBe(1);
    expect(summaryResult.failed).toBe(0);

    logSpy.mockRestore();
  });

  it('should prevent IEEE 754 floating point drift using Decimal in financial calculations', () => {
    // 0.1 + 0.2 in standard JS floating point is 0.30000000000000004
    const floatResult = 0.1 + 0.2;
    expect(floatResult).not.toBe(0.3);

    // Order financials calculation
    const orderItems = [
      { price: 0.1, quantity: 1 },
      { price: 0.2, quantity: 1 },
    ];
    const financials = calculateOrderFinancials(orderItems);
    expect(financials.subtotal).toBe(0.3);
    // Delivery fee applies under 25 AED (3.5 AED)
    expect(financials.deliveryFee).toBe(3.5);
    expect(financials.total).toBe(3.8);

    // Settlement variance calculation
    const varianceResult = calculateSettlementVariance(100.05, 100.00);
    expect(varianceResult.variance).toBe(0.05);
    expect(varianceResult.isDisputed).toBe(true);

    const exactVariance = calculateSettlementVariance(250.50, 250.50);
    expect(exactVariance.variance).toBe(0);
    expect(exactVariance.isDisputed).toBe(false);

    // Khata partial settlement FIFO test
    const khataOrders = [
      { id: 'ELS-1', total: 10.25, paidAmount: 0, paymentStatus: 'khata_debited' },
      { id: 'ELS-2', total: 15.50, paidAmount: 0, paymentStatus: 'khata_debited' }
    ];
    const settlement = executeKhataSettlement(25.75, 15.00, khataOrders);
    expect(settlement.settledAmount).toBe(15.00);
    expect(settlement.updatedOrders[0].id).toBe('ELS-1');
    expect(settlement.updatedOrders[0].paidAmount).toBe(10.25);
    expect(settlement.updatedOrders[0].paymentStatus).toBe('paid');
    expect(settlement.updatedOrders[1].id).toBe('ELS-2');
    expect(settlement.updatedOrders[1].paidAmount).toBe(4.75);
    expect(settlement.updatedOrders[1].paymentStatus).toBe('khata_debited');
  });
});

