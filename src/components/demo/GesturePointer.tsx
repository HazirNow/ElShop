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
  const displayText = actionText || label || 'click';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`pointer-events-none select-none flex flex-col items-center justify-center z-30 transition-all ${className}`}
    >
      {/* Subtle Red Fading Circle with Box-Shadow Pulsing Effect */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0 0px rgba(239, 68, 68, 0.75)',
            '0 0 0 6px rgba(239, 68, 68, 0.3)',
            '0 0 0 14px rgba(239, 68, 68, 0)'
          ],
          scale: [0.95, 1.05, 0.95],
          opacity: [0.85, 1, 0.85]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white/80 flex items-center justify-center shadow-sm"
      >
        <span className="w-1 h-1 rounded-full bg-white" />
      </motion.div>

      {/* Tiny Transparent 'click' / 'انقر' Label placed neatly under the clickable target */}
      {displayText && (
        <div className="mt-1 px-1.5 py-0.5 rounded-md bg-red-950/40 border border-red-500/25 backdrop-blur-[2px] text-red-300 font-mono text-[9px] font-bold tracking-tight whitespace-nowrap shadow-sm">
          {displayText}
        </div>
      )}
    </div>
  );
};
