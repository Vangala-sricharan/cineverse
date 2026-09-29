import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Home, Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-md w-full bg-[#0d0f17] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#ff2a5f]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 flex items-center justify-center mx-auto text-[#ff2a5f]">
          <Film className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest text-[#ff5c8a] uppercase font-bold">
            Error 404 · Scene Missing
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white">
            Lost between scenes.
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            The cinematic experience or movie reel you were seeking cannot be found. It may have moved or never existed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#ff154f] hover:from-[#ff154f] hover:to-[#e0003c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#ff2a5f]/30 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to CINEVERSE</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#ff2a5f]" />
            <span>Explore Movies</span>
          </button>
        </div>
      </div>
    </div>
  );
};
