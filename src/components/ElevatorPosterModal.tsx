import React, { useState } from 'react';
import { X, Printer, Download, Sparkles, Building, Phone, QrCode, Check, Copy, Flame, Bike } from 'lucide-react';
import { Store, Language } from '../types';
import { ElShopLogo } from './ElShopLogo';
import { ProductImage } from './ProductImage';

interface ElevatorPosterModalProps {
  store: Store;
  lang: Language;
  onClose: () => void;
}

export const ElevatorPosterModal: React.FC<ElevatorPosterModalProps> = ({
  store,
  lang,
  onClose,
}) => {
  const [towerName, setTowerName] = useState('Marina Heights Tower');
  const [promoCode, setPromoCode] = useState('NEIGHBOR');
  const [offerText, setOfferText] = useState('Free Delivery on All Orders + 10% Off');
  const [paperSize, setPaperSize] = useState<'a4' | 'a5'>('a4');
  const [copiedLink, setCopiedLink] = useState(false);

  const isRtl = lang === 'ar';
  const storeUrl = window.location.origin;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto">
        
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Elevator & Lobby QR Poster Generator</h3>
              <p className="text-[11px] text-slate-400">
                Generate printable QR flyers for building lobbies, elevators & noticeboards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Poster</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Poster Editor & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-y-auto flex-1 bg-slate-950/50">
          
          {/* Customization Settings Sidebar */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Flyer Customization</span>
              </h4>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Building / Tower Name</label>
                <input
                  type="text"
                  value={towerName}
                  onChange={(e) => setTowerName(e.target.value)}
                  placeholder="e.g. Princess Tower, Dubai Marina"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Headline Promotion</label>
                <input
                  type="text"
                  value={offerText}
                  onChange={(e) => setOfferText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Exclusive Resident Promo Code</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Flyer Size Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperSize('a4')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      paperSize === 'a4'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    A4 Full Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperSize('a5')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      paperSize === 'a5'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    A5 Half Page (Elevator)
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                  <span>{copiedLink ? 'Store URL Copied to Clipboard!' : 'Copy Direct Web QR Link'}</span>
                </button>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-2xl p-4 text-[11px] text-emerald-200 space-y-1.5">
              <span className="font-extrabold flex items-center gap-1.5 text-emerald-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Zero-App Conversion Power
              </span>
              <p>
                When building residents scan this QR code with their phone camera, your store catalog opens directly in their browser. No App Store download or account password friction!
              </p>
            </div>
          </div>

          {/* Print Preview Canvas (Rendered for Screen & Print) */}
          <div className="lg:col-span-7 flex justify-center items-start">
            <div
              id="printable-poster-area"
              className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-[#0B6E4F] w-full max-w-[420px] flex flex-col items-center text-center relative overflow-hidden"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {/* Decorative Accent Ribbon */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400 rotate-45 flex items-end justify-center pb-2 shadow-md">
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-wider">Fast</span>
              </div>

              {/* Tower & Building Badge */}
              <div className="bg-emerald-50 border border-emerald-200 text-[#0B6E4F] font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Exclusively for {towerName}</span>
              </div>

              {/* Store Identity */}
              <div className="flex items-center gap-2.5 mb-2">
                <ProductImage
                  src={store.image}
                  alt={store.name}
                  fallbackType="store"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#0B6E4F] shadow-md bg-emerald-900"
                />
                <div className="text-left">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {store.name}
                  </h2>
                  <p className="text-xs font-bold text-emerald-700">{store.nameAr}</p>
                </div>
              </div>

              {/* Headline Offer */}
              <div className="bg-amber-400 text-slate-950 font-black text-sm px-4 py-2 rounded-2xl shadow-sm my-2 w-full">
                ⚡ {offerText}
              </div>

              {/* Delivery Promise */}
              <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-[#0B6E4F] my-1">
                <Bike className="w-4 h-4" />
                <span>15 - 20 MIN DOORSTEP DELIVERY TO YOUR FLAT</span>
              </div>

              {/* High-Resolution Stylized QR Code Box */}
              <div className="my-4 p-4 bg-slate-50 border-2 border-dashed border-emerald-600/60 rounded-3xl flex flex-col items-center relative shadow-inner">
                {/* SVG QR Code Simulation with Center Logo */}
                <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow border border-slate-200 flex items-center justify-center relative">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* QR Code Matrix Elements */}
                    <path d="M0 0h30v30H0zm5 5h20v20H5zM10 10h10v10H10zM70 0h30v30H70zm5 5h20v20H75zM80 10h10v10H80zM0 70h30v30H0zm5 5h20v20H5zM10 80h10v10H10zM35 5h5v10h-5zm10 0h10v5h-10zm15 0h5v15h-5zm-25 15h15v5h-15zm20 0h5v10h-5zm-20 15h5v5h-5zm10 0h15v5h-15zm20 0h5v10h-5zm15 0h5v5h-5zm-45 10h10v5h-10zm15 0h10v10h-10zm15 0h10v5h-10zm-30 15h5v15h-5zm10 0h5v5h-5zm15 0h10v5h-10zm15 0h5v15h-5zm-25 10h15v5h-15zm30 0h10v10h-10zm-40 5h5v10h-5zm15 0h5v5h-5zm10 0h10v10h-10z" />
                  </svg>
                  {/* QR Center Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-1 rounded-xl shadow-lg border border-emerald-600">
                      <ElShopLogo size="xs" variant="badge" />
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] font-black text-slate-800 flex items-center gap-1">
                  <span>📱 Point Camera to Order Instantly</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">No App Download Required • Zero-Install</span>
              </div>

              {/* Promo Code Badge */}
              <div className="bg-slate-100 border border-slate-300 rounded-xl px-4 py-1.5 my-1 text-xs">
                <span className="text-slate-600 font-medium">Use Code: </span>
                <span className="font-mono font-black text-emerald-800 tracking-widest">{promoCode}</span>
              </div>

              {/* Store WhatsApp Contact */}
              <div className="mt-3 pt-3 border-t border-slate-200 w-full flex items-center justify-between text-xs text-slate-700 font-bold px-2">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0B6E4F]" />
                  <span className="font-mono">{store.phone}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Card • Cash • Monthly Khata
                </div>
              </div>

              {/* ElShop Brand Footer on Poster */}
              <div className="mt-4 pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">Powered by</span>
                <ElShopLogo size="xs" variant="light-badge" showCountry />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
