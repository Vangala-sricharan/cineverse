import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VERIFIED_MOVIES } from '../src/data/verifiedMovieCatalog';

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

function hasTmdbCredentials(): boolean {
  return Boolean(process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN);
}

// TMDB API Request Helper
async function fetchTmdb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const apiKey = process.env.TMDB_API_KEY;
  const accessToken = process.env.TMDB_ACCESS_TOKEN;

  if (!apiKey && !accessToken) {
    throw new Error('TMDB_CREDENTIALS_MISSING');
  }

  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  if (apiKey) url.searchParams.set('api_key', apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (accessToken && !apiKey) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url.toString(), { headers });
  if (res.status === 401) throw new Error('TMDB_INVALID_KEY');
  if (res.status === 429) throw new Error('TMDB_RATE_LIMITED');
  if (!res.ok) throw new Error(`TMDB_ERROR_${res.status}`);

  return res.json();
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
        provider: configured ? 'The Movie Database (TMDB Live)' : 'The Movie Database (Verified Provider)',
      });
    }

    if (action === 'trending') {
      if (!hasTmdbCredentials()) {
        const trending = VERIFIED_MOVIES.filter((m) => m.isTrending || m.rating >= 8.0);
        return res.status(200).json(trending.length > 0 ? trending : VERIFIED_MOVIES);
      }
      try {
        const data = await fetchTmdb('/trending/movie/week');
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch {
        return res.status(200).json(VERIFIED_MOVIES.filter((m) => m.isTrending || m.rating >= 8.0));
      }
    }

    if (action === 'popular') {
      if (!hasTmdbCredentials()) {
        const popular = VERIFIED_MOVIES.filter((m) => m.isPopular || m.rating >= 7.8);
        return res.status(200).json(popular.length > 0 ? popular : VERIFIED_MOVIES);
      }
      try {
        const data = await fetchTmdb('/movie/popular', { page: '1' });
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch {
        return res.status(200).json(VERIFIED_MOVIES.filter((m) => m.isPopular));
      }
    }

    if (action === 'upcoming') {
      if (!hasTmdbCredentials()) {
        const upcoming = VERIFIED_MOVIES.filter((m) => m.isUpcoming || (m.year && m.year >= 2024));
        return res.status(200).json(upcoming.length > 0 ? upcoming : VERIFIED_MOVIES);
      }
      try {
        const data = await fetchTmdb('/movie/upcoming', { page: '1' });
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch {
        return res.status(200).json(VERIFIED_MOVIES.filter((m) => m.isUpcoming));
      }
    }

    if (action === 'now-playing') {
      if (!hasTmdbCredentials()) {
        const nowPlaying = VERIFIED_MOVIES.filter((m) => m.year === 2024);
        return res.status(200).json(nowPlaying.length > 0 ? nowPlaying : VERIFIED_MOVIES);
      }
      try {
        const data = await fetchTmdb('/movie/now_playing', { page: '1' });
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch {
        return res.status(200).json(VERIFIED_MOVIES.filter((m) => m.year === 2024));
      }
    }

    if (action === 'search') {
      const q = (url.searchParams.get('q') || (req.query && req.query.q) || '').trim().toLowerCase();
      const langFilter = (url.searchParams.get('language') || (req.query && req.query.language) || '').toLowerCase();
      const ratingFilter = parseFloat(url.searchParams.get('rating') || (req.query && req.query.rating) || '0');

      if (!q) return res.status(200).json([]);

      if (!hasTmdbCredentials()) {
        const matched = VERIFIED_MOVIES.filter((m) => {
          const matchText = `${m.title} ${m.originalTitle || ''} ${m.director || ''} ${m.overview} ${m.genres.join(' ')}`.toLowerCase();
          const textMatches = matchText.includes(q) || q.split(' ').some((word: string) => word.length > 3 && matchText.includes(word));
          const langMatches = !langFilter || langFilter === 'all' || m.language.toLowerCase() === langFilter;
          const ratingMatches = !ratingFilter || m.rating >= ratingFilter;
          return textMatches && langMatches && ratingMatches;
        });
        return res.status(200).json(matched);
      }

      try {
        const data = await fetchTmdb('/search/movie', { query: q, include_adult: 'false' });
        const normalized = (data.results || []).map(normalizeTmdbMovie);
        return res.status(200).json(normalized);
      } catch {
        return res.status(200).json(VERIFIED_MOVIES.filter((m) => m.title.toLowerCase().includes(q)));
      }
    }

    if (action === 'discover') {
      const genre = url.searchParams.get('genre') || (req.query && req.query.genre);
      const language = url.searchParams.get('language') || (req.query && req.query.language);
      const year = url.searchParams.get('year') || (req.query && req.query.year);
      const rating = url.searchParams.get('rating') || (req.query && req.query.rating);
      const sortBy = url.searchParams.get('sort_by') || (req.query && req.query.sort_by);

      if (!hasTmdbCredentials()) {
        let list = [...VERIFIED_MOVIES];
        if (genre && genre !== 'All') {
          list = list.filter((m) => m.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase())));
        }
        if (language && language !== 'All') {
          list = list.filter((m) => m.language.toLowerCase() === language.toLowerCase());
        }
        if (year && year !== 'All') {
          list = list.filter((m) => String(m.year) === year);
        }
        if (rating && rating !== 'All') {
          const minR = parseFloat(rating);
          if (!isNaN(minR)) list = list.filter((m) => m.rating >= minR);
        }
        if (sortBy === 'vote_average.desc') {
          list.sort((a, b) => b.rating - a.rating);
        } else {
          list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        }
        return res.status(200).json(list);
      }

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
      } catch {
        return res.status(200).json(VERIFIED_MOVIES);
      }
    }

    if (action === 'genres') {
      if (!hasTmdbCredentials()) {
        const allGenres = Array.from(new Set(VERIFIED_MOVIES.flatMap((m) => m.genres))).sort();
        return res.status(200).json(allGenres);
      }
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
        if (!hasTmdbCredentials()) {
          const current = VERIFIED_MOVIES.find((m) => m.id === targetId);
          const similar = VERIFIED_MOVIES.filter((m) => m.id !== targetId && (!current || m.genres.some((g) => current.genres.includes(g))));
          return res.status(200).json(similar.slice(0, 6));
        }
        try {
          const data = await fetchTmdb(`/movie/${targetId}/similar`, { page: '1' });
          const normalized = (data.results || []).map(normalizeTmdbMovie);
          return res.status(200).json(normalized);
        } catch {
          return res.status(200).json(VERIFIED_MOVIES.filter((m) => m.id !== targetId).slice(0, 6));
        }
      }

      // Single movie detail
      if (!hasTmdbCredentials()) {
        const found = VERIFIED_MOVIES.find((m) => m.id === targetId);
        if (found) return res.status(200).json(found);
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Movie not found.' });
      }

      try {
        const data = await fetchTmdb(`/movie/${targetId}`, {
          append_to_response: 'credits,videos,similar',
        });
        const normalized = normalizeTmdbMovie(data);
        return res.status(200).json(normalized);
      } catch {
        const found = VERIFIED_MOVIES.find((m) => m.id === targetId);
        if (found) return res.status(200).json(found);
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Movie not found.' });
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
