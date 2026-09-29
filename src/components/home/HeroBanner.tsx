import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Film, SlidersHorizontal } from 'lucide-react';

interface HeroBannerProps {
  onExploreMoodClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreMoodClick }) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden pt-6 pb-12 md:py-16">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#ff2a5f]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-red-900/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Brand Vision, Copy & Primary Action Buttons */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#ff2a5f]" />
                <span className="tracking-wide">Cinematic Intelligence & Discovery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.06] font-display">
                Not just movies. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#ff5c8a]">
                  Experiences.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Explore cinema shaped by mood, storytelling depth, and your personal cinematic taste — free from generic algorithms and fabricated rankings.
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreMoodClick || (() => navigate('/discover'))}
                className="px-7 py-3.5 rounded-full bg-[#ff2a5f] hover:bg-[#ff154f] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#ff2a5f]/30 cine-glow hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
              >
                <Compass className="w-4 h-4 fill-white/20" />
                <span>Explore by Mood</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/taste')}
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#ff2a5f]" />
                <span>Calibrate Taste</span>
              </button>
            </div>
          </div>

          {/* Right Column: Premium Neutral Cinematic Sculpture / Canvas */}
          <div className="lg:col-span-5 z-10">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#131622] via-[#0d0f17] to-[#08090e] border border-white/10 p-7 sm:p-9 shadow-2xl shadow-black/80 space-y-6">
              
              {/* Subtle top accent beam */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ff2a5f]/40 to-transparent" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono uppercase tracking-wider text-[11px] text-[#ff5c8a] font-semibold flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    Cineverse Engine
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                    Live Catalog Ready
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                  Intent-Driven Cinema Discovery
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search naturally for atmosphere, pacing, and psychological depth. Connect your viewing preferences to uncover cinema tailored to your mood.
                </p>
              </div>

              {/* Discovery Pillars */}
              <div className="space-y-2.5 pt-1">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#ff2a5f]" />
                    <span className="text-xs font-medium text-slate-200">Cinematic DNA Profiling</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">15 Dimensions</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#ff2a5f]/60" />
                    <span className="text-xs font-medium text-slate-200">Natural-Language Search</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Semantic Intent</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                    <span className="text-xs font-medium text-slate-200">Client-First Privacy</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">100% Local</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ff2a5f]" />
                  <span>Start Natural Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
