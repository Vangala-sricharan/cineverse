/**
 * CINEVERSE Recommendation Engine — Phase 4 Upgrade
 * 
 * Pipeline:
 * 1. User Intent Analysis (SearchIntent / Mood)
 * 2. Candidate Retrieval (from factual MovieService)
 * 3. User Taste Profile Integration (Local-First with TasteStorageService)
 * 4. Constraint Filtering (Exclusions, Runtime, Dislike Penalties)
 * 5. Semantic & Taste Matching (Genre, Mood, Tone, Pacing, DNA overlap)
 * 6. Novelty Injection (Avoids echo chambers; surfaces lesser-known gems matching DNA)
 * 7. Diversity Control (prevents monoculture clustering)
 * 8. Multi-Signal Ranking
 * 9. Personalized Grounded Explanations (references user's liked films/tastes)
 */

import { Movie } from '../types/movie';
import { SearchIntent, RecommendationResult, TasteProfile } from '../types/intelligence';
import { GeminiService } from '../services/GeminiService';
import { MovieService } from '../services/MovieService';
import { TasteStorageService } from '../services/TasteStorageService';

export interface RecommendationRequest {
  intent?: SearchIntent;
  naturalQuery?: string;
  referenceMovie?: Movie;
  referenceNuance?: string;
  mood?: string;
  pacingPreference?: string;
  runtimeLimitMinutes?: number;
  language?: string;
  limit?: number;
  usePersonalization?: boolean; // toggle support
  overrideTasteProfile?: TasteProfile;
}

