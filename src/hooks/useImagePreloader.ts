import { useEffect, useState } from 'react';

/**
 * Hook to pre-load a list of image URLs.
 * Returns a boolean indicating if all images are loaded.
 */
export const useImagePreloader = (urls: string[]) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalCount = urls.length;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalCount) {
        setImagesLoaded(true);
      }
    };

    const onImageError = () => {
      loadedCount++; // Count even on error to avoid being stuck
      if (loadedCount === totalCount) {
        setImagesLoaded(true);
      }
    };

    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = onImageLoad;
      img.onerror = onImageError;
    });
  }, [urls]);

  return imagesLoaded;
};
