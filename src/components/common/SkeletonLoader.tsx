import React from 'react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="w-[180px] sm:w-[200px] md:w-[220px] shrink-0 rounded-xl overflow-hidden bg-[#111319]/80 border border-white/5 animate-pulse">
      <div className="aspect-[2/3] bg-white/5 w-full relative">
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/10" />
      </div>
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-3 bg-white/10 rounded w-10" />
          <div className="h-3 bg-white/5 rounded w-16" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-3xl overflow-hidden bg-[#111319] border border-white/5 animate-pulse flex items-end p-8 md:p-14">
      <div className="max-w-2xl space-y-4">
        <div className="h-6 bg-white/10 rounded-full w-28" />
        <div className="h-12 bg-white/10 rounded-lg w-full max-w-lg" />
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="flex gap-4 pt-4">
          <div className="h-11 bg-white/15 rounded-xl w-36" />
          <div className="h-11 bg-white/5 rounded-xl w-32" />
        </div>
      </div>
    </div>
  );
};
