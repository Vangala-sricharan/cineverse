/**
 * Storage Service Abstraction — Phase 4
 * 
 * Cleanly wraps TasteStorageService and provides unified async access.
 * Retains backward compatibility for Watchlist, Likes, Dislikes, History, and Collections,
 * while directing state to the standardized `cineverse:*` namespace.
 */

import { TasteStorageService } from './TasteStorageService';

export interface IStorageService {
  getWatchlist(): Promise<string[]>;
  addToWatchlist(movieId: string): Promise<boolean>;
  removeFromWatchlist(movieId: string): Promise<boolean>;
  isInWatchlist(movieId: string): Promise<boolean>;

  getLikes(): Promise<string[]>;
  toggleLike(movieId: string): Promise<'liked' | 'none'>;
  
  getDislikes(): Promise<string[]>;
  toggleDislike(movieId: string): Promise<'disliked' | 'none'>;

  getWatched(): Promise<string[]>;
  toggleWatched(movieId: string): Promise<boolean>;

  getHistory(): Promise<string[]>;
  recordView(movieId: string): Promise<void>;

  getUserPreferences(): Promise<string[]>;
  setUserPreferences(prefs: string[]): Promise<void>;
}

class BrowserLocalStorageService implements IStorageService {
  async getWatchlist(): Promise<string[]> {
    return TasteStorageService.getWatchlist();
  }

  async addToWatchlist(movieId: string): Promise<boolean> {
    const list = TasteStorageService.getWatchlist();
    if (!list.includes(movieId)) {
      const updated = [...list, movieId];
      TasteStorageService.saveWatchlist(updated);
      TasteStorageService.updateProfile({ watchlistMovies: updated });
    }
    return true;
  }

  async removeFromWatchlist(movieId: string): Promise<boolean> {
    let list = TasteStorageService.getWatchlist();
    list = list.filter((id) => id !== movieId);
    TasteStorageService.saveWatchlist(list);
    TasteStorageService.updateProfile({ watchlistMovies: list });
    return true;
  }

  async isInWatchlist(movieId: string): Promise<boolean> {
    const list = TasteStorageService.getWatchlist();
    return list.includes(movieId);
  }

  async getLikes(): Promise<string[]> {
    return TasteStorageService.getLikes();
  }

  async toggleLike(movieId: string): Promise<'liked' | 'none'> {
    let likes = TasteStorageService.getLikes();
    let dislikes = TasteStorageService.getDislikes();

    // Remove from dislikes
    dislikes = dislikes.filter((id) => id !== movieId);
    TasteStorageService.saveDislikes(dislikes);

    let result: 'liked' | 'none';
    if (likes.includes(movieId)) {
      likes = likes.filter((id) => id !== movieId);
      result = 'none';
    } else {
      likes.push(movieId);
      result = 'liked';
    }

    TasteStorageService.saveLikes(likes);
    TasteStorageService.updateProfile({
      likedMovies: likes,
      dislikedMovies: dislikes,
    });

    return result;
  }

  async getDislikes(): Promise<string[]> {
    return TasteStorageService.getDislikes();
  }

  async toggleDislike(movieId: string): Promise<'disliked' | 'none'> {
    let likes = TasteStorageService.getLikes();
    let dislikes = TasteStorageService.getDislikes();

    // Remove from likes
    likes = likes.filter((id) => id !== movieId);
    TasteStorageService.saveLikes(likes);

    let result: 'disliked' | 'none';
    if (dislikes.includes(movieId)) {
      dislikes = dislikes.filter((id) => id !== movieId);
      result = 'none';
    } else {
      dislikes.push(movieId);
      result = 'disliked';
    }

    TasteStorageService.saveDislikes(dislikes);
    TasteStorageService.updateProfile({
      likedMovies: likes,
      dislikedMovies: dislikes,
    });

    return result;
  }

  async getWatched(): Promise<string[]> {
    return TasteStorageService.getWatched();
  }

  async toggleWatched(movieId: string): Promise<boolean> {
    let watched = TasteStorageService.getWatched();
    let isNowWatched = false;
    if (watched.includes(movieId)) {
      watched = watched.filter((id) => id !== movieId);
    } else {
      watched = [movieId, ...watched];
      isNowWatched = true;
    }
    TasteStorageService.saveWatched(watched);
    TasteStorageService.updateProfile({ watchedMovies: watched });
    return isNowWatched;
  }

  async getHistory(): Promise<string[]> {
    return TasteStorageService.getProfile().interactionHistory.map((e) => e.movieId);
  }

  async recordView(movieId: string): Promise<void> {
    TasteStorageService.recordInteraction({
      movieId,
      eventType: 'opened',
      source: 'movie-details',
    });
  }

  async getUserPreferences(): Promise<string[]> {
    return TasteStorageService.getProfile().favoriteGenres;
  }

  async setUserPreferences(prefs: string[]): Promise<void> {
    TasteStorageService.updateProfile({ favoriteGenres: prefs });
  }
}

export const StorageService: IStorageService = new BrowserLocalStorageService();
