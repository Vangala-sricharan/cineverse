export interface CastMember {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface MovieDnaData {
  dimensions: {
    story: number;
    mystery: number;
    mindBending: number;
    thriller: number;
    action: number;
    emotion: number;
    romance: number;
    comedy: number;
    pacing: number;
    complexity: number;
  };
  userDnaComparison?: {
    story: number;
    mystery: number;
    mindBending: number;
    thriller: number;
    action: number;
    emotion: number;
    romance: number;
    comedy: number;
    pacing: number;
    complexity: number;
  };
  reasonsToLike: string[];
  keyElements: {
    name: string;
    percentage: number;
  }[];
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  runtimeMinutes?: number;
  runtimeFormatted?: string; // e.g., "2h 28m"
  rating: number; // e.g., 8.8
  voteCount?: string; // e.g., "1.4M" or "250"
  certification?: string; // e.g., "PG-13", "R"
  genres: string[];
  language: string;
  originalLanguage?: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  trailerYoutubeId?: string;
  director?: string;
  cast?: CastMember[];
  crew?: CastMember[];
  popularity?: number;
  adult?: boolean;
  providerId?: string;
  matchPercentage?: number;
  dna?: MovieDnaData;
  moods?: string[];
  storyType?: string;
  pacing?: 'Slow Burn' | 'Moderate' | 'Fast Paced' | 'Relentless';
  releaseDate?: string;
  isTrending?: boolean;
  isUpcoming?: boolean;
  isPopular?: boolean;
  tagline?: string;
}

export interface MovieFilterOptions {
  genre?: string;
  language?: string;
  releaseYear?: string;
  runtime?: string;
  rating?: string;
  pacing?: string;
  mood?: string;
  storyType?: string;
  searchQuery?: string;
}

export interface MovieCollection {
  id: string;
  title: string;
  description?: string;
  coverMoviePoster?: string;
  movieCount: number;
  movieIds: string[];
  createdAt: string;
}

export interface UserTasteProfile {
  name: string;
  avatarUrl: string;
  dna: {
    story: number;
    mystery: number;
    mindBending: number;
    thriller: number;
    action: number;
    sciFi: number;
    drama: number;
    romance: number;
  };
  topGenres: {
    name: string;
    percentage: number;
    color: string;
  }[];
  preferences: string[];
}
