import { useMemo } from 'react';
import { Store } from '../types';

export interface TierAccess {
  tier: 1 | 2 | 3;
  tierName: string;
  tierNameAr: string;
  tierFee: number;
  isTier1: boolean;
  isTier2: boolean;
  isTier3: boolean;
  // Feature flags
  canReconcileDrawer: boolean; // Tier 2+
  canSetCreditLimits: boolean; // Tier 2+
  canViewPnL: boolean; // Tier 3
  canManageStaffRoles: boolean; // Tier 2+
  canExportKhataCsv: boolean; // Tier 2+
  canBatchKhataStatements: boolean; // Tier 2+
  canViewBranchComparison: boolean; // Tier 3
  canManageReorderAlerts: boolean; // Tier 2+
  canAddStaffPINs: boolean; // Tier 2+
}

export function useTierAccess(store?: Store | null): TierAccess {
  return useMemo(() => {
    const tier: 1 | 2 | 3 = (store?.subscriptionTier as 1 | 2 | 3) || 1;

    const isTier1 = tier === 1;
    const isTier2 = tier === 2;
    const isTier3 = tier === 3;

    const tierName = tier === 1 ? 'Baqala Plan' : tier === 2 ? 'Mart Plan' : 'Franchise Plan';
    const tierNameAr = tier === 1 ? 'باقة البقالة' : tier === 2 ? 'باقة المارت' : 'باقة الفروع';
    const tierFee = tier === 1 ? 299 : tier === 2 ? 599 : 899;

    return {
      tier,
      tierName,
      tierNameAr,
      tierFee,
      isTier1,
      isTier2,
      isTier3,
      // Feature gates
      canReconcileDrawer: tier >= 2,
      canSetCreditLimits: tier >= 2,
      canViewPnL: tier >= 3,
      canManageStaffRoles: tier >= 2,
      canExportKhataCsv: tier >= 2,
      canBatchKhataStatements: tier >= 2,
      canViewBranchComparison: tier >= 3,
      canManageReorderAlerts: tier >= 2,
      canAddStaffPINs: tier >= 2,
    };
  }, [store?.subscriptionTier]);
}
