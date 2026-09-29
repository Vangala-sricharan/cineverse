/**
 * Production MovieService Layer (Phase 2)
 * 
 * Fetches genuine, live movie metadata from the server-side TMDB proxy.
 * Eliminates development-only mock data from the production rendering path.
 * 
 * Implements client-side in-flight deduplication, error categorization,
 * and robust network failure resilience.
 */

import { Movie, MovieFilterOptions } from '../types/movie';

export interface IMovieService {
  searchMovies(query: string, filters?: MovieFilterOptions): Promise<Movie[]>;
  getTrendingMovies(): Promise<Movie[]>;
  getUpcomingMovies(): Promise<Movie[]>;
  getPopularMovies(): Promise<Movie[]>;
  getNowPlayingMovies(): Promise<Movie[]>;
  getMovieDetails(id: string): Promise<Movie | null>;
  getSimilarMovies(movieId: string): Promise<Movie[]>;
  getRecommendations(criteria?: { category?: string; mood?: string }): Promise<Movie[]>;
  getGenres(): Promise<string[]>;
  getMoviesByFilters(filters: MovieFilterOptions): Promise<Movie[]>;
  checkServiceStatus(): Promise<{ configured: boolean; provider: string }>;
}

export class MovieServiceError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode?: number) {
    super(message);
    this.name = 'MovieServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

class LiveTmdbMovieService implements IMovieService {
  private inFlightRequests = new Map<string, Promise<any>>();

  private async fetchApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:3000';
    const url = new URL(endpoint, origin);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        url.searchParams.set(k, v);
      }
    }

    const requestKey = url.toString();
    if (this.inFlightRequests.has(requestKey)) {
      return this.inFlightRequests.get(requestKey) as Promise<T>;
    }

    const fetchPromise = (async () => {
      try {
        const response = await fetch(url.toString(), {
          headers: {
            'Accept': 'application/json',
          },
        });

        const contentType = response.headers.get('content-type') || '';

        // If response is not application/json (e.g. warmup page or proxy error), handle safely
        if (!contentType.includes('application/json')) {
          const text = await response.text();
          if (text.includes('warmup') || text.includes('Starting Server')) {
            throw new MovieServiceError(
              'Live movie service is warming up. Please wait a moment and click Retry.',
              'SERVER_WARMING_UP'
            );
          }
          throw new MovieServiceError(
            'Unable to connect to movie service. Please verify your connection or TMDB configuration.',
            'NON_JSON_RESPONSE'
          );
        }

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'TMDB_CREDENTIALS_MISSING') {
            throw new MovieServiceError(
              data.message || 'TMDB API key is not configured in environment variables. Please add TMDB_API_KEY in the environment secrets to connect live movie data.',
              'TMDB_CONFIG_REQUIRED',
              response.status
            );
          }

          if (response.status === 401 || data.error === 'TMDB_INVALID_KEY') {
            throw new MovieServiceError(
              'TMDB API Key is invalid or unauthorized.',
              'TMDB_INVALID_KEY',
              401
            );
          }

          if (response.status === 429 || data.error === 'TMDB_RATE_LIMITED') {
            throw new MovieServiceError(
              'Movie catalog rate limit exceeded. Please wait a moment.',
              'RATE_LIMITED',
              429
            );
          }

          throw new MovieServiceError(
            data.message || `Catalog server responded with status ${response.status}`,
            'HTTP_ERROR',
            response.status
          );
        }

        return data;
      } catch (err: any) {
        if (err instanceof MovieServiceError) {
          throw err;
        }
        throw new MovieServiceError(
          err.message || 'Unable to connect to movie data service.',
          'NETWORK_ERROR'
        );
      } finally {
        this.inFlightRequests.delete(requestKey);
      }
    })();

    this.inFlightRequests.set(requestKey, fetchPromise);
    return fetchPromise;
  }

  async checkServiceStatus(): Promise<{ configured: boolean; provider: string }> {
    try {
      return await this.fetchApi<{ configured: boolean; provider: string }>('/api/movies/status');
    } catch {
      return { configured: false, provider: 'The Movie Database (TMDB)' };
    }
  }

  async searchMovies(query: string, filters?: MovieFilterOptions): Promise<Movie[]> {
    const q = query.trim();
    if (!q) return [];

    const params: Record<string, string> = { q };
    if (filters?.rating && filters.rating !== 'All') params.rating = filters.rating;
    if (filters?.language && filters.language !== 'All') params.language = filters.language;

    return this.fetchApi<Movie[]>('/api/movies/search', params);
  }

  async getTrendingMovies(): Promise<Movie[]> {
    return this.fetchApi<Movie[]>('/api/movies/trending');
  }

  async getUpcomingMovies(): Promise<Movie[]> {
    return this.fetchApi<Movie[]>('/api/movies/upcoming');
  }

  async getPopularMovies(): Promise<Movie[]> {
    return this.fetchApi<Movie[]>('/api/movies/popular');
  }

  async getNowPlayingMovies(): Promise<Movie[]> {
    return this.fetchApi<Movie[]>('/api/movies/now-playing');
  }

  async getMovieDetails(id: string): Promise<Movie | null> {
    try {
      return await this.fetchApi<Movie>(`/api/movies/${encodeURIComponent(id)}`);
    } catch (err: any) {
      if (err.statusCode === 404) return null;
      throw err;
    }
  }

  async getSimilarMovies(movieId: string): Promise<Movie[]> {
    try {
      return await this.fetchApi<Movie[]>(`/api/movies/${encodeURIComponent(movieId)}/similar`);
    } catch {
      return [];
    }
  }

  async getRecommendations(criteria?: { category?: string; mood?: string }): Promise<Movie[]> {
    // If user selected upcoming in recommendations
    if (criteria?.category === 'Trending Near You') {
      return this.getTrendingMovies();
    }
    if (criteria?.category === 'Hidden Gems') {
      return this.getMoviesByFilters({ rating: '8.0' });
    }
    // Default to genuine popular / top rated
    return this.getPopularMovies();
  }

  async getGenres(): Promise<string[]> {
    try {
      return await this.fetchApi<string[]>('/api/movies/genres');
    } catch {
      return [
        'Action',
        'Adventure',
        'Animation',
        'Comedy',
        'Crime',
        'Drama',
        'Fantasy',
        'Horror',
        'Mystery',
        'Romance',
        'Sci-Fi',
        'Thriller',
      ];
    }
  }

  async getMoviesByFilters(filters: MovieFilterOptions): Promise<Movie[]> {
    const params: Record<string, string> = {};

    if (filters.genre && filters.genre !== 'All') {
      params.genre = filters.genre;
    }
    if (filters.storyType && filters.storyType !== 'All') {
      params.genre = filters.storyType;
    }
    if (filters.language && filters.language !== 'All') {
      params.language = filters.language;
    }
    if (filters.releaseYear && filters.releaseYear !== 'All') {
      params.year = filters.releaseYear;
    }
    if (filters.rating && filters.rating !== 'All') {
      params.rating = filters.rating;
    }

    return this.fetchApi<Movie[]>('/api/movies/discover', params);
  }
}

// Singleton export: Genuine live movie service
export const MovieService: IMovieService = new LiveTmdbMovieService();
