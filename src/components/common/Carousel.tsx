import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Movie } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './SkeletonLoader';
import { EmptyState, ErrorState } from './EmptyState';
import { Link } from 'react-router-dom';

interface CarouselProps {
  title: string;
  subtitle?: string;
  movies?: Movie[];
  seeAllLink?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  showMatch?: boolean;
  cardSize?: 'sm' | 'md' | 'lg';
}

export const Carousel: React.FC<CarouselProps> = ({
  title,
  subtitle,
  movies = [],
  seeAllLink,
  isLoading = false,
  error = null,
  onRetry,
  showMatch = true,
  cardSize = 'md',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies, isLoading]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -500 : 500;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <section className="relative py-4 md:py-6">
      {/* Carousel Header */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {seeAllLink && (
            <Link
              to={seeAllLink}
              className="text-xs font-semibold text-slate-400 hover:text-[#ff2a5f] transition-colors flex items-center gap-1 group py-1"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {/* Desktop Arrow Controls */}
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                canScrollLeft
                  ? 'bg-white/5 border-white/10 hover:bg-white/15 text-white cursor-pointer active:scale-90'
                  : 'bg-transparent border-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                canScrollRight
                  ? 'bg-white/5 border-white/10 hover:bg-white/15 text-white cursor-pointer active:scale-90'
                  : 'bg-transparent border-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {error ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : isLoading ? (
        <div className="flex gap-4 overflow-hidden px-4 sm:px-6 lg:px-8 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <EmptyState title="No movies available in this category" />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2 -my-2"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              showMatch={showMatch}
              size={cardSize}
            />
          ))}
        </div>
      )}
    </section>
  );
};
