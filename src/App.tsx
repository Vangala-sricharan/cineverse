/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { FeaturedTrailerModal } from './components/home/FeaturedTrailerModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy-loaded routes for optimal initial bundle splitting & performance
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then(m => ({ default: m.DiscoverPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const MovieDetailsPage = lazy(() => import('./pages/MovieDetailsPage').then(m => ({ default: m.MovieDetailsPage })));
const MovieDnaPage = lazy(() => import('./pages/MovieDnaPage').then(m => ({ default: m.MovieDnaPage })));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })));
const TastePage = lazy(() => import('./pages/TastePage').then(m => ({ default: m.TastePage })));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage').then(m => ({ default: m.WatchlistPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading spinner fallback during route transitions
const PageSuspenseFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4" role="status" aria-live="polite">
    <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#ff2a5f] animate-spin" />
    <span className="text-xs text-slate-400 font-mono tracking-wider">PREPARING CINEMATIC EXPERIENCE...</span>
  </div>
);

// Scroll to top helper on route transitions
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="CINEVERSE Initializing..." fallbackMessage="Unable to mount the cinema viewport. Please reload.">
      <MovieProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-[#07080b] text-slate-100 flex flex-col font-sans selection:bg-[#ff2a5f]/40 selection:text-white pb-14 md:pb-0">
            {/* Persistent Cinematic Top Navigation */}
            <Navbar />

            {/* Main Route Viewport with Global Error Boundary & Lazy Suspense */}
            <main className="flex-1" id="main-content">
              <ErrorBoundary>
                <Suspense fallback={<PageSuspenseFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/movie/:id" element={<MovieDetailsPage />} />
                    <Route path="/movie/:id/dna" element={<MovieDnaPage />} />
                    <Route path="/recommendations" element={<RecommendationsPage />} />
                    <Route path="/taste" element={<TastePage />} />
                    <Route path="/collections" element={<CollectionsPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>

            {/* Persistent Cinematic Footer */}
            <Footer />

            {/* Mobile Bottom Navigation Bar */}
            <MobileBottomBar />

            {/* Global Trailer Playback Modal */}
            <FeaturedTrailerModal />
          </div>
        </BrowserRouter>
      </MovieProvider>
    </ErrorBoundary>
  );
}
