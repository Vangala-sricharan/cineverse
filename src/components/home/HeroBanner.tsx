import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, SlidersHorizontal } from 'lucide-react';
import { Movie } from '../../types/movie';
import { DEFAULT_CINEMATIC_HERO_BACKDROP } from '../../data/cinematicAssets';

interface HeroBannerProps {
  onExploreMoodClick?: () => void;
  featuredMovie?: Movie | null;
  backdropUrl?: string | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreMoodClick,
  featuredMovie,
  backdropUrl: customBackdropUrl,
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Dynamic genuine backdrop URL resolution with reliable cinematic fallback
  const resolvedBackdropUrl = customBackdropUrl || featuredMovie?.backdropUrl || DEFAULT_CINEMATIC_HERO_BACKDROP;

  // Reset state when backdrop URL changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);

    if (resolvedBackdropUrl) {
      const img = new Image();
      img.src = resolvedBackdropUrl;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
    }
  }, [resolvedBackdropUrl]);

  const activeBackdropUrl = !imageError && resolvedBackdropUrl ? resolvedBackdropUrl : DEFAULT_CINEMATIC_HERO_BACKDROP;

  return (
    <div className="relative w-full overflow-hidden min-h-[520px] md:min-h-[580px] lg:min-h-[640px] flex items-center pt-8 pb-16 md:py-24 transition-colors duration-700">
      
      {/* 1. CINEMATIC MOVIE BACKDROP LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Real movie backdrop positioned toward the right, clearly visible */}
        <img
          src={activeBackdropUrl}
          alt={featuredMovie?.title ? `${featuredMovie.title} Backdrop` : 'Cinematic Backdrop'}
          className={`w-full h-full object-cover object-[80%_center] md:object-[85%_center] transition-opacity duration-1000 ease-out will-change-transform ${
            imageLoaded ? 'opacity-85 scale-100' : 'opacity-0 scale-105'
          }`}
          loading="eager"
          decoding="async"
        />

        {/* Layered Gradient Treatment:
            - Left side: Deep dark gradient for flawless headline readability
            - Center: Smooth transition emerging from the darkness
            - Right side: Clear visibility of the cinematic artwork without heavy darkening
        */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080b] via-[#07080b]/80 via-45% to-transparent pointer-events-none" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#07080b] via-[#07080b]/90 via-30% to-transparent pointer-events-none" />

        {/* Top and Bottom Edge Fades into page background */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#07080b] via-[#07080b]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07080b] via-[#07080b]/80 to-transparent pointer-events-none" />

        {/* Subtle cinematic edge vignette */}
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-[#07080b]/60 pointer-events-none" />
      </div>

      {/* 2. CINEVERSE SUBTLE AMBIENT PINK GLOW (Soft and non-obstructive) */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#ff2a5f]/8 rounded-full blur-[140px] pointer-events-none z-[1]" />

      {/* 3. HERO CONTENT CONTAINER (Clean, open cinematic composition) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#ff2a5f]" />
              <span className="tracking-wide">Cinematic Intelligence & Discovery</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.06] font-display drop-shadow-lg">
              Not just movies. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#ff5c8a]">
                Experiences.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed drop-shadow-md">
              Explore cinema shaped by mood, storytelling depth, and your personal cinematic taste — free from generic algorithms and fabricated rankings.
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onExploreMoodClick || (() => navigate('/discover'))}
              className="px-7 py-3.5 rounded-full bg-[#ff2a5f] hover:bg-[#ff154f] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#ff2a5f]/30 cine-glow hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 fill-white/20" />
              <span>Explore by Mood</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/taste')}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#ff2a5f]" />
              <span>Calibrate Taste</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
