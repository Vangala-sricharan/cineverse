import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Maximum allowed input text length for safety
const MAX_PROMPT_LENGTH = 10000;

// Request body parser for serverless environments
async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new Error('MALFORMED_JSON');
    }
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
      if (raw.length > 500000) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('MALFORMED_JSON'));
      }
    });
    req.on('error', reject);
  });
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

  // Set CORS and JSON headers
  res.setHeader('Content-Type', 'application/json');

  // Only allow POST requests for Gemini operations
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST method is accepted.',
    });
  }

  // Verify server-side API Key without exposing it
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_NOT_CONFIGURED',
      message: 'Cinematic Intelligence is temporarily unavailable. Gemini API key is not configured on the server.',
    });
  }

  let body: any;
  try {
    body = await parseBody(req);
  } catch (err: any) {
    if (err.message === 'PAYLOAD_TOO_LARGE') {
      return res.status(413).json({
        error: 'PAYLOAD_TOO_LARGE',
        message: 'The submitted request exceeds the maximum allowed size.',
      });
    }
    return res.status(400).json({
      error: 'MALFORMED_REQUEST',
      message: 'Invalid JSON request payload.',
    });
  }

  const { action, payload } = body;
  const validActions = [
    'interpret_search_intent',
    'natural_language_search', // backwards-compatible alias
    'generate_movie_dna',
    'movie_dna', // backwards-compatible alias
    'explain_recommendation',
    'semantic_similarity',
    'taste_analysis',
  ];

  if (!action || !validActions.includes(action)) {
    return res.status(400).json({
      error: 'INVALID_ACTION',
      message: `Invalid action specified. Supported actions: ${validActions.join(', ')}`,
    });
  }

  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({
      error: 'INVALID_PAYLOAD',
      message: 'Request payload must be a non-null object.',
    });
  }

  try {
    const ai = new GoogleGenAI();
    // Modern official alias per gemini-api skill
    const model = 'gemini-3.8-flash';

    switch (action) {
      // -------------------------------------------------------------
      // 1. Natural Language Search Intent Interpretation
      // -------------------------------------------------------------
      case 'interpret_search_intent':
      case 'natural_language_search': {
        const query = typeof payload.query === 'string' ? payload.query.trim() : '';
        if (!query) {
          return res.status(400).json({
            error: 'MISSING_QUERY',
            message: 'Query is required for natural language search.',
          });
        }
        if (query.length > MAX_PROMPT_LENGTH) {
          return res.status(400).json({
            error: 'QUERY_TOO_LONG',
            message: `Query length exceeds maximum limit of ${MAX_PROMPT_LENGTH} characters.`,
          });
        }

        const prompt = `You are the intelligence engine of CINEVERSE, a premium cinematic movie platform.
Analyze the following natural-language user movie request:
"${query}"

Understand what the user wants to FEEL, WATCH, EXPERIENCE, or AVOID.
Extract structured search criteria and return STRICT JSON with this exact schema:
{
  "query": "${query.replace(/"/g, '\\"')}",
  "interpretedIntent": "One clear sentence explaining the user's core cinematic desire",
  "genres": ["list", "of", "standard", "genres", "e.g. Crime, Thriller, Science Fiction"],
  "moods": ["Dark", "Emotional", "Uplifting", "Disturbing", "Relaxing", "Intense", "Mysterious", "Nostalgic", "Hopeful", "Funny", "Adventurous", "Mind-Bending"],
  "themes": ["revenge", "identity", "betrayal", "survival", "time", "morality", "crime", "technology", "isolation", "obsession", "justice"],
  "tones": ["serious", "gritty", "atmospheric", "surreal", "epic", "intimate", "disturbing", "playful"],
  "pacing": ["Slow Burn" | "Moderate" | "Fast Paced" | "Relentless"],
  "runtime": {
    "min": number | null,
    "max": number | null
  },
  "releasePreferences": {
    "from": number | null,
    "to": number | null
  },
  "languagePreferences": ["Telugu", "English", "Hindi", "Tamil", "Korean", "Japanese" etc or empty if any],
  "similarityTargets": ["e.g. Inception", "Interstellar", "The Dark Knight", "Se7en" if referenced],
  "exclusions": ["e.g. no romance", "less superhero", "not depressing", "not too violent"],
  "intensity": {
    "min": number (0-100) | null,
    "max": number (0-100) | null
  },
  "emotionalProfile": ["e.g. poignant", "cathartic", "adrenaline-inducing", "cerebral"],
  "visualPreferences": ["e.g. stunning cinematography", "noir lighting", "gritty realism"],
  "narrativePreferences": ["e.g. plot twist", "non-linear", "unpredictable", "character study"],
  "reasoningSummary": "2 concise sentences explaining why and how the cinematic criteria were extracted",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY valid JSON. No Markdown ticks, no commentary.`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        let parsed = JSON.parse(rawText);

        // Sanitize and ensure fallback fields
        parsed.query = query;
        if (!Array.isArray(parsed.genres)) parsed.genres = [];
        if (!Array.isArray(parsed.moods)) parsed.moods = [];
        if (!Array.isArray(parsed.themes)) parsed.themes = [];
        if (!Array.isArray(parsed.tones)) parsed.tones = [];
        if (!Array.isArray(parsed.pacing)) parsed.pacing = [];
        if (!Array.isArray(parsed.languagePreferences)) parsed.languagePreferences = [];
        if (!Array.isArray(parsed.similarityTargets)) parsed.similarityTargets = [];
        if (!Array.isArray(parsed.exclusions)) parsed.exclusions = [];
        if (!Array.isArray(parsed.suggestedKeywords)) parsed.suggestedKeywords = [query];

        return res.status(200).json({
          success: true,
          action,
          result: parsed,
        });
      }

      // -------------------------------------------------------------
      // 2. Movie DNA Algorithmic Dimension Analysis
      // -------------------------------------------------------------
      case 'generate_movie_dna':
      case 'movie_dna': {
        const title = typeof payload.title === 'string' ? payload.title.trim() : '';
        const overview = typeof payload.overview === 'string' ? payload.overview.trim() : '';
        const genres = Array.isArray(payload.genres) ? payload.genres : [];
        const director = typeof payload.director === 'string' ? payload.director : '';
        const year = payload.year || '';

        if (!title) {
          return res.status(400).json({
            error: 'MISSING_TITLE',
            message: 'Movie title is required to generate Movie DNA.',
          });
        }

        const prompt = `You are CINEVERSE's cinematic analyst. Generate an analytical Movie DNA profile for:
Title: "${title}"
Year: ${year}
Director: ${director}
Genres: ${genres.join(', ')}
Overview: "${overview}"

Analyze the movie across all 14 dimensions (values must be 0 to 100 based on the actual film).
Return STRICT JSON with this exact schema:
{
  "title": "${title.replace(/"/g, '\\"')}",
  "dimensions": {
    "action": number (0-100),
    "emotion": number (0-100),
    "suspense": number (0-100),
    "mystery": number (0-100),
    "comedy": number (0-100),
    "romance": number (0-100),
    "darkness": number (0-100),
    "intelligence": number (0-100),
    "visualSpectacle": number (0-100),
    "psychologicalDepth": number (0-100),
    "pacing": number (0-100),
    "storyComplexity": number (0-100),
    "emotionalIntensity": number (0-100),
    "characterFocus": number (0-100)
  },
  "insights": [
    "e.g. High psychological depth with complex moral ambiguity",
    "e.g. Slow-building tension culminating in an explosive resolution",
    "e.g. Visually ambitious cinematography with grand scale"
  ],
  "tonalAtmosphere": "One descriptive sentence capturing the visual and emotional tone",
  "reasonsToLike": [
    "Reason 1 specific to this film",
    "Reason 2 specific to this film",
    "Reason 3 specific to this film",
    "Reason 4 specific to this film"
  ],
  "keyThemes": ["theme1", "theme2", "theme3", "theme4"],
  "cinematicStyle": "e.g. Neo-Noir Psychological Thriller / Dystopian Sci-Fi Epic"
}

Provide realistic, film-accurate values. Return ONLY valid JSON.`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        return res.status(200).json({
          success: true,
          action,
          result: parsed,
        });
      }

      // -------------------------------------------------------------
      // 3. Grounded Recommendation Explanation
      // -------------------------------------------------------------
      case 'explain_recommendation': {
        const movieTitle = typeof payload.movieTitle === 'string' ? payload.movieTitle.trim() : '';
        const intentOrTaste = payload.intent || payload.userTaste || {};
        const context = typeof payload.context === 'string' ? payload.context : '';

        if (!movieTitle) {
          return res.status(400).json({
            error: 'MISSING_MOVIE_TITLE',
            message: 'Movie title is required.',
          });
        }

        const prompt = `In CINEVERSE, generate an authentic, concise recommendation rationale explaining why "${movieTitle}" was selected.
Context / Request: ${JSON.stringify(intentOrTaste)}
Viewing Nuance: "${context}"

Return STRICT JSON with this schema:
{
  "headline": "Short 4-6 word punchy match headline",
  "whyItFits": "1-2 engaging cinematic sentences explaining specifically why this film fits their requested mood/vibe. Mention specific tone, pacing, or thematic overlap. Never use generic praise like 'it is a great movie'.",
  "reasons": [
    "Bullet point reason 1",
    "Bullet point reason 2",
    "Bullet point reason 3"
  ],
  "sharedDnaHighlights": ["e.g. High Psychological Depth", "Unpredictable Pacing", "Minimal Romance"]
}

Return ONLY valid JSON.`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        return res.status(200).json({
          success: true,
          action,
          result: parsed,
        });
      }

      // -------------------------------------------------------------
      // 4. Semantic Similarity Comparison
      // -------------------------------------------------------------
      case 'semantic_similarity': {
        const reference = payload.referenceMovie || {};
        const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
        const nuance = typeof payload.nuance === 'string' ? payload.nuance : '';

        if (!reference.title || candidates.length === 0) {
          return res.status(400).json({
            error: 'MISSING_COMPARISON_DATA',
            message: 'Reference movie title and candidates array are required.',
          });
        }

        const prompt = `You are CINEVERSE's semantic similarity engine.
Reference Movie: "${reference.title}" (${reference.genres?.join(', ') || ''})
Reference Overview: "${reference.overview || ''}"
User Nuance / Request: "${nuance || 'Find movies with similar tone, themes, pacing, and complexity'}"

Evaluate each candidate movie below for true cinematic similarity beyond naive genre matching:
${candidates.map((c: any, i: number) => `[${i + 1}] ID: ${c.id}, Title: "${c.title}", Genres: ${c.genres?.join(', ')}, Overview: "${c.overview}"`).join('\n')}

Return STRICT JSON with an array named "comparisons":
{
  "comparisons": [
    {
      "movieId": "id matching candidate",
      "similarityScore": number (50 to 99),
      "whyItFeelsSimilar": "1 clear sentence explaining why this movie feels like the reference movie in themes, tension, pacing, or emotional resonance",
      "sharedSignals": ["shared theme 1", "shared tone 2"]
    }
  ]
}

Return ONLY valid JSON.`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        return res.status(200).json({
          success: true,
          action,
          result: parsed.comparisons || [],
        });
      }

      // -------------------------------------------------------------
      // 5. User Taste Analysis
      // -------------------------------------------------------------
      case 'taste_analysis': {
        const watchedMovies = Array.isArray(payload.watchedMovies) ? payload.watchedMovies : [];
        const likedGenres = Array.isArray(payload.likedGenres) ? payload.likedGenres : [];

        const prompt = `Analyze this user's movie taste for CINEVERSE:
Watched / Rated: ${watchedMovies.join(', ')}
Favorite Genres: ${likedGenres.join(', ')}

Return STRICT JSON with this schema:
{
  "cinematicPersona": "e.g. Cerebral Noir Explorer / Adrenaline Visionary",
  "tasteSummary": "2 sentences describing their taste profile",
  "dimensions": {
    "darkness": number (0-100),
    "complexity": number (0-100),
    "pacing": "Slow Burn" | "Moderate" | "Fast Paced" | "Relentless",
    "emotionalDepth": number (0-100),
    "actionThrills": number (0-100)
  },
  "recommendedDirectors": ["director1", "director2", "director3"],
  "signatureKeywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY valid JSON.`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        return res.status(200).json({
          success: true,
          action,
          result: parsed,
        });
      }

      default:
        return res.status(400).json({
          error: 'UNSUPPORTED_ACTION',
          message: 'The requested action is not supported.',
        });
    }
  } catch (err: any) {
    const statusCode = err.status || 500;
    if (statusCode === 429) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'AI intelligence rate limit reached. Please wait a moment before trying again.',
      });
    }
    if (statusCode === 503) {
      return res.status(503).json({
        error: 'UPSTREAM_AI_UNAVAILABLE',
        message: 'Cinematic intelligence model is temporarily experiencing high traffic. Please try again shortly.',
      });
    }

    return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: 'GEMINI_SERVICE_ERROR',
      message: 'An error occurred while processing the cinematic intelligence request.',
    });
  }
}
