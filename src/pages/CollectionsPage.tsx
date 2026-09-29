import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  Bookmark,
  History,
  Sparkles,
  FolderHeart,
  Settings,
  Plus,
  Folder,
  X,
  Play,
} from 'lucide-react';
import { SAMPLE_COLLECTIONS } from '../data/sampleMovies';
import { DEFAULT_AVATAR } from '../data/cinematicAssets';
import { Carousel } from '../components/common/Carousel';
import { MovieService } from '../services/MovieService';
import { Movie } from '../types/movie';
import { useMovie } from '../context/MovieContext';

export const CollectionsPage: React.FC = () => {
  const { watchlistIds, showNotification } = useMovie();
  const [collections, setCollections] = useState(SAMPLE_COLLECTIONS);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Dynamically load watchlist movies from live service
  useEffect(() => {
    let isMounted = true;
    const fetchWatchlistData = async () => {
      if (watchlistIds.length === 0) {
        // If empty, fetch popular or trending to show
        try {
          const trending = await MovieService.getTrendingMovies();
          if (isMounted) setWatchlistMovies(trending.slice(0, 6));
        } catch {
          if (isMounted) setWatchlistMovies([]);
        }
        return;
      }

      setIsLoadingWatchlist(true);
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
          setWatchlistMovies(fetched.filter((m): m is Movie => m !== null));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoadingWatchlist(false);
      }
    };

    fetchWatchlistData();
    return () => {
      isMounted = false;
    };
  }, [watchlistIds]);

  // Persist collections in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cineverse:collections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCollections(parsed);
        }
      }
    } catch {}
  }, []);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      const newColl = {
        id: `coll-${Date.now()}`,
        title: newTitle.trim(),
        description: newDesc.trim() || 'Custom curated list',
        movieCount: 0,
        movieIds: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updated = [newColl, ...collections];
      setCollections(updated);
      try {
        localStorage.setItem('cineverse:collections', JSON.stringify(updated));
      } catch {}
      setNewTitle('');
      setNewDesc('');
      setShowModal(false);
      showNotification(`Collection "${newTitle}" created!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Profile Navigation */}
        <aside className="lg:col-span-3 bg-[#0d0f17] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Profile"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
              className="w-12 h-12 rounded-full object-cover border border-[#ff2a5f]/40 p-0.5"
            />
            <div>
              <h3 className="font-bold text-white text-sm font-display">Soumya</h3>
              <span className="text-[11px] text-[#ff2a5f] font-semibold">Cinematic Explorer</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <NavLink
              to="/taste"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </NavLink>

            <NavLink
              to="/watchlist"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span>Watchlist</span>
            </NavLink>

            <button
              onClick={() => showNotification('Viewing history recorded.')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors text-left"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>

            <NavLink
              to="/taste"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>My Taste</span>
            </NavLink>

            <NavLink
              to="/collections"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/25"
            >
              <FolderHeart className="w-4 h-4" />
              <span>Collections</span>
            </NavLink>

            <button
              onClick={() => showNotification('Cineverse Settings loaded.')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors text-left"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area: Collections & Watchlist */}
        <main className="lg:col-span-9 space-y-10">
          
          {/* Section 1: My Collections */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                  My Collections
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Organize and curate your favorite cinematic journeys.
                </p>
              </div>

              {/* + New Collection button */}
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff2a5f] hover:bg-[#ff154f] text-white text-xs font-bold transition-all shadow-md shadow-[#ff2a5f]/30 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Collection</span>
              </button>
            </div>

            {/* Collection Cards Grid matching reference 8 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {collections.map((coll, idx) => {
                const colors = [
                  'from-red-950/40 via-[#181119] to-[#0f1118] border-red-500/20 text-[#ff4070]',
                  'from-indigo-950/40 via-[#131422] to-[#0f1118] border-indigo-500/20 text-indigo-400',
                  'from-amber-950/40 via-[#1f1614] to-[#0f1118] border-amber-500/20 text-amber-400',
                  'from-rose-950/40 via-[#1a1219] to-[#0f1118] border-rose-500/20 text-rose-400',
                ];
                const cardStyle = colors[idx % colors.length];

                return (
                  <div
                    key={coll.id}
                    onClick={() => showNotification(`Viewing "${coll.title}" collection`)}
                    className={`p-5 rounded-2xl bg-gradient-to-b ${cardStyle} border hover:border-white/20 transition-all hover:-translate-y-1 cursor-pointer group flex flex-col justify-between h-36`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Folder className="w-5 h-5 fill-current" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {coll.movieCount} movies
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-sm font-display group-hover:text-[#ff2a5f] transition-colors">
                        {coll.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {coll.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: My Watchlist Horizontal Carousel */}
          <div>
            <Carousel
              title="My Watchlist"
              subtitle="Films saved for upcoming viewing sessions"
              movies={watchlistMovies}
              seeAllLink="/watchlist"
              showMatch={false}
              isLoading={isLoadingWatchlist}
            />
          </div>
        </main>
      </div>

      {/* New Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#0f111a] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white font-display">Create Collection</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noir Thrillers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#161824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ff2a5f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gritty rainy night detective mysteries"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#161824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ff2a5f]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff2a5f] hover:bg-[#ff154f] text-white text-xs font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
