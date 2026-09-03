import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  CameraOff, 
  Flashlight, 
  FlipHorizontal, 
  Volume2, 
  VolumeX, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Scan, 
  Search,
  Plus,
  RefreshCw,
  Zap,
  ShoppingBag,
  PackagePlus,
  Barcode,
  X,
  Loader2
} from 'lucide-react';
import { Product, ProductCategory, Language } from '../types';
import { playScannerBeep, playScannerWarningBeep } from '../lib/audio';
import { createProduct } from '../api';
import { notifyError } from '../utils/errorHandler';

// Common UAE Baqala test barcodes for quick testing without physical packaging
export const QUICK_TEST_BARCODES = [
  { barcode: '6281007001254', name: 'Al Rawabi / Almarai Milk 2L', nameAr: 'حليب طازج ٢ لتر', icon: '🥛', price: '11.50 AED' },
  { barcode: '089686010724', name: 'Indomie Mi Goreng (5pk)', nameAr: 'إندومي مي جورينج', icon: '🍜', price: '7.50 AED' },
  { barcode: '6281031110013', name: 'Lipton Yellow Label 100TB', nameAr: 'شاي ليبتون ١٠٠ كيس', icon: '☕', price: '16.50 AED' },
  { barcode: '7622210741203', name: 'Puck Cream Cheese 500g', nameAr: 'جبنة بوك كاسات ٥٠٠غ', icon: '🧀', price: '15.00 AED' },
  { barcode: '5449000000996', name: 'Coca-Cola Original 330ml', nameAr: 'كوكاكولا علبة ٣٣٠ مل', icon: '🥤', price: '3.50 AED' },
  { barcode: '6291007004033', name: 'Arabic Sliced White Bread', nameAr: 'خبز أبيض توست عربي', icon: '🍞', price: '5.50 AED' },
  { barcode: '6291003001015', name: 'Mai Dubai Mineral Water 1.5L', nameAr: 'مياه مي دبي ١٫٥ لتر', icon: '💧', price: '10.50 AED' },
  { barcode: '7613035341234', name: 'KitKat 4-Finger Chocolate', nameAr: 'شوكولاتة كيت كات ٤ أصابع', icon: '🍫', price: '3.00 AED' },
  { barcode: '028400043816', name: 'Lays Chilli Potato Chips', nameAr: 'ليز بالفلفل الحار', icon: '🥔', price: '4.50 AED' },
  { barcode: '6281007002015', name: 'White Eggs Large (Pack 15)', nameAr: 'بيض أبيض كبير ١٥ حبة', icon: '🥚', price: '13.00 AED' },
  { barcode: '6299900112233', name: 'Unmapped / New Barcode (Test)', nameAr: 'باركود جديد غير مسجل', icon: '✨', price: 'Unknown' },
];

const CATEGORY_IMAGES: Record<string, string> = {
  'Dairy & Eggs': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80',
  'Pantry': 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=400&q=80',
  'Snacks': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
  'Fresh Produce': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
  'Household': 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&w=400&q=80',
  'Personal Care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
};

interface CameraBarcodeScannerProps {
  products: Product[];
  onProductScanned: (product: Product, rawBarcode: string) => void;
  onNewProductCreated?: (product: Product) => void;
  storeId?: string;
  lang?: Language;
  cart?: Record<string, number>;
  onClose?: () => void;
  isInline?: boolean; // If true, renders embedded within POS; otherwise renders as full overlay
}

