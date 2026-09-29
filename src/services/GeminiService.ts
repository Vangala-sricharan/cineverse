/**
 * CINEVERSE — Gemini Intelligence Client Service
 * 
 * Clean frontend service abstraction. Communicates strictly with the Vercel-compatible
 * serverless `/api/gemini` endpoint. No private Gemini credentials exist in the client.
 * 
 * Features:
 * - Client-side in-memory caching with TTL
 * - Automatic heuristic fallback if Gemini is temporarily unavailable
 * - Robust error handling
 */

import { Movie } from '../types/movie';
import {
  SearchIntent,
  MovieDnaProfile,
  RecommendationExplanation,
  TasteProfile,
} from '../types/intelligence';

export class GeminiServiceError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string = 'GEMINI_ERROR', status?: number) {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
    this.status = status;
  }
}

// In-Memory Client Cache with TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
}
const queryCache = new Map<string, CacheItem<SearchIntent>>();
const movieDnaCache = new Map<string, CacheItem<MovieDnaProfile>>();
const explanationCache = new Map<string, CacheItem<RecommendationExplanation>>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export class GeminiService {
  private static async postToApi<T>(action: string, payload: any): Promise<T> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = {};

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        if (response.status === 503) {
          throw new GeminiServiceError(
            data.message || 'Cinematic Intelligence is temporarily unavailable. You can still explore movies normally.',
            'SERVICE_UNAVAILABLE',
            503
          );
        }
        if (response.status === 429) {
          throw new GeminiServiceError(
            data.message || 'AI intelligence rate limit reached. Exploring via standard search.',
            'RATE_LIMITED',
            429
          );
        }
        throw new GeminiServiceError(
          data.message || 'Failed to process cinematic intelligence request.',
          data.error || 'API_ERROR',
          response.status
        );
      }

      return data.result as T;
    } catch (err: any) {
      if (err instanceof GeminiServiceError) {
        throw err;
      }
      throw new GeminiServiceError(
        'Unable to connect to CINEVERSE intelligence engine.',
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Interpret a natural language query into a structured SearchIntent model
   */
  static async interpretSearchIntent(query: string): Promise<SearchIntent> {
    const trimmed = query.trim().toLowerCase();
    const cached = queryCache.get(trimmed);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const result = await this.postToApi<SearchIntent>('interpret_search_intent', {
        query,
      });

      queryCache.set(trimmed, { data: result, timestamp: Date.now() });
      return result;
    } catch (err: any) {
      // Heuristic Fallback: Extract basic keywords, genres, and mood so the app never fails
      const fallback = this.createFallbackSearchIntent(query);
      return fallback;
    }
  }

  /**
   * Generate or retrieve Movie DNA analytical profile
   */
  static async generateMovieDNA(movie: Movie): Promise<MovieDnaProfile> {
    const key = movie.id || movie.title.toLowerCase();
    const cached = movieDnaCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const result = await this.postToApi<MovieDnaProfile>('generate_movie_dna', {
        title: movie.title,
        overview: movie.overview,
        genres: movie.genres,
        director: movie.director,
        year: movie.year,
      });

      // Strict validation & clamping: ensure every dimension is a finite number between 0 and 100
      if (result && result.dimensions) {
        const clamp = (val: any, fallback = 70) => {
          const num = typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : fallback;
          return Math.max(0, Math.min(100, Math.round(num)));
        };

        const dims = result.dimensions;
        result.dimensions = {
          story: clamp(dims.story ?? dims.storyComplexity, 80),
          action: clamp(dims.action, 50),
          emotion: clamp(dims.emotion, 70),
          suspense: clamp(dims.suspense, 75),
          mystery: clamp(dims.mystery, 70),
          comedy: clamp(dims.comedy, 20),
          romance: clamp(dims.romance, 20),
          darkness: clamp(dims.darkness, 60),
          intelligence: clamp(dims.intelligence, 80),
          visualSpectacle: clamp(dims.visualSpectacle, 80),
          psychologicalDepth: clamp(dims.psychologicalDepth, 75),
          pacing: clamp(dims.pacing, 75),
          storyComplexity: clamp(dims.storyComplexity, 80),
          emotionalIntensity: clamp(dims.emotionalIntensity, 75),
          characterFocus: clamp(dims.characterFocus, 75),
        };
      }

      movieDnaCache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } catch (err: any) {
      return this.createFallbackMovieDNA(movie);
    }
  }

  /**
   * Generate an authentic, personalized explanation for why a movie is recommended
   */
  static async explainRecommendation(
    movie: Movie,
    intent?: Partial<SearchIntent>,
    context?: string
  ): Promise<RecommendationExplanation> {
    const cacheKey = `${movie.id}_${intent?.query || context || 'default'}`;
    const cached = explanationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const result = await this.postToApi<RecommendationExplanation>('explain_recommendation', {
        movieTitle: movie.title,
        intent: intent || {},
        context: context || '',
      });

      explanationCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {
      return {
        movieId: movie.id,
        matchScore: movie.matchPercentage || Math.round(movie.rating * 10),
        headline: `Matches your interest in ${movie.genres[0] || 'cinema'}`,
        reasons: [
          `Shares high ${movie.genres.join(' & ')} characteristics`,
          `Features acclaimed directing by ${movie.director || 'esteemed creators'}`,
          `High audience rating of ${movie.rating}/10`,
        ],
        whyItFits: `Selected because it aligns with your preference for ${movie.genres.join(', ')} storytelling with high emotional and narrative stakes.`,
        sharedDnaHighlights: [movie.pacing || 'Engaging Pacing', movie.genres[0]],
      };
    }
  }

  /**
   * Compare a reference movie with candidate movies to find deep semantic similarity
   */
  static async compareMovieSimilarity(
    referenceMovie: Movie,
    candidates: Movie[],
    nuance?: string
  ): Promise<Record<string, { similarityScore: number; whyItFeelsSimilar: string }>> {
    try {
      const results = await this.postToApi<
        { movieId: string; similarityScore: number; whyItFeelsSimilar: string }[]
      >('semantic_similarity', {
        referenceMovie: {
          title: referenceMovie.title,
          genres: referenceMovie.genres,
          overview: referenceMovie.overview,
        },
        candidates: candidates.map((c) => ({
          id: c.id,
          title: c.title,
          genres: c.genres,
          overview: c.overview,
        })),
        nuance: nuance || '',
      });

      const map: Record<string, { similarityScore: number; whyItFeelsSimilar: string }> = {};
      results.forEach((r) => {
        map[r.movieId] = {
          similarityScore: r.similarityScore,
          whyItFeelsSimilar: r.whyItFeelsSimilar,
        };
      });
      return map;
    } catch {
      // Heuristic fallback
      const map: Record<string, { similarityScore: number; whyItFeelsSimilar: string }> = {};
      candidates.forEach((c) => {
        const shared = c.genres.filter((g) => referenceMovie.genres.includes(g));
        map[c.id] = {
          similarityScore: Math.min(95, 70 + shared.length * 8),
          whyItFeelsSimilar: `Shares thematic resonance and ${shared.join(' & ') || 'cinematic tension'} with ${referenceMovie.title}.`,
        };
      });
      return map;
    }
  }

  /**
   * Fallback heuristic SearchIntent generator (used if Gemini is temporarily down)
   */
  private static createFallbackSearchIntent(query: string): SearchIntent {
    const qLower = query.toLowerCase();
    const genres: string[] = [];
    const moods: string[] = [];
    const exclusions: string[] = [];
    const pacing: string[] = [];

    // Extract genres
    const genreCandidates = ['crime', 'thriller', 'science fiction', 'action', 'drama', 'comedy', 'mystery', 'adventure', 'romance'];
    genreCandidates.forEach((g) => {
      if (qLower.includes(g) && !qLower.includes(`no ${g}`) && !qLower.includes(`without ${g}`)) {
        genres.push(g.charAt(0).toUpperCase() + g.slice(1));
      }
    });

    // Extract moods
    if (qLower.includes('dark')) moods.push('Dark');
    if (qLower.includes('mind-bending') || qLower.includes('twist')) moods.push('Mind-Bending');
    if (qLower.includes('emotional')) moods.push('Emotional');
    if (qLower.includes('intense')) moods.push('Intense');
    if (qLower.includes('funny')) moods.push('Funny');

    // Extract pacing
    if (qLower.includes('slow') || qLower.includes('slow-burn')) pacing.push('Slow Burn');
    if (qLower.includes('fast') || qLower.includes('fast-paced')) pacing.push('Fast Paced');

    // Extract exclusions
    if (qLower.includes('no romance')) exclusions.push('no romance');
    if (qLower.includes('not depressing')) exclusions.push('not depressing');

    // Extract runtime
    let maxRuntime = undefined;
    if (qLower.includes('under 2 hours') || qLower.includes('two hours')) {
      maxRuntime = 120;
    } else if (qLower.includes('under 90 min')) {
      maxRuntime = 90;
    }

    const languagePreferences: string[] = [];
    if (qLower.includes('telugu')) languagePreferences.push('Telugu');
    if (qLower.includes('hindi')) languagePreferences.push('Hindi');
    if (qLower.includes('tamil')) languagePreferences.push('Tamil');
    if (qLower.includes('korean')) languagePreferences.push('Korean');
    if (qLower.includes('english')) languagePreferences.push('English');

    return {
      query,
      interpretedIntent: `Looking for ${moods.join(' ')} ${genres.join('/') || 'movies'}${languagePreferences.length > 0 ? ` in ${languagePreferences[0]}` : ''}`,
      genres: genres.length > 0 ? genres : ['Cinema'],
      moods: moods.length > 0 ? moods : ['Intriguing'],
      themes: ['cinematic narrative', 'character conflict'],
      tones: ['cinematic'],
      pacing: pacing.length > 0 ? pacing : ['Moderate'],
      runtime: { max: maxRuntime },
      releasePreferences: {},
      languagePreferences,
      similarityTargets: [],
      exclusions,
      intensity: { min: 50, max: 95 },
      emotionalProfile: ['engaging'],
      visualPreferences: ['immersive visuals'],
      narrativePreferences: ['compelling story'],
      reasoningSummary: 'Intent extracted via CINEVERSE cinematic rules engine.',
      suggestedKeywords: query.split(' ').filter((w) => w.length > 3),
    };
  }

  /**
   * Fallback heuristic Movie DNA generator
   */
  private static createFallbackMovieDNA(movie: Movie): MovieDnaProfile {
    const isSciFi = movie.genres.includes('Science Fiction');
    const isAction = movie.genres.includes('Action');
    const isCrime = movie.genres.includes('Crime') || movie.genres.includes('Thriller');
    const isDrama = movie.genres.includes('Drama');

    return {
      title: movie.title,
      dimensions: {
        action: isAction ? 85 : 45,
        emotion: isDrama ? 88 : 65,
        suspense: isCrime ? 90 : 70,
        mystery: isCrime || isSciFi ? 88 : 50,
        comedy: movie.genres.includes('Comedy') ? 80 : 15,
        romance: movie.genres.includes('Romance') ? 85 : 20,
        darkness: isCrime ? 86 : 55,
        intelligence: isSciFi ? 94 : 78,
        visualSpectacle: isSciFi || isAction ? 92 : 65,
        psychologicalDepth: isSciFi || isCrime ? 89 : 68,
        pacing: movie.pacing === 'Slow Burn' ? 60 : 85,
        storyComplexity: isSciFi ? 92 : 75,
        emotionalIntensity: isDrama ? 86 : 70,
        characterFocus: isDrama ? 90 : 65,
      },
      insights: [
        `High narrative focus with ${movie.rating >= 8.0 ? 'critically acclaimed' : 'compelling'} storytelling`,
        `Visually distinct presentation under director ${movie.director || 'acclaimed visionaries'}`,
        `Signature ${movie.genres.join(' & ')} atmospheric depth`,
      ],
      tonalAtmosphere: `Grounded and cinematic with prominent ${movie.genres.join(', ')} elements.`,
      reasonsToLike: [
        `High audience reception (${movie.rating}/10)`,
        `Strong performances across the cast`,
        `Immersive atmospheric soundtrack and pacing`,
      ],
      keyThemes: movie.genres,
      cinematicStyle: `${movie.genres.join(' ')} Experience`,
    };
  }
}
