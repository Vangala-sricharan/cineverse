import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Bell, BellRing, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { MovieCard } from '../components/common/MovieCard';
import { MovieCardSkeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { CineImage } from '../components/common/CineImage';
import { MovieService } from '../services/MovieService';
import { RecommendationEngine } from '../intelligence/RecommendationEngine';
import { RecommendationResult } from '../types/intelligence';
import { Movie } from '../types/movie';
import { useMovie } from '../context/MovieContext';

export const RecommendationsPage: React.FC = () => {
  const { showNotification, tasteProfile } = useMovie();
  const [activeTab, setActiveTab] = useState<'AI Picks' | 'Because You Watched' | 'Hidden Gems' | 'Trending Near You' | 'Outside Comfort Zone'>('AI Picks');
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<string[]>([]);

  const tabs: ('AI Picks' | 'Because You Watched' | 'Hidden Gems' | 'Trending Near You' | 'Outside Comfort Zone')[] = [
    'AI Picks',
    'Because You Watched',
    'Hidden Gems',
    'Trending Near You',
    'Outside Comfort Zone',
  ];

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let naturalVibe = 'High psychological tension, compelling cinematography, and character-driven mystery';
      let isPersonalized = true;

      if (activeTab === 'Because You Watched') {
        const watchedTitles = tasteProfile.watchedMovies.length > 0 ? tasteProfile.watchedMovies.join(', ') : 'Inception';
        naturalVibe = `Movies sharing the intellectual depth, tension, and narrative stakes of ${watchedTitles}`;
      } else if (activeTab === 'Hidden Gems') {
        naturalVibe = 'Underrated cinematic achievements with high emotional resonance and deep storytelling';
      } else if (activeTab === 'Trending Near You') {
        naturalVibe = 'Acclaimed global and Indian cinematic sensations with gripping narrative turns';
      } else if (activeTab === 'Outside Comfort Zone') {
        // High novelty request intentionally looking outside favorite genres
        naturalVibe = 'Exceptional, boundary-pushing cinema with high artistic vision and unexpected storytelling';
        isPersonalized = true;
      }

      const [recs, upcoming] = await Promise.all([
        RecommendationEngine.recommend({
          naturalQuery: naturalVibe,
          usePersonalization: isPersonalized,
          limit: 10,
        }),
        MovieService.getUpcomingMovies(),
      ]);

      setRecommendations(recs);
      setUpcomingMovies(upcoming);
    } catch (e: any) {
      console.warn('Recommendations notice:', e);
      setError(e.message || 'Unable to retrieve live recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeTab]);

  const handleRegenerate = () => {
    fetchRecommendations();
    showNotification('Recalculating cinematic recommendations...');
  };

  const toggleReminder = (id: string, title: string) => {
    if (reminders.includes(id)) {
      setReminders((prev) => prev.filter((r) => r !== id));
      showNotification(`Reminder removed for ${title}`);
    } else {
      setReminders((prev) => [...prev, id]);
      showNotification(`We will notify you when ${title} premieres!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#ff2a5f] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              CINEVERSE Recommendation Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Recommended for You
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multi-signal matching based on your mood, pacing, and narrative complexity.
          </p>
        </div>

        {/* Re-generate Action Button */}
        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold tracking-wide border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#ff2a5f] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-calculate</span>
        </button>
      </div>

      {/* Recommendation Tabs Bar */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#ff2a5f] to-[#ff154f] text-white shadow-lg shadow-[#ff2a5f]/20 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* AI Transparency Card */}
      <div className="mb-8 p-4 rounded-xl bg-[#10121b] border border-white/[0.08] flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#ff2a5f] shrink-0" />
          <span>
            <strong className="text-white">CINEVERSE Grounded Explanations:</strong> Ranked through multi-signal semantic matching, constraint satisfaction, and Movie DNA analysis.
          </span>
        </div>
      </div>

      {/* Primary Recommendations Grid */}
      <div className="mb-14">
        {error && recommendations.length === 0 ? (
          <ErrorState
            title="Recommendations temporarily unavailable"
            message={error}
            onRetry={fetchRecommendations}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recommendations.map((item) => (
              <div key={item.movie.id} className="flex flex-col space-y-2">
                <MovieCard
                  movie={item.movie}
                  size="sm"
                  className="w-full"
                />
                <div className="p-2.5 rounded-xl bg-[#0f111a] border border-white/5 text-[11px] text-slate-300 leading-snug">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span className="text-[#ff5c8a] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#ff2a5f]" />
                      {item.matchScore}% Fit
                    </span>
                    <span>Why it fits</span>
                  </div>
                  <p className="line-clamp-2 text-slate-400">{item.whyItFits}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: Upcoming Movies You Might Like */}
      <div className="pt-6 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Upcoming Movies You Might Like
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Anticipated releases matching your cinematic DNA
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {upcomingMovies.map((movie) => {
            const hasReminder = reminders.includes(movie.id);
            return (
              <div
                key={movie.id}
                className="rounded-2xl overflow-hidden bg-[#11131a] border border-white/[0.08] flex flex-col group hover:border-white/20 transition-all hover:-translate-y-1"
              >
                <div className="aspect-[2/3] w-full overflow-hidden bg-[#161822] relative">
                  <CineImage
                    src={movie.posterUrl}
                    alt={movie.title}
                    title={movie.title}
                    year={movie.year}
                    genre={movie.genres[0]}
                    themeColor="#ff2a5f"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white uppercase backdrop-blur-md">
                    {movie.releaseDate || movie.year}
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider line-clamp-1 group-hover:text-[#ff2a5f] transition-colors">
                      {movie.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {movie.genres.join(' · ')}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleReminder(movie.id, movie.title)}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      hasReminder
                        ? 'bg-[#ff2a5f] text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
                    }`}
                  >
                    {hasReminder ? (
                      <>
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Reminder Set</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Remind Me</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
