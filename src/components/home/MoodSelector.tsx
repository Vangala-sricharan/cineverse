import React from 'react';
import { Smile, Coffee, Zap, Heart, Disc, Moon, Laugh, Sparkles, Flame, Shuffle } from 'lucide-react';

export interface MoodOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface MoodSelectorProps {
  selectedMood: string;
  onSelectMood: (moodId: string) => void;
}

export const MOODS: MoodOption[] = [
  { id: 'Happy', name: 'Happy', icon: <Smile className="w-5 h-5 text-amber-400" /> },
  { id: 'Chill', name: 'Chill', icon: <Coffee className="w-5 h-5 text-emerald-400" /> },
  { id: 'Thrilling', name: 'Thrilling', icon: <Zap className="w-5 h-5 text-[#ff2a5f]" /> },
  { id: 'Emotional', name: 'Emotional', icon: <Heart className="w-5 h-5 text-rose-500" /> },
  { id: 'Mind-Bending', name: 'Mind-Bending', icon: <Disc className="w-5 h-5 text-indigo-400" /> },
  { id: 'Dark', name: 'Dark', icon: <Moon className="w-5 h-5 text-violet-400" /> },
  { id: 'Funny', name: 'Funny', icon: <Laugh className="w-5 h-5 text-yellow-400" /> },
  { id: 'Romantic', name: 'Romantic', icon: <Flame className="w-5 h-5 text-pink-500" /> },
  { id: 'Inspiring', name: 'Inspiring', icon: <Sparkles className="w-5 h-5 text-cyan-400" /> },
  { id: 'Any Mood', name: 'Any Mood', icon: <Shuffle className="w-5 h-5 text-slate-300" /> },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight font-display">
          What are you in the mood for?
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Pick a vibe to instantly tailor your cinematic experience.
        </p>
      </div>

      {/* Responsive Horizontal or Grid Flow */}
      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood.id)}
              className={`shrink-0 flex flex-col items-center justify-center gap-2 py-3 px-4 min-w-[85px] sm:min-w-[95px] rounded-2xl border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-b from-[#221019] to-[#140b10] border-[#ff2a5f] shadow-lg shadow-[#ff2a5f]/25 -translate-y-1'
                  : 'bg-[#10121a]/80 hover:bg-[#151824] border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform ${
                  isSelected ? 'bg-[#ff2a5f]/20 scale-110' : 'bg-white/5'
                }`}
              >
                {mood.icon}
              </div>
              <span
                className={`text-xs font-semibold tracking-tight whitespace-nowrap ${
                  isSelected ? 'text-[#ff4070]' : 'text-slate-300'
                }`}
              >
                {mood.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
