/**
 * CINEVERSE Intelligence Contracts & Models
 * Phase 3 — Gemini Intelligence + Cinematic Recommendation Engine
 */

import { Movie } from './movie';

export interface SearchIntent {
  query: string;
  interpretedIntent: string;
  genres: string[];
  moods: string[];
  themes: string[];
  tones: string[];
  pacing: string[];
  runtime: {
    min?: number;
    max?: number;
  };
  releasePreferences: {
    from?: number;
    to?: number;
  };
  languagePreferences: string[];
  similarityTargets: string[];
  exclusions: string[];
  intensity: {
    min?: number;
    max?: number;
  };
  emotionalProfile: string[];
  visualPreferences: string[];
  narrativePreferences: string[];
  reasoningSummary: string;
  suggestedKeywords: string[];
}

export interface MovieDnaDimensions {
  story?: number;
  action: number;
  emotion: number;
  suspense: number;
  mystery: number;
  comedy: number;
  romance: number;
  darkness: number;
  intelligence: number;
  visualSpectacle: number;
  psychologicalDepth: number;
  pacing: number;
  storyComplexity: number;
  emotionalIntensity: number;
  characterFocus: number;
}

export interface MovieDnaProfile {
  movieId?: string;
  title: string;
  dimensions: MovieDnaDimensions;
  insights: string[];
  tonalAtmosphere: string;
  reasonsToLike: string[];
  keyThemes: string[];
  cinematicStyle: string;
}

export interface RecommendationExplanation {
  movieId: string;
  matchScore: number;
  headline: string;
  reasons: string[];
  whyItFits: string;
  sharedDnaHighlights: string[];
}

export interface RecommendationResult {
  movie: Movie;
  matchScore: number;
  whyItFits: string;
  matchedSignals: string[];
  dnaScore?: number;
}

export interface GuidedDiscoveryStep {
  step: number;
  question: string;
  subtitle: string;
  options: {
    id: string;
    label: string;
    description: string;
    icon?: string;
  }[];
}

export interface InteractionEvent {
  movieId: string;
  eventType: 'liked' | 'disliked' | 'watched' | 'watchlisted' | 'opened' | 'searched' | 'collected';
  timestamp: number;
  source: 'home' | 'discover' | 'search' | 'recommendation' | 'movie-details' | 'taste';
  metadata?: {
    title?: string;
    genres?: string[];
    director?: string;
  };
}

export interface PersonalizationSettings {
  enabled: boolean;
  useWatchlistSignals: boolean;
  useHistorySignals: boolean;
  noveltyWeight: number; // 0 (strict taste) to 100 (high novelty exploration)
  negativePreferencePenalty: number; // weight of dislikes
}

/**
 * Phase 4: Full User TasteProfile Model
 */
export interface TasteProfile {
  version: number;
  onboardingCompleted: boolean;
  
  // Explicit & High-Confidence Preferences
  favoriteGenres: string[];
  dislikedGenres: string[];
  favoriteThemes: string[];
  dislikedThemes: string[];
  preferredTones: string[];
  preferredMoods: string[];
  preferredPacing: string[];
  
  // Normalized Cinematic DNA (0 to 100)
  preferredDNA: Partial<MovieDnaDimensions>;
  
  // Watched & Evaluated Movie References
  watchedMovies: string[];
  likedMovies: string[];
  dislikedMovies: string[];
  watchlistMovies: string[];
  
  // Constraints
  preferredRuntime: {
    min?: number;
    max?: number;
  };
  languagePreferences: string[];
  releasePreferences: {
    from?: number;
    to?: number;
  };
  
  // Dynamic Settings & Tracking
  settings: PersonalizationSettings;
  interactionHistory: InteractionEvent[];
  lastUpdated: number;
}
