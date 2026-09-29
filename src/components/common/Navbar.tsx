import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sparkles, Menu, X, Bookmark, Film } from 'lucide-react';
import { useMovie } from '../../context/MovieContext';
import { DEFAULT_AVATAR } from '../../data/cinematicAssets';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlistIds, notificationMessage } = useMovie();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    } else {
      navigate('/search');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Discover', path: '/discover' },
    { name: 'My Taste', path: '/taste' },
    { name: 'Collections', path: '/collections' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#07080b]/90 backdrop-blur-xl border-b border-white/[0.07] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8 shrink-0">
            <NavLink
              to="/"
              className="flex items-center gap-2 group select-none"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff2a5f] to-[#ff5c8a] flex items-center justify-center shadow-lg shadow-[#ff2a5f]/30 group-hover:scale-105 transition-transform">
                <Film className="w-4 h-4 text-white fill-white/20" />
              </div>
              <div className="flex items-center tracking-tight">
                <span className="font-extrabold text-xl tracking-wider text-white font-display">CINE</span>
                <span className="font-extrabold text-xl tracking-wider text-[#ff2a5f] font-display">VERSE</span>
              </div>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Notifications, Avatar */}
          <div className="flex items-center gap-3">
            {/* Search Input Bar (Desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:block w-56 md:w-72 lg:w-80 group"
            >
              <input
                type="text"
                placeholder="Search for movies, actors, or a vibe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11131a] hover:bg-[#151822] focus:bg-[#171a25] text-xs text-white placeholder-slate-400 pl-9 pr-8 py-2 rounded-full border border-white/10 focus:border-[#ff2a5f]/60 focus:outline-none focus:ring-1 focus:ring-[#ff2a5f]/40 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#ff2a5f] text-white flex items-center justify-center text-[10px]"
                >
                  ↵
                </button>
              )}
            </form>

            {/* Watchlist Quick Link */}
            <NavLink
              to="/watchlist"
              title="Watchlist"
              aria-label="View Watchlist"
              className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#ff2a5f] text-[9px] font-bold text-white flex items-center justify-center">
                  {watchlistIds.length}
                </span>
              )}
            </NavLink>

            {/* User Profile / Taste Avatar */}
            <NavLink
              to="/taste"
              className="flex items-center pl-1 group"
              title="My Taste"
              aria-label="View your Cinematic Taste Profile"
            >
              <div className="relative w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#ff2a5f] to-[#ff5c8a] group-hover:scale-105 transition-transform">
                <img
                  src={DEFAULT_AVATAR}
                  alt="User Taste Profile"
                  loading="lazy"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </NavLink>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Global Notification Banner if triggered */}
        {notificationMessage && (
          <div className="bg-[#ff2a5f] text-white text-xs font-semibold py-1.5 px-4 text-center animate-in fade-in slide-in-from-top-2 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{notificationMessage}</span>
          </div>
        )}

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0c0e15] border-b border-white/10 px-4 py-4 space-y-3 animate-in slide-in-from-top-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies, mood or vibe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151822] text-xs text-white placeholder-slate-400 pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ff2a5f]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-xs font-medium ${
                      isActive
                        ? 'bg-[#ff2a5f] text-white font-semibold'
                        : 'bg-white/5 text-slate-300 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <NavLink
                to="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-medium ${
                    isActive ? 'bg-[#ff2a5f] text-white' : 'bg-white/5 text-slate-300'
                  }`
                }
              >
                Watchlist ({watchlistIds.length})
              </NavLink>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
