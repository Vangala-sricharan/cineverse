import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MovieCard } from '../components/common/MovieCard';
import { MovieCardSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { RecommendationEngine } from '../intelligence/RecommendationEngine';
import { SearchIntent, RecommendationResult } from '../types/intelligence';
import { useMovie } from '../context/MovieContext';

const EXAMPLE_QUERIES = [
  'Dark Telugu crime movie with a crazy twist',
  'Something like Inception but more emotional',
  'Fast-paced crime movie with a crazy ending',
  'Something emotional but not depressing',
  'Funny action movie under two hours',
  'Mind-bending sci-fi with beautiful visuals',
  'Slow-burn mystery with a shocking ending',
  'Something intense but not too violent',
];

interface GuidedAnswers {
  vibe?: string;
  pacing?: string;
  focus?: string;
}

export const SearchPage: React.FC = () => {
  const { tasteProfile } = useMovie();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery || 'Dark Telugu crime movie with a crazy twist');
  
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [activeIntent, setActiveIntent] = useState<SearchIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [useTastePersonalization, setUseTastePersonalization] = useState(tasteProfile.settings?.enabled ?? true);

  // Guided Discovery State
  const [showGuided, setShowGuided] = useState(false);
  const [guidedStep, setGuidedStep] = useState(1);
  const [guidedAnswers, setGuidedAnswers] = useState<GuidedAnswers>({});

  // Request deduplication tracker
  const requestIdRef = useRef(0);

  const executeRecommendationSearch = async (
    searchTerm: string,
    lang = selectedLanguage,
    rat = selectedRating,
    answers?: GuidedAnswers,
    personalize = useTastePersonalization
  ) => {
    const currentId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      let combinedQuery = searchTerm;
      if (answers?.vibe) {
        combinedQuery = `${answers.vibe} movie with ${answers.pacing || 'moderate'} pacing and focus on ${answers.focus || 'great storytelling'}`;
      }

      const recs = await RecommendationEngine.recommend({
        naturalQuery: combinedQuery,
        language: lang !== 'All' ? lang : undefined,
        usePersonalization: personalize,
      });

      // Filter by rating if specified
      let finalResults = recs;
      if (rat !== 'All') {
        const minRating = parseFloat(rat);
        if (!isNaN(minRating)) {
          finalResults = recs.filter((r) => r.movie.rating >= minRating);
        }
      }

      // Check if this is still the newest active request
      if (currentId === requestIdRef.current) {
        setResults(finalResults);
        setIsLoading(false);
      }
    } catch (e: any) {
      if (currentId === requestIdRef.current) {
        console.warn('Recommendation search notice:', e);
        setError(e.message || 'Unable to complete intelligent recommendation search.');
        setIsLoading(false);
      }
    }
  };

  // Debounced search on activeQuery change
  useEffect(() => {
    executeRecommendationSearch(activeQuery, selectedLanguage, selectedRating, guidedAnswers, useTastePersonalization);
  }, [activeQuery, selectedLanguage, selectedRating, useTastePersonalization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveQuery(query.trim());
      setSearchParams({ q: query.trim() });
      setShowGuided(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setActiveQuery(example);
    setSearchParams({ q: example });
    setShowGuided(false);
  };

  const handleGuidedSelect = (key: keyof GuidedAnswers, value: string) => {
    const updated = { ...guidedAnswers, [key]: value };
    setGuidedAnswers(updated);
    if (guidedStep < 3) {
      setGuidedStep(guidedStep + 1);
    } else {
      // Completed guided flow
      const summaryQuery = `${updated.vibe} film with ${updated.pacing} pacing and ${updated.focus}`;
      setQuery(summaryQuery);
      setActiveQuery(summaryQuery);
      setSearchParams({ q: summaryQuery });
      setShowGuided(false);
      setGuidedStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Prompt Formulation */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff2a5f]/10 border border-[#ff2a5f]/20 text-xs font-semibold text-[#ff5c8a]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Natural Language Movie Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
          Search Your Next Experience
        </h1>
        <p className="text-sm text-slate-400">
          Describe what you want to <strong className="text-white font-medium">feel</strong>, <strong className="text-white font-medium">watch</strong>, or <strong className="text-white font-medium">avoid</strong>.
        </p>
      </div>

      {/* Large Natural Language Search Box */}
      <div className="max-w-4xl mx-auto mb-6">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center rounded-2xl bg-[#0f111a] border border-white/15 focus-within:border-[#ff2a5f] focus-within:ring-2 focus-within:ring-[#ff2a5f]/20 shadow-2xl p-2 transition-all"
        >
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5 text-[#ff2a5f]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you want to watch... (e.g. fast-paced crime with a crazy ending)"
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 py-2.5 focus:outline-none"
          />
          
          {/* Guided flow toggle button */}
          <button
            type="button"
            onClick={() => setShowGuided(!showGuided)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all mr-2 ${
              showGuided
                ? 'bg-[#ff2a5f]/20 text-[#ff5c8a] border border-[#ff2a5f]/40'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#ff2a5f]" />
            <span>Guided Flow</span>
          </button>

          <button
            type="submit"
            aria-label="Run natural language search"
            className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#ff154f] hover:from-[#ff154f] hover:to-[#e0003c] text-white flex items-center justify-center transition-all cine-glow hover:scale-105 active:scale-95 ml-1 cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Guided Cinematic Discovery Modal / Panel */}
        {showGuided && (
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[#121422] to-[#0c0d16] border border-[#ff2a5f]/30 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#ff2a5f]" />
                <h3 className="text-sm font-bold text-white font-display">Guided Cinematic Match</h3>
                <span className="text-[11px] text-slate-400 font-mono">Step {guidedStep} of 3</span>
              </div>
              <button
                onClick={() => setShowGuided(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {guidedStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 font-medium">What is your mood or primary atmosphere tonight?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Dark & Gritty', desc: 'Neo-noir tension, crime, psychological stakes' },
                    { label: 'Mind-Bending', desc: 'Complex mysteries, sci-fi puzzles, twists' },
                    { label: 'Emotional & Deep', desc: 'Poignant human drama, heartfelt journeys' },
                    { label: 'High Adrenaline', desc: 'Fast relentless action, explosive pacing' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleGuidedSelect('vibe', opt.label)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-[#ff2a5f]/15 hover:border-[#ff2a5f]/50 border border-white/10 text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-[#ff5c8a]">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {guidedStep === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 font-medium">How should the pacing feel?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: 'Slow Burn', desc: 'Atmospheric, tension gradually builds' },
                    { label: 'Fast Paced', desc: 'Quick transitions, relentless momentum' },
                    { label: 'Balanced', desc: 'Evenly structured narrative flow' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleGuidedSelect('pacing', opt.label)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-[#ff2a5f]/15 hover:border-[#ff2a5f]/50 border border-white/10 text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-[#ff5c8a]">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {guidedStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 font-medium">Any special focus or surprise elements?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Crazy Plot Twist', desc: 'Unpredictable ending that flips the script' },
                    { label: 'Zero Romance', desc: 'Pure focus on crime, mystery or stakes' },
                    { label: 'Visual Spectacle', desc: 'Stunning cinematography & grand scale' },
                    { label: 'Character Study', desc: 'Intimate character transformation' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleGuidedSelect('focus', opt.label)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-[#ff2a5f]/15 hover:border-[#ff2a5f]/50 border border-white/10 text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-[#ff5c8a]">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Try These Examples */}
        <div className="mt-4 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">
            Try these cinematic prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className={`text-xs px-3 py-1.5 rounded-full transition-all text-left ${
                  activeQuery === example
                    ? 'bg-[#ff2a5f]/20 border border-[#ff2a5f] text-white font-medium'
                    : 'bg-[#121420] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                }`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Semantic Intent Understanding Card */}
      {activeQuery && (
        <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-[#11131c] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#ff2a5f] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-white">CINEVERSE Semantic Understanding: </span>
              <span className="text-slate-300">
                Searching for narrative profiles matching <span className="text-[#ff5c8a] font-medium">"{activeQuery}"</span>.
                {useTastePersonalization && tasteProfile.favoriteGenres.length > 0 && (
                  <span className="text-slate-400 block mt-0.5">
                    Personalized with your taste in <strong className="text-white font-medium">{tasteProfile.favoriteGenres.slice(0, 2).join(' & ')}</strong> and pacing preferences.
                  </span>
                )}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setUseTastePersonalization(!useTastePersonalization)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                useTastePersonalization
                  ? 'bg-[#ff2a5f]/15 border-[#ff2a5f]/40 text-[#ff5c8a]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span>{useTastePersonalization ? 'Taste Active' : 'Taste Off'}</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Signals</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Header & Secondary Quick Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-white/[0.08] mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display">
            Recommended Matches
          </h2>
          <span className="text-xs text-slate-400">
            {results.length} movies ranked by cinematic match
          </span>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-[#121420] text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#ff2a5f]"
          >
            <option value="All">Language: All</option>
            <option value="Telugu">Language: Telugu</option>
            <option value="English">Language: English</option>
            <option value="Hindi">Language: Hindi</option>
            <option value="Tamil">Language: Tamil</option>
          </select>

          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="bg-[#121420] text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#ff2a5f]"
          >
            <option value="All">Rating: All</option>
            <option value="8.0">Rating: 8.0+</option>
            <option value="7.5">Rating: 7.5+</option>
            <option value="7.0">Rating: 7.0+</option>
          </select>
        </div>
      </div>

      {/* Results Grid with Grounded "Why It Fits" Badges */}
      {error && results.length === 0 ? (
        <ErrorState
          title="Search temporarily unavailable"
          message={error}
          onRetry={() => executeRecommendationSearch(activeQuery, selectedLanguage, selectedRating)}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="No movies found for your query"
          description="Try one of our example prompts or adjust your language/rating filters."
          actionText="Try 'Mind-bending sci-fi with beautiful visuals'"
          onAction={() => handleExampleClick('Mind-bending sci-fi with beautiful visuals')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {results.map((item) => (
            <div key={item.movie.id} className="flex flex-col space-y-2">
              <MovieCard
                movie={item.movie}
                size="sm"
                className="w-full"
              />
              {/* Compact "Why it fits" badge */}
              <div className="p-2.5 rounded-xl bg-[#0f111a] border border-white/5 text-[11px] text-slate-300 leading-snug">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span className="text-[#ff5c8a] flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#ff2a5f]" />
                    {item.matchScore}% Match
                  </span>
                  <span>Why it fits</span>
                </div>
                <p className="line-clamp-2 text-slate-400">{item.whyItFits}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
