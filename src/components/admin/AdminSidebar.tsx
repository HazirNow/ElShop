import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  ShieldCheck, 
  X,
  Menu,
  Activity,
  Rocket
} from 'lucide-react';
import { ElShopLogo } from '../ElShopLogo';
import { Language } from '../../types';

export type AdminTab = 'dashboard' | 'stores' | 'users' | 'billing' | 'settings' | 'audit' | 'readiness';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout?: () => void;
  lang: Language;
  overdueCount: number;
  globalSearchQuery: string;
  onGlobalSearchChange: (q: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  lang,
  overdueCount,
  globalSearchQuery,
  onGlobalSearchChange,
  isMobileOpen,
  onCloseMobile,
}) => {
  const isRtl = lang === 'ar';

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      labelEn: 'Dashboard Overview',
      labelAr: 'لوحة التحكم العامة',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'stores' as AdminTab,
      labelEn: 'Store Management',
      labelAr: 'إدارة شبكة المتاجر',
      icon: Building2,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'users' as AdminTab,
      labelEn: 'User Directory & 2FA',
      labelAr: 'دليل المستخدمين والصلاحيات',
      icon: Users,
      badge: null,
    },
    {
      id: 'billing' as AdminTab,
      labelEn: 'Billing & Subscriptions',
      labelAr: 'الفوترة والاشتراكات',
      icon: CreditCard,
      badge: null,
    },
    {
      id: 'audit' as AdminTab,
      labelEn: 'Security Audit Trail',
      labelAr: 'سجل التدقيق والأمان',
      icon: FileText,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'readiness' as AdminTab,
      labelEn: 'Go-Live Readiness',
      labelAr: 'جاهزية الإطلاق المباشر',
      icon: Rocket,
      badge: 'Sept 9',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ElShopLogo size="sm" variant="white" showCountry />
        </div>
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Global Search Input */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            placeholder={isRtl ? 'بحث عام (المتاجر، المستخدمين)...' : 'Global search (stores, users)...'}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {globalSearchQuery && (
            <button
              onClick={() => onGlobalSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links (Scrollable body) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          {isRtl ? 'الأقسام الرئيسية' : 'Enterprise Modules'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950 font-bold'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{isRtl ? item.labelAr : item.labelEn}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pinned Bottom Controls (Settings & Logout) */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-1 mt-auto">
        <button
          onClick={() => {
            onSelectTab('settings');
            onCloseMobile();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400" />
          <span>{isRtl ? 'إعدادات النظام والرسوم' : 'System Settings'}</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{isRtl ? 'تسجيل الخروج الآمن' : 'Lock & Sign Out'}</span>
          </button>
        )}

        <div className="pt-2 px-2 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cloud SQL Active</span>
          </span>
          <span>v2.4.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
