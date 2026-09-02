import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MousePointerClick, ChevronRight } from 'lucide-react';

interface GesturePointerProps {
  label: string;
  subLabel?: string;
  hintPosition?: 'top' | 'bottom' | 'left' | 'right';
  onClick?: () => void;
  pulseColor?: 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky';
  className?: string;
  compact?: boolean;
  actionText?: string;
}

export const GesturePointer: React.FC<GesturePointerProps> = ({
  label,
  subLabel,
  hintPosition = 'bottom',
  onClick,
  pulseColor = 'emerald',
  className = '',
  compact = false,
  actionText = 'CLICK HERE'
}) => {
  const colorMap = {
    emerald: {
      ring: 'border-emerald-400 bg-emerald-500/30 text-emerald-300',
      badge: 'bg-emerald-950 border-emerald-400 text-emerald-100 shadow-[0_10px_35px_rgba(16,185,129,0.45)]',
      dot: 'bg-gradient-to-tr from-emerald-500 to-teal-300 text-slate-950 shadow-[0_0_20px_#34d399]',
      tag: 'bg-emerald-400 text-slate-950',
      arrow: 'text-emerald-400'
    },
    amber: {
      ring: 'border-amber-400 bg-amber-500/30 text-amber-300',
      badge: 'bg-amber-950 border-amber-400 text-amber-100 shadow-[0_10px_35px_rgba(245,158,11,0.45)]',
      dot: 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-[0_0_20px_#fbbf24]',
      tag: 'bg-amber-400 text-slate-950',
      arrow: 'text-amber-400'
    },
    indigo: {
      ring: 'border-indigo-400 bg-indigo-500/30 text-indigo-300',
      badge: 'bg-indigo-950 border-indigo-400 text-indigo-100 shadow-[0_10px_35px_rgba(99,102,241,0.45)]',
      dot: 'bg-gradient-to-tr from-indigo-500 to-purple-300 text-slate-950 shadow-[0_0_20px_#818cf8]',
      tag: 'bg-indigo-400 text-slate-950',
      arrow: 'text-indigo-400'
    },
    rose: {
      ring: 'border-rose-400 bg-rose-500/30 text-rose-300',
      badge: 'bg-rose-950 border-rose-400 text-rose-100 shadow-[0_10px_35px_rgba(244,63,94,0.45)]',
      dot: 'bg-gradient-to-tr from-rose-500 to-pink-300 text-slate-950 shadow-[0_0_20px_#f43f5e]',
      tag: 'bg-rose-400 text-slate-950',
      arrow: 'text-rose-400'
    },
    sky: {
      ring: 'border-sky-400 bg-sky-500/30 text-sky-300',
      badge: 'bg-sky-950 border-sky-400 text-sky-100 shadow-[0_10px_35px_rgba(14,165,233,0.45)]',
      dot: 'bg-gradient-to-tr from-sky-500 to-cyan-300 text-slate-950 shadow-[0_0_20px_#38bdf8]',
      tag: 'bg-sky-400 text-slate-950',
      arrow: 'text-sky-400'
    }
  };

  const scheme = colorMap[pulseColor];

  const posClasses = {
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2'
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`relative inline-flex items-center justify-center cursor-pointer pointer-events-auto select-none z-50 group ${className}`}
    >
      {/* Outer Expanding Wave 1 */}
      <motion.div
        animate={{ scale: [1, 2.4, 3.2], opacity: [0.95, 0.4, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        className={`absolute w-10 h-10 rounded-full border-2 ${scheme.ring} pointer-events-none`}
      />

      {/* Outer Expanding Wave 2 */}
      <motion.div
        animate={{ scale: [1, 1.9, 2.5], opacity: [0.85, 0.3, 0] }}
        transition={{ duration: 1.6, delay: 0.35, repeat: Infinity, ease: 'easeOut' }}
        className={`absolute w-10 h-10 rounded-full border ${scheme.ring} pointer-events-none`}
      />

      {/* Main Touch Hotspot Point with Animated Hand & Pointer */}
      <motion.div
        animate={{ scale: [1, 0.88, 1.08, 1], y: [0, 2, -2, 0] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative w-10 h-10 rounded-full ${scheme.dot} flex items-center justify-center font-black shadow-2xl ring-4 ring-white/80 active:scale-75 transition-transform`}
      >
        <span className="text-sm select-none">👆</span>
      </motion.div>

      {/* High-Visibility Self-Explanatory Floating Hint Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: hintPosition === 'bottom' ? -6 : 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`absolute ${posClasses[hintPosition]} p-2 sm:p-2.5 rounded-2xl border-2 backdrop-blur-xl shadow-2xl flex flex-col gap-1 pointer-events-auto cursor-pointer z-50 transition-transform group-hover:scale-105 min-w-[170px] max-w-[260px] ${scheme.badge}`}
      >
        {/* Top Attention Bar: "👉 CLICK HERE" */}
        <div className="flex items-center justify-between gap-1.5 pb-0.5 border-b border-white/15">
          <span className={`px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider ${scheme.tag} shadow-sm flex items-center gap-1`}>
            <MousePointerClick className="w-2.5 h-2.5 inline" />
            {actionText}
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </div>

        {/* Action Label */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black leading-tight text-white">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300 animate-spin-slow" />
          <span>{label}</span>
        </div>

        {/* Optional Secondary Context Sublabel */}
        {subLabel && (
          <div className="text-[9px] opacity-80 text-slate-300 font-medium leading-tight">
            {subLabel}
          </div>
        )}
      </motion.div>
    </div>
  );
};

