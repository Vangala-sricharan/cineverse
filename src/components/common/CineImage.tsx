import React, { useState, useEffect } from 'react';
import { generateThematicPoster } from '../../data/cinematicAssets';

interface CineImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  title?: string;
  year?: number;
  genre?: string;
  themeColor?: string;
  aspectRatioClass?: string;
}

export const CineImage: React.FC<CineImageProps> = ({
  src,
  alt,
  fallbackSrc,
  title = '',
  year = 2024,
  genre = 'Cinema',
  themeColor = '#ff2a5f',
  className = '',
  aspectRatioClass = '',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync if src prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      } else {
        // Generate high-end inline SVG poster fallback
        setCurrentSrc(generateThematicPoster(title || alt, year, genre, themeColor));
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden ${aspectRatioClass} ${className}`}>
      {/* Loading Shimmer Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#121520] animate-pulse z-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-[#ff2a5f] animate-spin" />
        </div>
      )}

      {/* Actual Image with seamless fallback */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
};
