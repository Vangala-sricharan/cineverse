import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Plus,
  Check,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Dna,
  Share2,
} from 'lucide-react';
import { MovieService } from '../services/MovieService';
import { RecommendationEngine } from '../intelligence/RecommendationEngine';
import { RecommendationResult } from '../types/intelligence';
import { Movie } from '../types/movie';
import { useMovie } from '../context/MovieContext';
import { Carousel } from '../components/common/Carousel';
import { ErrorState } from '../components/common/ErrorState';
import { CineImage } from '../components/common/CineImage';
import { INCEPTION_BACKDROP, DEFAULT_AVATAR } from '../data/cinematicAssets';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    openTrailer,
    likes,
    toggleLike,
    dislikes,
    toggleDislike,
    toggleWatched,
    isWatched,
    showNotification,
  } = useMovie();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Cast & Crew' | 'Reviews' | 'Movie DNA' | 'Similar Movies'>('Overview');
  const [isLoading, setIsLoading] = useState(true);

  const [similarRecs, setSimilarRecs] = useState<RecommendationResult[]>([]);

  useEffect(() => {
    const fetchMovieData = async () => {
      setIsLoading(true);
      try {
        const movieId = id || '693134';
        const data = await MovieService.getMovieDetails(movieId);
        setMovie(data);
        if (data) {
          // Set dynamic document title and meta description for SEO
          document.title = `${data.title} (${data.year}) — CINEVERSE`;
          // Use intelligent semantic recommendation for "More Like This"
          const recResults = await RecommendationEngine.recommend({
            referenceMovie: data,
            limit: 8,
          });
          setSimilarRecs(recResults);
          setSimilarMovies(recResults.map((r) => r.movie));
        }
      } catch (err) {
        console.warn('Movie details notice:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff2a5f]" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#07080b] py-16 px-4 max-w-4xl mx-auto">
        <ErrorState
          title="Movie not found"
          message="We could not find the cinematic details for the specified movie."
          onRetry={() => navigate('/discover')}
        />
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const isLiked = likes.includes(movie.id);
  const isDisliked = dislikes.includes(movie.id);

  const tabs: ('Overview' | 'Cast & Crew' | 'Reviews' | 'Movie DNA' | 'Similar Movies')[] = [
    'Overview',
    'Cast & Crew',
    'Reviews',
    'Movie DNA',
    'Similar Movies',
  ];

  return (
    <div className="min-h-screen bg-[#07080b] text-white pb-20">
      
      {/* Huge Cinematic Backdrop Hero Header */}
      <div className="relative w-full h-[480px] sm:h-[580px] lg:h-[660px] overflow-hidden bg-[#0a0b10]">
        <CineImage
          src={movie.backdropUrl || INCEPTION_BACKDROP}
          fallbackSrc={INCEPTION_BACKDROP}
          alt={movie.title}
          title={movie.title}
          year={movie.year}
          genre={movie.genres[0]}
          themeColor="#ff2a5f"
          className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
        />

        {/* Ambient Dark Gradient Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-[#07080b]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080b] via-[#07080b]/55 to-transparent" />

        {/* Top Floating Back Button & Share */}
        <div className="absolute top-6 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showNotification('Movie link copied to clipboard');
            }}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Overlay Content in Hero Area */}
        <div className="absolute bottom-8 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-3xl space-y-4">
            
            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display">
              {movie.title}
            </h1>

            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <span className="font-semibold text-white">{movie.year}</span>
              <span className="text-slate-600">·</span>
              <span>{movie.runtimeFormatted}</span>
              {movie.certification && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="px-1.5 py-0.5 rounded border border-white/20 text-xs font-medium">
                    {movie.certification}
                  </span>
                </>
              )}
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{movie.rating.toFixed(1)}/10</span>
                {movie.voteCount && <span className="text-xs text-slate-400">({movie.voteCount})</span>}
              </div>
            </div>

            {/* Genres */}
            <div className="text-xs sm:text-sm text-slate-300 font-medium">
              {movie.genres.join(' · ')}
            </div>

            {/* Overview excerpt */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-3 leading-relaxed">
              {movie.overview}
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {movie.trailerYoutubeId ? (
                <button
                  onClick={() => openTrailer(movie)}
                  className="px-6 py-3 rounded-full bg-[#ff2a5f] hover:bg-[#ff154f] text-white text-xs sm:text-sm font-bold tracking-wide transition-all cine-glow hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play Trailer</span>
                </button>
              ) : (
                <span className="px-4 py-3 rounded-full bg-white/5 text-slate-400 text-xs font-medium border border-white/5 flex items-center gap-2">
                  <Play className="w-4 h-4 text-slate-600" />
                  <span>Trailer Unavailable</span>
                </span>
              )}

              <button
                onClick={() => {
                  if (inWatchlist) removeFromWatchlist(movie.id);
                  else addToWatchlist(movie.id, movie);
                }}
                className={`px-5 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all border flex items-center gap-2 ${
                  inWatchlist
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4 text-[#ff2a5f]" /> : <Plus className="w-4 h-4" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to List'}</span>
              </button>

              <button
                onClick={() => toggleWatched(movie.id, movie)}
                className={`px-4 py-3 rounded-full text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5 ${
                  isWatched(movie.id)
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{isWatched(movie.id) ? 'Watched' : 'Seen It'}</span>
              </button>

              {/* Like / Dislike */}
              <button
                onClick={() => toggleLike(movie.id, movie)}
                className={`p-3 rounded-full border transition-all ${
                  isLiked
                    ? 'bg-[#ff2a5f]/20 border-[#ff2a5f] text-[#ff2a5f]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Like"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleDislike(movie.id, movie)}
                className={`p-3 rounded-full border transition-all ${
                  isDisliked
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Not for me"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>

              {/* Movie DNA Quick Button */}
              <Link
                to={`/movie/${movie.id}/dna`}
                className="px-4 py-3 rounded-full bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 text-white text-xs font-semibold border border-purple-500/30 flex items-center gap-2 transition-all ml-auto"
              >
                <Dna className="w-4 h-4 text-[#ff2a5f]" />
                <span>Movie DNA</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] overflow-x-auto no-scrollbar pb-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'Movie DNA') {
                  navigate(`/movie/${movie.id}/dna`);
                } else {
                  setActiveTab(tab);
                }
              }}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 -mb-1 ${
                activeTab === tab
                  ? 'border-[#ff2a5f] text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-white font-display">Storyline</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {movie.overview}
                </p>
                {movie.director && (
                  <div className="pt-2 text-xs text-slate-400">
                    <span className="text-slate-500">Directed by </span>
                    <strong className="text-white font-semibold">{movie.director}</strong>
                  </div>
                )}
              </div>

              <div className="bg-[#10121b] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Movie Specs
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Original Language</span>
                    <span className="text-white font-medium">{movie.language}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Release Date</span>
                    <span className="text-white font-medium">{movie.releaseDate || `${movie.year}`}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Pacing</span>
                    <span className="text-white font-medium">{movie.pacing || 'Fast Paced'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Story Archetype</span>
                    <span className="text-white font-medium">{movie.storyType || movie.genres[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cast Section with Circular Avatars */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white font-display">Cast</h3>
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
                  {movie.cast.map((actor) => (
                    <div key={actor.name} className="flex flex-col items-center text-center shrink-0 w-24">
                      <div className="w-18 h-18 rounded-full overflow-hidden bg-white/5 border border-white/10 mb-2">
                        <img
                          src={actor.avatarUrl}
                          alt={actor.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-semibold text-white leading-tight truncate w-full">
                        {actor.name}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate w-full mt-0.5">
                        {actor.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Cast & Crew */}
        {activeTab === 'Cast & Crew' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {movie.cast?.map((actor) => (
              <div key={actor.name} className="flex items-center gap-3 p-3 rounded-xl bg-[#11131c] border border-white/5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
                  <img src={actor.avatarUrl} alt={actor.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">{actor.name}</h5>
                  <p className="text-[11px] text-slate-400">{actor.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'Reviews' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#10121a] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Film Critic Verdict</span>
                <span className="text-amber-400 font-bold">⭐ 9.2/10</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;An extraordinary technical and narrative achievement that challenges the boundaries of cinematic dreamscapes while maintaining emotional weight.&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Tab 5 / Bottom: Similar Movies */}
        <div className="mt-14">
          <Carousel
            title="Similar Movies"
            subtitle="Films with comparable thematic depth, pacing, and visual style"
            movies={similarMovies}
            seeAllLink="/recommendations"
          />
        </div>
      </div>
    </div>
  );
};
