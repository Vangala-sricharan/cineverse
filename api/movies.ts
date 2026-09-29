import type { VercelRequest, VercelResponse } from '@vercel/node';

// Language lookup
const ISO_LANG_MAP: Record<string, string> = {
  en: 'English',
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  ko: 'Korean',
  ja: 'Japanese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  zh: 'Chinese',
};

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

function getTmdbToken(): string | null {
  return (
    process.env.TMDB_READ_ACCESS_TOKEN ||
    process.env.TMDB_ACCESS_TOKEN ||
    null
  );
}

function hasTmdbCredentials(): boolean {
  return Boolean(getTmdbToken() || process.env.TMDB_API_KEY);
}

// TMDB API Request Helper with safe server-side logging (never logs tokens)
async function fetchTmdb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const readToken = getTmdbToken();
  const apiKey = process.env.TMDB_API_KEY;

  if (!readToken && !apiKey) {
    console.error('[TMDB API Audit] Request failed: Neither TMDB_READ_ACCESS_TOKEN nor TMDB_API_KEY is defined in process.env');
    throw new Error('TMDB_CREDENTIALS_MISSING');
  }

  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  
  // Prefer TMDB Read Access Token with Bearer Auth
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (readToken) {
    headers['Authorization'] = `Bearer ${readToken}`;
  } else if (apiKey) {
    url.searchParams.set('api_key', apiKey);
  }

  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), { headers });

    if (res.status === 401) {
      console.error(`[TMDB API Audit] Upstream 401 Unauthorized for ${endpoint}. Authentication failed with TMDB_READ_ACCESS_TOKEN.`);
      throw new Error('TMDB_INVALID_KEY');
    }
    if (res.status === 429) {
      console.warn(`[TMDB API Audit] Upstream 429 Rate Limited for ${endpoint}.`);
      throw new Error('TMDB_RATE_LIMITED');
    }
    if (!res.ok) {
      console.error(`[TMDB API Audit] Upstream error ${res.status} ${res.statusText} for ${endpoint}`);
      throw new Error(`TMDB_ERROR_${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' || err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      console.error(`[TMDB API Audit] Network failure when reaching TMDB (${url.origin}): ${err.message}`);
      throw new Error('TMDB_NETWORK_FAILURE');
    }
    throw err;
  }
}

function normalizeTmdbMovie(raw: any): any {
  const releaseDate = raw.release_date || '';
  const year = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : 2024;
  const runtime = raw.runtime ? raw.runtime : undefined;

  let runtimeFormatted = undefined;
  if (runtime && runtime > 0) {
    const hours = Math.floor(runtime / 60);
    const mins = runtime % 60;
    runtimeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  let genres: string[] = [];
  if (raw.genres && Array.isArray(raw.genres)) {
    genres = raw.genres.map((g: any) => g.name);
  } else if (raw.genre_ids && Array.isArray(raw.genre_ids)) {
    genres = raw.genre_ids.map((id: number) => GENRE_MAP[id] || 'Cinema');
  }
  if (genres.length === 0) genres = ['Cinema'];

  let voteCount = undefined;
  if (raw.vote_count) {
    if (raw.vote_count >= 1000000) {
      voteCount = (raw.vote_count / 1000000).toFixed(1) + 'M';
    } else if (raw.vote_count >= 1000) {
      voteCount = (raw.vote_count / 1000).toFixed(0) + 'K';
    } else {
      voteCount = String(raw.vote_count);
    }
  }

  let director = undefined;
  let cast: any[] = [];
  if (raw.credits) {
    if (raw.credits.crew) {
      const dirObj = raw.credits.crew.find((c: any) => c.job === 'Director');
      if (dirObj) director = dirObj.name;
    }
    if (raw.credits.cast && Array.isArray(raw.credits.cast)) {
      cast = raw.credits.cast.slice(0, 10).map((actor: any) => ({
        name: actor.name,
        role: actor.character || 'Cast Member',
        avatarUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '',
      }));
    }
  }

  let trailerYoutubeId = undefined;
  if (raw.videos && raw.videos.results && Array.isArray(raw.videos.results)) {
    const trailer = raw.videos.results.find(
      (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    if (trailer) trailerYoutubeId = trailer.key;
  }

  const langCode = raw.original_language || 'en';
  const language = ISO_LANG_MAP[langCode] || langCode.toUpperCase();

  return {
    id: String(raw.id),
    title: raw.title || raw.original_title || 'Untitled',
    originalTitle: raw.original_title,
    year: isNaN(year) ? 2024 : year,
    runtimeMinutes: runtime,
    runtimeFormatted: runtimeFormatted || '2h',
    rating: typeof raw.vote_average === 'number' ? Number(raw.vote_average.toFixed(1)) : 7.0,
    voteCount,
    genres,
    language,
    originalLanguage: langCode,
    overview: raw.overview || 'No synopsis provided.',
    posterUrl: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : '',
    backdropUrl: raw.backdrop_path ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}` : '',
    trailerYoutubeId,
    director,
    cast,
    popularity: raw.popularity,
    adult: raw.adult || false,
    providerId: 'tmdb',
    releaseDate,
  };
}

