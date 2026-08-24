/**
 * Shared utility for compressing and resizing images captured via camera, clipboard, or file input.
 * Standardizes to a maximum bounding edge of 640px and JPEG quality 0.6.
 */

export const compressDataUrl = (
  imageSrc: string,
  maxEdge = 640,
  quality = 0.6
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxEdge) {
          height = Math.round((height * maxEdge) / width);
          width = maxEdge;
        }
      } else {
        if (height > maxEdge) {
          width = Math.round((width * maxEdge) / height);
          height = maxEdge;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
          console.log(`[imageUtils] Compressed image to ${width}x${height} @ quality ${quality} (${compressed.length} chars)`);
        }
        resolve(compressed);
      } else {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

export const compressImageFile = (
  file: File,
  maxEdgeOrWidth: number = 640,
  qualityOrHeight: number = 0.6,
  optionalQuality?: number
): Promise<string> => {
  // Support both (file, maxEdge, quality) and legacy (file, maxWidth, maxHeight, quality)
  let maxEdge = maxEdgeOrWidth;
  let quality = qualityOrHeight;

  if (optionalQuality !== undefined) {
    maxEdge = Math.max(maxEdgeOrWidth, qualityOrHeight);
    quality = optionalQuality;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to read file'));
        return;
      }
      try {
        const compressed = await compressDataUrl(result, maxEdge, quality);
        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
