import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { MovieCard } from '../components/common/MovieCard';
import { MovieCardSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { MovieService } from '../services/MovieService';
import { Movie } from '../types/movie';
import { useMovie } from '../context/MovieContext';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { watchlistIds, removeFromWatchlist } = useMovie();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadWatchlistMovies = async () => {
      if (watchlistIds.length === 0) {
        setMovies([]);
        return;
      }

      setIsLoading(true);
      try {
        const fetched = await Promise.all(
          watchlistIds.map(async (id) => {
            try {
              return await MovieService.getMovieDetails(id);
            } catch {
              return null;
            }
          })
        );
        if (isMounted) {
          setMovies(fetched.filter((m): m is Movie => m !== null));
        }
      } catch (err) {
        console.error('Error loading watchlist movies:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWatchlistMovies();
    return () => {
      isMounted = false;
    };
  }, [watchlistIds]);

  return (
    <div className="min-h-screen bg-[#07080b] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-[#ff2a5f]" />
              <span>My Watchlist</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {movies.length} movies saved for upcoming movie nights.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/discover')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff2a5f]" />
          <span>Discover More</span>
        </button>
      </div>

      {/* Grid, Loading, or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          description="Explore trending films or search for a specific mood to queue your next experience."
          actionText="Discover Movies"
          onAction={() => navigate('/discover')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="relative group">
              <MovieCard movie={movie} size="sm" className="w-full" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchlist(movie.id);
                }}
                title="Remove from Watchlist"
                className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
