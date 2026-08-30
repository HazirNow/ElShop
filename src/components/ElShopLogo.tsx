import React from 'react';

interface ElShopLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'badge' | 'text' | 'light-badge' | 'minimal' | 'white';
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
      badge: 'text-[11px] px-1.5 py-0.5 rounded',
      lSize: 'text-[1.35em]',
      country: 'text-[8px]',
    },
    sm: {
      text: 'text-sm',
      badge: 'text-xs px-2 py-0.5 rounded-md',
      lSize: 'text-[1.4em]',
      country: 'text-[9px]',
    },
    md: {
      text: 'text-base font-black',
      badge: 'text-sm px-2.5 py-1 rounded-lg',
      lSize: 'text-[1.5em]',
      country: 'text-[10px]',
    },
    lg: {
      text: 'text-xl font-black',
      badge: 'text-base px-3 py-1 rounded-xl',
      lSize: 'text-[1.55em]',
      country: 'text-xs',
    },
    xl: {
      text: 'text-2xl font-black',
      badge: 'text-lg px-3.5 py-1.5 rounded-2xl',
      lSize: 'text-[1.6em]',
      country: 'text-xs',
    },
    '2xl': {
      text: 'text-4xl font-black',
      badge: 'text-2xl px-5 py-2.5 rounded-2xl',
      lSize: 'text-[1.7em]',
      country: 'text-sm',
    },
  };

  const currentSize = sizeClasses[size];

  // Render cursive L with bold prominence, pearl white finish, grounded baseline, and upright posture
  const renderCursiveL = (accentColor = 'text-[#FAF9F6]') => (
    <span
      className={`font-cursive-l ${accentColor} ${currentSize.lSize} font-black inline-block select-none px-0.5`}
      style={{
        direction: 'ltr',
        lineHeight: 1,
        verticalAlign: 'baseline',
        fontStyle: 'normal',
      }}
    >
      l
    </span>
  );

  if (variant === 'minimal') {
    return (
      <span 
        dir="ltr" 
        className={`inline-flex items-center tracking-tight font-black select-none ${currentSize.text} ${className}`}
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        <span>E</span>
        {renderCursiveL('text-[#FAF9F6]')}
        <span>Shop</span>
        {showCountry && <span className={`ml-1 font-black text-emerald-400 ${currentSize.country}`}>UAE</span>}
      </span>
    );
  }

  if (variant === 'light-badge') {
    return (
      <div 
        dir="ltr" 
        className={`inline-flex items-center gap-1.5 select-none ${className}`}
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        <div 
          dir="ltr" 
          className={`bg-[#0B6E4F] text-white ${currentSize.badge} font-black shadow flex items-center`}
          style={{ direction: 'ltr' }}
        >
          <span>E</span>
          {renderCursiveL('text-[#FAF9F6]')}
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

  if (variant === 'white') {
    return (
      <span 
        dir="ltr" 
        className={`inline-flex items-center tracking-tight font-black text-white select-none ${currentSize.text} ${className}`}
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        <span>E</span>
        {renderCursiveL('text-[#FAF9F6]')}
        <span>Shop</span>
        {showCountry && (
          <span className={`ml-1.5 bg-white/20 text-[#FAF9F6] border border-white/40 font-black px-1.5 py-0.5 rounded ${currentSize.country}`}>
            UAE
          </span>
        )}
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div 
        dir="ltr" 
        className={`inline-flex items-center gap-1.5 select-none ${className}`}
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        <div 
          dir="ltr" 
          className={`bg-[#0B6E4F] text-white ${currentSize.badge} font-black shadow-sm flex items-center`}
          style={{ direction: 'ltr' }}
        >
          <span>E</span>
          {renderCursiveL('text-[#FAF9F6]')}
        </div>
        <span className={`font-black text-white ${currentSize.text} tracking-tight`}>Shop</span>
        {showCountry && (
          <span className={`bg-white/20 text-[#FAF9F6] border border-white/40 font-black px-1.5 py-0.5 rounded ${currentSize.country}`}>
            UAE
          </span>
        )}
      </div>
    );
  }

  // Default 'text' variant
  return (
    <span 
      dir="ltr" 
      className={`inline-flex items-center tracking-tight font-black select-none ${currentSize.text} ${className}`}
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      <span>E</span>
      {renderCursiveL('text-[#FAF9F6]')}
      <span>Shop</span>
      {showCountry && (
        <span className={`ml-1 text-emerald-400 font-bold ${currentSize.country}`}>
          UAE
        </span>
      )}
    </span>
  );
};

