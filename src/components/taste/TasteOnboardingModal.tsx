import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, Check, Film, Compass } from 'lucide-react';
import { useMovie } from '../../context/MovieContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_GENRES = [
  'Science Fiction',
  'Crime',
  'Thriller',
  'Mystery',
  'Action',
  'Drama',
  'Comedy',
  'Horror',
  'Adventure',
];

const AVAILABLE_MOODS = [
  'Dark',
  'Mind-Bending',
  'Emotional',
  'Intense',
  'Uplifting',
  'Mysterious',
  'Relaxing',
];

const AVAILABLE_PACING = ['Slow Burn', 'Balanced', 'Fast Paced'];

export const TasteOnboardingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { tasteProfile, updateTasteProfile, showNotification } = useMovie();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(tasteProfile.favoriteGenres || []);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(tasteProfile.preferredMoods || []);
  const [selectedPacing, setSelectedPacing] = useState<string[]>(tasteProfile.preferredPacing || ['Slow Burn']);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const togglePacing = (pacing: string) => {
    setSelectedPacing((prev) =>
      prev.includes(pacing) ? prev.filter((p) => p !== pacing) : [...prev, pacing]
    );
  };

  const handleSave = () => {
    updateTasteProfile({
      favoriteGenres: selectedGenres.length > 0 ? selectedGenres : ['Science Fiction', 'Crime'],
      preferredMoods: selectedMoods.length > 0 ? selectedMoods : ['Dark', 'Mind-Bending'],
      preferredPacing: selectedPacing.length > 0 ? selectedPacing : ['Slow Burn'],
      onboardingCompleted: true,
    });
    showNotification('Taste preferences calibrated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0e1019] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 text-xs font-semibold text-[#ff5c8a]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optional Taste Calibration</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            What kind of movies pull you in?
          </h2>
          <p className="text-xs text-slate-400">
            Select your natural affinities. Skip anytime — CINEVERSE also learns dynamically as you browse.
          </p>
        </div>

        {/* Section 1: Favorite Genres */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Favorite Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GENRES.map((genre) => {
              const active = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#ff2a5f] text-white shadow-lg shadow-[#ff2a5f]/30 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Preferred Moods */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Preferred Atmospheres & Moods
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_MOODS.map((mood) => {
              const active = selectedMoods.includes(mood);
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => toggleMood(mood)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#ff2a5f] text-white shadow-lg shadow-[#ff2a5f]/30 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Pacing */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Preferred Narrative Rhythm
          </label>
          <div className="grid grid-cols-3 gap-2">
            {AVAILABLE_PACING.map((pacing) => {
              const active = selectedPacing.includes(pacing);
              return (
                <button
                  key={pacing}
                  type="button"
                  onClick={() => togglePacing(pacing)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                    active
                      ? 'bg-[#ff2a5f] text-white shadow-md shadow-[#ff2a5f]/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  {pacing}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#ff154f] hover:from-[#ff154f] hover:to-[#e0003c] text-white text-xs font-bold transition-all shadow-lg shadow-[#ff2a5f]/30 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Save Preferences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
