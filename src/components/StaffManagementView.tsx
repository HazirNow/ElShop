import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Users, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  Bike, 
  Sliders, 
  Save
} from 'lucide-react';
import { Store, Language } from '../types';
import { useTierAccess } from '../hooks/useTierAccess';
import { updateStore } from '../api';
import { notifyError } from '../utils/errorHandler';

interface Props {
  store: Store;
  lang: Language;
  onRefresh: () => void;
  onOpenUpgradeModal?: (featureTitle?: string) => void;
}

export const StaffManagementView: React.FC<Props> = ({
  store,
  lang,
  onRefresh,
  onOpenUpgradeModal,
}) => {
  const isRtl = lang === 'ar';
  const tierAccess = useTierAccess(store);

  // PIN states
  const [managerPin, setManagerPin] = useState(store.managerPin || store.pin || '1234');
  const [cashierPin, setCashierPin] = useState(store.cashierPin || '1111');
  const [riderPin, setRiderPin] = useState(store.riderPin || '5678');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePins = async () => {
    setIsSaving(true);
    try {
      await updateStore(store.id, {
        managerPin,
        cashierPin,
        riderPin,
        pin: managerPin, // Keep master PIN aligned with manager
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (e) {
      notifyError(e, 'Failed to update staff security PINs');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="staff-management-view">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {isRtl ? 'إدارة صلاحيات الموظفين ورموز PIN للأدوار' : 'Staff Role PINs & Granular Access'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                Tier 2 Mart+
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isRtl
                ? 'تخصيص رموز PIN منفصلة للمدير، الكاشير، ومناديب التوصيل مع عزل الصلاحيات'
                : 'Configure dedicated 4-digit security PINs and permissions for Manager, Cashier, and Delivery Runners'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSavePins}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? (isRtl ? 'جاري الحفظ...' : 'Saving PINs...') : (isRtl ? 'حفظ رموز الموظفين' : 'Save Staff PINs')}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Staff Role PINs updated and synced across all local terminal sessions.</span>
        </div>
      )}

      {/* Role PINs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role 1: Store Manager */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Store Manager</h4>
                <p className="text-[10px] text-slate-400">Full Terminal Access</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
              Admin Role
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Manager 4-Digit PIN
            </label>
            <input
              type="text"
              maxLength={4}
              value={managerPin}
              onChange={(e) => setManagerPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-base font-mono font-black text-purple-300 tracking-widest focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
            <p className="font-bold text-slate-300">Capabilities:</p>
            <p>✓ End-of-shift Cash Reconciliation</p>
            <p>✓ Customer Khata Limit Overrides</p>
            <p>✓ Supplier Price & Inventory Management</p>
          </div>
        </div>

        {/* Role 2: Cashier / POS Operator */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Cashier / POS</h4>
                <p className="text-[10px] text-slate-400">Counter Sales Only</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              Counter Role
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cashier 4-Digit PIN
            </label>
            <input
              type="text"
              maxLength={4}
              value={cashierPin}
              onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-base font-mono font-black text-amber-300 tracking-widest focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
            <p className="font-bold text-slate-300">Capabilities:</p>
            <p>✓ Process Walk-in & Phone Orders</p>
            <p>✓ Check Resident Khata Balances</p>
            <p>✕ Restricted from adjusting credit limits</p>
          </div>
        </div>

        {/* Role 3: Delivery Runner / Rider */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Delivery Courier</h4>
                <p className="text-[10px] text-slate-400">Mobile Rider App</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Rider Role
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Rider 4-Digit PIN
            </label>
            <input
              type="text"
              maxLength={4}
              value={riderPin}
              onChange={(e) => setRiderPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-base font-mono font-black text-emerald-300 tracking-widest focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
            <p className="font-bold text-slate-300">Capabilities:</p>
            <p>✓ Accept Dispatched Elevator Runs</p>
            <p>✓ Confirm Cash Collection & POD</p>
            <p>✓ Hand-in Cash at End-of-Shift</p>
          </div>
        </div>
      </div>
    </div>
  );
};
