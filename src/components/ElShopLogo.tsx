import React from 'react';

interface ElShopLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'badge' | 'text' | 'light-badge' | 'minimal';
  showCountry?: boolean;
  className?: string;
}

export const ElShopLogo: React.FC<ElShopLogoProps> = ({
  size = 'md',
  variant = 'badge',
  showCountry = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: {
      text: 'text-xs',
      badge: 'text-[10px] px-1 py-0.5 rounded',
      lSize: 'text-[1.2em]',
      country: 'text-[8px]',
    },
    sm: {
      text: 'text-sm',
      badge: 'text-xs px-1.5 py-0.5 rounded-md',
      lSize: 'text-[1.25em]',
      country: 'text-[9px]',
    },
    md: {
      text: 'text-base font-bold',
      badge: 'text-sm px-2 py-0.5 rounded-lg',
      lSize: 'text-[1.3em]',
      country: 'text-[10px]',
    },
    lg: {
      text: 'text-xl font-extrabold',
      badge: 'text-base px-2.5 py-1 rounded-xl',
      lSize: 'text-[1.35em]',
      country: 'text-xs',
    },
    xl: {
      text: 'text-2xl font-black',
      badge: 'text-lg px-3 py-1.5 rounded-2xl',
      lSize: 'text-[1.4em]',
      country: 'text-xs',
    },
    '2xl': {
      text: 'text-4xl font-black',
      badge: 'text-2xl px-4 py-2 rounded-2xl',
      lSize: 'text-[1.45em]',
      country: 'text-sm',
    },
  };

  const currentSize = sizeClasses[size];

  // Render cursive L with distinctive slant, accent color, and calligraphic cursive script
  const renderCursiveL = (accentColor = 'text-amber-400') => (
    <span
      className={`font-cursive-l ${accentColor} ${currentSize.lSize} transform -translate-y-0.5 mx-[0.5px] -rotate-6 select-none`}
      style={{
        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      l
    </span>
  );

  if (variant === 'minimal') {
    return (
      <span className={`inline-flex items-center tracking-tight font-black ${currentSize.text} ${className}`}>
        <span>E</span>
        {renderCursiveL('text-amber-400')}
        <span>Shop</span>
        {showCountry && <span className={`ml-1 font-bold text-emerald-500 ${currentSize.country}`}>UAE</span>}
      </span>
    );
  }

  if (variant === 'light-badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className={`bg-[#0B6E4F] text-white ${currentSize.badge} font-black shadow flex items-center`}>
          <span>E</span>
          {renderCursiveL('text-amber-300')}
        </div>
        <span className={`font-black text-slate-900 ${currentSize.text} tracking-tight`}>Shop</span>
        {showCountry && (
          <span className={`bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded ${currentSize.country}`}>
            UAE
          </span>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
        <div className={`bg-white text-[#0B6E4F] ${currentSize.badge} font-black shadow-sm flex items-center`}>
          <span>E</span>
          {renderCursiveL('text-amber-500')}
        </div>
        <span className={`font-black text-white ${currentSize.text} tracking-tight`}>Shop</span>
        {showCountry && (
          <span className={`bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold px-1.5 py-0.5 rounded ${currentSize.country}`}>
            UAE
          </span>
        )}
      </div>
    );
  }

  // Default 'text' variant
  return (
    <span className={`inline-flex items-center tracking-tight font-extrabold ${currentSize.text} ${className}`}>
      <span>E</span>
      {renderCursiveL('text-amber-400')}
      <span>Shop</span>
      {showCountry && (
        <span className={`ml-1 text-emerald-400 font-bold ${currentSize.country}`}>
          UAE
        </span>
      )}
    </span>
  );
};
