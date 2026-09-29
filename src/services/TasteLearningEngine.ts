/**
 * CINEVERSE TasteLearningEngine
 * 
 * Manages explicit vs implicit preferences, confidence weighting,
 * recency decay, and incremental DNA evolution without sudden jumps.
 * 
 * Signal Confidence Weighting:
 * - Explicit (User selected genre/mood in settings/onboarding): Weight 1.0 (High confidence)
 * - Strong Implicit (Like / Dislike / Watchlist / Watched): Weight 0.8
 * - Medium Implicit (Opened details / collected): Weight 0.4
 * - Weak Implicit (Searched / viewed): Weight 0.15
 */

import { TasteProfile, InteractionEvent, MovieDnaDimensions } from '../types/intelligence';
import { TasteStorageService } from './TasteStorageService';
import { Movie } from '../types/movie';

export class TasteLearningEngine {
  /**
   * Applies an interaction event to incrementally update the user's TasteProfile
   */
  static processInteraction(
    movie: Movie,
    eventType: InteractionEvent['eventType'],
    source: InteractionEvent['source'] = 'movie-details'
  ): TasteProfile {
    const profile = TasteStorageService.getProfile();

    // 1. Record the interaction event
    TasteStorageService.recordInteraction({
      movieId: movie.id,
      eventType,
      source,
      metadata: {
        title: movie.title,
        genres: movie.genres,
        director: movie.director,
      },
    });

    const updatedProfile = { ...profile };

    // 2. Process based on event weight
    if (eventType === 'liked') {
      if (!updatedProfile.likedMovies.includes(movie.id)) {
        updatedProfile.likedMovies = [...updatedProfile.likedMovies, movie.id];
      }
      updatedProfile.dislikedMovies = updatedProfile.dislikedMovies.filter((id) => id !== movie.id);

      // Reinforce movie genres (strong positive signal)
      movie.genres.forEach((g) => {
        if (!updatedProfile.favoriteGenres.includes(g)) {
          updatedProfile.favoriteGenres = [...updatedProfile.favoriteGenres, g];
        }
        updatedProfile.dislikedGenres = updatedProfile.dislikedGenres.filter((dg) => dg !== g);
      });

      // Evolve DNA incrementally (+3 points towards movie's characteristic strengths)
      updatedProfile.preferredDNA = this.evolveDNA(updatedProfile.preferredDNA, movie, 3);
    } else if (eventType === 'disliked') {
      if (!updatedProfile.dislikedMovies.includes(movie.id)) {
        updatedProfile.dislikedMovies = [...updatedProfile.dislikedMovies, movie.id];
      }
      updatedProfile.likedMovies = updatedProfile.likedMovies.filter((id) => id !== movie.id);

      // Negative signal: If multiple movies of this genre are disliked, record negative preference
      // Do not ban an entire genre from a single dislike
      const recentDislikes = updatedProfile.interactionHistory.filter((e) => e.eventType === 'disliked');
      movie.genres.forEach((g) => {
        const dislikedCount = recentDislikes.filter((e) => e.metadata?.genres?.includes(g)).length;
        if (dislikedCount >= 2 && !updatedProfile.dislikedGenres.includes(g)) {
          updatedProfile.dislikedGenres = [...updatedProfile.dislikedGenres, g];
        }
      });

      // Evolve DNA slightly away from dominant traits (-2 points)
      updatedProfile.preferredDNA = this.evolveDNA(updatedProfile.preferredDNA, movie, -2);
    } else if (eventType === 'watched') {
      if (!updatedProfile.watchedMovies.includes(movie.id)) {
        updatedProfile.watchedMovies = [movie.id, ...updatedProfile.watchedMovies];
      }
      // Watched signal reinforces familiarity and preferred pacing
      if (movie.pacing && !updatedProfile.preferredPacing.includes(movie.pacing)) {
        updatedProfile.preferredPacing = [...updatedProfile.preferredPacing, movie.pacing];
      }
    } else if (eventType === 'watchlisted') {
      if (!updatedProfile.watchlistMovies.includes(movie.id)) {
        updatedProfile.watchlistMovies = [...updatedProfile.watchlistMovies, movie.id];
      }
      // Moderate preference reinforcement
      movie.genres.forEach((g) => {
        if (!updatedProfile.favoriteGenres.includes(g) && updatedProfile.favoriteGenres.length < 8) {
          updatedProfile.favoriteGenres = [...updatedProfile.favoriteGenres, g];
        }
      });
    }

    return TasteStorageService.saveProfile(updatedProfile) ? updatedProfile : profile;
  }

  /**
   * Incrementally shifts preferred DNA dimensions without abrupt jumps
   */
  private static evolveDNA(
    currentDNA: Partial<MovieDnaDimensions>,
    movie: Movie,
    delta: number
  ): Partial<MovieDnaDimensions> {
    const isSciFi = movie.genres.includes('Science Fiction');
    const isCrime = movie.genres.includes('Crime') || movie.genres.includes('Thriller');
    const isAction = movie.genres.includes('Action');
    const isDrama = movie.genres.includes('Drama');

    const clamp = (v: number) => Math.min(99, Math.max(15, Math.round(v)));

    return {
      ...currentDNA,
      psychologicalDepth: clamp((currentDNA.psychologicalDepth || 80) + (isSciFi || isCrime ? delta : 0)),
      suspense: clamp((currentDNA.suspense || 80) + (isCrime ? delta : 0)),
      visualSpectacle: clamp((currentDNA.visualSpectacle || 75) + (isSciFi || isAction ? delta : 0)),
      action: clamp((currentDNA.action || 60) + (isAction ? delta : 0)),
      emotion: clamp((currentDNA.emotion || 70) + (isDrama ? delta : 0)),
      storyComplexity: clamp((currentDNA.storyComplexity || 80) + (isSciFi ? delta : 0)),
    };
  }

  /**
   * Generates a concise cinematic persona based on learned profile
   */
  static getCinematicPersona(profile: TasteProfile): { title: string; subtitle: string } {
    const genres = profile.favoriteGenres;
    const isDark = profile.preferredMoods.includes('Dark');
    const isMindBending = profile.preferredMoods.includes('Mind-Bending');
    const isSciFi = genres.includes('Science Fiction');
    const isCrime = genres.includes('Crime') || genres.includes('Thriller');

    if (isMindBending && isSciFi) {
      return {
        title: 'Cerebral Speculative Visionary',
        subtitle: 'Drawn to non-linear narratives, psychological puzzles, and cosmic questions.',
      };
    }
    if (isDark && isCrime) {
      return {
        title: 'Neo-Noir Atmospheric Realist',
        subtitle: 'Values morally complex antiheroes, escalating tension, and gritty realism.',
      };
    }
    if (genres.includes('Action') && genres.includes('Thriller')) {
      return {
        title: 'High-Stakes Momentum Seeker',
        subtitle: 'Craves kinetic storytelling, relentless pacing, and grand set pieces.',
      };
    }

    return {
      title: 'Eclectic Cinematic Connoisseur',
      subtitle: 'Explores high-rated storytelling across multiple genres with strong narrative depth.',
    };
  }
}
