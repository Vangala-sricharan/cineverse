import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { TasteStorageService } from '../services/TasteStorageService';
import { TasteLearningEngine } from '../services/TasteLearningEngine';
import { TasteProfile } from '../types/intelligence';
import { Movie } from '../types/movie';

interface MovieContextType {
  watchlistIds: string[];
  addToWatchlist: (movieId: string, movie?: Movie) => Promise<void>;
  removeFromWatchlist: (movieId: string) => Promise<void>;
  isInWatchlist: (movieId: string) => boolean;
  
  activeTrailerMovie: Movie | null;
  openTrailer: (movie: Movie) => void;
  closeTrailer: () => void;
  
  likes: string[];
  toggleLike: (movieId: string, movie?: Movie) => Promise<void>;
  dislikes: string[];
  toggleDislike: (movieId: string, movie?: Movie) => Promise<void>;
  
  watchedIds: string[];
  toggleWatched: (movieId: string, movie?: Movie) => Promise<boolean>;
  isWatched: (movieId: string) => boolean;
  
  tasteProfile: TasteProfile;
  updateTasteProfile: (partial: Partial<TasteProfile>) => void;
  resetTasteProfile: (preserveWatchlist?: boolean) => void;
  
  notificationMessage: string | null;
  showNotification: (msg: string) => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [watchedIds, setWatchedIds] = useState<string[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>(TasteStorageService.getProfile());
  const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  useEffect(() => {
    // Sync initial state from TasteStorageService
    const profile = TasteStorageService.getProfile();
    setTasteProfile(profile);
    setWatchlistIds(TasteStorageService.getWatchlist());
    setLikes(TasteStorageService.getLikes());
    setDislikes(TasteStorageService.getDislikes());
    setWatchedIds(TasteStorageService.getWatched());
  }, []);

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3200);
  };

  const addToWatchlist = async (movieId: string, movie?: Movie) => {
    await StorageService.addToWatchlist(movieId);
    setWatchlistIds((prev) => (prev.includes(movieId) ? prev : [...prev, movieId]));
    if (movie) {
      const updated = TasteLearningEngine.processInteraction(movie, 'watchlisted', 'movie-details');
      setTasteProfile(updated);
    }
    showNotification('Added to your Watchlist');
  };

  const removeFromWatchlist = async (movieId: string) => {
    await StorageService.removeFromWatchlist(movieId);
    setWatchlistIds((prev) => prev.filter((id) => id !== movieId));
    showNotification('Removed from Watchlist');
  };

  const isInWatchlist = (movieId: string) => {
    return watchlistIds.includes(movieId);
  };

  const toggleLike = async (movieId: string, movie?: Movie) => {
    const res = await StorageService.toggleLike(movieId);
    if (res === 'liked') {
      setLikes((prev) => [...prev.filter((id) => id !== movieId), movieId]);
      setDislikes((prev) => prev.filter((id) => id !== movieId));
      if (movie) {
        const updated = TasteLearningEngine.processInteraction(movie, 'liked', 'movie-details');
        setTasteProfile(updated);
      }
      showNotification('Marked as Liked · Added to your Taste DNA');
    } else {
      setLikes((prev) => prev.filter((id) => id !== movieId));
      showNotification('Removed from Liked');
    }
  };

  const toggleDislike = async (movieId: string, movie?: Movie) => {
    const res = await StorageService.toggleDislike(movieId);
    if (res === 'disliked') {
      setDislikes((prev) => [...prev.filter((id) => id !== movieId), movieId]);
      setLikes((prev) => prev.filter((id) => id !== movieId));
      if (movie) {
        const updated = TasteLearningEngine.processInteraction(movie, 'disliked', 'movie-details');
        setTasteProfile(updated);
      }
      showNotification('Marked as Not for me · Reduced in recommendations');
    } else {
      setDislikes((prev) => prev.filter((id) => id !== movieId));
      showNotification('Dislike removed');
    }
  };

  const toggleWatched = async (movieId: string, movie?: Movie): Promise<boolean> => {
    const isNowWatched = await StorageService.toggleWatched(movieId);
    if (isNowWatched) {
      setWatchedIds((prev) => [movieId, ...prev.filter((id) => id !== movieId)]);
      if (movie) {
        const updated = TasteLearningEngine.processInteraction(movie, 'watched', 'movie-details');
        setTasteProfile(updated);
      }
      showNotification('Marked as Watched');
    } else {
      setWatchedIds((prev) => prev.filter((id) => id !== movieId));
      showNotification('Removed from Watched');
    }
    return isNowWatched;
  };

  const isWatched = (movieId: string) => {
    return watchedIds.includes(movieId);
  };

  const updateTasteProfile = (partial: Partial<TasteProfile>) => {
    const updated = TasteStorageService.updateProfile(partial);
    setTasteProfile(updated);
    showNotification('Taste Profile updated');
  };

  const resetTasteProfile = (preserveWatchlist = true) => {
    const clean = TasteStorageService.resetTasteSignals(preserveWatchlist);
    setTasteProfile(clean);
    setLikes(clean.likedMovies);
    setDislikes(clean.dislikedMovies);
    showNotification('Cinematic Taste signals have been reset.');
  };

  const openTrailer = (movie: Movie) => {
    setActiveTrailerMovie(movie);
  };

  const closeTrailer = () => {
    setActiveTrailerMovie(null);
  };

  return (
    <MovieContext.Provider
      value={{
        watchlistIds,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        activeTrailerMovie,
        openTrailer,
        closeTrailer,
        likes,
        toggleLike,
        dislikes,
        toggleDislike,
        watchedIds,
        toggleWatched,
        isWatched,
        tasteProfile,
        updateTasteProfile,
        resetTasteProfile,
        notificationMessage,
        showNotification,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovie = (): MovieContextType => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovie must be used within a MovieProvider');
  }
  return context;
};
