import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Check, ShieldCheck, X, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Language } from '../types';

interface MerchantCameraPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
  lang?: Language;
}

export const MerchantCameraPromptModal: React.FC<MerchantCameraPromptModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  lang = 'en',
}) => {
  const isRtl = lang === 'ar';
  const [isRequesting, setIsRequesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGrantAccess = async () => {
    setIsRequesting(true);
    setStatusMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatusMessage(
          isRtl
            ? 'متصفحك يدعم رفع الصور من الكاميرا عبر تطبيق الهاتف مباشرة'
            : 'Live stream not supported; native phone camera upload is ready.'
        );
        localStorage.setItem('elshop_merchant_camera_status', 'fallback');
        setTimeout(() => {
          onClose();
        }, 1200);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      // Stop stream immediately after acquiring permission
      stream.getTracks().forEach((track) => track.stop());

      setIsSuccess(true);
      localStorage.setItem('elshop_merchant_camera_status', 'granted');
      localStorage.setItem('elshop_merchant_camera_prompted', 'true');

      if (onPermissionGranted) {
        onPermissionGranted();
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.warn('Camera access denied or dismissed:', err);
      localStorage.setItem('elshop_merchant_camera_status', 'denied');
      localStorage.setItem('elshop_merchant_camera_prompted', 'true');
      setStatusMessage(
        isRtl
          ? 'تم تفضيل رفع الصور من تطبيق الكاميرا أو المعرض مباشرة دون بث مباشر'
          : 'Camera stream skipped. You can still snap photos using your phone camera app or gallery.'
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('elshop_merchant_camera_status', 'skipped');
    localStorage.setItem('elshop_merchant_camera_prompted', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        id="merchant-camera-prompt-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 space-y-5"
          id="merchant-camera-prompt-card"
        >
          {/* Top Decorative Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-500/20 blur-2xl pointer-events-none" />

          {/* Header Bar */}
          <div className="flex items-start justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                {isSuccess ? <Check className="w-6 h-6 text-emerald-400" /> : <Camera className="w-6 h-6 text-emerald-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {isRtl ? 'إضافة منتجات للكتالوج • خاص بالتاجر' : 'Add Products • Merchant POS Only'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {isRtl ? 'تفعيل الكاميرا لتصوير المنتجات' : 'Enable Product Photo & Barcode Camera'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {isRtl
              ? 'السماح لكاميرا نقطة البيع بالتقاط صور عبوات المنتجات فوراً وإضافتها لكتالوج بقالتك، بالإضافة لمسح الباركود عند الكاونتر. الزبائن وعمال التوصيل لا يتم سؤالهم أبداً عن هذا الإذن.'
              : 'Enable camera access to instantly snap product packaging photos for your store catalog and scan retail barcodes. Customers and delivery runners are never prompted for camera permissions.'}
          </p>

          {/* Feature highlights */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                📸
              </div>
              <span>{isRtl ? 'تصوير فوري لعبوات البقالة والمشروبات للكتالوج' : '1-Tap Product Photo Snapper for Store Catalog'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                🔍
              </div>
              <span>{isRtl ? 'مسح سريع للباركود وفواتير الموردين عند الكاونتر' : 'Fast Barcode & Inbound Supplier Invoices'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                🔒
              </div>
              <span>{isRtl ? 'خصوصية تامة: لا تظهر أي نافذة أذونات للمشترين أو المناديب' : 'Strict Role Privacy: Customers & Riders are never prompted'}</span>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              disabled={isRequesting || isSuccess}
              onClick={handleGrantAccess}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
            >
              {isRequesting ? (
                <span>{isRtl ? 'جاري طلب الإذن...' : 'Requesting Access...'}</span>
              ) : isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{isRtl ? 'تم التفعيل بنجاح' : 'Camera Enabled!'}</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>{isRtl ? 'السماح بالوصول للكاميرا' : 'Allow Camera Access'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
            >
              {isRtl ? 'ليس الآن' : 'Not Now / Skip'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
