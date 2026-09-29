/**
 * CINEVERSE TasteStorageService
 * 
 * Clean, abstracted local persistence layer for TasteProfile and interaction history.
 * Standardizes namespace under `cineverse:*`.
 * Handles versioning (version 1), safe migrations, corrupted storage recovery,
 * compact event pruning (max 80 events), and zero external database dependencies.
 */

import { TasteProfile, InteractionEvent } from '../types/intelligence';

const PROFILE_VERSION = 1;
const STORAGE_PREFIX = 'cineverse:';
const PROFILE_KEY = `${STORAGE_PREFIX}taste-profile`;
const WATCHLIST_KEY = `${STORAGE_PREFIX}watchlist`;
const LIKES_KEY = `${STORAGE_PREFIX}likes`;
const DISLIKES_KEY = `${STORAGE_PREFIX}dislikes`;
const WATCHED_KEY = `${STORAGE_PREFIX}watched`;
const COLLECTIONS_KEY = `${STORAGE_PREFIX}collections`;
const MAX_INTERACTION_HISTORY = 80;

// In-Memory Fallback for non-browser/SSR or test contexts
let memoryStore: Record<string, string> = {};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function storageGet(key: string): string | null {
  if (isBrowser()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  }
  return memoryStore[key] || null;
}

function storageSet(key: string, value: string): void {
  memoryStore[key] = value;
  if (isBrowser()) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }
}

export const DEFAULT_TASTE_PROFILE: TasteProfile = {
  version: PROFILE_VERSION,
  onboardingCompleted: false,
  favoriteGenres: ['Science Fiction', 'Crime', 'Thriller', 'Mystery'],
  dislikedGenres: [],
  favoriteThemes: ['identity', 'time', 'morality', 'survival'],
  dislikedThemes: [],
  preferredTones: ['atmospheric', 'gritty', 'surreal'],
  preferredMoods: ['Dark', 'Mind-Bending', 'Intense'],
  preferredPacing: ['Slow Burn', 'Fast Paced'],
  preferredDNA: {
    storyComplexity: 88,
    psychologicalDepth: 90,
    suspense: 85,
    visualSpectacle: 84,
    darkness: 76,
    action: 65,
    emotion: 72,
    romance: 20,
    comedy: 25,
  },
  watchedMovies: ['inception', 'interstellar'],
  likedMovies: ['inception', 'the-dark-knight'],
  dislikedMovies: [],
  watchlistMovies: ['dune-part-two', 'inception'],
  preferredRuntime: {
    min: 90,
    max: 180,
  },
  languagePreferences: ['English', 'Telugu'],
  releasePreferences: {
    from: 1995,
  },
  settings: {
    enabled: true,
    useWatchlistSignals: true,
    useHistorySignals: true,
    noveltyWeight: 25, // 25% novelty exploration
    negativePreferencePenalty: 70, // significant reduction for disliked items
  },
  interactionHistory: [],
  lastUpdated: Date.now(),
};

export class TasteStorageService {
  /**
   * Safely reads and migrates TasteProfile from LocalStorage
   */
  static getProfile(): TasteProfile {
    try {
      const raw = storageGet(PROFILE_KEY);
      if (!raw) {
        const initial = { ...DEFAULT_TASTE_PROFILE, lastUpdated: Date.now() };
        this.saveProfile(initial);
        return initial;
      }

      const parsed = JSON.parse(raw);
      return this.migrateProfile(parsed);
    } catch (e) {
      console.warn('TasteStorageService: corrupted profile detected, recovering safely', e);
      return { ...DEFAULT_TASTE_PROFILE, lastUpdated: Date.now() };
    }
  }

  /**
   * Validates and saves TasteProfile to LocalStorage
   */
  static saveProfile(profile: TasteProfile): boolean {
    try {
      const validated: TasteProfile = {
        ...profile,
        version: PROFILE_VERSION,
        favoriteGenres: Array.isArray(profile.favoriteGenres) ? profile.favoriteGenres : [],
        dislikedGenres: Array.isArray(profile.dislikedGenres) ? profile.dislikedGenres : [],
        favoriteThemes: Array.isArray(profile.favoriteThemes) ? profile.favoriteThemes : [],
        dislikedThemes: Array.isArray(profile.dislikedThemes) ? profile.dislikedThemes : [],
        preferredMoods: Array.isArray(profile.preferredMoods) ? profile.preferredMoods : [],
        preferredTones: Array.isArray(profile.preferredTones) ? profile.preferredTones : [],
        preferredPacing: Array.isArray(profile.preferredPacing) ? profile.preferredPacing : [],
        likedMovies: Array.isArray(profile.likedMovies) ? profile.likedMovies : [],
        dislikedMovies: Array.isArray(profile.dislikedMovies) ? profile.dislikedMovies : [],
        watchedMovies: Array.isArray(profile.watchedMovies) ? profile.watchedMovies : [],
        watchlistMovies: Array.isArray(profile.watchlistMovies) ? profile.watchlistMovies : [],
        interactionHistory: Array.isArray(profile.interactionHistory)
          ? profile.interactionHistory.slice(0, MAX_INTERACTION_HISTORY)
          : [],
        settings: {
          enabled: profile.settings?.enabled ?? true,
          useWatchlistSignals: profile.settings?.useWatchlistSignals ?? true,
          useHistorySignals: profile.settings?.useHistorySignals ?? true,
          noveltyWeight: profile.settings?.noveltyWeight ?? 25,
          negativePreferencePenalty: profile.settings?.negativePreferencePenalty ?? 70,
        },
        lastUpdated: Date.now(),
      };

      storageSet(PROFILE_KEY, JSON.stringify(validated));
      return true;
    } catch (e) {
      console.warn('TasteStorageService: unable to save profile', e);
      return false;
    }
  }

