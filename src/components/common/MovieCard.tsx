import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Check, Play, Dna } from 'lucide-react';
import { Movie } from '../../types/movie';
import { useMovie } from '../../context/MovieContext';
import { CineImage } from './CineImage';

interface MovieCardProps {
  movie: Movie;
  showMatch?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  showMatch = true,
  className = '',
  size = 'md',
}) => {
  const navigate = useNavigate();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, openTrailer } = useMovie();
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  const handlePlayTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTrailer(movie);
  };

  const handleDnaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/movie/${movie.id}/dna`);
  };

  // Card dimensions
  const widthClasses = {
    sm: 'w-[160px] sm:w-[170px]',
    md: 'w-[185px] sm:w-[205px] md:w-[220px]',
    lg: 'w-[210px] sm:w-[230px] md:w-[250px]',
  }[size];

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      className={`group relative shrink-0 cursor-pointer rounded-2xl overflow-hidden bg-[#11131a] border border-white/[0.08] transition-all duration-300 hover:border-white/20 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/80 ${widthClasses} ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/movie/${movie.id}`);
      }}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#161822]">
        <CineImage
          src={movie.posterUrl}
          alt={movie.title}
          title={movie.title}
          year={movie.year}
          genre={movie.genres[0]}
          themeColor="#ff2a5f"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Cinematic Scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          {showMatch && movie.matchPercentage ? (
            <span className="px-2 py-0.5 rounded-md bg-[#ff2a5f]/90 text-[11px] font-bold text-white shadow-sm tracking-tight backdrop-blur-md">
              {movie.matchPercentage}% Match
            </span>
          ) : (
            <span />
          )}

          {/* Quick trailer play on hover */}
          <button
            onClick={handlePlayTrailer}
            aria-label={`Play trailer for ${movie.title}`}
            className="pointer-events-auto w-7 h-7 rounded-full bg-black/60 hover:bg-[#ff2a5f] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md hover:scale-110 active:scale-95 shadow-md cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        </div>

        {/* DNA badge button on hover */}
        {movie.dna && (
          <button
            onClick={handleDnaClick}
            title="View Movie DNA"
            className="absolute bottom-16 right-2.5 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-[#ff2a5f]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md hover:scale-110 shadow-md cursor-pointer"
          >
            <Dna className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom Poster Content Details */}
        <div className="absolute bottom-0 inset-x-0 p-3 pt-6 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/90 to-transparent z-10">
          <h4 className="text-white font-medium text-sm leading-tight truncate group-hover:text-[#ff3b6c] transition-colors font-display">
            {movie.title}
          </h4>

          {/* Metadata: Year · Runtime · Rating */}
          <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>{movie.year}</span>
              <span className="text-slate-600">·</span>
              <span>{movie.runtimeFormatted}</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Genres & Watchlist Action */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06]">
            <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
              {movie.genres.slice(0, 2).join(' · ')}
            </div>

            {/* Watchlist Quick Button */}
            <button
              onClick={handleWatchlistToggle}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label={inWatchlist ? `Remove ${movie.title} from Watchlist` : `Add ${movie.title} to Watchlist`}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                inWatchlist
                  ? 'bg-[#ff2a5f] text-white shadow-sm shadow-[#ff2a5f]/50'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
              }`}
            >
              {inWatchlist ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
