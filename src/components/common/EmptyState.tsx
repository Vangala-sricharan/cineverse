import React from 'react';
import { Film, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'film' | 'search' | 'taste';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No movies found',
  description = 'Try adjusting your filters, mood, or search criteria to uncover more experiences.',
  actionText = 'Reset Filters',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/5 bg-[#0f1118]/60 my-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-[#ff2a5f]">
        <Film className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-xl font-semibold text-white tracking-tight mb-2 font-display">
        {title}
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold tracking-wide transition-all border border-white/10 hover:border-white/20 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#ff2a5f]" />
          {actionText}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load movie data',
  message = 'Something unexpected occurred while communicating with the movie catalog. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-red-500/20 bg-red-950/10 my-6">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-[#ff2a5f]">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-white tracking-tight mb-2 font-display">
        {title}
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff2a5f] hover:bg-[#ff154f] text-white text-xs font-semibold tracking-wide transition-all cine-glow active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};
