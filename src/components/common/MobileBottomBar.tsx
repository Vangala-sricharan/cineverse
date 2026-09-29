import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Sparkles, Bookmark, User } from 'lucide-react';
import { useMovie } from '../../context/MovieContext';

export const MobileBottomBar: React.FC = () => {
  const { watchlistIds } = useMovie();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Taste', path: '/taste', icon: Sparkles },
    { name: 'Saved', path: '/watchlist', icon: Bookmark, badge: watchlistIds.length },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0a0b10]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-2">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-[#ff2a5f]'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-[#ff2a5f] text-[9px] font-bold text-white flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold mt-0.5 tracking-tight">
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#ff2a5f] mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
