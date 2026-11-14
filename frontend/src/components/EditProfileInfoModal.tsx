import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  Check, 
  Heart, 
  Compass, 
  Music, 
  Phone, 
  MessageSquare, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  Save, 
  X,
  Languages,
  Smile,
  Disc3,
  Coffee,
  BatteryCharging,
  Sliders
} from 'lucide-react';
import { 
  FullUserAttributes, 
  loadUserAttributes, 
  saveUserAttributes,
  DEFAULT_USER_ATTRIBUTES
} from '../types/tinderFeatures';
import { GlassModal, GlassButton, GlassPrimaryButton } from './klyven';
import { useSpotifyMusic } from '../context/SpotifyMusicContext';

interface EditProfileInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttributesUpdated?: (updated: FullUserAttributes) => void;
}

export const EditProfileInfoModal: React.FC<EditProfileInfoModalProps> = ({
  isOpen,
  onClose,
  onAttributesUpdated
}) => {
  const [attributes, setAttributes] = useState<FullUserAttributes>(loadUserAttributes);
  const [activeTab, setActiveTab] = useState<'essentials' | 'lifestyle' | 'prompts' | 'anthem'>('essentials');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const { linkSpotify } = useSpotifyMusic();

  if (!isOpen) return null;

  // Compute profile completion percentage dynamically
  const calculateCompletion = (attrs: FullUserAttributes): number => {
    let score = 0;
    const totalFields = 16;
    if (attrs.essentials.heightCm > 0) score++;
    if (attrs.essentials.job) score++;
    if (attrs.essentials.location) score++;
    if (attrs.essentials.zodiac) score++;
    if (attrs.essentials.languages.length > 0) score++;
    if (attrs.lifestyle.lookingFor) score++;
    if (attrs.lifestyle.communicationStyle) score++;
    if (attrs.lifestyle.loveStyle) score++;
    if (attrs.lifestyle.pets) score++;
    if (attrs.lifestyle.drinking) score++;
    if (attrs.lifestyle.workout) score++;
    if (attrs.prompts.greenFlag) score++;
    if (attrs.prompts.perksOfDating) score++;
    if (attrs.prompts.weekendsFor) score++;
    if (attrs.prompts.saturdayNight) score++;
    if (attrs.anthem.trackId) score++;

    return Math.round((score / totalFields) * 100);
  };

  const handleSave = () => {
    const completion = calculateCompletion(attributes);
    const updated = { ...attributes, completionPercentage: completion };
    setAttributes(updated);
    saveUserAttributes(updated);
    if (onAttributesUpdated) {
      onAttributesUpdated(updated);
    }
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 1000);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile Information"
      maxWidth="lg"
    >
      <div className="space-y-5">
        
        {/* Profile Completion Header Progress Bar */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>Profile Strength & Completion</span>
            </span>
            <span className="font-mono font-bold text-white">
              {calculateCompletion(attributes)}% Complete
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)]"
              style={{ width: `${calculateCompletion(attributes)}%` }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'essentials', label: 'Essentials & Basics' },
            { id: 'lifestyle', label: 'Lifestyle & Habits' },
            { id: 'prompts', label: 'Connection Prompts' },
            { id: 'anthem', label: 'Spotify Anthem' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                activeTab === tab.id ? 'bg-white text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ESSENTIALS & BASICS */}
        {activeTab === 'essentials' && (
          <div className="space-y-4 animate-fadeIn max-h-[55vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Height */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 flex items-center gap-1.5">
                  <span>📏 Height (cm)</span>
                </label>
                <input
                  type="number"
                  value={attributes.essentials.heightCm}
                  onChange={e => setAttributes({
                    ...attributes,
                    essentials: { ...attributes.essentials, heightCm: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* Job */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 flex items-center gap-1.5">
                  <span>💼 Work / Title</span>
                </label>
                <input
                  type="text"
                  value={attributes.essentials.job}
                  onChange={e => setAttributes({
                    ...attributes,
                    essentials: { ...attributes.essentials, job: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* School / Company */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 flex items-center gap-1.5">
                  <span>🎓 College / Organization</span>
                </label>
                <input
                  type="text"
                  value={attributes.essentials.schoolOrCompany}
                  onChange={e => setAttributes({
                    ...attributes,
                    essentials: { ...attributes.essentials, schoolOrCompany: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 flex items-center gap-1.5">
                  <span>🏠 Current Location</span>
                </label>
                <input
                  type="text"
                  value={attributes.essentials.location}
                  onChange={e => setAttributes({
                    ...attributes,
                    essentials: { ...attributes.essentials, location: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* Zodiac */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 flex items-center gap-1.5">
                  <span>✨ Zodiac Sign</span>
                </label>
                <select
                  value={attributes.essentials.zodiac}
                  onChange={e => setAttributes({
                    ...attributes,
                    essentials: { ...attributes.essentials, zodiac: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#12141B] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all cursor-pointer"
                >
                  {['♒ Aquarius', '♓ Pisces', '♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo', '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn'].map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              {/* Hometown */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 flex items-center gap-1.5">
                  <span>📍 Hometown</span>
                </label>
                <input
                  type="text"
                  value={attributes.essentials.hometown}
                  onChange={e => setAttributes({
                    ...attributes,
                    essentials: { ...attributes.essentials, hometown: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all"
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: LIFESTYLE & HABITS (Image 1) */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-3.5 animate-fadeIn max-h-[55vh] overflow-y-auto pr-1">
            
            {/* Looking For Card (Image 11) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span>Looking For (Intent & Relationship Goals)</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { emoji: '🧐', label: 'Still figuring it out' },
                  { emoji: '💍', label: 'Long-term relationship' },
                  { emoji: '☕', label: 'Casual dating' },
                  { emoji: '🌌', label: 'Deep soul connection' },
                  { emoji: '🤝', label: 'Meaningful friendship' }
                ].map(item => {
                  const isSelected = attributes.lifestyle.lookingFor === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setAttributes({
                        ...attributes,
                        lifestyle: {
                          ...attributes.lifestyle,
                          lookingFor: item.label,
                          lookingForEmoji: item.emoji
                        }
                      })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-[#090A0E] border-white font-bold'
                          : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lifestyle Grid: Communication, Love Style, Pets, Drinking, Workout, Family Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Communication Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 block">💬 Communication Style</label>
                <select
                  value={attributes.lifestyle.communicationStyle}
                  onChange={e => setAttributes({
                    ...attributes,
                    lifestyle: { ...attributes.lifestyle, communicationStyle: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#12141B] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all cursor-pointer"
                >
                  <option value="Big time texter & late night voice notes">Big time texter & late night voice notes</option>
                  <option value="Phone caller over texting">Phone caller over texting</option>
                  <option value="Video chat enthusiast">Video chat enthusiast</option>
                  <option value="Bad texter but great in person">Bad texter but great in person</option>
                </select>
              </div>

              {/* Love Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 block">💌 Love Style</label>
                <select
                  value={attributes.lifestyle.loveStyle}
                  onChange={e => setAttributes({
                    ...attributes,
                    lifestyle: { ...attributes.lifestyle, loveStyle: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#12141B] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all cursor-pointer"
                >
                  <option value="Words of affirmation & Quality time">Words of affirmation & Quality time</option>
                  <option value="Quality time exclusively">Quality time exclusively</option>
                  <option value="Physical touch & presence">Physical touch & presence</option>
                  <option value="Acts of service & kindness">Acts of service & kindness</option>
                  <option value="Thoughtful gifts & surprises">Thoughtful gifts & surprises</option>
                </select>
              </div>

              {/* Pets */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 block">🐾 Pets</label>
                <select
                  value={attributes.lifestyle.pets}
                  onChange={e => setAttributes({
                    ...attributes,
                    lifestyle: { ...attributes.lifestyle, pets: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#12141B] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all cursor-pointer"
                >
                  <option value="Dog lover & Cat friendly">Dog lover & Cat friendly</option>
                  <option value="Dog parent">Dog parent</option>
                  <option value="Cat guardian">Cat guardian</option>
                  <option value="Don't have pets but want one">Don't have pets but want one</option>
                  <option value="No pets">No pets</option>
                </select>
              </div>

              {/* Drinking */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 block">🍷 Drinking</label>
                <select
                  value={attributes.lifestyle.drinking}
                  onChange={e => setAttributes({
                    ...attributes,
                    lifestyle: { ...attributes.lifestyle, drinking: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#12141B] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all cursor-pointer"
                >
                  <option value="Socially on weekends">Socially on weekends</option>
                  <option value="Never / Teetotaler">Never / Teetotaler</option>
                  <option value="On special occasions">On special occasions</option>
                  <option value="Most weekends">Most weekends</option>
                </select>
              </div>

              {/* Smoking */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 block">🚬 Smoking</label>
                <select
                  value={attributes.lifestyle.smoking}
                  onChange={e => setAttributes({
                    ...attributes,
                    lifestyle: { ...attributes.lifestyle, smoking: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#12141B] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all cursor-pointer"
                >
                  <option value="Non-smoker">Non-smoker</option>
                  <option value="Social smoker">Social smoker</option>
                  <option value="Regular smoker">Regular smoker</option>
                </select>
              </div>

              {/* Workout */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 block">🏋️ Workout</label>
                <select
                  value={attributes.lifestyle.workout}
                  onChange={e => setAttributes({
                    ...attributes,
                    lifestyle: { ...attributes.lifestyle, workout: e.target.value }
                  })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#12141B] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all cursor-pointer"
                >
                  <option value="Often (4x/week)">Often (4x/week)</option>
                  <option value="Every day">Every day</option>
                  <option value="Sometimes / Weekend runs">Sometimes / Weekend runs</option>
                  <option value="Never">Never</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: PROMPTS (Images 12, 13, 14) */}
        {activeTab === 'prompts' && (
          <div className="space-y-4 animate-fadeIn max-h-[55vh] overflow-y-auto pr-1">
            
            {/* Green Flag Prompt (Image 12) */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <label className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                <span>💬 My biggest green flag is...</span>
              </label>
              <textarea
                value={attributes.prompts.greenFlag}
                onChange={e => setAttributes({
                  ...attributes,
                  prompts: { ...attributes.prompts, greenFlag: e.target.value }
                })}
                rows={2}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Perks of Dating Me Prompt (Image 12) */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <label className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                <span>💬 Perks of dating me...</span>
              </label>
              <textarea
                value={attributes.prompts.perksOfDating}
                onChange={e => setAttributes({
                  ...attributes,
                  prompts: { ...attributes.prompts, perksOfDating: e.target.value }
                })}
                rows={2}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Habit Prompts (Image 13) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 block">I prefer receiving...</label>
                <input
                  type="text"
                  value={attributes.prompts.receivePreference}
                  onChange={e => setAttributes({
                    ...attributes,
                    prompts: { ...attributes.prompts, receivePreference: e.target.value }
                  })}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <label className="text-xs font-heading font-medium text-zinc-300 block">My phone is always...</label>
                <input
                  type="text"
                  value={attributes.prompts.phoneAlways}
                  onChange={e => setAttributes({
                    ...attributes,
                    prompts: { ...attributes.prompts, phoneAlways: e.target.value }
                  })}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
            </div>

            {/* My Weekends Prompts (Image 14) */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <label className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                <span>💬 My Weekends</span>
              </label>
              
              <div className="space-y-2.5">
                <div>
                  <span className="text-xs font-heading font-medium text-zinc-300 block mb-1">Weekends are for...</span>
                  <input
                    type="text"
                    value={attributes.prompts.weekendsFor}
                    onChange={e => setAttributes({
                      ...attributes,
                      prompts: { ...attributes.prompts, weekendsFor: e.target.value }
                    })}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div>
                  <span className="text-xs font-heading font-medium text-zinc-300 block mb-1">Saturday night looks like...</span>
                  <input
                    type="text"
                    value={attributes.prompts.saturdayNight}
                    onChange={e => setAttributes({
                      ...attributes,
                      prompts: { ...attributes.prompts, saturdayNight: e.target.value }
                    })}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div>
                  <span className="text-xs font-heading font-medium text-zinc-300 block mb-1">A typical Sunday looks like...</span>
                  <input
                    type="text"
                    value={attributes.prompts.typicalSunday}
                    onChange={e => setAttributes({
                      ...attributes,
                      prompts: { ...attributes.prompts, typicalSunday: e.target.value }
                    })}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SPOTIFY ANTHEM (Image 13) */}
        {activeTab === 'anthem' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Music className="w-4 h-4 text-[#1DB954]" />
                <span>🎵 My Anthem (Your Profile Soundtrack)</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your signature song. Other members can listen to your anthem directly while browsing your profile or worlds.
              </p>

              {/* Anthem Preview Card */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-3.5">
                <img
                  src={attributes.anthem.coverUrl}
                  alt={attributes.anthem.title}
                  className="w-14 h-14 rounded-xl object-cover border border-white/15 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-[#1DB954]" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.309c-.215.353-.675.467-1.028.252-2.816-1.722-6.36-2.112-10.536-1.157-.403.092-.806-.157-.899-.56-.092-.403.157-.806.56-.899 4.568-1.044 8.5-608 11.651 1.336.353.215.467.675.252 1.028zm1.47-3.264c-.27.441-.849.582-1.29.312-3.224-1.982-8.14-2.556-11.954-1.398-.499.151-1.028-.135-1.179-.634-.151-.499.135-1.028.634-1.179 4.364-1.325 9.789-.684 13.477 1.583.441.27.582.849.312 1.29zm.126-3.41c-3.864-2.295-10.244-2.508-13.935-1.387-.594.18-1.226-.154-1.406-.748-.18-.594.154-1.226.748-1.406 4.246-1.29 11.289-1.042 15.744 1.604.535.317.71 1.01.393 1.545-.317.535-1.01.71-1.545.393z"/>
                    </svg>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Active Profile Anthem
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">{attributes.anthem.title}</h4>
                  <p className="text-[10px] text-zinc-400 truncate">{attributes.anthem.artist}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => linkSpotify(attributes.anthem.spotifyUrl, attributes.anthem.title, attributes.anthem.artist)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Play Now
                </button>
              </div>

              {/* Edit Anthem Fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-heading font-medium text-zinc-300 block">Track Title</label>
                  <input
                    type="text"
                    value={attributes.anthem.title}
                    onChange={e => setAttributes({
                      ...attributes,
                      anthem: { ...attributes.anthem, title: e.target.value }
                    })}
                    className="w-full h-10 px-3 mt-1 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-heading font-medium text-zinc-300 block">Artist Name</label>
                  <input
                    type="text"
                    value={attributes.anthem.artist}
                    onChange={e => setAttributes({
                      ...attributes,
                      anthem: { ...attributes.anthem, artist: e.target.value }
                    })}
                    className="w-full h-10 px-3 mt-1 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-heading font-medium text-zinc-300 block">Spotify Link or URI</label>
                  <input
                    type="text"
                    value={attributes.anthem.spotifyUrl}
                    onChange={e => setAttributes({
                      ...attributes,
                      anthem: { ...attributes.anthem, spotifyUrl: e.target.value }
                    })}
                    className="w-full h-10 px-3 mt-1 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <GlassButton variant="subtle" size="sm" onClick={onClose}>
            Cancel
          </GlassButton>

          <GlassPrimaryButton
            size="sm"
            onClick={handleSave}
            icon={savedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          >
            {savedFeedback ? 'Saved!' : 'Save Profile Changes'}
          </GlassPrimaryButton>
        </div>

      </div>
    </GlassModal>
  );
};
