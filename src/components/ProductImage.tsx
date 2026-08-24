import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Store } from 'lucide-react';
import { getImageFallback } from '../utils/image';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
  fallbackType?: 'grocery' | 'store' | 'avatar';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'grocery',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const effectiveSrc = getImageFallback(src);

  if (hasError || !effectiveSrc) {
    return (
      <div
        className={`bg-slate-100 flex flex-col items-center justify-center text-emerald-800 border border-slate-200/80 rounded-xl overflow-hidden relative select-none ${className}`}
        title={`${alt} (Image Unavailable)`}
      >
        <div className="bg-emerald-50 w-full h-full flex flex-col items-center justify-center p-2 text-center">
          {fallbackType === 'store' ? (
            <Store className="w-1/3 h-1/3 max-w-[28px] max-h-[28px] text-[#0B6E4F] opacity-80" />
          ) : fallbackType === 'avatar' ? (
            <Package className="w-1/3 h-1/3 max-w-[28px] max-h-[28px] text-[#0B6E4F] opacity-80" />
          ) : (
            <ShoppingBag className="w-1/3 h-1/3 max-w-[28px] max-h-[28px] text-[#0B6E4F] opacity-80" />
          )}
          <span className="text-[9px] font-semibold text-emerald-900/70 mt-1 line-clamp-1 px-1">
            {alt || 'ElShop Item'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
};

