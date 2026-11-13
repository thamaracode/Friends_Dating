import React from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Heart, 
  BookOpen, 
  Users, 
  Coffee, 
  Cigarette, 
  Dumbbell, 
  PawPrint, 
  Moon, 
  MessageSquare,
  Globe,
  Smile
} from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';

export type LifestyleCategoryKey = 
  | 'interests'
  | 'lookingFor'
  | 'languages'
  | 'zodiac'
  | 'education'
  | 'familyPlans'
  | 'communicationStyle'
  | 'loveStyle'
  | 'pets'
  | 'drinking'
  | 'smoking'
  | 'workout';

export interface LifestyleOptionItem {
  id: string;
  label: string;
  emoji?: string;
  description?: string;
}

export const LIFESTYLE_CATALOG: Record<LifestyleCategoryKey, {
  title: string;
  icon: any;
  isMultiSelect?: boolean;
  options: LifestyleOptionItem[];
}> = {
  interests: {
    title: 'Interests & Passions',
    icon: Sparkles,
    isMultiSelect: true,
    options: [
      { id: 'art', label: 'Art & Design', emoji: '🎨' },
      { id: 'coffee', label: 'Coffee & Cafes', emoji: '☕' },
      { id: 'talks', label: 'Deep Conversations', emoji: '💬' },
      { id: 'gaming', label: 'Gaming & Sci-Fi', emoji: '🎮' },
      { id: 'hiking', label: 'Hiking & Nature', emoji: '🌲' },
      { id: 'drives', label: 'Late Night Drives', emoji: '🚗' },
      { id: 'music', label: 'Live Music & Concerts', emoji: '🎵' },
      { id: 'meditation', label: 'Meditation & Mindfulness', emoji: '🧘' },
      { id: 'photo', label: 'Photography', emoji: '📸' },
      { id: 'books', label: 'Reading & Literature', emoji: '📚' },
      { id: 'stars', label: 'Stargazing & Astronomy', emoji: '🌌' },
      { id: 'travel', label: 'Travel & Exploration', emoji: '✈️' },
      { id: 'gym', label: 'Weightlifting & Fitness', emoji: '🏋️' },
      { id: 'poetry', label: 'Writing & Poetry', emoji: '✍️' }
    ]
  },
  lookingFor: {
    title: 'Looking For',
    icon: Heart,
    isMultiSelect: false,
    options: [
      { id: 'ltr', label: 'Long-term relationship', emoji: '💘', description: 'Seeking a committed, lasting romantic partnership' },
      { id: 'lt_open_st', label: 'Long-term, open to short', emoji: '✨', description: 'Looking for a future partner, but open to seeing where things go' },
      { id: 'st_open_lt', label: 'Short-term, open to long', emoji: '🥂', description: 'Casual dating initially, with potential for deeper chemistry' },
      { id: 'st_fun', label: 'Short-term fun', emoji: '🎉', description: 'Spontaneous dates and lighthearted experiences' },
      { id: 'friends', label: 'New friends & kindred spirits', emoji: '🫂', description: 'Platonic friendship, shared passions, and heartfelt conversation' },
      { id: 'figuring_out', label: 'Still figuring it out', emoji: '🧐', description: 'Taking time to explore personal connections and discover myself' }
    ]
  },
  languages: {
    title: 'Languages I Know',
    icon: Globe,
    isMultiSelect: true,
    options: [
      { id: 'en', label: 'English', emoji: '🇬🇧' },
      { id: 'si', label: 'Sinhala', emoji: '🇱🇰' },
      { id: 'ta', label: 'Tamil', emoji: '🇱🇰' },
      { id: 'es', label: 'Spanish', emoji: '🇪🇸' },
      { id: 'fr', label: 'French', emoji: '🇫🇷' },
      { id: 'de', label: 'German', emoji: '🇩🇪' },
      { id: 'ja', label: 'Japanese', emoji: '🇯🇵' },
      { id: 'zh', label: 'Mandarin', emoji: '🇨🇳' },
      { id: 'ar', label: 'Arabic', emoji: '🇦🇪' },
      { id: 'ru', label: 'Russian', emoji: '🇷🇺' },
      { id: 'it', label: 'Italian', emoji: '🇮🇹' }
    ]
  },
  zodiac: {
    title: 'Zodiac Sign',
    icon: Moon,
    isMultiSelect: false,
    options: [
      { id: 'ari', label: 'Aries (Mar 21 - Apr 19)', emoji: '♈' },
      { id: 'tau', label: 'Taurus (Apr 20 - May 20)', emoji: '♉' },
      { id: 'gem', label: 'Gemini (May 21 - Jun 20)', emoji: '♊' },
      { id: 'can', label: 'Cancer (Jun 21 - Jul 22)', emoji: '♋' },
      { id: 'leo', label: 'Leo (Jul 23 - Aug 22)', emoji: '♌' },
      { id: 'vir', label: 'Virgo (Aug 23 - Sep 22)', emoji: '♍' },
      { id: 'lib', label: 'Libra (Sep 23 - Oct 22)', emoji: '♎' },
      { id: 'sco', label: 'Scorpio (Oct 23 - Nov 21)', emoji: '♏' },
      { id: 'sag', label: 'Sagittarius (Nov 22 - Dec 21)', emoji: '♐' },
      { id: 'cap', label: 'Capricorn (Dec 22 - Jan 19)', emoji: '♑' },
      { id: 'aqu', label: 'Aquarius (Jan 20 - Feb 18)', emoji: '♒' },
      { id: 'pis', label: 'Pisces (Feb 19 - Mar 20)', emoji: '♓' }
    ]
  },
  education: {
    title: 'Education',
    icon: BookOpen,
    isMultiSelect: false,
    options: [
      { id: 'hs', label: 'High School', emoji: '🎒' },
      { id: 'college', label: 'In College / University', emoji: '🏛️' },
      { id: 'ug', label: 'Undergraduate Degree', emoji: '🎓' },
      { id: 'grad_curr', label: 'In Graduate School', emoji: '📖' },
      { id: 'masters', label: 'Master’s Degree', emoji: '📜' },
      { id: 'phd', label: 'PhD / Doctorate', emoji: '🔬' },
      { id: 'trade', label: 'Trade / Vocational School', emoji: '🛠️' }
    ]
  },
  familyPlans: {
    title: 'Family Plans',
    icon: Users,
    isMultiSelect: false,
    options: [
      { id: 'want_kids', label: 'I want children', emoji: '👶' },
      { id: 'no_kids', label: 'I don’t want children', emoji: '🚫' },
      { id: 'have_and_want', label: 'I have children & want more', emoji: '👨‍👩‍👧' },
      { id: 'have_and_no', label: 'I have children & don’t want more', emoji: '👨‍👧' },
      { id: 'open_future', label: 'Open to children in the future', emoji: '🌱' },
      { id: 'not_sure', label: 'Not sure yet', emoji: '🤔' }
    ]
  },
  communicationStyle: {
    title: 'Communication Style',
    icon: MessageSquare,
    isMultiSelect: false,
    options: [
      { id: 'big_texter', label: 'Big time texter', emoji: '📱', description: 'Replies within seconds with energetic messages' },
      { id: 'caller', label: 'Phone caller & FaceTime', emoji: '📞', description: 'Prefers real human voices over long text paragraphs' },
      { id: 'voice_notes', label: 'Late night voice notes', emoji: '🎙️', description: 'Loves sending and receiving heartfelt audio recordings' },
      { id: 'in_person', label: 'Slow texter / in person', emoji: '🚶', description: 'Unplugged throughout the day; present when together' },
      { id: 'bad_text_great_real', label: 'Bad at texting, great in real life', emoji: '🤝', description: 'Terrible typing thumbs but wonderful company' }
    ]
  },
  loveStyle: {
    title: 'Love Style / Love Language',
    icon: Heart,
    isMultiSelect: false,
    options: [
      { id: 'words', label: 'Words of Affirmation', emoji: '💌', description: 'Kind words, handwritten letters, and gentle reassurances' },
      { id: 'time', label: 'Quality Time', emoji: '⏳', description: 'Undivided attention, shared silence, and joint adventures' },
      { id: 'touch', label: 'Physical Touch', emoji: '🫂', description: 'Holding hands, warm embraces, and grounding physical closeness' },
      { id: 'service', label: 'Acts of Service', emoji: '☕', description: 'Making breakfast, fixing things, and easing life burdens' },
      { id: 'gifts', label: 'Receiving Gifts', emoji: '🎁', description: 'Thoughtful tokens that show someone remembered you' }
    ]
  },
  pets: {
    title: 'Pets',
    icon: PawPrint,
    isMultiSelect: false,
    options: [
      { id: 'dog', label: 'Dog lover', emoji: '🐕' },
      { id: 'cat', label: 'Cat lover', emoji: '🐈' },
      { id: 'both', label: 'Have both cats & dogs', emoji: '🐾' },
      { id: 'exotic', label: 'Bird / Reptile / Exotic pets', emoji: '🦜' },
      { id: 'none', label: 'Pet-free', emoji: '🚫' },
      { id: 'allergic', label: 'Allergic to pets', emoji: '🤧' }
    ]
  },
  drinking: {
    title: 'Drinking Habits',
    icon: Coffee,
    isMultiSelect: false,
    options: [
      { id: 'sober', label: 'Not for me (Sober)', emoji: '🍵' },
      { id: 'curious', label: 'Sober curious', emoji: '🌱' },
      { id: 'social', label: 'Socially on weekends', emoji: '🥂' },
      { id: 'occasions', label: 'Special occasions only', emoji: '🍾' },
      { id: 'frequent', label: 'Most nights', emoji: '🍷' }
    ]
  },
  smoking: {
    title: 'Smoking Habits',
    icon: Cigarette,
    isMultiSelect: false,
    options: [
      { id: 'non', label: 'Non-smoker', emoji: '🚭' },
      { id: 'social_smoker', label: 'Social smoker', emoji: '💨' },
      { id: 'with_drinks', label: 'Smoker with drinks', emoji: '🍻' },
      { id: 'regular', label: 'Regular smoker', emoji: '🚬' },
      { id: 'quitting', label: 'Trying to quit', emoji: '🌿' }
    ]
  },
  workout: {
    title: 'Workout & Fitness',
    icon: Dumbbell,
    isMultiSelect: false,
    options: [
      { id: 'daily', label: 'Every single day', emoji: '⚡' },
      { id: 'often', label: 'Often (4-5x / week)', emoji: '💪' },
      { id: 'sometimes', label: 'Sometimes (1-2x / week)', emoji: '🏃' },
      { id: 'rarely', label: 'Rarely / Never', emoji: '🛋️' },
      { id: 'walks', label: 'Active walks & Nature trails', emoji: '🌿' }
    ]
  }
};

