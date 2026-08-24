import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  LogOut, 
  KeyRound, 
  Store as StoreIcon, 
  Bike, 
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LockKeyhole
} from 'lucide-react';
import { AppState, Language, Role } from '../../types';

interface AdminUserTableProps {
  state: AppState;
  lang: Language;
  onShowToast: (msg: string) => void;
  onAddAuditLog: (entry: { actor: string; action: string; target: string; severity: 'info' | 'warning' | 'critical' | 'success'; details?: string }) => void;
}

interface UserDirectoryItem {
  id: string;
  name: string;
  role: Role;
  contact: string;
  storeName?: string;
  twoFactorEnabled: boolean;
  status: 'active' | 'revoked' | 'locked';
  lastActive: string;
  details: string;
}

export const AdminUserTable: React.FC<AdminUserTableProps> = ({
  state,
  lang,
  onShowToast,
  onAddAuditLog,
}) => {
  const isRtl = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'merchant' | 'rider' | 'customer' | 'admin'>('all');
  const [userStatuses, setUserStatuses] = useState<Record<string, 'active' | 'revoked' | 'locked'>>({});
  const [twoFactorStates, setTwoFactorStates] = useState<Record<string, boolean>>({
    'admin-1': true,
    'store-1-mgr': true,
    'cust-1': true,
    'rider-1': false,
  });

  // Build unified user directory list from AppState
  const unifiedUsers: UserDirectoryItem[] = [
    // HQ Admins
    {
      id: 'admin-hq-1',
      name: 'Super Admin HQ',
      role: 'admin',
      contact: 'admin@elshop.ae',
      storeName: 'Platform Central',
      twoFactorEnabled: twoFactorStates['admin-hq-1'] ?? true,
      status: userStatuses['admin-hq-1'] || 'active',
      lastActive: 'Just now',
      details: 'Full Root Privileges • CBUAE Key Signer',
    },
    // Store Merchants
    ...state.stores.map((s, idx) => ({
      id: `merchant-${s.id}`,
      name: s.merchantName || `${s.name} Operator`,
      role: 'merchant' as Role,
      contact: s.merchantEmail || s.whatsapp || s.phone || '+971500000000',
      storeName: s.name,
      twoFactorEnabled: twoFactorStates[`merchant-${s.id}`] ?? (idx % 2 === 0),
      status: userStatuses[`merchant-${s.id}`] || (s.servicePaused ? 'locked' : 'active'),
      lastActive: '12m ago',
      details: `POS Terminal Access • PIN: ${s.storePin || '1234'}`,
    })),
    // Couriers / Riders
    ...state.riders.map((r, idx) => {
      const parentStore = state.stores.find((s) => s.id === r.storeId);
      return {
        id: `rider-${r.id}`,
        name: r.name,
        role: 'rider' as Role,
        contact: r.phone,
        storeName: parentStore?.name || 'In-House Courier',
        twoFactorEnabled: twoFactorStates[`rider-${r.id}`] ?? false,
        status: userStatuses[`rider-${r.id}`] || (r.isOnline ? 'active' : 'active'),
        lastActive: r.isOnline ? 'Active Online' : '35m ago',
        details: `${r.vehicle} • ${r.completedDeliveriesCount || 0} Runs • Rating ${r.rating}`,
      };
    }),
    // Resident Customers
    ...state.customers.map((c, idx) => ({
      id: `customer-${c.id}`,
      name: c.name,
      role: 'customer' as Role,
      contact: c.phone,
      storeName: c.tower,
      twoFactorEnabled: twoFactorStates[`customer-${c.id}`] ?? (c.isKhataPreApproved ? true : false),
      status: userStatuses[`customer-${c.id}`] || 'active',
      lastActive: '2h ago',
      details: `${c.unit} • Khata: ${c.currentKhataBalance} / ${c.khataLimit} AED`,
    })),
  ];

  // Filtering
  const filteredUsers = unifiedUsers.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.storeName && u.storeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  // Actions
  const handleRevokeSession = (user: UserDirectoryItem) => {
    setUserStatuses((prev) => ({ ...prev, [user.id]: 'revoked' }));
    onAddAuditLog({
      actor: 'Admin HQ',
      action: 'Session Terminated & Revoked',
      target: `${user.name} (${user.id})`,
      severity: 'warning',
      details: `Forced instant sign-out. Invalidate JWT tokens across all mobile and POS devices.`,
    });
    onShowToast(`Revoked active session for ${user.name}`);
  };

  const handleToggleLockUser = (user: UserDirectoryItem) => {
    const isCurrentlyLocked = user.status === 'locked';
    const newStatus = isCurrentlyLocked ? 'active' : 'locked';
    setUserStatuses((prev) => ({ ...prev, [user.id]: newStatus }));
    onAddAuditLog({
      actor: 'Admin HQ',
      action: isCurrentlyLocked ? 'User Account Unlocked' : 'User Account Locked',
      target: `${user.name} (${user.id})`,
      severity: isCurrentlyLocked ? 'success' : 'critical',
      details: `Authentication credentials toggled to ${newStatus}.`,
    });
    onShowToast(`User account ${isCurrentlyLocked ? 'unlocked' : 'locked'}: ${user.name}`);
  };

  const handleToggle2FA = (user: UserDirectoryItem) => {
    const new2FA = !user.twoFactorEnabled;
    setTwoFactorStates((prev) => ({ ...prev, [user.id]: new2FA }));
    onAddAuditLog({
      actor: 'Admin HQ',
      action: new2FA ? '2FA Enforced' : '2FA Bypassed',
      target: `${user.name} (${user.id})`,
      severity: new2FA ? 'success' : 'warning',
      details: `Two-factor authentication hardware policy updated.`,
    });
    onShowToast(`2FA ${new2FA ? 'Enabled' : 'Disabled'} for ${user.name}`);
  };

  return (
    <div className="space-y-6" id="admin-user-management-module">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>{isRtl ? 'دليل المستخدمين وصلاحيات 2FA' : 'User Directory & Security Policies'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'مراقبة حسابات المدراء، أصحاب البقالات، المناديب وسكان الأبراج مع فرض المصادقة الثنائية'
              : 'Enterprise identity governance, 2FA status audit, and instant session revocation.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-bold">2FA Active: {unifiedUsers.filter(u => u.twoFactorEnabled).length} / {unifiedUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث بالاسم، رقم الهاتف، المعرف...' : 'Search name, phone, tower, ID...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['all', 'admin', 'merchant', 'rider', 'customer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'المستخدم والهوية' : 'User & Identity'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'الدور والمنشأة' : 'Role & Tenant'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'حالة 2FA' : '2FA Status'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'حالة الحساب' : 'Account Gate'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'آخر نشاط' : 'Last Active'}</th>
                <th className="py-3.5 px-4 font-extrabold text-right">{isRtl ? 'الإجراءات' : 'Security Actions'}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredUsers.map((user) => {
                const isLocked = user.status === 'locked';
                const isRevoked = user.status === 'revoked';

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User & Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          user.role === 'admin'
                            ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                            : user.role === 'merchant'
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                            : user.role === 'rider'
                            ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700'
                            : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm">{user.name}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{user.contact}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Tenant */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : user.role === 'merchant'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : user.role === 'rider'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {user.role}
                        </span>
                        <div className="text-slate-400 text-[11px] mt-1">{user.storeName}</div>
                      </div>
                    </td>

                    {/* 2FA Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggle2FA(user)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          user.twoFactorEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                        title="Click to toggle 2FA requirement"
                      >
                        {user.twoFactorEnabled ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>2FA Enabled</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                            <span>2FA Disabled</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4">
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <UserX className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      )}
                      {isRevoked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <LogOut className="w-3 h-3" />
                          <span>Session Revoked</span>
                        </span>
                      )}
                      {!isLocked && !isRevoked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {user.lastActive}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Revoke Session Button */}
                        <button
                          onClick={() => handleRevokeSession(user)}
                          className="bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          title="Force Sign-Out & Revoke Active Tokens"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Revoke Session</span>
                        </button>

                        {/* Lock / Unlock Toggle */}
                        <button
                          onClick={() => handleToggleLockUser(user)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isLocked
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700'
                          }`}
                          title={isLocked ? 'Unlock Account' : 'Lock Account Access'}
                        >
                          {isLocked ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
