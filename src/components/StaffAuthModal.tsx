import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Store as StoreIcon, 
  Bike, 
  BarChart3, 
  X, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  PlusCircle,
  Building2
} from 'lucide-react';
import { Role, Language, Store } from '../types';
import { getTranslation } from '../translations';
import { verifyStaffAuth } from '../api';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (role: Role, storeId?: string) => void;
  onOpenMerchantOnboarding?: () => void;
  stores?: Store[];
  activeStoreId?: string;
  lang: Language;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  onOpenMerchantOnboarding,
  stores = [],
  activeStoreId,
  lang,
}) => {
  const [selectedRole, setSelectedRole] = useState<'merchant' | 'rider' | 'admin'>('merchant');
  const [selectedStoreId, setSelectedStoreId] = useState<string>(activeStoreId || (stores[0]?.id ?? 'store-1'));
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = (key: string, params?: Record<string, any>) => getTranslation(lang, key, params);
  const isRtl = lang === 'ar';

  useEffect(() => {
    if (activeStoreId) {
      setSelectedStoreId(activeStoreId);
    } else if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [activeStoreId, stores]);

  const targetStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const handleKeypadPress = (num: string) => {
    if (passcode.length < 12) {
      setPasscode((prev) => prev + num);
      setErrorMsg(null);
    }
  };

  const handleBackspace = () => {
    setPasscode((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!passcode.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال رمز المرور أو PIN' : 'Please enter your security access PIN');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await verifyStaffAuth({
        role: selectedRole,
        storeId: selectedRole !== 'admin' ? selectedStoreId : undefined,
        passcode: passcode.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
        setErrorMsg(null);

        const storeIdToLock = res.storeId || selectedStoreId;

        // Save authorized session in sessionStorage
        try {
          sessionStorage.setItem(
            'elshop_staff_session',
            JSON.stringify({
              role: selectedRole,
              storeId: storeIdToLock,
              storeName: res.storeName || targetStore?.name,
              authTime: Date.now(),
            })
          );
        } catch (err) {
          console.warn('SessionStorage not accessible:', err);
        }

        setTimeout(() => {
          onAuthenticate(selectedRole, storeIdToLock);
          setIsSuccess(false);
          setPasscode('');
          onClose();
        }, 500);
      } else {
        setErrorMsg(
          res.message ||
          (isRtl 
            ? 'رمز الدخول غير صحيح لهذا المتجر. يرجى المحاولة مرة أخرى' 
            : `Invalid PIN for ${targetStore?.name || 'this store'}. Check credentials below.`)
        );
        setPasscode('');
      }
    } catch (err) {
      setErrorMsg(isRtl ? 'حدث خطأ في المصادقة' : 'Authentication verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {isRtl ? 'بوابة دخول موظفي المتجر والشركاء' : 'Store POS & Staff Security Gateway'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isRtl ? 'دخول مشفر ومعزول لكل متجر وبقالة' : 'Isolated, PIN-protected multi-tenant store access'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isRtl ? 'اختر بوابة الدخول' : 'Select Portal'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('merchant');
                    setPasscode('');
                    setErrorMsg(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'merchant'
                      ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <StoreIcon className={`w-4 h-4 ${selectedRole === 'merchant' ? 'text-emerald-400' : ''}`} />
                  <span className="text-[11px] font-bold">
                    {isRtl ? 'المتجر / POS' : 'Store POS'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('rider');
                    setPasscode('');
                    setErrorMsg(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'rider'
                      ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bike className={`w-4 h-4 ${selectedRole === 'rider' ? 'text-emerald-400' : ''}`} />
                  <span className="text-[11px] font-bold">
                    {isRtl ? 'المندوب' : 'Runner App'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin');
                    setPasscode('');
                    setErrorMsg(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'admin'
                      ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-emerald-400' : ''}`} />
                  <span className="text-[11px] font-bold">
                    {isRtl ? 'الإدارة HQ' : 'Admin HQ'}
                  </span>
                </button>
              </div>
            </div>

            {/* Store Selector (for Merchant & Rider roles) */}
            {selectedRole !== 'admin' && stores.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {isRtl ? 'اختر المتجر أو الفرع' : 'Target Store / Branch'}
                </label>
                <div className="relative">
                  <select
                    value={selectedStoreId}
                    onChange={(e) => {
                      setSelectedStoreId(e.target.value);
                      setPasscode('');
                      setErrorMsg(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] transition-all cursor-pointer"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {isRtl ? s.nameAr : s.name} — {s.area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Passkey Input */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    {selectedRole === 'admin'
                      ? (isRtl ? 'رمز مرور المسؤول (Admin Master Key)' : 'Admin Master Passkey')
                      : (isRtl ? `رمز PIN السري لـ (${targetStore ? (isRtl ? targetStore.nameAr : targetStore.name) : 'المتجر'})` : `4-Digit Security PIN for ${targetStore?.name || 'Store'}`)}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    {showPasscode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPasscode ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder={
                      selectedRole === 'admin' 
                        ? 'Enter admin key...' 
                        : '••••'
                    }
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] transition-all"
                  />
                  <KeyRound className={`w-4 h-4 text-slate-500 absolute ${isRtl ? 'left-3' : 'right-3'} top-4`} />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Banner */}
              {isSuccess && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-600/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{isRtl ? 'تم التحقق بنجاح! جاري فتح الواجهة...' : 'Access Granted! Locking session to store...'}</span>
                </div>
              )}

              {/* Numeric Keypad for fast touch input */}
              {selectedRole !== 'admin' && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleKeypadPress(n)}
                      className="py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700/60 active:scale-95 transition-all"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPasscode('')}
                    className="py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-400 font-semibold text-xs rounded-xl border border-slate-700/40"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700/60 active:scale-95 transition-all"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-400 font-semibold text-xs rounded-xl border border-slate-700/40"
                  >
                    ⌫
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSuccess || isLoading}
                className="w-full bg-[#0B6E4F] hover:bg-emerald-600 active:scale-[0.99] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>
                  {isRtl ? 'تسجيل الدخول الآمن للمتجر' : `Authenticate & Open ${selectedRole === 'merchant' ? `${targetStore?.name || 'Store'} POS` : selectedRole === 'rider' ? 'Rider Courier' : 'Admin HQ'}`}
                </span>
              </button>
            </form>

            {/* Authorized Demo Credentials Reference Pill */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Authorized Store Credentials (Demo)</span>
                </span>
                <span className="text-[10px] text-slate-500">Auto-locks on exit</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('merchant');
                    setPasscode(targetStore?.pin || '');
                    setErrorMsg(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-lg text-center border border-slate-800 text-emerald-400"
                >
                  Store: <strong className="text-white">{targetStore?.pin || '---'}</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('rider');
                    setPasscode(targetStore?.riderPin || '');
                    setErrorMsg(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-lg text-center border border-slate-800 text-emerald-400"
                >
                  Rider: <strong className="text-white">{targetStore?.riderPin || '---'}</strong>
                </button>
              </div>
            </div>

            {/* Merchant Onboarding Banner / Shortcut */}
            {onOpenMerchantOnboarding && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{isRtl ? 'تريد تسجيل متجر جديد؟' : 'New store owner?'}</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMerchantOnboarding();
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline underline-offset-2"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'سجل بقالتك أو متجرك الآن' : 'Register Store / Onboard'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
