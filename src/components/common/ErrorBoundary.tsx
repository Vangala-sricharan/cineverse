import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log sanitized error in development without leaking customer info
    if (process.env.NODE_ENV === 'development') {
      console.warn('CINEVERSE ErrorBoundary caught an unhandled component error:', error.message, errorInfo.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full bg-[#0d0f17] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 flex items-center justify-center mx-auto text-[#ff2a5f]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-display text-white">
                {this.props.fallbackTitle || 'Something paused the scene'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {this.props.fallbackMessage || 'An unexpected rendering issue occurred. Your saved watchlist and taste profile remain completely safe.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#ff154f] hover:from-[#ff154f] hover:to-[#e0003c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#ff2a5f]/20 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Scene</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to CINEVERSE</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
