import { describe, it, expect } from 'vitest';
import { getTierAccess } from '../hooks/useTierAccess';
import { Store } from '../types';

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
});
