import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  Bookmark,
  History,
  Sparkles,
  FolderHeart,
  Settings,
  Plus,
  X,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Compass,
} from 'lucide-react';
import { RadarChart, RadarDataPoint } from '../components/common/RadarChart';
import { useMovie } from '../context/MovieContext';
import { TasteLearningEngine } from '../services/TasteLearningEngine';
import { DEFAULT_AVATAR } from '../data/cinematicAssets';
import { TasteOnboardingModal } from '../components/taste/TasteOnboardingModal';

const ALL_GENRES = [
  'Science Fiction',
  'Crime',
  'Thriller',
  'Mystery',
  'Action',
  'Drama',
  'Comedy',
  'Horror',
  'Adventure',
  'Romance',
];

const ALL_MOODS = [
  'Dark',
  'Mind-Bending',
  'Emotional',
  'Intense',
  'Uplifting',
  'Mysterious',
  'Relaxing',
];

export const TastePage: React.FC = () => {
  const {
    tasteProfile,
    updateTasteProfile,
    resetTasteProfile,
    likes,
    dislikes,
    watchedIds,
    showNotification,
  } = useMovie();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'taste' | 'settings'>('taste');

  const persona = TasteLearningEngine.getCinematicPersona(tasteProfile);
  const dna = tasteProfile.preferredDNA || {};

  // Build Radar Data from actual taste profile DNA
  const radarData: RadarDataPoint[] = [
    { dimension: 'Story', value: dna.storyComplexity ?? 88 },
    { dimension: 'Mystery', value: dna.suspense ?? 85 },
    { dimension: 'Mind-Bending', value: dna.psychologicalDepth ?? 90 },
    { dimension: 'Thriller', value: dna.suspense ?? 82 },
    { dimension: 'Action', value: dna.action ?? 65 },
    { dimension: 'Visuals', value: dna.visualSpectacle ?? 84 },
    { dimension: 'Emotion', value: dna.emotion ?? 72 },
    { dimension: 'Darkness', value: dna.darkness ?? 76 },
  ];

  const handleToggleFavoriteGenre = (genre: string) => {
    const current = tasteProfile.favoriteGenres;
    const isFav = current.includes(genre);
    const updated = isFav ? current.filter((g) => g !== genre) : [...current, genre];
    updateTasteProfile({ favoriteGenres: updated });
  };

  const handleToggleDislikedGenre = (genre: string) => {
    const current = tasteProfile.dislikedGenres;
    const isDisliked = current.includes(genre);
    const updated = isDisliked ? current.filter((g) => g !== genre) : [...current, genre];
    updateTasteProfile({ dislikedGenres: updated });
  };

  const handleToggleMood = (mood: string) => {
    const current = tasteProfile.preferredMoods;
    const isMood = current.includes(mood);
    const updated = isMood ? current.filter((m) => m !== mood) : [...current, mood];
    updateTasteProfile({ preferredMoods: updated });
  };

  const handleTogglePersonalization = (enabled: boolean) => {
    updateTasteProfile({
      settings: {
        ...tasteProfile.settings,
        enabled,
      },
    });
    showNotification(enabled ? 'Personalized recommendations activated' : 'Standard recommendations mode enabled');
  };

  return (
    <div className="min-h-screen bg-[#07080b] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
      <TasteOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#10121c] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display">Reset Cinematic Taste Signals?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear learned preferences, genre weights, and interaction histories. Your Watchlist and saved Collections will be safely preserved.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetTasteProfile(true);
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 bg-[#0d0f17] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
            <img
              src={DEFAULT_AVATAR}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border border-[#ff2a5f]/40 p-0.5"
            />
            <div>
              <h3 className="font-bold text-white text-sm font-display">You</h3>
              <span className="text-[11px] text-[#ff2a5f] font-semibold">{persona.title}</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('taste')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left ${
                activeTab === 'taste'
                  ? 'bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/25'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Cinematic DNA</span>
            </button>

            <NavLink
              to="/watchlist"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span>Watchlist ({tasteProfile.watchlistMovies.length})</span>
            </NavLink>

            <NavLink
              to="/collections"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <FolderHeart className="w-4 h-4" />
              <span>Collections</span>
            </NavLink>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left ${
                activeTab === 'settings'
                  ? 'bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/25'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Taste Controls</span>
            </button>
          </nav>

          {/* Quick Stats Summary */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><ThumbsUp className="w-3.5 h-3.5 text-[#ff2a5f]" /> Liked</span>
              <span className="font-bold text-white">{likes.length}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><ThumbsDown className="w-3.5 h-3.5 text-slate-500" /> Disliked</span>
              <span className="font-bold text-white">{dislikes.length}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-emerald-400" /> Watched</span>
              <span className="font-bold text-white">{watchedIds.length}</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-8">
          {activeTab === 'taste' ? (
            <>
              {/* Persona Banner */}
              <div className="bg-gradient-to-r from-[#121422] to-[#0c0d15] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 text-xs font-semibold text-[#ff5c8a] mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your Cinematic Archetype</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                    {persona.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                    {persona.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#ff2a5f]" />
                    <span>Calibrate Taste</span>
                  </button>
                </div>
              </div>

              {/* Cinematic DNA Radar Container */}
              <div className="bg-[#0d0f17] border border-white/[0.08] rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
                      Your Taste Fingerprint
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Learned incrementally from movies you like, dislike, watch, and search.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 self-start sm:self-auto flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Local & Private</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 flex justify-center">
                    <RadarChart
                      data={radarData}
                      size={360}
                      showComparison={false}
                      centerText="My DNA"
                    />
                  </div>

                  <div className="md:col-span-5 space-y-6">
                    {/* Favorite Genres Chips */}
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Favorite Genres
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {ALL_GENRES.map((genre) => {
                          const isFav = tasteProfile.favoriteGenres.includes(genre);
                          return (
                            <button
                              key={genre}
                              onClick={() => handleToggleFavoriteGenre(genre)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                isFav
                                  ? 'bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/25'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                              }`}
                            >
                              {genre}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preferred Atmospheres */}
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Preferred Atmospheres
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {ALL_MOODS.map((mood) => {
                          const isMood = tasteProfile.preferredMoods.includes(mood);
                          return (
                            <button
                              key={mood}
                              onClick={() => handleToggleMood(mood)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                isMood
                                  ? 'bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/25'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                              }`}
                            >
                              {mood}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Disliked / Avoidance Settings */}
              <div className="bg-[#0e1017] border border-white/[0.08] rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-display">
                    Negative Preferences & Avoidance
                  </h3>
                  <span className="text-[11px] text-slate-500">Soft penalty in ranking</span>
                </div>
                <p className="text-xs text-slate-400">
                  Select genres you want CINEVERSE to de-prioritize in recommendations:
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {ALL_GENRES.map((genre) => {
                    const isDisliked = tasteProfile.dislikedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => handleToggleDislikedGenre(genre)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          isDisliked
                            ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                        }`}
                      >
                        {isDisliked ? `✕ Avoid ${genre}` : genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Settings & Control Tab */
            <div className="space-y-6">
              <div className="bg-[#0d0f17] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    Personalization Controls
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Control how CINEVERSE leverages your taste profile across searches and recommendations.
                  </p>
                </div>

                <div className="divide-y divide-white/10 space-y-4">
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Personalized Recommendations</h4>
                      <p className="text-xs text-slate-400">When enabled, rankings blend your taste profile with search intent.</p>
                    </div>
                    <button
                      onClick={() => handleTogglePersonalization(!tasteProfile.settings.enabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        tasteProfile.settings.enabled ? 'bg-[#ff2a5f]' : 'bg-white/15'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          tasteProfile.settings.enabled ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Watchlist Signals Toggle */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Use Watchlist Signals</h4>
                      <p className="text-xs text-slate-400">Factor movies in your watchlist into recommendation models.</p>
                    </div>
                    <button
                      onClick={() =>
                        updateTasteProfile({
                          settings: {
                            ...tasteProfile.settings,
                            useWatchlistSignals: !tasteProfile.settings.useWatchlistSignals,
                          },
                        })
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        tasteProfile.settings.useWatchlistSignals ? 'bg-[#ff2a5f]' : 'bg-white/15'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          tasteProfile.settings.useWatchlistSignals ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Novelty Exploration Slider */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Discovery & Novelty Exploration</h4>
                      <span className="text-xs text-[#ff5c8a] font-mono font-bold">
                        {tasteProfile.settings.noveltyWeight}% Novelty
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Higher novelty introduces fresh titles outside your comfort zone that match your DNA.
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={tasteProfile.settings.noveltyWeight}
                      onChange={(e) =>
                        updateTasteProfile({
                          settings: {
                            ...tasteProfile.settings,
                            noveltyWeight: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-[#ff2a5f] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Destructive Reset Action */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-red-400">Reset Taste Signals</h4>
                    <p className="text-xs text-slate-400">Clear learned weights without losing your Watchlist.</p>
                  </div>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Taste</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
