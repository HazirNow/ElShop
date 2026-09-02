import React from 'react';
import { Wifi, BatteryMedium, Signal, Sparkles } from 'lucide-react';

interface DevicePhoneFrameProps {
  children: React.ReactNode;
  theme?: 'dark' | 'sunlight';
  statusBarTitle?: string;
  isRtl?: boolean;
}

export const DevicePhoneFrame: React.FC<DevicePhoneFrameProps> = ({
  children,
  theme = 'dark',
  statusBarTitle,
  isRtl = false
}) => {
  const isSunlight = theme === 'sunlight';

  return (
    <div className="relative inline-block select-none my-2 transition-transform duration-300">
      {/* Outer Titanium Chassis: Strictly Fixed 375px x 720px */}
      <div
        className={`relative w-[375px] min-w-[375px] max-w-[375px] h-[720px] min-h-[720px] max-h-[720px] shrink-0 rounded-[52px] p-[10px] shadow-[0_28px_70px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-500 ${
          isSunlight
            ? 'bg-[#18150f] border-4 border-amber-500/80 ring-2 ring-amber-400/40 shadow-amber-500/20'
            : 'bg-[#12161f] border-4 border-[#252c3b] ring-1 ring-slate-700/80 shadow-emerald-950/40'
        }`}
      >
        {/* Left Side Physical Buttons: Action Button + Volume Up + Volume Down */}
        <div className="absolute -left-[9px] top-28 w-[5px] h-8 bg-slate-700 rounded-l-md shadow-sm" />
        <div className="absolute -left-[9px] top-40 w-[5px] h-12 bg-slate-700 rounded-l-md shadow-sm" />
        <div className="absolute -left-[9px] top-56 w-[5px] h-12 bg-slate-700 rounded-l-md shadow-sm" />

        {/* Right Side Physical Button: Power / Lock */}
        <div className="absolute -right-[9px] top-36 w-[5px] h-16 bg-slate-700 rounded-r-md shadow-sm" />

        {/* Dynamic Island Pill with Camera & Sensor */}
        <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-32 h-[26px] bg-black rounded-full z-40 flex items-center justify-between px-3 shadow-md border border-white/5 pointer-events-none">
          {/* Front Camera Lens Dot with subtle anti-reflective blue-green glint */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#0a0f18] ring-1 ring-slate-800 relative flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
          </div>

          {/* Dynamic Island Speaker / Audio Wave Indicator */}
          <div className="flex items-center gap-1">
            <div className="w-1 h-2 bg-emerald-400/80 rounded-full animate-pulse" />
            <div className="w-1 h-3 bg-emerald-400 rounded-full" />
            <div className="w-1 h-1.5 bg-emerald-400/80 rounded-full animate-pulse" />
          </div>

          {/* FaceID / Ambient Sensor Dot */}
          <div className="w-2 h-2 rounded-full bg-[#111827]" />
        </div>

        {/* Inner Screen Display (Fixed viewport with internal scrolling) */}
        <div
          className={`w-full h-full rounded-[42px] overflow-hidden flex flex-col pt-9 pb-2 relative transition-colors duration-500 ${
            isSunlight ? 'bg-[#181816] text-[#FFF8DC]' : 'bg-slate-950 text-slate-100'
          }`}
        >
          {/* iOS System Status Bar */}
          <div className="px-6 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 select-none shrink-0 z-30">
            {/* Time */}
            <span className="font-mono text-white font-black text-xs tracking-tight">09:41</span>

            {/* Middle Carrier / Store status if provided */}
            {statusBarTitle && (
              <span className="text-[10px] text-emerald-400 font-extrabold truncate max-w-[130px]">
                {statusBarTitle}
              </span>
            )}

            {/* Status Icons: Signal, 5G, Wi-Fi, Battery */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3 text-slate-200" />
              <span className="text-[9px] font-black text-emerald-400">5G</span>
              <Wifi className="w-3 h-3 text-slate-200" />
              <div className="flex items-center gap-0.5 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
                <span className="text-[8px] font-black font-mono text-emerald-400">100%</span>
                <div className="w-3.5 h-2 rounded-sm bg-emerald-500 relative flex items-center justify-center">
                  <div className="w-0.5 h-1 bg-white rounded-full absolute -right-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Screen Content Wrapper (Fixed Height with Smooth Internal Scroll) */}
          <div className="flex-1 w-full h-[calc(100%-48px)] overflow-y-auto overflow-x-hidden flex flex-col no-scrollbar">
            {children}
          </div>

          {/* iOS Bottom Home Indicator Bar */}
          <div className="w-full flex items-center justify-center pt-1.5 pb-0.5 shrink-0 select-none pointer-events-none">
            <div className="w-32 h-1 rounded-full bg-slate-600/60" />
          </div>
        </div>
      </div>
    </div>
  );
};
