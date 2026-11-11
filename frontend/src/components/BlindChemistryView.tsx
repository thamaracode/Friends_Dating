import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Heart, 
  X, 
  HelpCircle, 
  ShieldCheck, 
  Lock, 
  CheckCircle,
  MessageCircle,
  Quote,
  Film
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';
import type { UserProfile } from '../types';

interface BlindChemistryViewProps {
  onOpenRevealedChat: (profile: UserProfile) => void;
}

export interface AnonymousCharacterCard {
  anonymousId: string;
  avatarSilhouetteEmoji: string;
  aliasTitle: string; // e.g. "The Nocturnal Stargazer"
  lifeMovieGenre: string;
  openingScene: string;
  villainOriginStory: string;
  quote: string;
  interests: string[];
  compatibilityScore: number;
  stage: 'ANONYMOUS' | 'LIKE_PENDING' | 'MUTUAL_INTEREST' | 'REVEALED';
  underlyingProfile: UserProfile;
}

export const BlindChemistryView: React.FC<BlindChemistryViewProps> = ({
  onOpenRevealedChat
}) => {
  const [characterCards, setCharacterCards] = useState<AnonymousCharacterCard[]>([
    {
      anonymousId: 'anon_1',
      avatarSilhouetteEmoji: '🌌',
      aliasTitle: 'The Nocturnal Game Architect',
      lifeMovieGenre: 'Cosmic Indie Mystery',
      openingScene: 'Analyzing orbital planetary trajectories in a Kandy hilltop observatory at 2 AM.',
      villainOriginStory: "Being told to 'hurry up and pick something basic' at a vinyl record shop.",
      quote: "Some stories are better when you don't know the ending.",
      interests: ['Indie Games', 'Astronomy', 'Psychology', 'Synthesizers'],
      compatibilityScore: 91,
      stage: 'ANONYMOUS',
      underlyingProfile: MOCK_PROFILES[0] // Alex
    },
    {
      anonymousId: 'anon_2',
      avatarSilhouetteEmoji: '📷',
      aliasTitle: 'The Film Noir Observer',
      lifeMovieGenre: 'Atmospheric French New Wave',
      openingScene: 'Walking through Pettah rain with a 35mm film camera watching people tell stories without words.',
      villainOriginStory: 'Someone taking a picture only for social validation rather than capturing a feeling.',
      quote: "I look calm because my imagination is somewhere in the cosmos.",
      interests: ['Cinematography', 'Literature', 'Film Noir', 'Ambient Lo-Fi'],
      compatibilityScore: 94,
      stage: 'MUTUAL_INTEREST', // ready to reveal
      underlyingProfile: MOCK_PROFILES[1] // Tara
    }
  ]);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const currentCard = characterCards[activeCardIndex];

  const handleLikeAnonymous = (card: AnonymousCharacterCard) => {
    setCharacterCards(prev => prev.map(c => {
      if (c.anonymousId === card.anonymousId) {
        // If it was already mutual interest, trigger reveal
        return {
          ...c,
          stage: c.stage === 'MUTUAL_INTEREST' ? 'REVEALED' : 'LIKE_PENDING'
        };
      }
      return c;
    }));
  };

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % characterCards.length);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col space-y-4 px-3 pt-2 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#FFB4CE]">
            <Sparkles className="w-4 h-4 text-[#FF4F87]" />
            <span>BLIND CHEMISTRY (ANONYMOUS FIRST)</span>
          </div>
          <h1 className="text-xl font-black text-[#FFF1F3] tracking-tight">Personality Before Appearance</h1>
          <p className="text-xs text-[#B9A8B3]">
            True privacy-first discovery. Real photos and identities are locked until mutual curiosity is verified.
          </p>
        </div>
      </div>

      {currentCard ? (
        <div className="space-y-4">
          {/* Main Anonymous Character Sheet */}
          <div className="p-6 rounded-3xl glass-panel-elevated border border-[#FF78A8]/30 space-y-5 pink-ambient-glow relative overflow-hidden">
            {/* Header / Avatar Silhouette */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1B121D] to-[#241827] border-2 border-[#FF78A8]/40 flex items-center justify-center text-3xl shadow-lg">
                  {currentCard.avatarSilhouetteEmoji}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#FFF1F3]">{currentCard.aliasTitle}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#B9A8B3] mt-0.5">
                    <span className="text-[#FFB4CE] font-semibold">{currentCard.lifeMovieGenre}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{currentCard.compatibilityScore}% Compatibility</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revealed State Check */}
            {currentCard.stage === 'REVEALED' ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3 animate-fadeIn">
                <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>Mutual Consent Granted! Identity Unlocked</span>
                </div>

                <div className="flex items-center justify-center gap-3 py-2">
                  <img 
                    src={currentCard.underlyingProfile.avatar} 
                    alt={currentCard.underlyingProfile.name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FF4F87] shadow-xl"
                  />
                  <div className="text-left">
                    <h4 className="text-sm font-black text-[#FFF1F3]">{currentCard.underlyingProfile.name}, {currentCard.underlyingProfile.age}</h4>
                    <p className="text-xs text-[#B9A8B3]">{currentCard.underlyingProfile.location}</p>
                    <span className="text-[10px] text-[#FF4F87] font-bold">Safe transition to full chat</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenRevealedChat(currentCard.underlyingProfile)}
                  className="w-full py-2.5 rounded-xl pink-gradient-btn text-xs font-bold shadow-md cursor-pointer"
                >
                  Start Verified Direct Chat →
                </button>
              </div>
            ) : (
              <>
                {/* Quote Card */}
                <div className="p-3.5 rounded-2xl bg-[#100B12]/80 border border-[#FF78A8]/20 space-y-1">
                  <span className="text-[10px] font-bold text-[#FFB4CE] uppercase flex items-center gap-1">
                    <Quote className="w-3 h-3 text-[#FF4F87]" />
                    <span>Personal Philosophy:</span>
                  </span>
                  <p className="text-xs text-[#FFF1F3] italic leading-relaxed">
                    "{currentCard.quote}"
                  </p>
                </div>

                {/* Opening Scene Scenario */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#FFB4CE]">🎬 Life Opening Scene:</span>
                  <p className="text-[#FFF1F3] leading-relaxed p-3 rounded-2xl glass-panel">
                    {currentCard.openingScene}
                  </p>
                </div>

                {/* Villain Origin Story */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#FFB4CE]">⚡ Villain Origin Story:</span>
                  <p className="text-[#FFF1F3] leading-relaxed p-3 rounded-2xl glass-panel">
                    "{currentCard.villainOriginStory}"
                  </p>
                </div>

                {/* Interests Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#B9A8B3]">Obsessions & Passions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCard.interests.map((interest, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#100B12] border border-[#FF78A8]/30 text-[#FFB4CE]">
                        #{interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={handleNextCard}
                    className="flex-1 py-3 rounded-2xl glass-panel text-xs text-[#B9A8B3] hover:text-[#FFF1F3] font-semibold cursor-pointer"
                  >
                    Next Mystery
                  </button>

                  <button
                    onClick={() => handleLikeAnonymous(currentCard)}
                    className="flex-1 py-3 rounded-2xl pink-gradient-btn text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-transform active:scale-95"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{currentCard.stage === 'MUTUAL_INTEREST' ? 'Unlock Reveal!' : 'Send Mystery Like'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