interface LifestyleSelectModalProps {
  category: LifestyleCategoryKey | null;
  isOpen: boolean;
  onClose: () => void;
  currentValue: string | string[];
  onSave: (category: LifestyleCategoryKey, value: string | string[]) => void;
}

export const LifestyleSelectModal: React.FC<LifestyleSelectModalProps> = ({
  category,
  isOpen,
  onClose,
  currentValue,
  onSave
}) => {
  if (!isOpen || !category) return null;

  const catalog = LIFESTYLE_CATALOG[category];
  const [selectedSingle, setSelectedSingle] = React.useState<string>(
    typeof currentValue === 'string' ? currentValue : (currentValue[0] || '')
  );
  const [selectedMulti, setSelectedMulti] = React.useState<string[]>(
    Array.isArray(currentValue) ? currentValue : (currentValue ? [currentValue] : [])
  );

  const handleToggleMulti = (label: string) => {
    if (selectedMulti.includes(label)) {
      setSelectedMulti(selectedMulti.filter(item => item !== label));
    } else {
      setSelectedMulti([...selectedMulti, label]);
    }
  };

  const handleSelectSingle = (label: string) => {
    setSelectedSingle(label);
    onSave(category, label);
    onClose();
  };

  const handleSaveMulti = () => {
    onSave(category, selectedMulti);
    onClose();
  };

  const Icon = catalog.icon;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={catalog.title}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
          <Icon className="w-4 h-4 text-white shrink-0" />
          <span>
            {catalog.isMultiSelect 
              ? 'Select all that match your lifestyle and identity.' 
              : 'Choose the option that best reflects who you are.'}
          </span>
        </div>

        <div className="max-h-[50vh] overflow-y-auto no-scrollbar space-y-1.5 pr-1">
          {catalog.options.map(opt => {
            const isSelected = catalog.isMultiSelect
              ? selectedMulti.includes(opt.label)
              : selectedSingle === opt.label || selectedSingle.toLowerCase() === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => {
                  if (catalog.isMultiSelect) {
                    handleToggleMulti(opt.label);
                  } else {
                    handleSelectSingle(opt.label);
                  }
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected 
                    ? 'bg-white text-[#090A0E] font-bold shadow-md border-white' 
                    : 'bg-white/[0.03] text-zinc-200 border-white/10 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {opt.emoji && <span className="text-lg shrink-0">{opt.emoji}</span>}
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate">{opt.label}</span>
                    {opt.description && (
                      <span className={`text-[10px] block line-clamp-1 ${
                        isSelected ? 'text-[#090A0E]/75' : 'text-zinc-400'
                      }`}>
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-[#090A0E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  catalog.isMultiSelect && (
                    <div className="w-5 h-5 rounded-full border border-white/20 shrink-0" />
                  )
                )}
              </button>
            );
          })}
        </div>

        {catalog.isMultiSelect && (
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-xs text-zinc-400">
              {selectedMulti.length} selected
            </span>
            <GlassButton
              variant="primary"
              onClick={handleSaveMulti}
              className="text-xs py-1.5 px-4 font-bold"
            >
              Done
            </GlassButton>
          </div>
        )}
      </div>
    </GlassModal>
  );
};
