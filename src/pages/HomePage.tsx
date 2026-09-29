import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { MoodSelector } from '../components/home/MoodSelector';
import { Carousel } from '../components/common/Carousel';
import { ErrorState } from '../components/common/ErrorState';
import { MovieService } from '../services/MovieService';
import { RecommendationEngine } from '../intelligence/RecommendationEngine';
import { useMovie } from '../context/MovieContext';
import { Movie } from '../types/movie';

export const HomePage: React.FC = () => {
  const { tasteProfile } = useMovie();
  const [pickedForYouMovies, setPickedForYouMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('Any Mood');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [trendingRes, popularRes, nowPlayingRes, upcomingRes] = await Promise.allSettled([
        MovieService.getTrendingMovies(),
        MovieService.getPopularMovies(),
        MovieService.getNowPlayingMovies(),
        MovieService.getUpcomingMovies(),
      ]);

      const trending = trendingRes.status === 'fulfilled' ? trendingRes.value : [];
      const popular = popularRes.status === 'fulfilled' ? popularRes.value : [];
      const nowPlaying = nowPlayingRes.status === 'fulfilled' ? nowPlayingRes.value : [];
      const upcoming = upcomingRes.status === 'fulfilled' ? upcomingRes.value : [];

      setTrendingMovies(trending);
      setPopularMovies(popular);
      setNowPlayingMovies(nowPlaying);
      setUpcomingMovies(upcoming);

      // If all catalog requests failed, report the specific reason
      if (trending.length === 0 && popular.length === 0 && nowPlaying.length === 0 && upcoming.length === 0) {
        const firstError = [trendingRes, popularRes, nowPlayingRes, upcomingRes].find(
          (r) => r.status === 'rejected'
        ) as PromiseRejectedResult | undefined;

        const errorMsg = firstError?.reason?.message || 'Unable to connect to movie service. Please verify your connection or TMDB configuration.';
        setError(errorMsg);
      } else {
        // Try personalized recommendations non-blockingly
        try {
          const personalized = await RecommendationEngine.recommend({
            usePersonalization: true,
            limit: 8,
          });
          setPickedForYouMovies(personalized.map((r) => r.movie));
        } catch {
          // If personalized recommendations fail, fallback to top trending/popular
          setPickedForYouMovies(trending.slice(0, 8));
        }
      }
    } catch (err: any) {
      console.warn('Movie catalog notice:', err?.message || err);
      setError(
        err?.message || 'Unable to connect to movie data service. Please click Retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    if (mood === 'Any Mood') {
      try {
        const trending = await MovieService.getTrendingMovies();
        setTrendingMovies(trending);
      } catch (err) {
        console.warn('Mood reset notice:', err);
      }
    } else {
      try {
        const recs = await RecommendationEngine.recommend({ mood, limit: 10 });
        if (recs && recs.length > 0) {
          setTrendingMovies(recs.map((r) => r.movie));
        } else {
          const filtered = await MovieService.getMoviesByFilters({ mood });
          if (filtered && filtered.length > 0) {
            setTrendingMovies(filtered);
          }
        }
      } catch (err) {
        console.warn('Mood recommendation notice:', err);
      }
    }
  };

  const scrollToMood = () => {
    const el = document.getElementById('mood-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Find genuine movie with a valid backdrop from real data
  const backdropCandidate =
    trendingMovies.find((m) => Boolean(m.backdropUrl)) ||
    popularMovies.find((m) => Boolean(m.backdropUrl)) ||
    pickedForYouMovies.find((m) => Boolean(m.backdropUrl)) ||
    null;

  return (
    <div className="min-h-screen bg-[#07080b] pb-20">
      {/* Hero Section */}
      <HeroBanner
        featuredMovie={backdropCandidate}
        onExploreMoodClick={scrollToMood}
      />

      {/* Mood Discovery Section */}
      <div id="mood-section">
        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={handleMoodSelect}
        />
      </div>

      {/* Main Content / Error State */}
      {error && trendingMovies.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState
            title="Live Movie Data Unavailable"
            message={error}
            onRetry={loadData}
          />
        </div>
      ) : (
        <>
          {/* Picked For You Carousel (Personalized based on Taste Profile) */}
          {pickedForYouMovies.length > 0 && (
            <Carousel
              title="Picked For You"
              subtitle={`Personalized for your affinity in ${tasteProfile.favoriteGenres.slice(0, 2).join(' & ')} cinema`}
              movies={pickedForYouMovies}
              seeAllLink="/recommendations"
              isLoading={isLoading}
            />
          )}

          {/* Trending This Week Carousel */}
          <Carousel
            title="Trending This Week"
            subtitle="The most talked about films right now across the global box office"
            movies={trendingMovies}
            seeAllLink="/discover"
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
          />

          {/* Popular Movies Carousel */}
          <Carousel
            title="Popular Movies"
            subtitle="Top rated experiences captivating audiences worldwide"
            movies={popularMovies}
            seeAllLink="/discover"
            isLoading={isLoading}
          />

          {/* Now Playing in Theatres Carousel */}
          <Carousel
            title="Now Playing"
            subtitle="Currently lighting up the big screen in cinemas"
            movies={nowPlayingMovies}
            seeAllLink="/discover"
            isLoading={isLoading}
          />

          {/* Upcoming Movies You Might Like Carousel */}
          <Carousel
            title="Upcoming Movies"
            subtitle="Anticipated cinematic releases premiering soon"
            movies={upcomingMovies}
            seeAllLink="/discover"
            isLoading={isLoading}
            showMatch={false}
          />
        </>
      )}
    </div>
  );
};
