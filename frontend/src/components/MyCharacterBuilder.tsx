import React, { useState } from 'react';
import { 
  Sparkles, 
  Film, 
  Quote, 
  RefreshCw, 
  Save, 
  Heart, 
  Check, 
  Layers, 
  Shuffle, 
  Flame,
  Volume2
} from 'lucide-react';
import { GENDER_PROMPT_PACKS, ORIGINAL_QUOTES } from '../characterPromptsData';
import type { UserCharacterUniverse } from '../characterPromptsData';

interface MyCharacterBuilderProps {
  onSaveUniverse?: (universe: UserCharacterUniverse) => void;
  onClose?: () => void;
}

export const MyCharacterBuilder: React.FC<MyCharacterBuilderProps> = ({
  onSaveUniverse,
  onClose
}) => {
  const [activePack, setActivePack] = useState<'men' | 'women' | 'universal'>('universal');
  const [lifeMovieTitle, setLifeMovieTitle] = useState("Midnight Overthinking & The Art of Finding Rare Humans");
  const [playedByActor, setPlayedByActor] = useState("Timothée Chalamet / A quiet indie protagonist");
  const [lifeGenre, setLifeGenre] = useState("Indie Comedy / Atmospheric Drama");
  const [openingScene, setOpeningScene] = useState("Sitting by a rainy window in a Colombo tea room with lo-fi music playing in wired headphones.");
  const [villainOriginStory, setVillainOriginStory] = useState("Someone telling me 'it’s not that deep' after I poured my soul into a thought.");
  const [hiddenSuperpower, setHiddenSuperpower] = useState("Making introverts feel completely safe to speak without fear of being judged.");
  const [fictionalUniverse, setFictionalUniverse] = useState("Studio Ghibli's seaside town in Kiki's Delivery Service");
  
  const [quoteIndex, setQuoteIndex] = useState(0);
  const currentQuote = ORIGINAL_QUOTES[quoteIndex];

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % ORIGINAL_QUOTES.length);
  };

  const handleSave = () => {
    const universeData: UserCharacterUniverse = {
      lifeMovieTitle,
      playedByActor,
      lifeGenre,
      openingScene,
      villainOriginStory,
      endingScene: "Driving towards the misty mountains with someone who understands comfortable silence.",
      hiddenSuperpower,
      fictionalUniverse,
      selectedQuote: currentQuote,
      hypotheticalAnswers: [
        {
          questionId: 'u_1',
          question: "My villain origin story...",
          answer: villainOriginStory
        }
      ]
    };

    if (onSaveUniverse) {
      onSaveUniverse(universeData);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col space-y-4 px-3 pt-2 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#E5E7EB]">
            <Film className="w-4 h-4 text-[#FFFFFF]" />
            <span>MY CHARACTER UNIVERSE</span>
          </div>
          <h1 className="text-xl font-black text-[#F3F4F6] tracking-tight">Introduce Yourself Imaginatively</h1>
          <p className="text-xs text-[#9CA3AF]">Skip the boring biography. Show your fictional alter ego, cinema tropes, and mind.</p>
        </div>
      </div>

      {/* Gender-Aware Pack Selector */}
      <div className="flex p-1 rounded-2xl glass-panel-elevated">
        <button
          onClick={() => setActivePack('universal')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activePack === 'universal' 
              ? 'bg-[#FFFFFF] text-[#F3F4F6] shadow-[0_0_12px_rgba(255,79,135,0.6)]' 
              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
        >
          Universal Pack
        </button>
        <button
          onClick={() => setActivePack('men')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activePack === 'men' 
              ? 'bg-[#FFFFFF] text-[#F3F4F6] shadow-[0_0_12px_rgba(255,79,135,0.6)]' 
              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
        >
          Men’s Prompts
        </button>
        <button
          onClick={() => setActivePack('women')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activePack === 'women' 
              ? 'bg-[#FFFFFF] text-[#F3F4F6] shadow-[0_0_12px_rgba(255,79,135,0.6)]' 
              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
        >
          Women’s Prompts
        </button>
      </div>

      {/* Quote Generator Card */}
      <div className="p-4 rounded-3xl glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 space-y-3 glass-panel relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E5E7EB]">
            <Quote className="w-4 h-4 text-[#FFFFFF]" />
            <span>Personality Quote Generator</span>
          </div>
          <button
            onClick={handleNextQuote}
            className="flex items-center gap-1 text-xs text-[#FFFFFF] hover:text-[#E5E7EB] font-bold cursor-pointer transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Roll Another</span>
          </button>
        </div>

        <p className="text-sm font-medium text-[#F3F4F6] italic leading-relaxed pl-2 border-l-2 border-[#FFFFFF]">
          "{currentQuote.text}"
        </p>

        <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] pt-1">
          <span>Vibe: <strong className="text-[#E5E7EB]">{currentQuote.authorOrMood}</strong></span>
          <span className="text-[10px] text-emerald-400 font-semibold">Active on Character Card</span>
        </div>
      </div>

      {/* Cinematic Personality Questions Inputs */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-bold text-[#E5E7EB] tracking-wider px-1">
          Cinematic Personality Elements
        </span>

        {/* 1. Life Movie Title */}
        <div className="p-3.5 rounded-2xl glass-panel space-y-1.5">
          <label className="text-xs font-bold text-[#F3F4F6] flex items-center justify-between">
            <span>🎬 If my life were an indie movie, it would be called:</span>
          </label>
          <input 
            type="text"
            value={lifeMovieTitle}
            onChange={(e) => setLifeMovieTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#090A0E]/80 border border-[rgba(255,255,255,0.20)]/20 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
          />
        </div>

        {/* 2. Played by actor */}
        <div className="p-3.5 rounded-2xl glass-panel space-y-1.5">
          <label className="text-xs font-bold text-[#F3F4F6] flex items-center justify-between">
            <span>🎭 My character would be played by:</span>
          </label>
          <input 
            type="text"
            value={playedByActor}
            onChange={(e) => setPlayedByActor(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#090A0E]/80 border border-[rgba(255,255,255,0.20)]/20 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
          />
        </div>

        {/* 3. Villain Origin Story */}
        <div className="p-3.5 rounded-2xl glass-panel space-y-1.5">
          <label className="text-xs font-bold text-[#F3F4F6] flex items-center justify-between">
            <span>⚡ My villain origin story would be:</span>
          </label>
          <textarea 
            rows={2}
            value={villainOriginStory}
            onChange={(e) => setVillainOriginStory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#090A0E]/80 border border-[rgba(255,255,255,0.20)]/20 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF] resize-none"
          />
        </div>

        {/* 4. Hidden Superpower */}
        <div className="p-3.5 rounded-2xl glass-panel space-y-1.5">
          <label className="text-xs font-bold text-[#F3F4F6] flex items-center justify-between">
            <span>✨ My hidden superpower that people don't notice at first:</span>
          </label>
          <input 
            type="text"
            value={hiddenSuperpower}
            onChange={(e) => setHiddenSuperpower(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#090A0E]/80 border border-[rgba(255,255,255,0.20)]/20 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
          />
        </div>

        {/* 5. Fictional Universe */}
        <div className="p-3.5 rounded-2xl glass-panel space-y-1.5">
          <label className="text-xs font-bold text-[#F3F4F6] flex items-center justify-between">
            <span>🌌 The fictional universe I would escape into:</span>
          </label>
          <input 
            type="text"
            value={fictionalUniverse}
            onChange={(e) => setFictionalUniverse(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#090A0E]/80 border border-[rgba(255,255,255,0.20)]/20 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl gray-glass-btn font-bold text-xs flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-transform active:scale-95"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Universe Updated & Synced!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Display On My Character Card</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