export const CameraBarcodeScanner: React.FC<CameraBarcodeScannerProps> = ({
  products,
  onProductScanned,
  onNewProductCreated,
  storeId = 'store-1',
  lang = 'en',
  cart = {},
  onClose,
  isInline = false,
}) => {
  const isRtl = lang === 'ar';
  const scannerId = useRef(`qr-reader-${Math.random().toString(36).substring(2, 9)}`).current;
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorchCapability, setHasTorchCapability] = useState(false);
  
  // Last scan feedback state
  const [lastScannedProduct, setLastScannedProduct] = useState<{
    product: Product;
    time: number;
    barcode: string;
  } | null>(null);
  const [lastUnrecognizedCode, setLastUnrecognizedCode] = useState<string | null>(null);
  const [scanSuccessFlash, setScanSuccessFlash] = useState(false);
  const [scanWarningFlash, setScanWarningFlash] = useState(false);

  // Quick Add Product Modal state for Unknown Barcodes
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddBarcode, setQuickAddBarcode] = useState('');
  const [quickAddSku, setQuickAddSku] = useState('');
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddNameAr, setQuickAddNameAr] = useState('');
  const [quickAddCategory, setQuickAddCategory] = useState<ProductCategory>('Pantry');
  const [quickAddPrice, setQuickAddPrice] = useState('');
  const [quickAddStock, setQuickAddStock] = useState('25');
  const [quickAddUnit, setQuickAddUnit] = useState('1 Unit');
  const [quickAddUnitAr, setQuickAddUnitAr] = useState('١ حبة');
  const [quickAddSaving, setQuickAddSaving] = useState(false);
  const [quickAddError, setQuickAddError] = useState<string | null>(null);

  // Manual code input
  const [manualCode, setManualCode] = useState('');

  // Debounce ref to avoid duplicate continuous trigger on same barcode
  const lastScanTimeRef = useRef<number>(0);
  const lastCodeRef = useRef<string>('');

  // Find product by barcode, SKU, ID, or JSON payload
  const lookupProduct = useCallback((code: string): Product | undefined => {
    const trimmed = code.trim();
    if (!trimmed) return undefined;

    // 1. Direct Barcode Match
    let matched = products.find(p => p.barcode && p.barcode.toLowerCase() === trimmed.toLowerCase());
    if (matched) return matched;

    // 2. SKU Match
    matched = products.find(p => p.sku && p.sku.toLowerCase() === trimmed.toLowerCase());
    if (matched) return matched;

    // 3. ID Match
    matched = products.find(p => p.id.toLowerCase() === trimmed.toLowerCase());
    if (matched) return matched;

    // 4. Try parsing as JSON QR Code (e.g. {"id":"p101"} or {"barcode":"6281007001254"})
    try {
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        if (parsed.barcode) {
          matched = products.find(p => p.barcode === parsed.barcode);
          if (matched) return matched;
        }
        if (parsed.id) {
          matched = products.find(p => p.id === parsed.id);
          if (matched) return matched;
        }
        if (parsed.sku) {
          matched = products.find(p => p.sku === parsed.sku);
          if (matched) return matched;
        }
      }
    } catch {
      // Ignore JSON parse errors
    }

    // 5. Partial fallback for EAN-13 vs UPC-A (some scanners drop or prepend leading zero)
    if (trimmed.length === 12) {
      const withZero = '0' + trimmed;
      matched = products.find(p => p.barcode === withZero);
      if (matched) return matched;
    } else if (trimmed.length === 13 && trimmed.startsWith('0')) {
      const withoutZero = trimmed.substring(1);
      matched = products.find(p => p.barcode === withoutZero);
      if (matched) return matched;
    }

    return undefined;
  }, [products]);

  // Handle successful code decode
  const handleCodeDetected = useCallback((decodedText: string) => {
    const now = Date.now();
    // Allow re-scanning same code after 1.2 seconds, or different code after 400ms
    if (decodedText === lastCodeRef.current && now - lastScanTimeRef.current < 1200) {
      return;
    }
    if (now - lastScanTimeRef.current < 400) {
      return;
    }

    lastScanTimeRef.current = now;
    lastCodeRef.current = decodedText;

    const matchedProduct = lookupProduct(decodedText);
    if (matchedProduct) {
      // 1. RECOGNIZED PRODUCT FLOW
      // Visual Green Success Flash overlay
      setScanWarningFlash(false);
      setScanSuccessFlash(true);
      setTimeout(() => setScanSuccessFlash(false), 400);

      // Auditory Feedback
      if (soundEnabled) {
        playScannerBeep();
      }

      // Subtle Haptic Vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 30, 60]);
        } catch {
          // Safe fallback
        }
      }

      setLastUnrecognizedCode(null);
      setLastScannedProduct({
        product: matchedProduct,
        time: now,
        barcode: decodedText,
      });
      onProductScanned(matchedProduct, decodedText);
    } else {
      // 2. UNKNOWN / UNMAPPED BARCODE FLOW
      // Visual Amber Warning Flash overlay
      setScanSuccessFlash(false);
      setScanWarningFlash(true);
      setTimeout(() => setScanWarningFlash(false), 450);

      // Warning Audio Cue
      if (soundEnabled) {
        playScannerWarningBeep();
      }

      // Alert Haptic Pattern
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 60, 100]);
        } catch {
          // Safe fallback
        }
      }

      setLastUnrecognizedCode(decodedText);
      setLastScannedProduct(null);
    }
  }, [lookupProduct, onProductScanned, soundEnabled]);

  // Open Quick Add Form prefilled with unknown barcode
  const handleOpenQuickAdd = (barcodeToRegister: string) => {
    setQuickAddBarcode(barcodeToRegister);
    setQuickAddSku(`SKU-${barcodeToRegister.slice(-6).replace(/[^0-9A-Za-z]/g, '') || Math.floor(100000 + Math.random() * 900000)}`);
    setQuickAddName('');
    setQuickAddNameAr('');
    setQuickAddCategory('Pantry');
    setQuickAddPrice('');
    setQuickAddStock('25');
    setQuickAddUnit('1 Unit');
    setQuickAddUnitAr('١ حبة');
    setQuickAddError(null);
    setShowQuickAddModal(true);
  };

  // Submit Quick Add Product Form
  const handleSaveQuickProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddName.trim()) {
      setQuickAddError(isRtl ? 'يرجى إدخال اسم المنتج' : 'Please enter product name');
      return;
    }
    const priceNum = parseFloat(quickAddPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setQuickAddError(isRtl ? 'يرجى إدخال سعر صحيح أكبر من الصفر' : 'Please enter a valid price greater than 0');
      return;
    }

    setQuickAddSaving(true);
    setQuickAddError(null);

    try {
      const stockNum = parseInt(quickAddStock, 10) || 25;
      const defaultImg = CATEGORY_IMAGES[quickAddCategory] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

      const newProductPayload: Partial<Product> = {
        storeId,
        name: quickAddName.trim(),
        nameAr: quickAddNameAr.trim() || quickAddName.trim(),
        category: quickAddCategory,
        barcode: quickAddBarcode.trim(),
        sku: quickAddSku.trim() || undefined,
        price: priceNum,
        regularPrice: priceNum,
        stock: stockNum,
        inStock: stockNum > 0,
        unit: quickAddUnit.trim() || '1 Unit',
        unitAr: quickAddUnitAr.trim() || '١ حبة',
        image: defaultImg,
      };

      const created = await createProduct(newProductPayload);

      // Notify parent about new product
      if (onNewProductCreated) {
        onNewProductCreated(created);
      }

      // Automatically add newly registered product to cart!
      onProductScanned(created, created.barcode || quickAddBarcode);

      // Success confirmation state & effects
      setLastUnrecognizedCode(null);
      setShowQuickAddModal(false);
      setLastScannedProduct({
        product: created,
        time: Date.now(),
        barcode: quickAddBarcode,
      });

      // Visual & audio success trigger
      setScanSuccessFlash(true);
      setTimeout(() => setScanSuccessFlash(false), 400);
      if (soundEnabled) {
        playScannerBeep();
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([80, 40, 80]);
        } catch {
          // Safe fallback
        }
      }
    } catch (err: any) {
      notifyError(err, 'Failed to quick-add product');
      setQuickAddError(err?.message || (isRtl ? 'فشل حفظ المنتج الجديد' : 'Failed to register product'));
    } finally {
      setQuickAddSaving(false);
    }
  };

  // Start Camera Scanner
  const startScanner = useCallback(async () => {
    setCameraError(null);
    try {
      // Ensure any existing instance is cleaned up
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch {
          // Ignore cleanup errors
        }
      }

      const qrCode = new Html5Qrcode(scannerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = qrCode;

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdgePercentage = 0.75;
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
          return {
            width: Math.min(qrboxSize, 380),
            height: Math.min(Math.floor(qrboxSize * 0.7), 240),
          };
        },
        aspectRatio: 1.333334,
      };

      await qrCode.start(
        { facingMode: facingMode },
        config,
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        () => {
          // Ignored per-frame decode non-matches
        }
      );

      setIsCameraActive(true);

      // Check if torch/flashlight is supported
      try {
        const capabilities = qrCode.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setHasTorchCapability(true);
        }
      } catch {
        setHasTorchCapability(false);
      }
    } catch (err: any) {
      console.warn('[CameraBarcodeScanner] Camera initialization error:', err);
      setIsCameraActive(false);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setCameraError(isRtl ? 'تم رفض إذن الوصول للكاميرا. يرجى منح الإذن من إعدادات المتصفح.' : 'Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError(isRtl ? 'لم يتم العثور على كاميرا في هذا الجهاز.' : 'No camera hardware detected on this device.');
      } else {
        setCameraError(isRtl ? 'تعذر تشغيل كاميرا الماسح الضوئي. يمكنك استخدام أزرار الباركود السريعة أدناه.' : 'Unable to activate video stream. You can use the quick barcode test buttons below or enter the code manually.');
      }
    }
  }, [facingMode, handleCodeDetected, isRtl, scannerId]);

  // Stop Camera Scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('[CameraBarcodeScanner] Cleanup error:', err);
      }
    }
    setIsCameraActive(false);
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        startScanner();
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [facingMode]); // Re-init when flipping camera

  // Toggle Torch/Flashlight
  const handleToggleTorch = async () => {
    if (!html5QrCodeRef.current || !hasTorchCapability) return;
    try {
      const nextTorch = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  // Flip Camera (Front / Back)
  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle Manual Code Submission
  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeDetected(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className={`flex flex-col relative ${isInline ? 'w-full' : 'w-full h-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl'}`}>
      
      {/* Scanner Header / Controls */}
      <div className="p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">
                {isRtl ? 'ماسح الباركود وQR بالكاميرا' : 'Live Camera Barcode & QR Scanner'}
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCameraActive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isCameraActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isRtl ? 'مرر باركود السلعة أمام الكاميرا للإضافة الفورية' : 'Point camera at any retail barcode to auto-add item to POS cart'}
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Beep Audio Enabled' : 'Beep Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {hasTorchCapability && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                torchOn
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle Flashlight"
            >
              <Flashlight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleFlipCamera}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-xs"
            title="Flip Camera (Front/Back)"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition-all ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="relative bg-black overflow-hidden flex items-center justify-center min-h-[270px] max-h-[350px] border-b border-slate-800">
        
        {/* html5-qrcode DOM Target Element */}
        <div id={scannerId} className="w-full h-full [&_video]:object-cover" />

        {/* Laser Scanner Animation Overlay */}
        {isCameraActive && !showQuickAddModal && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Viewfinder Target Frame */}
            <div className="relative w-64 h-44 sm:w-80 sm:h-52 rounded-2xl border-2 border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex flex-col justify-between p-2 overflow-hidden">
              
              {/* Corner Reticles */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Animated Laser Scanline */}
              <motion.div
                animate={{
                  y: [0, 180, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] opacity-90"
              />

              {/* Central alignment crosshair */}
              <div className="self-center text-[10px] tracking-wider uppercase font-mono font-bold text-emerald-400/90 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                {isRtl ? 'ضع الباركود داخل الإطار' : 'Align Barcode in Viewfinder'}
              </div>
            </div>
          </div>
        )}

        {/* VISUAL FEEDBACK: Green Success Flash Overlay with Glowing Borders & Confirmation */}
        <AnimatePresence>
          {scanSuccessFlash && (
            <motion.div
              initial={{ opacity: 0.9, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-emerald-500/25 border-4 border-emerald-400 backdrop-blur-[1px] shadow-[inset_0_0_50px_rgba(16,185,129,0.6)] pointer-events-none z-30 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="px-4 py-2 rounded-2xl bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-emerald-300 tracking-wide uppercase shadow-emerald-950/80"
              >
                <Check className="w-5 h-5 stroke-[3] text-white" />
                <span>{isRtl ? 'تم التعرف والإضافة بنجاح!' : 'Recognized & Added +1'}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VISUAL FEEDBACK: Amber Warning Flash Overlay on Unknown Code */}
        <AnimatePresence>
          {scanWarningFlash && (
            <motion.div
              initial={{ opacity: 0.9, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 bg-amber-500/20 border-4 border-amber-400 backdrop-blur-[1px] shadow-[inset_0_0_40px_rgba(245,158,11,0.5)] pointer-events-none z-30 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="px-4 py-2 rounded-2xl bg-amber-600 text-white font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-amber-300 tracking-wide uppercase shadow-amber-950/80"
              >
                <AlertCircle className="w-5 h-5 text-white" />
                <span>{isRtl ? 'باركود غير مسجل!' : 'Unknown Barcode Scanned!'}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error / Fallback State if Camera unavailable */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center z-20">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-300 mb-3">
              <CameraOff className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              {isRtl ? 'الكاميرا غير متاحة حالياً' : 'Live Camera Inactive'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
              {cameraError}
            </p>
            <button
              type="button"
              onClick={startScanner}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إعادة محاولة الكاميرا' : 'Retry Camera Feed'}</span>
            </button>
          </div>
        )}

        {/* Recognized Live Scanned Product Overlay Card (Pop on detection) */}
        <AnimatePresence>
          {lastScannedProduct && !showQuickAddModal && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 z-30"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={lastScannedProduct.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                    alt={lastScannedProduct.product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-950"
                  />
                  <span className="absolute -top-1.5 -right-1.5 p-1 bg-emerald-500 text-white rounded-full shadow">
                    <Check className="w-3 h-3" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      ADDED +1
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{lastScannedProduct.barcode}
                    </span>
                  </div>
                  <h5 className="text-xs font-black text-white truncate">
                    {isRtl ? lastScannedProduct.product.nameAr : lastScannedProduct.product.name}
                  </h5>
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                    <span>
                      {((lastScannedProduct.product.sale && lastScannedProduct.product.discountedPrice) ? lastScannedProduct.product.discountedPrice : lastScannedProduct.product.price).toFixed(2)} AED
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">
                      {isRtl ? 'في السلة:' : 'In Cart:'} <strong className="text-white font-mono">{cart[lastScannedProduct.product.id] || 1}</strong>
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </motion.div>
          )}

          {/* UNKNOWN PRODUCT NOTIFICATION: Banner with Fast Quick Add Product Action */}
          {lastUnrecognizedCode && !showQuickAddModal && (
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md border border-amber-500/60 rounded-2xl p-3.5 shadow-2xl z-30 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
                    <PackagePlus className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {isRtl ? 'منتج غير مسجل' : 'Unknown Product'}
                      </span>
                      <span className="text-[11px] text-amber-200 font-mono font-bold">
                        #{lastUnrecognizedCode}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {isRtl ? 'هذا الباركود غير موجود في مخزون متجرك' : 'Barcode is not yet in your store catalog'}
                    </p>
                    <p className="text-[10px] text-slate-300">
                      {isRtl ? 'هل ترغب في إضافة هذا الصنف الآن وبيعه فوراً؟' : 'Quickly register this item to start selling immediately'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLastUnrecognizedCode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons for Unknown Barcode */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpenQuickAdd(lastUnrecognizedCode)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRtl ? 'إضافة سريعة للمنتج والمخزون' : 'Quick Add Product & Cart'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLastUnrecognizedCode(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                >
                  {isRtl ? 'تجاهل' : 'Dismiss'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QUICK ADD PRODUCT FORM MODAL OVERLAY */}
        <AnimatePresence>
          {showQuickAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-40 p-4 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <PackagePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">
                        {isRtl ? 'إضافة منتج جديد بالباركود الممسوح' : 'Quick Register New Product'}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Barcode: <span className="text-emerald-400 font-bold">#{quickAddBarcode}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {quickAddError && (
                  <div className="mb-2 p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{quickAddError}</span>
                  </div>
                )}

                <form id="quick-add-form" onSubmit={handleSaveQuickProduct} className="space-y-2.5 text-xs">
                  {/* Name EN & AR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold text-[10px] mb-1">
                        {isRtl ? 'اسم السلعة (إنجليزي) *' : 'Product Name (English) *'}
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        value={quickAddName}
                        onChange={(e) => setQuickAddName(e.target.value)}
                        placeholder="e.g. Kinza Citrus Soda 250ml"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold text-[10px] mb-1">
                        {isRtl ? 'اسم السلعة (عربي)' : 'Product Name (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={quickAddNameAr}
                        onChange={(e) => setQuickAddNameAr(e.target.value)}
                        placeholder="مثال: كينزا حمضيات ٢٥٠ مل"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Category & Price */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold text-[10px] mb-1">
                        {isRtl ? 'التصنيف' : 'Category'}
                      </label>
                      <select
                        value={quickAddCategory}
                        onChange={(e) => setQuickAddCategory(e.target.value as ProductCategory)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Dairy & Eggs">Dairy & Eggs (ألبان وبيض)</option>
                        <option value="Bakery">Bakery (مخبوزات)</option>
                        <option value="Beverages">Beverages (مشروبات)</option>
                        <option value="Pantry">Pantry (بقالة وتموين)</option>
                        <option value="Snacks">Snacks (تسالي ومقرمشات)</option>
                        <option value="Fresh Produce">Fresh Produce (خضار وفواكه)</option>
                        <option value="Household">Household (منظفات)</option>
                        <option value="Personal Care">Personal Care (عناية شخصية)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-emerald-400 font-bold text-[10px] mb-1">
                        {isRtl ? 'سعر البيع (AED) *' : 'Selling Price (AED) *'}
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        required
                        value={quickAddPrice}
                        onChange={(e) => setQuickAddPrice(e.target.value)}
                        placeholder="e.g. 2.50"
                        className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-500 font-bold"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-slate-400 font-bold text-[10px] mb-1">
                        {isRtl ? 'المخزون المتاح' : 'Stock Quantity'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quickAddStock}
                        onChange={(e) => setQuickAddStock(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  disabled={quickAddSaving}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  form="quick-add-form"
                  disabled={quickAddSaving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/50 transition-all"
                >
                  {quickAddSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isRtl ? 'جارِ الحفظ...' : 'Saving to Catalog...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isRtl ? 'حفظ وإضافة للسلة فوراً' : 'Save & Auto-Add to Cart'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Bottom Section: Manual Barcode Entry + Quick Simulation Strip */}
      <div className="p-3.5 sm:p-4 bg-slate-950/90 flex flex-col gap-3">
        
        {/* Manual Barcode / Scanner Gun Input Form */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder={isRtl ? 'أدخل رقم الباركود يدوياً أو استخدم قارئ الليزر...' : 'Type barcode or scan with USB/Bluetooth scanner gun...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إدخال' : 'Add Code'}</span>
          </button>
        </form>

        {/* Quick UAE Baqala Test Presets Bar (Instant One-Tap Testing) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{isRtl ? 'تجربة سريعة للباركود الإماراتي (One-Tap Test)' : 'Simulate UAE Baqala Barcodes (1-Tap Test):'}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Instant POS Cart Match</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-28 overflow-y-auto pr-1">
            {QUICK_TEST_BARCODES.map((item) => (
              <button
                key={item.barcode}
                type="button"
                onClick={() => handleCodeDetected(item.barcode)}
                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 group ${
                  item.price === 'Unknown'
                    ? 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-700/60 hover:border-amber-500'
                    : 'bg-slate-900/80 hover:bg-emerald-950/50 border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <span className="text-base shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-200 truncate group-hover:text-emerald-300">
                    {isRtl ? item.nameAr : item.name}
                  </p>
                  <p className={`text-[10px] font-mono font-semibold ${item.price === 'Unknown' ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                    {item.price}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
