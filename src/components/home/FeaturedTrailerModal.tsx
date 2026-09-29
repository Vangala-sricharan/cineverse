import React, { useEffect } from 'react';
import { X, Plus, Check, Film } from 'lucide-react';
import { useMovie } from '../../context/MovieContext';

export const FeaturedTrailerModal: React.FC = () => {
  const { activeTrailerMovie, closeTrailer, isInWatchlist, addToWatchlist, removeFromWatchlist } = useMovie();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTrailer();
    };
    if (activeTrailerMovie) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [activeTrailerMovie, closeTrailer]);

  if (!activeTrailerMovie) return null;

  const inWatchlist = isInWatchlist(activeTrailerMovie.id);
  const trailerId = activeTrailerMovie.trailerYoutubeId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-[#0e1017] border border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with close button */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-[#12141e]">
          <div>
            <span className="text-[11px] font-bold text-[#ff2a5f] uppercase tracking-wider">
              {trailerId ? 'Official Trailer' : 'Trailer Notice'}
            </span>
            <h3 className="text-lg font-bold text-white font-display truncate max-w-md">
              {activeTrailerMovie.title} ({activeTrailerMovie.year})
            </h3>
          </div>
          <button
            onClick={closeTrailer}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Embed or Honest Unavailable State */}
        {trailerId ? (
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`}
              title={`${activeTrailerMovie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="aspect-video w-full flex flex-col items-center justify-center p-8 bg-[#0a0b10] text-center">
            <Film className="w-12 h-12 text-[#ff2a5f] opacity-60 mb-3" />
            <h4 className="text-white font-bold text-base font-display">No Official Trailer Stream Available</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              The movie data provider does not have an authorized YouTube trailer stream for {activeTrailerMovie.title}.
            </p>
          </div>
        )}

        {/* Footer info & Actions */}
        <div className="p-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141e] border-t border-white/10">
          <div className="text-xs text-slate-300">
            <span className="text-white font-semibold">{activeTrailerMovie.runtimeFormatted}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span>{activeTrailerMovie.genres.join(', ')}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-amber-400 font-semibold">⭐ {activeTrailerMovie.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (inWatchlist) removeFromWatchlist(activeTrailerMovie.id);
                else addToWatchlist(activeTrailerMovie.id);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                inWatchlist
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-[#ff2a5f] hover:bg-[#ff154f] text-white cine-glow'
              }`}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