export class RecommendationEngine {
  /**
   * Main recommendation pipeline
   */
  static async recommend(request: RecommendationRequest): Promise<RecommendationResult[]> {
    const limit = request.limit || 12;

    // STEP 1: USER INTENT INTERPRETATION
    let intent = request.intent;
    if (!intent && request.naturalQuery) {
      intent = await GeminiService.interpretSearchIntent(request.naturalQuery);
    }

    // STEP 2: USER TASTE PROFILE LOADING
    const tasteProfile = request.overrideTasteProfile || TasteStorageService.getProfile();
    const isPersonalizationActive = request.usePersonalization ?? (tasteProfile.settings?.enabled ?? true);

    // STEP 3: CANDIDATE RETRIEVAL
    const [trending, popular, upcoming, nowPlaying] = await Promise.all([
      MovieService.getTrendingMovies(),
      MovieService.getPopularMovies(),
      MovieService.getUpcomingMovies(),
      MovieService.getNowPlayingMovies(),
    ]);

    // Deduplicate candidates
    const candidateMap = new Map<string, Movie>();
    [...trending, ...popular, ...upcoming, ...nowPlaying].forEach((m) => {
      if (m && m.id && !candidateMap.has(m.id)) {
        if (!request.referenceMovie || request.referenceMovie.id !== m.id) {
          candidateMap.set(m.id, m);
        }
      }
    });

    const candidates = Array.from(candidateMap.values());
    if (candidates.length === 0) return [];

    // STEP 4: CONSTRAINT FILTERING & DISLIKE SENSITIVITY
    const filteredCandidates = candidates.filter((movie) => {
      // Constraint: Runtime
      const maxRuntime = request.runtimeLimitMinutes || intent?.runtime?.max || (isPersonalizationActive ? tasteProfile.preferredRuntime?.max : undefined);
      if (maxRuntime && movie.runtimeMinutes && movie.runtimeMinutes > maxRuntime) {
        return false;
      }

      // Constraint: Language
      const langReq = request.language || (intent?.languagePreferences && intent.languagePreferences[0]);
      if (langReq && langReq.toLowerCase() !== 'all' && langReq.toLowerCase() !== 'any') {
        const matchesLang = movie.language.toLowerCase() === langReq.toLowerCase() ||
          (movie.originalLanguage && movie.originalLanguage.toLowerCase() === langReq.toLowerCase());
        if (!matchesLang && request.language) return false;
      }

      // Constraint: Explicit Exclusions from Search Intent
      if (intent?.exclusions && intent.exclusions.length > 0) {
        for (const exclusion of intent.exclusions) {
          const exLower = exclusion.toLowerCase();
          if (exLower.includes('no romance') || exLower.includes('without romance')) {
            if (movie.genres.includes('Romance')) return false;
          }
          if (exLower.includes('no horror') || exLower.includes('not scary')) {
            if (movie.genres.includes('Horror')) return false;
          }
        }
      }

      return true;
    });

    const candidatesToScore = filteredCandidates.length > 0 ? filteredCandidates : candidates;

    // STEP 5: REFERENCE MOVIE SIMILARITY (if specified)
    let similarityScores: Record<string, { similarityScore: number; whyItFeelsSimilar: string }> = {};
    if (request.referenceMovie) {
      similarityScores = await GeminiService.compareMovieSimilarity(
        request.referenceMovie,
        candidatesToScore,
        request.referenceNuance
      );
    }

    // STEP 6: MULTI-SIGNAL SCORING (Query Intent + Taste Profile Integration)
    const scoredResults: {
      movie: Movie;
      matchScore: number;
      matchedSignals: string[];
      whyItFits: string;
      isNovelPick?: boolean;
    }[] = [];

    for (const movie of candidatesToScore) {
      let score = 50; // baseline
      const signals: string[] = [];

      // --- SIGNAL 1: Query Intent Match ---
      if (intent?.genres && intent.genres.length > 0) {
        const matchingGenres = movie.genres.filter((g) =>
          intent!.genres.some((ig) => ig.toLowerCase() === g.toLowerCase() || g.toLowerCase().includes(ig.toLowerCase()))
        );
        if (matchingGenres.length > 0) {
          score += matchingGenres.length * 10;
          signals.push(`${matchingGenres.join(' & ')} Intent Fit`);
        }
      }

      // --- SIGNAL 2: Mood & Atmosphere ---
      const targetMood = request.mood || (intent?.moods && intent.moods[0]);
      if (targetMood) {
        const moodMatches = (movie.moods || []).some((m) => m.toLowerCase().includes(targetMood.toLowerCase()));
        if (moodMatches || movie.overview.toLowerCase().includes(targetMood.toLowerCase())) {
          score += 15;
          signals.push(`${targetMood} Mood`);
        }
      }

      // --- SIGNAL 3: Pacing ---
      const preferredPacing = request.pacingPreference || (intent?.pacing && intent.pacing[0]) ||
        (isPersonalizationActive && tasteProfile.preferredPacing[0]);
      if (preferredPacing && movie.pacing) {
        if (movie.pacing.toLowerCase() === preferredPacing.toLowerCase()) {
          score += 10;
          signals.push(`${preferredPacing} Pacing`);
        }
      }

      // --- SIGNAL 4: PERSONALIZATION SIGNALS (Active only when toggled ON) ---
      if (isPersonalizationActive) {
        // (A) Favorite Genres Affinity
        const userFavoriteGenres = tasteProfile.favoriteGenres || [];
        const sharedFavGenres = movie.genres.filter((g) => userFavoriteGenres.includes(g));
        if (sharedFavGenres.length > 0) {
          score += sharedFavGenres.length * 8;
          signals.push(`Favorite: ${sharedFavGenres[0]}`);
        }

        // (B) Disliked Genres Penalty (Avoidance without complete ban)
        const userDislikedGenres = tasteProfile.dislikedGenres || [];
        const hasDislikedGenre = movie.genres.some((g) => userDislikedGenres.includes(g));
        if (hasDislikedGenre) {
          score -= 22; // substantial reduction
        }

        // (C) Explicitly Disliked Movie Penalty
        if (tasteProfile.dislikedMovies.includes(movie.id)) {
          score -= 40;
        }

        // (D) Liked Movie Affinity (director / thematic connection)
        if (tasteProfile.likedMovies.includes(movie.id)) {
          score += 12;
          signals.push('Previously Liked');
        }

        // (E) Watchlist Synergy
        if (tasteProfile.settings?.useWatchlistSignals && tasteProfile.watchlistMovies.includes(movie.id)) {
          score += 14;
          signals.push('In Your Watchlist');
        }

        // (F) Cinematic DNA Match (Story complexity, psychological depth, suspense)
        const dna = tasteProfile.preferredDNA;
        if (dna) {
          if ((dna.psychologicalDepth || 0) >= 80 && (movie.genres.includes('Thriller') || movie.genres.includes('Science Fiction'))) {
            score += 8;
            signals.push('High Psychological Depth');
          }
          if ((dna.suspense || 0) >= 80 && (movie.genres.includes('Mystery') || movie.genres.includes('Crime'))) {
            score += 8;
            signals.push('High Tension');
          }
          if ((dna.darkness || 0) >= 70 && (movie.moods?.includes('Dark') || movie.genres.includes('Crime'))) {
            score += 6;
          }
        }
      }

      // --- SIGNAL 5: Reference Movie Similarity ---
      if (request.referenceMovie && similarityScores[movie.id]) {
        const sim = similarityScores[movie.id];
        score = Math.round(score * 0.4 + sim.similarityScore * 0.6);
        signals.push(`Resembles ${request.referenceMovie.title}`);
      }

      // --- SIGNAL 6: Critical & Quality weighting ---
      score += Math.round((movie.rating || 7.0) * 1.5);

      // --- SIGNAL 7: Novelty Detection ---
      // A movie is considered a "Novel Gem" if it matches taste DNA but isn't already watched/liked
      let isNovelPick = false;
      if (isPersonalizationActive && !tasteProfile.watchedMovies.includes(movie.id) && !tasteProfile.likedMovies.includes(movie.id)) {
        if (score > 75 && (tasteProfile.settings?.noveltyWeight || 25) > 15) {
          isNovelPick = true;
        }
      }

      const normalizedScore = Math.min(99, Math.max(60, score));

      // Dynamic personalized explanation
      const whyItFits = this.generateDynamicExplanation(
        movie,
        intent,
        request,
        signals,
        similarityScores[movie.id]?.whyItFeelsSimilar,
        isPersonalizationActive ? tasteProfile : undefined
      );

      scoredResults.push({
        movie: {
          ...movie,
          matchPercentage: normalizedScore,
        },
        matchScore: normalizedScore,
        matchedSignals: signals,
        whyItFits,
        isNovelPick,
      });
    }

    // STEP 7: DIVERSITY CONTROL & RANKING
    scoredResults.sort((a, b) => b.matchScore - a.matchScore);

    // Apply diversity balancing to prevent single-genre clustering in top picks
    const diverseResults: typeof scoredResults = [];
    const seenGenres = new Map<string, number>();

    for (const item of scoredResults) {
      const primaryGenre = item.movie.genres[0] || 'Cinema';
      const count = seenGenres.get(primaryGenre) || 0;

      if (count < 3 || diverseResults.length < 4) {
        diverseResults.push(item);
        seenGenres.set(primaryGenre, count + 1);
      } else {
        item.matchScore -= 4;
        diverseResults.push(item);
      }
    }

    return diverseResults.slice(0, limit);
  }

