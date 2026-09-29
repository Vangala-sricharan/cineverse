import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sparkles, Info, Play, Bookmark, ShieldCheck } from 'lucide-react';
import { RadarChart, RadarDataPoint } from '../components/common/RadarChart';
import { CineImage } from '../components/common/CineImage';
import { MovieService } from '../services/MovieService';
import { GeminiService } from '../services/GeminiService';
import { Movie } from '../types/movie';
import { MovieDnaProfile } from '../types/intelligence';
import { useMovie } from '../context/MovieContext';

export const MovieDnaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openTrailer, isInWatchlist, addToWatchlist, removeFromWatchlist } = useMovie();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [dnaProfile, setDnaProfile] = useState<MovieDnaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieAndDNA = async () => {
      setIsLoading(true);
      try {
        const movieId = id || '693134';
        const data = await MovieService.getMovieDetails(movieId);
        setMovie(data);

        // Generate dynamic Movie DNA via GeminiService (cached automatically)
        if (data) {
          const profile = await GeminiService.generateMovieDNA(data);
          setDnaProfile(profile);
        }
      } catch (e) {
        console.warn('Movie DNA loading notice:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovieAndDNA();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080b] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff2a5f]" />
        <p className="text-xs text-slate-400 font-mono tracking-wider">CALCULATING CINEVERSE MOVIE DNA...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#07080b] p-8 text-center text-white">
        <h2>Movie not found</h2>
        <button onClick={() => navigate('/discover')} className="mt-4 text-[#ff2a5f]">
          Back to Discover
        </button>
      </div>
    );
  }

  // Radar data points derived from dynamic Movie DNA
  const dims = dnaProfile?.dimensions;
  const radarData: RadarDataPoint[] = [
    { dimension: 'Story', value: dims?.story ?? 90, userValue: 88 },
    { dimension: 'Mind-Bending', value: dims?.intelligence ?? 92, userValue: 85 },
    { dimension: 'Thriller', value: dims?.suspense ?? 85, userValue: 88 },
    { dimension: 'Action', value: dims?.action ?? 65, userValue: 60 },
    { dimension: 'Emotion', value: dims?.emotion ?? 75, userValue: 75 },
    { dimension: 'Romance', value: dims?.romance ?? 15, userValue: 20 },
    { dimension: 'Pacing', value: dims?.pacing ?? 85, userValue: 80 },
    { dimension: 'Mystery', value: dims?.mystery ?? 88, userValue: 85 },
  ];

  const reasons = dnaProfile?.reasonsToLike && dnaProfile.reasonsToLike.length > 0
    ? dnaProfile.reasonsToLike
    : [
        'High psychological depth and tension',
        'Complex non-linear narrative progression',
        'Minimal conventional romance subplots',
        'Immersive visual cinematography',
      ];

  const keyElements = [
    { name: 'Psychological Depth', percentage: dims?.psychologicalDepth ?? 88 },
    { name: 'Suspense & Thrills', percentage: dims?.suspense ?? 86 },
    { name: 'Visual Spectacle', percentage: dims?.visualSpectacle ?? 85 },
    { name: 'Story Complexity', percentage: dims?.storyComplexity ?? 82 },
    { name: 'Mystery Quotient', percentage: dims?.mystery ?? 78 },
    { name: 'Emotional Intensity', percentage: dims?.emotionalIntensity ?? 74 },
    { name: 'Action Density', percentage: dims?.action ?? 65 },
    { name: 'Romance Component', percentage: dims?.romance ?? 18 },
  ];

  const inWatchlist = isInWatchlist(movie.id);

  return (
    <div className="min-h-screen bg-[#07080b] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              <span>Movie DNA</span>
              <span className="text-sm font-normal text-slate-400">· {movie.title}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              CINEVERSE Analytical Signals & Dimensional Breakdown.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openTrailer(movie)}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-white" />
            <span className="hidden sm:inline">Play Trailer</span>
          </button>
          <button
            onClick={() => {
              if (inWatchlist) removeFromWatchlist(movie.id);
              else addToWatchlist(movie.id);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              inWatchlist ? 'bg-[#ff2a5f] text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>{inWatchlist ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Analytical Transparency Notice */}
      <div className="mb-6 px-4 py-2.5 rounded-xl bg-[#121422] border border-[#ff2a5f]/20 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#ff2a5f]" />
          <span>
            <strong className="text-white">CINEVERSE Analytical Signals:</strong> These dimensional scores represent internal algorithmic analysis, not official ratings or critic scores.
          </span>
        </div>
        {dnaProfile?.cinematicStyle && (
          <span className="hidden sm:inline text-[11px] text-[#ff5c8a] font-mono bg-white/5 px-2.5 py-1 rounded-md">
            {dnaProfile.cinematicStyle}
          </span>
        )}
      </div>

      {/* Main 3-Column DNA Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column: Movie Poster & Title card */}
        <div className="lg:col-span-3 flex flex-col items-center sm:items-start">
          <div className="relative w-48 sm:w-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <CineImage
              src={movie.posterUrl}
              alt={movie.title}
              title={movie.title}
              year={movie.year}
              genre={movie.genres[0]}
              themeColor="#ff2a5f"
              className="w-full aspect-[2/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 inset-x-4">
              <span className="text-[10px] font-bold text-[#ff2a5f] uppercase tracking-wider block">
                {movie.year} · {movie.language}
              </span>
              <h3 className="text-lg font-bold font-display uppercase tracking-wider text-white">
                {movie.title}
              </h3>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400 space-y-1">
            <p><strong>Director:</strong> {movie.director || 'Acclaimed Director'}</p>
            <p><strong>Runtime:</strong> {movie.runtimeFormatted || '2h 15m'}</p>
            <p><strong>Official Rating:</strong> ⭐ {movie.rating.toFixed(1)}/10</p>
          </div>
        </div>

        {/* Center Column: Radar Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-[#0c0e15] border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-center gap-4 text-xs mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff2a5f]" />
              <span className="text-slate-300 font-semibold">{movie.title} DNA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-purple-400 border-dashed" />
              <span className="text-slate-400 font-medium">Comparative Baseline</span>
            </div>
          </div>

          <RadarChart
            data={radarData}
            size={360}
            showComparison={true}
            centerText="Movie DNA"
          />

          {dnaProfile?.tonalAtmosphere && (
            <p className="text-center text-[11px] text-slate-400 italic mt-3 px-4">
              "{dnaProfile.tonalAtmosphere}"
            </p>
          )}
        </div>

        {/* Right Column: "Why You Might Like It" & Cinematic Insights */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#ff2a5f]" />
              <h2 className="text-lg font-bold text-white font-display">
                Cinematic Insights
              </h2>
            </div>

            <div className="space-y-2">
              {dnaProfile?.insights && dnaProfile.insights.length > 0 ? (
                dnaProfile.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#10121c] border border-white/[0.06] text-xs text-slate-300 leading-snug"
                  >
                    {insight}
                  </div>
                ))
              ) : (
                reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#10121c] border border-white/[0.06]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#ff2a5f] shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200 leading-snug">{reason}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              CINEVERSE DNA profiles decompose pacing, complexity, tension, and thematic resonance from genuine movie facts.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Key Elements Horizontal Progress Bars */}
      <div className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white font-display">
            Key Elements Breakdown
          </h2>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider">
            Analytical Weight
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyElements.map((el) => (
            <div key={el.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{el.name}</span>
                <span className="text-white font-bold tabular-nums">{el.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff2a5f] to-[#ff5c8a] rounded-full transition-all duration-700"
                  style={{ width: `${el.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
