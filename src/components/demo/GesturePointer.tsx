import React from 'react';
import { motion } from 'motion/react';

interface GesturePointerProps {
  label?: string;
  subLabel?: string;
  hintPosition?: 'top' | 'bottom' | 'left' | 'right';
  onClick?: () => void;
  pulseColor?: 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky' | 'red';
  className?: string;
  compact?: boolean;
  actionText?: string;
}

export const GesturePointer: React.FC<GesturePointerProps> = ({
  label,
  subLabel,
  hintPosition = 'bottom',
  onClick,
  className = '',
  actionText
}) => {
  const posClasses = {
    top: 'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-1.5 left-1/2 -translate-x-1/2',
    left: 'right-full mr-1.5 top-1/2 -translate-y-1/2',
    right: 'left-full ml-1.5 top-1/2 -translate-y-1/2'
  };

  const displayText = actionText || label || 'click';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`relative inline-flex items-center justify-center cursor-pointer pointer-events-auto select-none z-50 group ${className}`}
    >
      {/* Subtle Red Fading Pulse Ring */}
      <motion.div
        animate={{ scale: [0.9, 1.6, 2.0], opacity: [0.85, 0.35, 0] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
        className="absolute w-7 h-7 rounded-full bg-red-500/40 pointer-events-none"
      />

      {/* Small Core Red Dot (24px) with subtle breathing */}
      <motion.div
        animate={{ scale: [0.94, 1.08, 0.94], opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-6 h-6 rounded-full bg-red-600 border border-white/90 shadow-[0_0_12px_rgba(220,38,38,0.7)] flex items-center justify-center text-white text-[10px] font-bold active:scale-80 transition-transform"
      >
        <span className="text-[10px] leading-none select-none">👆</span>
      </motion.div>

      {/* Tiny Non-Obtrusive Tag: "click" / "انقر" */}
      {displayText && (
        <div
          className={`absolute ${posClasses[hintPosition]} pointer-events-none whitespace-nowrap z-50 transition-transform`}
        >
          <div className="px-1.5 py-0.5 rounded-full bg-slate-950/90 border border-red-500/40 text-white font-mono text-[9px] font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
            <span>{displayText}</span>
          </div>
        </div>
      )}
    </div>
  );
};