  /**
   * Incrementally updates profile with partial values
   */
  static updateProfile(partial: Partial<TasteProfile>): TasteProfile {
    const current = this.getProfile();
    const updated: TasteProfile = {
      ...current,
      ...partial,
      preferredDNA: {
        ...current.preferredDNA,
        ...(partial.preferredDNA || {}),
      },
      settings: {
        ...current.settings,
        ...(partial.settings || {}),
      },
      lastUpdated: Date.now(),
    };

    this.saveProfile(updated);
    return updated;
  }

  /**
   * Appends an interaction event and prunes history to MAX_INTERACTION_HISTORY
   */
  static recordInteraction(event: Omit<InteractionEvent, 'timestamp'>): TasteProfile {
    const profile = this.getProfile();
    const fullEvent: InteractionEvent = {
      ...event,
      timestamp: Date.now(),
    };

    const newHistory = [fullEvent, ...profile.interactionHistory].slice(0, MAX_INTERACTION_HISTORY);
    return this.updateProfile({ interactionHistory: newHistory });
  }

  /**
   * Resets learned taste signals while preserving user-curated Watchlist & Collections
   */
  static resetTasteSignals(preserveWatchlist: boolean = true): TasteProfile {
    const current = this.getProfile();
    const clean: TasteProfile = {
      ...DEFAULT_TASTE_PROFILE,
      watchlistMovies: preserveWatchlist ? current.watchlistMovies : [],
      watchedMovies: preserveWatchlist ? current.watchedMovies : [],
      onboardingCompleted: false,
      lastUpdated: Date.now(),
    };

    this.saveProfile(clean);
    return clean;
  }

  /**
   * Safe profile migration across schema versions
   */
  private static migrateProfile(data: any): TasteProfile {
    if (!data || typeof data !== 'object') {
      return { ...DEFAULT_TASTE_PROFILE, lastUpdated: Date.now() };
    }

    // Merge onto default template to ensure missing fields in older versions are populated
    const merged: TasteProfile = {
      ...DEFAULT_TASTE_PROFILE,
      ...data,
      version: PROFILE_VERSION,
      preferredDNA: {
        ...DEFAULT_TASTE_PROFILE.preferredDNA,
        ...(data.preferredDNA || {}),
      },
      settings: {
        ...DEFAULT_TASTE_PROFILE.settings,
        ...(data.settings || {}),
      },
      lastUpdated: data.lastUpdated || Date.now(),
    };

    return merged;
  }

  // --- Namespace-safe helper accessors ---
  static getWatchlist(): string[] {
    try {
      const data = storageGet(WATCHLIST_KEY);
      return data ? JSON.parse(data) : ['dune-part-two', 'inception'];
    } catch {
      return ['dune-part-two', 'inception'];
    }
  }

  static saveWatchlist(ids: string[]): void {
    storageSet(WATCHLIST_KEY, JSON.stringify(ids));
  }

  static getLikes(): string[] {
    try {
      const data = storageGet(LIKES_KEY);
      return data ? JSON.parse(data) : ['inception', 'the-dark-knight'];
    } catch {
      return ['inception', 'the-dark-knight'];
    }
  }

  static saveLikes(ids: string[]): void {
    storageSet(LIKES_KEY, JSON.stringify(ids));
  }

  static getDislikes(): string[] {
    try {
      const data = storageGet(DISLIKES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveDislikes(ids: string[]): void {
    storageSet(DISLIKES_KEY, JSON.stringify(ids));
  }

  static getWatched(): string[] {
    try {
      const data = storageGet(WATCHED_KEY);
      return data ? JSON.parse(data) : ['inception'];
    } catch {
      return ['inception'];
    }
  }

  static saveWatched(ids: string[]): void {
    storageSet(WATCHED_KEY, JSON.stringify(ids));
  }
}
