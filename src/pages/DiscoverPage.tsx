import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, RotateCcw } from 'lucide-react';
import { MovieCard } from '../components/common/MovieCard';
import { MovieCardSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { MovieService } from '../services/MovieService';
import { Movie, MovieFilterOptions } from '../types/movie';

const STATIC_GENRES = ['All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];
const LANGUAGES = ['All', 'English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Korean', 'Japanese', 'Spanish', 'French'];
const RUNTIMES = ['All', 'Under 2h', '2h - 2h 30m', 'Over 2h 30m'];
const RATINGS = ['All', '8.5', '8.0', '7.5', '7.0'];
const PACINGS = ['All', 'Fast Paced', 'Moderate', 'Slow Burn', 'Relentless'];
const MOODS = ['All', 'Mind-Bending', 'Dark', 'Thrilling', 'Emotional', 'Happy', 'Inspiring'];
const STORY_TYPES = ['All', 'Action', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

export const DiscoverPage: React.FC = () => {
  const [filters, setFilters] = useState<MovieFilterOptions>({
    genre: 'Crime',
    language: 'All',
    runtime: 'All',
    rating: 'All',
    pacing: 'All',
    mood: 'All',
    storyType: 'Crime',
  });

  const [genresList, setGenresList] = useState<string[]>(STATIC_GENRES);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    MovieService.getGenres()
      .then((genres) => {
        if (genres && genres.length > 0) {
          setGenresList(['All', ...genres]);
        }
      })
      .catch((e) => console.warn('Using standard genres:', e));
  }, []);

  const fetchFilteredMovies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await MovieService.getMoviesByFilters(filters);
      setMovies(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Unable to load movies matching the selected filters.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredMovies();
  }, [filters]);

  const updateFilter = (key: keyof MovieFilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // If clicking story type chip, keep genre in sync if appropriate
      ...(key === 'storyType' && value !== 'All' ? { genre: value } : {}),
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      genre: 'All',
      language: 'All',
      runtime: 'All',
      rating: 'All',
      pacing: 'All',
      mood: 'All',
      storyType: 'All',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== 'All');

  return (
    <div className="min-h-screen bg-[#07080b] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
          Find something worth watching.
        </h1>
        <p className="text-sm text-slate-400">
          Explore from millions of movies with powerful filters and genuine cinematic dimensions.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-4 mb-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Genre Dropdown */}
          <div className="relative">
            <select
              value={filters.genre || 'All'}
              onChange={(e) => updateFilter('genre', e.target.value)}
              className="appearance-none bg-[#161824] text-xs font-semibold text-white pl-3.5 pr-8 py-2 rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#ff2a5f] cursor-pointer"
            >
              {genresList.map((g) => (
                <option key={g} value={g} className="bg-[#11131a] text-white">
                  Genre: {g}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Language Dropdown */}
          <div className="relative">
            <select
              value={filters.language || 'All'}
              onChange={(e) => updateFilter('language', e.target.value)}
              className="appearance-none bg-[#161824] text-xs font-semibold text-white pl-3.5 pr-8 py-2 rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#ff2a5f] cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-[#11131a] text-white">
                  Language: {l}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Runtime Dropdown */}
          <div className="relative">
            <select
              value={filters.runtime || 'All'}
              onChange={(e) => updateFilter('runtime', e.target.value)}
              className="appearance-none bg-[#161824] text-xs font-semibold text-white pl-3.5 pr-8 py-2 rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#ff2a5f] cursor-pointer"
            >
              {RUNTIMES.map((r) => (
                <option key={r} value={r} className="bg-[#11131a] text-white">
                  Runtime: {r}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Rating Dropdown */}
          <div className="relative">
            <select
              value={filters.rating || 'All'}
              onChange={(e) => updateFilter('rating', e.target.value)}
              className="appearance-none bg-[#161824] text-xs font-semibold text-white pl-3.5 pr-8 py-2 rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#ff2a5f] cursor-pointer"
            >
              {RATINGS.map((r) => (
                <option key={r} value={r} className="bg-[#11131a] text-white">
                  Rating: {r === 'All' ? 'All Ratings' : `${r}+ Stars`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Pacing Dropdown */}
          <div className="relative">
            <select
              value={filters.pacing || 'All'}
              onChange={(e) => updateFilter('pacing', e.target.value)}
              className="appearance-none bg-[#161824] text-xs font-semibold text-white pl-3.5 pr-8 py-2 rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#ff2a5f] cursor-pointer"
            >
              {PACINGS.map((p) => (
                <option key={p} value={p} className="bg-[#11131a] text-white">
                  Pacing: {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mood Dropdown */}
          <div className="relative">
            <select
              value={filters.mood || 'All'}
              onChange={(e) => updateFilter('mood', e.target.value)}
              className="appearance-none bg-[#161824] text-xs font-semibold text-white pl-3.5 pr-8 py-2 rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#ff2a5f] cursor-pointer"
            >
              {MOODS.map((m) => (
                <option key={m} value={m} className="bg-[#11131a] text-white">
                  Mood: {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear All action button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-colors border border-white/5 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Story Type Quick Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/[0.06]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Story Type:
          </span>
          {STORY_TYPES.map((type) => {
            const isSelected = (filters.storyType === type) || (type === 'All' && filters.storyType === 'All');
            return (
              <button
                key={type}
                onClick={() => updateFilter('storyType', type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/30'
                    : 'bg-[#161824] text-slate-300 hover:text-white hover:bg-[#1d2030] border border-white/5'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movie Results Grid */}
      {error && movies.length === 0 ? (
        <ErrorState
          title="Movie discovery temporarily unavailable"
          message={error}
          onRetry={fetchFilteredMovies}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <EmptyState
          title="No movies found for this combination"
          description="Try broadening your genre, runtime, or mood criteria to discover more titles."
          actionText="Reset All Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
            <span>Showing <strong className="text-white font-semibold">{movies.length}</strong> matching cinematic experiences</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                size="sm"
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
