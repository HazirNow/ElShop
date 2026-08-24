import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  RefreshCw, 
  X, 
  Check, 
  Upload, 
  Sparkles, 
  AlertCircle,
  FlipHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import { compressDataUrl } from '../lib/imageUtils.ts';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  isRtl?: boolean;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  isRtl = false,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flashAnimation, setFlashAnimation] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Compress & normalize captured image using canvas
  const processImage = (imageSrc: string): Promise<string> => {
    return compressDataUrl(imageSrc, 640, 0.6);
  };

  // Start video stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      setErrorMessage(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        setErrorMessage('Camera API is not supported in this browser. Please use the native camera upload.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.error('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Live camera stream not accessible:', err);
      setHasCameraPermission(false);
      setErrorMessage('Could not open live viewfinder. You can still take a picture directly with your phone camera.');
    }
  };

  // Stop video stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  // Take snapshot from video stream
  const handleSnap = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // If user camera is mirrored
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawData = canvas.toDataURL('image/jpeg', 0.9);
      const compressed = await processImage(rawData);
      setCapturedImage(compressed);
      stopCamera();
    }
    setIsCapturing(false);
  };

  // Switch facing lens (rear vs front)
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handle native phone camera file input or gallery selection
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const compressed = await processImage(event.target.result as string);
        setCapturedImage(compressed);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value so user can pick again if needed
    e.target.value = '';
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Close and cleanup
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {isRtl ? 'التقاط صورة المنتج' : 'Take Product Photo'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isRtl ? 'استخدم كاميرا الهاتف لتصوير المنتج' : 'Use phone camera to snap item packaging'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hidden inputs for native camera & gallery picker */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={nativeCameraInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Viewport Area */}
          <div className="relative bg-black flex-1 min-h-[300px] max-h-[420px] flex items-center justify-center overflow-hidden">
            {/* White Flash Effect when photo is snapped */}
            {flashAnimation && (
              <div className="absolute inset-0 bg-white z-30 animate-fade-out" />
            )}

            {capturedImage ? (
              // Captured Photo Preview
              <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2">
                <img
                  src={capturedImage}
                  alt="Captured Product"
                  className="max-h-[380px] w-auto max-w-full object-contain rounded-2xl border border-slate-800 shadow-md"
                />
                <div className="absolute top-4 left-4 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow backdrop-blur-sm flex items-center gap-1.5 border border-emerald-400/40">
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تم التقاط الصورة' : 'Photo Ready'}</span>
                </div>
              </div>
            ) : hasCameraPermission !== false ? (
              // Live Video Feed Viewfinder
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Viewfinder Target Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-dashed border-emerald-400/80 rounded-2xl flex flex-col items-center justify-between p-3 relative shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                    <div className="w-full flex justify-between">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    </div>
                    <span className="text-[11px] bg-slate-950/70 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-sm font-semibold">
                      {isRtl ? 'ضع المنتج داخل الإطار' : 'Center Product Here'}
                    </span>
                    <div className="w-full flex justify-between">
                      <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Switch Lens Button (Rear / Front) */}
                <button
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-800 text-white p-2.5 rounded-full border border-slate-700 backdrop-blur-sm shadow-lg transition-all"
                  title="Switch Camera (Front / Back)"
                >
                  <FlipHorizontal className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            ) : (
              // Camera Permission Denied or Unsupported Fallback
              <div className="p-6 text-center text-slate-300 space-y-4 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">
                    {isRtl ? 'تشغيل كاميرا الهاتف' : 'Camera Access Notice'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {errorMessage || 'Tap below to launch your smartphone camera directly to snap this product.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isRtl ? 'فتح كاميرا الهاتف الآن' : 'Launch Phone Camera'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Bar / Controls */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
            {capturedImage ? (
              // Confirmation Actions
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>{isRtl ? 'إعادة التصوير' : 'Retake Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'اعتماد هذه الصورة' : 'Use This Photo'}</span>
                </button>
              </div>
            ) : (
              // Capture Controls
              <div className="space-y-2.5">
                <div className="flex items-center justify-center gap-4">
                  {/* Gallery Button */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all"
                    title="Choose from Gallery / Photos"
                  >
                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                  </button>

                  {/* Big Snap Shutter Button */}
                  <button
                    type="button"
                    disabled={isCapturing}
                    onClick={() => {
                      if (hasCameraPermission !== false && stream) {
                        handleSnap();
                      } else {
                        nativeCameraInputRef.current?.click();
                      }
                    }}
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-slate-900 transition-all cursor-pointer"
                    title="Take Photo"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-slate-950 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-slate-950" />
                    </div>
                  </button>

                  {/* Native Phone Camera Launcher Button */}
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all"
                    title="Direct Phone Camera App"
                  >
                    <Upload className="w-5 h-5 text-amber-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1 border-t border-slate-800/80">
                  <span className="cursor-pointer hover:text-emerald-400" onClick={() => galleryInputRef.current?.click()}>
                    📁 {isRtl ? 'ألبوم الصور' : 'Photo Gallery'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-semibold text-slate-300">
                    📸 {isRtl ? 'كاميرا الهاتف' : 'Tap Shutter to Snap'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="cursor-pointer hover:text-amber-400" onClick={() => nativeCameraInputRef.current?.click()}>
                    📱 {isRtl ? 'تطبيق الكاميرا' : 'Camera App'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
