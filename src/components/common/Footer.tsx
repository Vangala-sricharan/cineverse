import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-[#050608] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        
        {/* Brand & Tagline */}
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#ff2a5f] to-[#ff5c8a] flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-wider text-white font-display">
              CINE<span className="text-[#ff2a5f]">VERSE</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-display italic">
            &ldquo;Not just movies. Experiences.&rdquo;
          </p>
          <p className="text-[11px] text-slate-500">
            A premium cinematic movie discovery and recommendation platform designed to help you uncover movies that genuinely match your mood and taste.
          </p>
        </div>

        {/* Navigation columns */}
        <div className="flex flex-wrap gap-8 text-xs">
          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Explore</h5>
            <ul className="space-y-1.5">
              <li><Link to="/" className="hover:text-white transition-colors">Home Experience</Link></li>
              <li><Link to="/discover" className="hover:text-white transition-colors">Discover Catalog</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Natural Language Search</Link></li>
              <li><Link to="/recommendations" className="hover:text-white transition-colors">AI Recommendations</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Personalization</h5>
            <ul className="space-y-1.5">
              <li><Link to="/taste" className="hover:text-white transition-colors">Cinematic DNA</Link></li>
              <li><Link to="/collections" className="hover:text-white transition-colors">Collections</Link></li>
              <li><Link to="/watchlist" className="hover:text-white transition-colors">My Watchlist</Link></li>
              <li><Link to="/movie/inception/dna" className="hover:text-white transition-colors">Movie DNA Breakdown</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-4">
        <div>
          © {new Date().getFullYear()} CINEVERSE. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span>Phase 1 Architectural Foundation</span>
          <span>·</span>
          <span>Designed with high fidelity</span>
        </div>
      </div>
    </footer>
  );
};