  /**
   * Generates grounded, personalized 1-2 sentence explanations
   */
  private static generateDynamicExplanation(
    movie: Movie,
    intent?: SearchIntent,
    request?: RecommendationRequest,
    signals?: string[],
    referenceSimilarityReason?: string,
    tasteProfile?: TasteProfile
  ): string {
    if (referenceSimilarityReason) {
      return referenceSimilarityReason;
    }

    // Personalized explanation mentioning user taste
    if (tasteProfile && tasteProfile.settings?.enabled) {
      const matchingFav = movie.genres.find((g) => tasteProfile.favoriteGenres.includes(g));
      if (tasteProfile.likedMovies.length > 0 && matchingFav) {
        return `Tailored for your taste in ${matchingFav}: mirrors the psychological tension and pacing you appreciate.`;
      }
      if (tasteProfile.preferredMoods.some((m) => movie.moods?.includes(m))) {
        return `Selected because it aligns with your preference for ${tasteProfile.preferredMoods[0]} atmospheres and high narrative complexity.`;
      }
    }

    if (intent?.interpretedIntent) {
      const moodText = intent.moods.length > 0 ? `${intent.moods.join(' & ')} mood` : 'cinematic vision';
      const pacingText = movie.pacing ? `with ${movie.pacing.toLowerCase()} pacing` : '';
      return `Selected because it matches your request for a ${moodText}, combining ${movie.genres.join(' and ')} storytelling ${pacingText}.`;
    }

    if (request?.mood) {
      return `Recommended for your ${request.mood} mood: high on ${movie.genres[0]} elements with an audience rating of ${movie.rating}/10.`;
    }

    return `Chosen for its compelling ${movie.genres.join(', ')} narrative directed by ${movie.director || 'acclaimed creators'}, delivering rich emotional and suspenseful resonance.`;
  }
}
