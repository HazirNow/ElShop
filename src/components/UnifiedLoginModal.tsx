import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Store as StoreIcon, 
  Bike, 
  ShieldCheck, 
  ShoppingBag, 
  Lock, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Mail,
  Shield,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Store, Role, Language } from '../types';
import { verifyStaffAuth } from '../api';
import { ElShopLogo } from './ElShopLogo';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (role: Role, storeId?: string) => void;
  stores: Store[];
  activeStoreId?: string;
  initialRole?: Role;
  lang?: Language;
}

export const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  stores = [],
  activeStoreId,
  initialRole = 'merchant',
  lang = 'en',
}) => {
  const isRtl = lang === 'ar';
  
  // Selected Login Role Tab
  const [selectedRole, setSelectedRole] = useState<'merchant' | 'rider' | 'admin' | 'customer'>(
    initialRole === 'customer' ? 'merchant' : (initialRole as any) || 'merchant'
  );

  // Form Fields
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    activeStoreId || (stores[0]?.id ?? 'store-1')
  );
  const [phone, setPhone] = useState<string>('+971 50 123 4567');
  const [passcode, setPasscode] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('admin@elshop.ae');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick reset when role changes
  const handleRoleChange = (role: 'merchant' | 'rider' | 'admin' | 'customer') => {
    setSelectedRole(role);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPasscode('');
    setShowPassword(false);
    if (role === 'merchant') {
      const st = stores.find((s) => s.id === selectedStoreId) || stores[0];
      setPhone(st?.phone || '+971 50 123 4567');
    } else if (role === 'rider') {
      setPhone('+971 52 987 6543');
    }
  };

  const handleQuickDemoFill = (type: 'merchant' | 'rider') => {
    setErrorMsg(null);
    if (type === 'merchant') {
      setSelectedRole('merchant');
      const st = stores.find((s) => s.id === selectedStoreId) || stores[0];
      setPasscode(st?.pin || '');
      setPhone(st?.phone || '');
    } else if (type === 'rider') {
      setSelectedRole('rider');
      const st = stores.find((s) => s.id === selectedStoreId) || stores[0];
      setPasscode(st?.riderPin || '');
      setPhone('+971 52 987 6543');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Customer direct entry
    if (selectedRole === 'customer') {
      onAuthenticate('customer', selectedStoreId);
      onClose();
      return;
    }

    // Admin Auth
    if (selectedRole === 'admin') {
      if (!adminEmail.trim()) {
        setErrorMsg('Please enter your administrator email.');
        return;
      }
      if (!adminPassword.trim()) {
        setErrorMsg('Please enter your admin master key or password.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await verifyStaffAuth({
          role: 'admin',
          passcode: adminPassword.trim(),
        });
        if (res.success) {
          setSuccessMsg('Admin authentication verified. Initializing HQ Dashboard...');
          if (rememberMe) {
            try {
              sessionStorage.setItem('elshop_staff_session', JSON.stringify({ role: 'admin', timestamp: Date.now() }));
            } catch (e) {}
          }
          setTimeout(() => {
            onAuthenticate('admin');
            onClose();
          }, 450);
        } else {
          setErrorMsg(res.message || 'Invalid administrator master key or passcode.');
        }
      } catch (err) {
        setErrorMsg('Authentication service unavailable. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Merchant / Rider Auth
    if (!passcode.trim()) {
      setErrorMsg(`Please enter your 4-digit ${selectedRole === 'merchant' ? 'Store POS' : 'Rider Courier'} PIN.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyStaffAuth({
        role: selectedRole,
        storeId: selectedStoreId,
        passcode: passcode.trim(),
      });

      if (res.success) {
        const storeName = res.storeName || stores.find((s) => s.id === selectedStoreId)?.name || 'Store';
        setSuccessMsg(`Welcome back to ${storeName}! Loading ${selectedRole === 'merchant' ? 'POS Terminal' : 'Delivery Board'}...`);
        
        if (rememberMe) {
          try {
            sessionStorage.setItem(
              'elshop_staff_session',
              JSON.stringify({ role: selectedRole, storeId: selectedStoreId, timestamp: Date.now() })
            );
          } catch (e) {}
        }

        setTimeout(() => {
          onAuthenticate(selectedRole, selectedStoreId);
          onClose();
        }, 450);
      } else {
        const expectedPin = selectedRole === 'merchant'
          ? (stores.find((s) => s.id === selectedStoreId)?.pin || '1234')
          : (stores.find((s) => s.id === selectedStoreId)?.riderPin || '5678');
        setErrorMsg(res.message || `Invalid PIN for this store. Default PIN is "${expectedPin}".`);
      }
    } catch (err) {
      setErrorMsg('Failed to verify PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        id="unified-login-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-100"
          id="unified-login-modal-card"
        >
          {/* Top Decorative Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-indigo-500/20 via-emerald-500/10 to-transparent blur-2xl pointer-events-none" />

          {/* Header Bar */}
          <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <ElShopLogo size="md" variant="white" showCountry />
              <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                {isRtl ? 'بوابة الدخول الموحدة' : 'Unified Access'}
              </span>
            </div>

            <button
              onClick={onClose}
              id="unified-login-close-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Login Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            
            {/* Title & Subtitle */}
            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isRtl ? 'تسجيل الدخول إلى حسابك' : 'Sign In to Your Workspace'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isRtl
                  ? 'اختر دورك الوظيفي للوصول إلى لوحة التحكم الخاصة بك مع أقصى درجات الأمان'
                  : 'Select your stakeholder role to access your dedicated POS terminal, dispatch console, or HQ dashboard.'}
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div 
              className="grid grid-cols-3 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold"
              id="unified-login-role-tabs"
            >
              <button
                type="button"
                onClick={() => handleRoleChange('merchant')}
                id="tab-role-merchant"
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all ${
                  selectedRole === 'merchant'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <StoreIcon className="w-4 h-4 shrink-0" />
                <span>{isRtl ? 'تاجر / متجر' : 'Merchant'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('rider')}
                id="tab-role-rider"
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all ${
                  selectedRole === 'rider'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bike className="w-4 h-4 shrink-0" />
                <span>{isRtl ? 'مندوب توصيل' : 'Rider'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                id="tab-role-admin"
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-amber-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{isRtl ? 'إدارة HQ' : 'Admin'}</span>
              </button>
            </div>

            {/* Error / Success Notifications */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold"
                  id="unified-login-error-alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                  id="unified-login-success-alert"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" id="unified-login-form">
              
              {/* Merchant / Rider: Store Selector */}
              {(selectedRole === 'merchant' || selectedRole === 'rider') && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    {isRtl ? 'اختر الفرع / المتجر' : 'Assigned Store Branch'}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStoreId}
                      onChange={(e) => {
                        setSelectedStoreId(e.target.value);
                        const found = stores.find((s) => s.id === e.target.value);
                        if (found) setPhone(found.phone);
                      }}
                      id="unified-login-store-select"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.area}) • {s.paymentStatus === 'overdue' ? '⚠️ Overdue' : 'Active'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Merchant / Rider: Phone Number */}
              {(selectedRole === 'merchant' || selectedRole === 'rider') && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    {isRtl ? 'رقم الهاتف المسجل' : 'Registered WhatsApp / Mobile Phone'}
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 000 0000"
                      id="unified-login-phone-input"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Merchant / Rider: 4-Digit Security PIN */}
              {(selectedRole === 'merchant' || selectedRole === 'rider') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      {selectedRole === 'merchant' 
                        ? (isRtl ? 'رمز أمان نقطة البيع (4 أرقام)' : 'Store POS Security PIN (4 Digits)')
                        : (isRtl ? 'رمز أمان المندوب (4 أرقام)' : 'Rider Courier Dispatch PIN (4 Digits)')}
                    </label>
                    <span className="text-[11px] text-indigo-400 font-mono">
                      Default: {selectedRole === 'merchant' ? '1234' : '5678'}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <KeyRound className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      maxLength={8}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder={selectedRole === 'merchant' ? '1234' : '5678'}
                      id="unified-login-pin-input"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-500 hover:text-slate-300"
                      aria-label="Toggle PIN Visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Admin: Email & Master Key */}
              {selectedRole === 'admin' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      {isRtl ? 'البريد الإلكتروني الإداري' : 'Enterprise Admin Email'}
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@elshop.ae"
                        id="unified-login-admin-email"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-300">
                        {isRtl ? 'المفتاح الرئيسي / كلمة المرور' : 'Master Key / Password'}
                      </label>
                      <span className="text-[11px] text-amber-400 font-mono">
                        {isRtl ? 'مفتاح الإدارة' : 'HQ Master Key'}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        id="unified-login-admin-pass"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-500 hover:text-slate-300"
                        aria-label="Toggle Password Visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Remember Session & Help */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>{isRtl ? 'تذكر هذه الجلسة' : 'Keep me signed in'}</span>
                </label>

                {selectedRole !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill(selectedRole as any)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    {isRtl ? 'ملء تجريبي سريع' : 'Auto-Fill Store PIN'}
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="unified-login-submit-btn"
                className={`w-full py-3 px-4 rounded-xl text-xs font-black text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  selectedRole === 'merchant'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/50'
                    : selectedRole === 'rider'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-950/50'
                    : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-amber-950/50'
                }`}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <>
                    <span>
                      {selectedRole === 'merchant'
                        ? (isRtl ? 'دخول نقطة بيع المتجر (POS)' : 'Launch Merchant POS Terminal')
                        : selectedRole === 'rider'
                        ? (isRtl ? 'دخول منصة التوصيل' : 'Launch Rider Dispatch App')
                        : (isRtl ? 'دخول لوحة الإدارة الرئيسية' : 'Access Multi-Tenant Admin HQ')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Resident / Shopper Fast Access Banner */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRtl ? 'هل أنت مقيم في البرج وتريد التسوق؟' : 'Looking to order groceries to your unit?'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onAuthenticate('customer', selectedStoreId);
                  onClose();
                }}
                id="unified-login-customer-link"
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>{isRtl ? 'واجهة المتجر للمقيمين' : 'Resident Storefront'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

          </div>

          {/* Modal Footer Security Badge */}
          <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 256-Bit Encrypted • ACID Tenant Isolation</span>
            </div>
            <span>v2.4 Enterprise</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
