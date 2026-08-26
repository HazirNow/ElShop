import React, { useState } from 'react';

// [PILOT MODULE] Hyper-Local Building Elevator Poster Generator Core
export function ElevatorPosterGenerator({ storeName, storeId }: { storeName: string, storeId: string }) {
  const [promoText, setPromoText] = useState("FREE Fresh Bread on your first order above 20 AED!");
  
  const handlePrintFlyerPage = () => {
    window.print(); // Leverages high-resolution browser page print formatting stylesheets
  };

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl border border-amber-200 shadow-md max-w-xl mx-auto print:bg-white print:border-none print:shadow-none">
      <div className="text-center print:mt-12">
        <span className="bg-amber-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full">Elevator Marketing Kit</span>
        <h2 className="text-3xl font-extrabold text-gray-900 mt-3">{storeName} Is Now ONLINE!</h2>
        <p className="text-sm text-gray-600 mt-1">Get local products delivered straight to your door by our store Runners.</p>
      </div>

      <div className="my-8 p-4 bg-white rounded-lg border-2 border-dashed border-orange-400 text-center bg-opacity-90">
        <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">🔥 Limited Time Launch Promo</p>
        <textarea 
          className="w-full text-lg font-bold text-center text-gray-800 bg-transparent border-none focus:ring-0 resize-none mt-1 print:border-none"
          value={promoText}
          onChange={(e) => setPromoText(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-inner">
        <div className="w-40 h-40 bg-gray-200 flex items-center justify-center rounded border border-gray-300">
          {/* Simulated Direct QR Scan Link Destination Mapping Context */}
          <span className="text-center text-xs font-mono text-gray-500 p-2">QR Code Target:<br/>?tenant={storeId}</span>
        </div>
        <p className="text-xs font-bold text-gray-700 mt-3 uppercase tracking-widest">Scan QR To Order Natively</p>
      </div>

      <div className="mt-6 flex justify-center print:hidden">
        <button 
          onClick={handlePrintFlyerPage}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow transition"
        >
          🖨️ Print High-Res Elevator Flyer
        </button>
      </div>
    </div>
  );
}
