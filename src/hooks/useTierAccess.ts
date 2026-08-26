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
  
  // Core Gated Feature Flags
  canShiftReconciliation: boolean; // Tier 2+ (Mart / Franchise)
  canReconcileDrawer: boolean; // Tier 2+ alias
  canSetCreditLimits: boolean; // Tier 2+ (Mart / Franchise)
  canViewPnL: boolean; // Tier 3 (Franchise only)
  canManageStaffRoles: boolean; // Tier 2+
  canExportKhataCsv: boolean; // Tier 2+
  canBatchKhataStatements: boolean; // Tier 2+
  canViewBranchComparison: boolean; // Tier 3
  canMultiBranchBenchmarking: boolean; // Tier 3
  canManageReorderAlerts: boolean; // Tier 2+
  canAddStaffPINs: boolean; // Tier 2+
}

export function getTierAccess(storeOrTier?: Store | number | null): TierAccess {
  let tierNum: 1 | 2 | 3 = 1;

  if (typeof storeOrTier === 'number') {
    tierNum = (storeOrTier === 2 ? 2 : storeOrTier === 3 ? 3 : 1) as 1 | 2 | 3;
  } else if (storeOrTier && typeof storeOrTier === 'object') {
    if (typeof storeOrTier.subscriptionTier === 'number') {
      const raw = storeOrTier.subscriptionTier;
      tierNum = (raw === 2 ? 2 : raw === 3 ? 3 : 1) as 1 | 2 | 3;
    } else if (typeof storeOrTier.subscriptionFee === 'number') {
      tierNum = (storeOrTier.subscriptionFee >= 899 ? 3 : storeOrTier.subscriptionFee >= 599 ? 2 : 1) as 1 | 2 | 3;
    }
  }

  const isTier1 = tierNum === 1;
  const isTier2 = tierNum === 2;
  const isTier3 = tierNum === 3;

  const tierName = tierNum === 1 ? 'Baqala (Tier 1)' : tierNum === 2 ? 'Mart (Tier 2)' : 'Franchise (Tier 3)';
  const tierNameAr = tierNum === 1 ? 'باقة البقالة (المستوى 1)' : tierNum === 2 ? 'باقة المارت (المستوى 2)' : 'باقة الفروع (المستوى 3)';
  const tierFee = tierNum === 1 ? 299 : tierNum === 2 ? 599 : 899;

  return {
    tier: tierNum,
    tierName,
    tierNameAr,
    tierFee,
    isTier1,
    isTier2,
    isTier3,
    // Feature gates
    canShiftReconciliation: tierNum >= 2,
    canReconcileDrawer: tierNum >= 2,
    canSetCreditLimits: tierNum >= 2,
    canViewPnL: tierNum >= 3,
    canManageStaffRoles: tierNum >= 2,
    canExportKhataCsv: tierNum >= 2,
    canBatchKhataStatements: tierNum >= 2,
    canViewBranchComparison: tierNum >= 3,
    canMultiBranchBenchmarking: tierNum >= 3,
    canManageReorderAlerts: tierNum >= 2,
    canAddStaffPINs: tierNum >= 2,
  };
}

export function useTierAccess(storeOrTier?: Store | number | null): TierAccess {
  return useMemo(() => {
    return getTierAccess(storeOrTier);
  }, [
    typeof storeOrTier === 'number'
      ? storeOrTier
      : (storeOrTier as Store | null | undefined)?.subscriptionTier ?? (storeOrTier as Store | null | undefined)?.subscriptionFee
  ]);
}

export default useTierAccess;