export default async function handler(req: any, res: any) {
  // Ensure status and json helpers are present in both Vercel and local dev environments
  if (typeof res.status !== 'function') {
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== 'function') {
    res.json = (data: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  res.setHeader('Content-Type', 'application/json');

  // Extract path and query parameters
  const url = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`);
  const pathname = url.pathname.replace(/^\/api\/movies\/?/, '');
  const pathParts = pathname.split('/').filter(Boolean);

  const action = url.searchParams.get('action') || (req.query && req.query.action) || pathParts[0] || 'status';
  const targetId = url.searchParams.get('id') || (req.query && req.query.id) || (action !== 'trending' && action !== 'popular' && action !== 'upcoming' && action !== 'now-playing' && action !== 'search' && action !== 'discover' && action !== 'genres' && action !== 'status' ? action : pathParts[0]);
  const isSimilar = pathParts[1] === 'similar' || url.searchParams.get('subaction') === 'similar';

  try {
    if (action === 'status') {
      const configured = hasTmdbCredentials();
      return res.status(200).json({
        configured,
        provider: configured ? 'The Movie Database (TMDB Live)' : 'The Movie Database (Not Configured)',
      });
    }

    if (!hasTmdbCredentials()) {
      return res.status(503).json({
        error: 'TMDB_CREDENTIALS_MISSING',
        message: 'TMDB authentication token is not configured. Please configure TMDB_READ_ACCESS_TOKEN in environment variables.',
      });
    }

    function handleTmdbError(err: any, fallbackMessage: string) {
      if (err.message === 'TMDB_INVALID_KEY') {
        return res.status(401).json({
          error: 'TMDB_INVALID_KEY',
          message: 'TMDB authentication failed: TMDB_READ_ACCESS_TOKEN is invalid or unauthorized.',
        });
      }
      if (err.message === 'TMDB_RATE_LIMITED') {
        return res.status(429).json({
          error: 'TMDB_RATE_LIMITED',
          message: 'TMDB rate limit reached. Please retry in a few moments.',
        });
      }
      if (err.message === 'TMDB_NETWORK_FAILURE') {
        return res.status(504).json({
          error: 'TMDB_NETWORK_FAILURE',
          message: 'Unable to reach TMDB API service. Please verify network connectivity.',
        });
      }
      if (err.message === 'TMDB_ERROR_404') {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Requested movie resource was not found on TMDB.',
        });
      }
      return res.status(502).json({
        error: 'TMDB_UPSTREAM_ERROR',
        message: err.message ? `TMDB Service Notice: ${err.message}` : fallbackMessage,
      });
    }

    if (action === 'trending') {
      try {
        const data = await fetchTmdb('/trending/movie/week');
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch (err: any) {
        return handleTmdbError(err, 'Failed to fetch trending movies from TMDB.');
      }
    }

    if (action === 'popular') {
      try {
        const data = await fetchTmdb('/movie/popular', { page: '1' });
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch (err: any) {
        return handleTmdbError(err, 'Failed to fetch popular movies from TMDB.');
      }
    }

    if (action === 'upcoming') {
      try {
        const data = await fetchTmdb('/movie/upcoming', { page: '1' });
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch (err: any) {
        return handleTmdbError(err, 'Failed to fetch upcoming movies from TMDB.');
      }
    }

    if (action === 'now-playing') {
      try {
        const data = await fetchTmdb('/movie/now_playing', { page: '1' });
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch (err: any) {
        return handleTmdbError(err, 'Failed to fetch now playing movies from TMDB.');
      }
    }

    if (action === 'search') {
      const q = (url.searchParams.get('q') || (req.query && req.query.q) || '').trim().toLowerCase();
      if (!q) return res.status(200).json([]);

      try {
        const data = await fetchTmdb('/search/movie', { query: q, include_adult: 'false' });
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch (err: any) {
        return handleTmdbError(err, 'Failed to execute search on TMDB.');
      }
    }

    if (action === 'discover') {
      const genre = url.searchParams.get('genre') || (req.query && req.query.genre);
      const language = url.searchParams.get('language') || (req.query && req.query.language);
      const year = url.searchParams.get('year') || (req.query && req.query.year);
      const rating = url.searchParams.get('rating') || (req.query && req.query.rating);
      const sortBy = url.searchParams.get('sort_by') || (req.query && req.query.sort_by);

      const params: Record<string, string> = {
        sort_by: sortBy || 'popularity.desc',
        include_adult: 'false',
      };
      if (genre && genre !== 'All') {
        const foundId = Object.entries(GENRE_MAP).find(
          ([, name]) => name.toLowerCase() === genre.toLowerCase()
        );
        if (foundId) params.with_genres = foundId[0];
      }
      if (language && language !== 'All') {
        const langEntry = Object.entries(ISO_LANG_MAP).find(
          ([, name]) => name.toLowerCase() === language.toLowerCase()
        );
        if (langEntry) params.with_original_language = langEntry[0];
      }
      if (year && year !== 'All') params.primary_release_year = year;
      if (rating && rating !== 'All') {
        const minRating = parseFloat(rating);
        if (!isNaN(minRating)) params['vote_average.gte'] = String(minRating);
      }

      try {
        const data = await fetchTmdb('/discover/movie', params);
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch (err: any) {
        return handleTmdbError(err, 'Failed to discover movies on TMDB.');
      }
    }

    if (action === 'genres') {
      try {
        const data = await fetchTmdb('/genre/movie/list');
        const list = (data.genres || []).map((g: any) => g.name);
        return res.status(200).json(list.length > 0 ? list : Object.values(GENRE_MAP));
      } catch {
        return res.status(200).json(Object.values(GENRE_MAP));
      }
    }

    // Movie Detail or Similar
    if (targetId) {
      if (isSimilar) {
        try {
          const data = await fetchTmdb(`/movie/${targetId}/similar`, { page: '1' });
          const normalized = (data.results || []).map(normalizeTmdbMovie);
          return res.status(200).json(normalized);
        } catch (err: any) {
          return handleTmdbError(err, 'Failed to fetch similar movies from TMDB.');
        }
      }

      // Single movie detail
      try {
        const data = await fetchTmdb(`/movie/${targetId}`, {
          append_to_response: 'credits,videos,similar',
        });
        const normalized = normalizeTmdbMovie(data);
        return res.status(200).json(normalized);
      } catch (err: any) {
        if (err.message === 'TMDB_ERROR_404') {
          return res.status(404).json({ error: 'NOT_FOUND', message: 'Movie not found.' });
        }
        return handleTmdbError(err, 'Failed to fetch movie details from TMDB.');
      }
    }

    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Unknown action or missing movie ID.' });
  } catch (err: any) {
    return res.status(500).json({
      error: 'SERVERLESS_ERROR',
      message: err?.message || 'Serverless movie handler error.',
    });
  }
}
