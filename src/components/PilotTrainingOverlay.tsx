import React, { useState } from 'react';

// [PILOT COMPONENT] On-Screen Dynamic Training Overlay for 10-Store Stakeholders
export function PilotTrainingOverlay({ currentRole }: { currentRole: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const trainingSteps: Record<string, string[]> = {
    customer: [
      "🌐 STEP 1: Toggle English/العربية to test seamless bidirectional RTL layout translations.",
      "🏢 STEP 2: Use the Address Dropdown to select one of the 5 flyer-matched residential towers.",
      "🛒 STEP 3: Add Almarai Milk or Indomie to the cart and hit '1-Tap WhatsApp Checkout' to trace the precise fils-to-integer accounting engine execution."
    ],
    merchant: [
      "🔔 STEP 1: Listen for the audio alert when an order arrives and move it across the Kanban layout board.",
      "🖨️ STEP 2: Click 'Print Ticket' to trigger the Web Bluetooth ESC/POS 58mm/80mm counter receipt layout builder.",
      "💰 STEP 3: Open 'Shift Settlement', count the physical UAE notes/coins, enter the value, and generate your immutable cash variance audit certificate."
    ],
    rider: [
      "☀️ STEP 1: Hit 'Sunlight Mode' to toggle the high-contrast amber display for outdoor legibility.",
      "🏢 STEP 2: Tap the 'Tower Batch Filter' chips to view orders grouped by building name, checking the 3-minute-per-floor elevator cycle time estimates.",
      "🤝 STEP 3: Use the 'Doorstep COD Changer' to quickly calculate exact change due for 50, 100, or 200 AED notes at the customer's flat door."
    ]
  };

  const steps = trainingSteps[currentRole.toLowerCase()] || [];
  if (steps.length === 0) return null;

  return (
    <div className="bg-slate-900 text-slate-100 p-4 border-b border-slate-800 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="animate-pulse h-2 w-2 rounded-full bg-amber-400"></span>
            <h4 className="text-xs font-black tracking-wider uppercase text-amber-400">
              🚀 Interactive {currentRole} Training Script
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            {steps.map((step, idx) => (
              <p key={idx} className="text-[11px] font-medium leading-relaxed text-slate-300">
                {step}
              </p>
            ))}
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-1 rounded transition shrink-0"
        >
          Hide Guide
        </button>
      </div>
    </div>
  );
}
