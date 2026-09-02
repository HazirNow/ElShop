import React from 'react';
import { Store, Wifi, Printer, Barcode, Clock, ShieldCheck } from 'lucide-react';

interface DeviceTabletFrameProps {
  children: React.ReactNode;
  storeName?: string;
  terminalId?: string;
  activeTabLabel?: string;
  headerControls?: React.ReactNode;
}

export const DeviceTabletFrame: React.FC<DeviceTabletFrameProps> = ({
  children,
  storeName = 'Al Medina Supermarket (Marina)',
  terminalId = 'POS-01',
  activeTabLabel = 'Kanban Dispatch',
  headerControls
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center my-4 select-none">
      {/* Scrollable Container Wrapper for mobile viewports to prevent squishing */}
      <div className="w-full overflow-x-auto pb-4 flex justify-center no-scrollbar">
        {/* Strictly Fixed Tablet Dimensions: 860px x 560px */}
        <div className="relative w-[860px] min-w-[860px] max-w-[860px] h-[560px] min-h-[560px] max-h-[560px] shrink-0 rounded-[38px] p-[12px] bg-[#141822] border-4 border-[#252c3c] ring-1 ring-slate-700/80 shadow-[0_35px_80px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)] flex flex-col">
          {/* Top Center TrueDepth Camera & Ambient Sensor */}
          <div className="absolute top-[5px] left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none z-40">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0a0f18] ring-1 ring-slate-800 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#080d14]" />
          </div>

          {/* Inner Tablet Display Screen */}
          <div className="w-full h-full rounded-[28px] overflow-hidden bg-slate-950 text-slate-100 flex flex-col border border-slate-800/80 relative">
            {/* Real POS Status Bar */}
            <div className="px-5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between text-xs shrink-0 select-none">
              {/* Left: Store Title & Terminal Pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="h-4 w-[1px] bg-slate-800" />
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-white text-xs">{storeName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    {terminalId} • iPad Pro (12.9&quot;)
                  </span>
                </div>
              </div>

              {/* Right: Hardware Peripherals Health & Header Controls */}
              <div className="flex items-center gap-3">
                {headerControls}

                <div className="hidden sm:flex items-center gap-2.5 text-[10px] font-bold text-slate-400 border-l border-slate-800 pl-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Printer className="w-3 h-3" />
                    <span>Thermal OK</span>
                  </span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <Barcode className="w-3 h-3" />
                    <span>Scanner USB</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-300 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>10:42 AM</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Screen Content (Fixed Viewport) */}
            <div className="flex-1 w-full h-[calc(100%-44px)] overflow-y-auto overflow-x-hidden p-4 sm:p-5 flex flex-col no-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Countertop POS Terminal Metallic Desk Stand Foot */}
      <div className="relative -mt-3 flex flex-col items-center pointer-events-none select-none">
        {/* Metal Neck Hinge */}
        <div className="w-28 h-6 bg-gradient-to-b from-[#1b212d] to-[#0f131a] rounded-t-lg border-t border-slate-700/60 shadow-lg" />
        {/* Heavy Brushed Metal Stand Base */}
        <div className="w-64 h-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-2xl border-t border-slate-600/50" />
      </div>
    </div>
  );
};
