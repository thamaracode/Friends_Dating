import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  Bell, 
  Eye, 
  Shield, 
  Palette, 
  Check, 
  MapPin, 
  Compass, 
  Users, 
  Sliders, 
  Globe2, 
  Image as ImageIcon, 
  Languages, 
  CreditCard, 
  RefreshCw, 
  Mail, 
  Smartphone, 
  Share2, 
  LogOut, 
  Trash2, 
  Flame, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { 
  loadDiscoverySettings, 
  saveDiscoverySettings, 
  loadVisibilitySettings, 
  saveVisibilitySettings, 
  loadAccountPreferences, 
  saveAccountPreferences,
  loadUserAttributes,
  saveUserAttributes,
  DiscoverySettings,
  VisibilitySettings,
  AccountPreferences,
  FullUserAttributes
} from '../types/tinderFeatures';
import { GlassModal, GlassButton, GlassPrimaryButton } from './klyven';
import { LifestyleSelectModal, LifestyleCategoryKey } from './control/LifestyleSelectModal';

export const SoulverseSettingsPage: React.FC = () => {
  // State loaded from localStorage with rich defaults
  const [discovery, setDiscovery] = useState<DiscoverySettings>(loadDiscoverySettings);
  const [visibility, setVisibility] = useState<VisibilitySettings>(loadVisibilitySettings);
  const [account, setAccount] = useState<AccountPreferences>(loadAccountPreferences);
  const [userAttributes, setUserAttributes] = useState<FullUserAttributes>(loadUserAttributes);
  const [activeLifestyleCategory, setActiveLifestyleCategory] = useState<LifestyleCategoryKey | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'discovery' | 'visibility' | 'account' | 'preferences' | 'safety'>('discovery');

  // Modals & Feedback
  const [savedToast, setSavedToast] = useState(false);
  const [isBlockContactsModalOpen, setIsBlockContactsModalOpen] = useState(false);
  const [newBlockedName, setNewBlockedName] = useState('');
  const [newBlockedContact, setNewBlockedContact] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [_isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMessageControlsModalOpen, setIsMessageControlsModalOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState(false);

  // Auto-save whenever settings change
  const handleSaveAll = () => {
    saveDiscoverySettings(discovery);
    saveVisibilitySettings(visibility);
    saveAccountPreferences(account);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleAddBlockedContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedContact.trim()) return;
    const newEntry = {
      id: `blk_${Date.now()}`,
      name: newBlockedName.trim() || 'Blocked Contact',
      contactInfo: newBlockedContact.trim()
    };
    const updated = {
      ...visibility,
      blockedContacts: [...visibility.blockedContacts, newEntry]
    };
    setVisibility(updated);
    saveVisibilitySettings(updated);
    setNewBlockedName('');
    setNewBlockedContact('');
  };

  const handleRemoveBlockedContact = (id: string) => {
    const updated = {
      ...visibility,
      blockedContacts: visibility.blockedContacts.filter(c => c.id !== id)
    };
    setVisibility(updated);
    saveVisibilitySettings(updated);
  };

  const handleShareApp = () => {
    navigator.clipboard.writeText('https://soulverse.im/join?ref=thamara');
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  const handleRestorePurchases = () => {
    setRestoreFeedback(true);
    setTimeout(() => setRestoreFeedback(false), 2500);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-24 max-w-4xl mx-auto">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white shadow-inner shrink-0">
            <Settings className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white font-serif tracking-tight">Platform Settings & Discovery</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300 border border-white/15">
                v7.42.1
              </span>
            </div>
            <p className="text-xs text-zinc-400">Configure discovery distance, visibility boundaries, account info, and safety controls</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <a
            href="#admin"
            className="px-3.5 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            title="Open Admin Operations Console"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Admin Ops</span>
          </a>
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-2xl gray-glass-btn text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
          >
            {savedToast ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4 text-zinc-300" />}
            <span>{savedToast ? 'Settings Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl dark-glass border border-white/10 overflow-x-auto no-scrollbar text-xs">
        {[
          { id: 'discovery', label: 'Discovery Settings', icon: Compass },
          { id: 'visibility', label: 'Visibility & Safety', icon: Eye },
          { id: 'account', label: 'Account & Membership', icon: CreditCard },
          { id: 'preferences', label: 'Appearance & Alerts', icon: Palette },
          { id: 'safety', label: 'Legal & Actions', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 px-3.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-2 text-center ${
                isActive
                  ? 'bg-white text-[#090A0E] shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DISCOVERY SETTINGS (Images 2, 4, 5)                             */}
      {/* ===================================================================== */}
      {activeTab === 'discovery' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Location Card */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-zinc-300" />
                <span>Discovery Location</span>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Change City / Passport</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="p-3.5 rounded-2xl dark-glass-card border border-white/[0.06] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Current Location</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{discovery.locationName}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-zinc-200 border border-white/15">
                GPS Verified
              </span>
            </div>
          </div>

          {/* Distance Preference Slider (Image 5) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Compass className="w-4 h-4 text-zinc-300" />
                <span>Distance Preference</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {discovery.maxDistanceKm} {account.distanceUnit}.
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="2"
                max="250"
                step="1"
                value={discovery.maxDistanceKm}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setDiscovery(prev => ({ ...prev, maxDistanceKm: val }));
                }}
                className="w-full accent-white h-2 bg-black/60 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>2 {account.distanceUnit}</span>
                <span>80 {account.distanceUnit}</span>
                <span>160 {account.distanceUnit}</span>
                <span>250+ {account.distanceUnit}</span>
              </div>
            </div>

            {/* Only show people in this range toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <div>
                <h4 className="text-xs font-semibold text-white">Only show people in this range</h4>
                <p className="text-[10px] text-zinc-400">Strictly filter out anyone beyond your chosen distance.</p>
              </div>
              <button
                onClick={() => setDiscovery(prev => ({ ...prev, onlyShowInDistanceRange: !prev.onlyShowInDistanceRange }))}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  discovery.onlyShowInDistanceRange ? 'bg-white' : 'bg-black/60 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  discovery.onlyShowInDistanceRange ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>
          </div>

          {/* Looking For Gender & Intent (Image 5) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Users className="w-4 h-4 text-zinc-300" />
              <span>Looking For</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {(['Women', 'Men', 'Everyone', 'Soul Connections'] as const).map(gender => {
                const isSelected = discovery.lookingForGender === gender;
                return (
                  <button
                    key={gender}
                    onClick={() => setDiscovery(prev => ({ ...prev, lookingForGender: gender }))}
                    className={`py-2.5 px-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#090A0E] border-white shadow-md'
                        : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {gender}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Preference Dual Sliders (Image 5) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-zinc-300" />
                <span>Age Preference</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {discovery.minAge} – {discovery.maxAge >= 100 ? '100+' : discovery.maxAge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Minimum Age</span>
                  <span className="font-mono text-white font-bold">{discovery.minAge}</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={discovery.minAge}
                  onChange={(e) => {
                    const min = parseInt(e.target.value);
                    if (min <= discovery.maxAge) {
                      setDiscovery(prev => ({ ...prev, minAge: min }));
                    }
                  }}
                  className="w-full accent-white h-2 bg-black/60 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Maximum Age</span>
                  <span className="font-mono text-white font-bold">{discovery.maxAge >= 100 ? '100+' : discovery.maxAge}</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="100"
                  value={discovery.maxAge}
                  onChange={(e) => {
                    const max = parseInt(e.target.value);
                    if (max >= discovery.minAge) {
                      setDiscovery(prev => ({ ...prev, maxAge: max }));
                    }
                  }}
                  className="w-full accent-white h-2 bg-black/60 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Only show people in this age range toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <div>
                <h4 className="text-xs font-semibold text-white">Only show people in this range</h4>
                <p className="text-[10px] text-zinc-400">Strictly filter out anyone outside this exact age bracket.</p>
              </div>
              <button
                onClick={() => setDiscovery(prev => ({ ...prev, onlyShowInAgeRange: !prev.onlyShowInAgeRange }))}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  discovery.onlyShowInAgeRange ? 'bg-white' : 'bg-black/60 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  discovery.onlyShowInAgeRange ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>
          </div>

          {/* Global Mode Toggle with Tinder Explainer (Image 5) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Global Discovery</h4>
              </div>
              <button
                onClick={() => setDiscovery(prev => ({ ...prev, globalMode: !prev.globalMode }))}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  discovery.globalMode ? 'bg-white' : 'bg-black/60 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  discovery.globalMode ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06]">
              "Going global will allow you to see people from around the world after you've run out of profiles nearby."
            </p>
          </div>

          {/* Minimum Number of Photos (Image 2) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-zinc-300" />
                <span>Minimum Number of Photos</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">{discovery.minPhotos}</span>
            </div>

            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={discovery.minPhotos}
              onChange={(e) => setDiscovery(prev => ({ ...prev, minPhotos: parseInt(e.target.value) }))}
              className="w-full accent-white h-2 bg-black/60 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>1 photo</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6+ photos</span>
            </div>
          </div>

          {/* Preferred Languages (Image 5) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Languages className="w-4 h-4 text-zinc-300" />
              <span>Preferred Languages</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {['English', 'Sinhala', 'Tamil', 'French', 'German', 'Spanish', 'Japanese'].map(lang => {
                const isSelected = discovery.preferredLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      const updated = isSelected
                        ? discovery.preferredLanguages.filter(l => l !== lang)
                        : [...discovery.preferredLanguages, lang];
                      setDiscovery(prev => ({ ...prev, preferredLanguages: updated }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white text-[#090A0E] border-white'
                        : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {lang} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIFESTYLE & DETAILS QUICK SELECTORS (Image 1) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Lifestyle & Passions (Profile Essentials)
            </span>

            <div className="space-y-1">
              {[
                { key: 'interests' as LifestyleCategoryKey, label: 'Interests', current: 'Travel, Coffee, Deep Talks' },
                { key: 'lookingFor' as LifestyleCategoryKey, label: 'Looking for', current: userAttributes.lifestyle.lookingFor || 'Select' },
                { key: 'languages' as LifestyleCategoryKey, label: 'Add languages', current: discovery.preferredLanguages.join(', ') || 'Select' },
                { key: 'zodiac' as LifestyleCategoryKey, label: 'Zodiac', current: userAttributes.essentials.zodiac || 'Select' },
                { key: 'education' as LifestyleCategoryKey, label: 'Education', current: userAttributes.essentials.education || 'Select' },
                { key: 'familyPlans' as LifestyleCategoryKey, label: 'Family Plans', current: userAttributes.lifestyle.familyPlans || 'Select' },
                { key: 'communicationStyle' as LifestyleCategoryKey, label: 'Communication Style', current: userAttributes.lifestyle.communicationStyle || 'Select' },
                { key: 'loveStyle' as LifestyleCategoryKey, label: 'Love Style', current: userAttributes.lifestyle.loveStyle || 'Select' },
                { key: 'pets' as LifestyleCategoryKey, label: 'Pets', current: userAttributes.lifestyle.pets || 'Select' },
                { key: 'drinking' as LifestyleCategoryKey, label: 'Drinking', current: userAttributes.lifestyle.drinking || 'Select' },
                { key: 'smoking' as LifestyleCategoryKey, label: 'Smoking', current: userAttributes.lifestyle.smoking || 'Select' },
                { key: 'workout' as LifestyleCategoryKey, label: 'Workout', current: userAttributes.lifestyle.workout || 'Select' }
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => setActiveLifestyleCategory(item.key)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-colors cursor-pointer text-xs"
                >
                  <span className="font-semibold text-zinc-200">{item.label}</span>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="text-[11px] font-medium text-white truncate max-w-[180px]">{item.current}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: VISIBILITY & SAFETY (Images 6, 7)                               */}
      {/* ===================================================================== */}
      {activeTab === 'visibility' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* CONTROL MY VISIBILITY (Image 6) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Control My Visibility
            </span>

            {/* Standard Mode Card */}
            <div 
              onClick={() => setVisibility(prev => ({ ...prev, mode: 'standard' }))}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                visibility.mode === 'standard'
                  ? 'bg-white/10 border-white/40 shadow-lg'
                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-white">Standard</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">You will be discoverable in the card stack</p>
              </div>
              {visibility.mode === 'standard' && (
                <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
              )}
            </div>

            {/* Incognito Plus Mode Card */}
            <div 
              onClick={() => setVisibility(prev => ({ ...prev, mode: 'incognito' }))}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                visibility.mode === 'incognito'
                  ? 'bg-white/10 border-white/40 shadow-lg'
                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Incognito</h4>
                  <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-white font-mono text-[9px] font-bold">
                    PLUS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">You will be discoverable only by people you Like</p>
              </div>
              {visibility.mode === 'incognito' && (
                <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
              )}
            </div>
          </div>

          {/* ENABLE DISCOVERY (Image 7) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Enable Discovery
              </span>
              <button
                onClick={() => setVisibility(prev => ({ ...prev, enableDiscovery: !prev.enableDiscovery }))}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  visibility.enableDiscovery ? 'bg-white' : 'bg-black/60 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  visibility.enableDiscovery ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06]">
              "When turned off, your profile will be hidden from the card stack and Discovery will be disabled. People you have already Liked may still see and match with you."
            </p>
          </div>

          {/* BLOCK CONTACTS (Image 7) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Block Contacts</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Select people from your contact list that you don't want to see or be seen by on Soulverse.
                </p>
              </div>
              <button
                onClick={() => setIsBlockContactsModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 ml-3"
              >
                Manage ({visibility.blockedContacts.length})
              </button>
            </div>

            {visibility.blockedContacts.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {visibility.blockedContacts.map(c => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-zinc-500 text-[10px] ml-2 font-mono">{c.contactInfo}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveBlockedContact(c.id)}
                      className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                      title="Unblock"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MESSAGE CONTROLS (Image 7) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Message Preferences & Controls</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Decide who can initiate conversations or send introductory notes.
                </p>
              </div>
              <button
                onClick={() => setIsMessageControlsModalOpen(true)}
                className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{visibility.messageControls === 'everyone' ? 'Everyone' : visibility.messageControls === 'verified_only' ? 'Verified Only' : 'Mutual Matches Only'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* WEB PROFILE USERNAME (Image 7) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Web Profile
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Username</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Create a username. Share your username. Have people all over the world match with you right on Soulverse.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-zinc-300 bg-white/10 px-2.5 py-1 rounded-lg">
                  @{visibility.claimedUsername}
                </code>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: ACCOUNT & MEMBERSHIP (Image 3)                                 */}
      {/* ===================================================================== */}
      {activeTab === 'account' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* ACCOUNT SETTINGS Header Card (Image 3) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Account Settings
            </span>

            <div className="space-y-2">
              {/* Manage Payment Account */}
              <div 
                onClick={() => setIsPaymentModalOpen(true)}
                className="p-3.5 rounded-2xl dark-glass-card border border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-zinc-300" />
                  <span className="text-xs font-bold text-white">Manage Payment Account</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">
                    Sanctuary VIP
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              {/* Restore Purchases */}
              <div 
                onClick={handleRestorePurchases}
                className="p-3.5 rounded-2xl dark-glass-card border border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-zinc-300" />
                  <span className="text-xs font-bold text-white">Restore Purchases</span>
                </div>
                {restoreFeedback ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Restored
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>

              {/* Email */}
              <div 
                onClick={() => setIsEmailModalOpen(true)}
                className="p-3.5 rounded-2xl dark-glass-card border border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-zinc-300" />
                  <span className="text-xs font-bold text-white">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono truncate max-w-[180px]">
                    {account.email}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              {/* Phone Number */}
              <div 
                onClick={() => setIsPhoneModalOpen(true)}
                className="p-3.5 rounded-2xl dark-glass-card border border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-zinc-300" />
                  <span className="text-xs font-bold text-white">Phone Number</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">
                    {account.phoneNumber}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="p-3.5 rounded-2xl dark-glass-card border border-white/[0.06] space-y-2">
                <span className="text-xs font-bold text-white block">Connected Accounts</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/[0.06] border border-white/10 text-zinc-200 flex items-center gap-1.5">
                    <span>Google</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/[0.06] border border-white/10 text-zinc-200 flex items-center gap-1.5">
                    <span>Spotify</span>
                    <Check className="w-3 h-3 text-[#1DB954]" />
                  </span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/[0.06] border border-white/10 text-zinc-200 flex items-center gap-1.5">
                    <span>Apple ID</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/[0.03] border border-white/10 text-zinc-400 hover:text-white cursor-pointer">
                    + Connect Instagram
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: APPEARANCE & ALERTS (Image 8)                                  */}
      {/* ===================================================================== */}
      {activeTab === 'preferences' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* ACTIVITY STATUS (Image 8) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Activity Status
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Recently Active Status</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Allow other members to see when you were recently online.</p>
              </div>
              <button
                onClick={() => setVisibility(prev => ({ ...prev, recentlyActiveStatus: !prev.recentlyActiveStatus }))}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  visibility.recentlyActiveStatus ? 'bg-white' : 'bg-black/60 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  visibility.recentlyActiveStatus ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>
          </div>

          {/* NOTIFICATIONS (Image 8) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Notifications
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06]">
                <span className="text-xs font-semibold text-white">Email Notifications</span>
                <button
                  onClick={() => setAccount(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    account.emailNotifications ? 'bg-white' : 'bg-black/60 border border-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                    account.emailNotifications ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06]">
                <span className="text-xs font-semibold text-white">Push Notifications</span>
                <button
                  onClick={() => setAccount(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    account.pushNotifications ? 'bg-white' : 'bg-black/60 border border-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                    account.pushNotifications ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06]">
                <div>
                  <span className="text-xs font-semibold text-white">Quiet Hours (11:00 PM – 7:00 AM)</span>
                  <p className="text-[10px] text-zinc-400">Silence sound chimes during late restful hours.</p>
                </div>
                <button
                  onClick={() => setAccount(prev => ({ ...prev, quietHoursEnabled: !prev.quietHoursEnabled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    account.quietHoursEnabled ? 'bg-white' : 'bg-black/60 border border-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                    account.quietHoursEnabled ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* APPEARANCE (Image 8) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Appearance
            </span>

            <div className="space-y-2">
              {[
                { id: 'system', label: 'Use System Setting' },
                { id: 'dark', label: 'Dark Titanium Mode' },
                { id: 'light', label: 'Light Mode' }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setAccount(prev => ({ ...prev, theme: opt.id as typeof prev.theme }))}
                  className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-colors"
                >
                  <span className="text-xs font-semibold text-white">{opt.label}</span>
                  {account.theme === opt.id && <Check className="w-4 h-4 text-white" />}
                </div>
              ))}
            </div>
          </div>

          {/* DISPLAY PREFERENCE (Image 8) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Display Preference
            </span>

            <div className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div>
                <span className="text-xs font-semibold text-white">Show Distances in</span>
                <p className="text-[10px] text-zinc-400">Kilometers or Miles</p>
              </div>
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setAccount(prev => ({ ...prev, distanceUnit: 'km' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    account.distanceUnit === 'km' ? 'bg-white text-[#090A0E]' : 'text-zinc-400'
                  }`}
                >
                  km.
                </button>
                <button
                  onClick={() => setAccount(prev => ({ ...prev, distanceUnit: 'mi' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    account.distanceUnit === 'mi' ? 'bg-white text-[#090A0E]' : 'text-zinc-400'
                  }`}
                >
                  mi.
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: LEGAL & ACTIONS (Images 9, 10)                                 */}
      {/* ===================================================================== */}
      {activeTab === 'safety' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* HELP & SUPPORT (Image 9) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Help & Support
            </span>
            <a
              href="mailto:support@soulverse.im"
              className="p-3.5 rounded-2xl dark-glass-card border border-white/[0.06] flex items-center justify-between hover:bg-white/[0.06] transition-colors"
            >
              <span className="text-xs font-bold text-white">Help & Support</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>

          {/* SAFETY (Image 9) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-2 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Safety
            </span>
            {['Community Guidelines', 'Safety & Policy', 'Safety Tips'].map(item => (
              <div 
                key={item}
                className="p-3 rounded-2xl dark-glass-card border border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <span className="text-xs font-semibold text-white">{item}</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            ))}
          </div>

          {/* ACCESSIBILITY: KEYBOARD SHORTCUTS (Image 10) */}
          <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Accessibility
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Keyboard shortcuts</h4>
                <p className="text-[10px] text-zinc-400">Use arrow keys, spacebar, and Esc to navigate cards.</p>
              </div>
              <button
                onClick={() => setAccount(prev => ({ ...prev, keyboardShortcuts: !prev.keyboardShortcuts }))}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  account.keyboardShortcuts ? 'bg-white' : 'bg-black/60 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  account.keyboardShortcuts ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>
          </div>

          {/* PLATFORM OPERATIONS / ADMIN PORTAL */}
          <div className="p-5 rounded-3xl dark-glass border border-emerald-500/20 bg-emerald-950/10 space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              Governance & Operations
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>Admin Operations Console</span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Manage platform users, liveness verification, Spotify audio presets, and discovery engine weights.
                </p>
              </div>
              <a
                href="#admin"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer shrink-0 ml-3"
              >
                Launch Console
              </a>
            </div>
          </div>

          {/* ACTION BUTTONS (Image 10) */}
          <div className="space-y-2.5 pt-2">
            {/* Share Tinder / Share Soulverse */}
            <button
              onClick={handleShareApp}
              className="w-full py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareFeedback ? 'Link Copied to Clipboard!' : 'Share Soulverse'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => alert('Logged out safely.')}
              className="w-full py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Version 7.42.1 (Image 10) */}
            <div className="py-4 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-white/10 text-white">
                <Flame className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-mono font-bold text-zinc-400">Version 7.42.1</p>
            </div>

            {/* Delete Account (Image 10) */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs border border-red-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS                                                               */}
      {/* ===================================================================== */}

      {/* Block Contacts Modal */}
      <GlassModal
        isOpen={isBlockContactsModalOpen}
        onClose={() => setIsBlockContactsModalOpen(false)}
        title="Block Contacts"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Enter a phone number, email, or name to prevent this person from seeing your profile in Discovery.
          </p>

          <form onSubmit={handleAddBlockedContact} className="space-y-3">
            <input
              type="text"
              placeholder="Name or Label (e.g. Ex-Colleague)"
              value={newBlockedName}
              onChange={e => setNewBlockedName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500"
            />
            <input
              type="text"
              placeholder="Phone number or Email (+94... / email@...)"
              value={newBlockedContact}
              onChange={e => setNewBlockedContact(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500"
            />
            <div className="flex justify-end gap-2">
              <GlassButton variant="subtle" size="sm" onClick={() => setIsBlockContactsModalOpen(false)}>
                Done
              </GlassButton>
              <GlassPrimaryButton type="submit" size="sm">
                Block Contact
              </GlassPrimaryButton>
            </div>
          </form>

          {visibility.blockedContacts.length > 0 && (
            <div className="border-t border-white/10 pt-3 space-y-1.5 max-h-48 overflow-y-auto">
              {visibility.blockedContacts.map(c => (
                <div key={c.id} className="p-2 rounded-xl bg-white/[0.02] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">{c.contactInfo}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedContact(c.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassModal>

      {/* Delete Account Modal */}
      <GlassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Soulverse Account"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Are you completely sure? This will immediately delete your profile, chat history, profile worlds, and active matches. This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <GlassButton variant="subtle" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </GlassButton>
            <button
              onClick={() => {
                alert('Account deletion request queued. Goodbye!');
                setIsDeleteModalOpen(false);
              }}
              className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      </GlassModal>

      {/* Change Location Modal */}
      <GlassModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Change Discovery Location"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">
            Enter a city or travel destination to browse matches before arriving.
          </p>
          <input
            type="text"
            value={discovery.locationName}
            onChange={e => setDiscovery(prev => ({ ...prev, locationName: e.target.value }))}
            placeholder="e.g. Tokyo, Japan / London, UK"
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500"
          />
          <div className="flex justify-end pt-2">
            <GlassPrimaryButton size="sm" onClick={() => setIsLocationModalOpen(false)}>
              Set Location
            </GlassPrimaryButton>
          </div>
        </div>
      </GlassModal>

      {/* Message Controls Modal */}
      <GlassModal
        isOpen={isMessageControlsModalOpen}
        onClose={() => setIsMessageControlsModalOpen(false)}
        title="Message Preferences"
        maxWidth="sm"
      >
        <div className="space-y-2">
          {[
            { id: 'everyone', label: 'Everyone', desc: 'Any verified user can send you introductory notes.' },
            { id: 'verified_only', label: 'Verified Profiles Only', desc: 'Only users with selfie or passport verification can message.' },
            { id: 'matches_only', label: 'Mutual Matches Only', desc: 'Only people you have mutually liked or connected with can message.' }
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => {
                setVisibility(prev => ({ ...prev, messageControls: opt.id as typeof prev.messageControls }));
                setIsMessageControlsModalOpen(false);
              }}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 cursor-pointer flex items-center justify-between"
            >
              <div>
                <h5 className="text-xs font-bold text-white">{opt.label}</h5>
                <p className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</p>
              </div>
              {visibility.messageControls === opt.id && <Check className="w-4 h-4 text-white" />}
            </div>
          ))}
        </div>
      </GlassModal>

      {/* Email Edit Modal */}
      <GlassModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Edit Account Email"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <input
            type="email"
            value={account.email}
            onChange={e => setAccount(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
          />
          <div className="flex justify-end pt-2">
            <GlassPrimaryButton size="sm" onClick={() => setIsEmailModalOpen(false)}>
              Save Email
            </GlassPrimaryButton>
          </div>
        </div>
      </GlassModal>

      {/* Phone Edit Modal */}
      <GlassModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title="Edit Phone Number"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <input
            type="tel"
            value={account.phoneNumber}
            onChange={e => setAccount(prev => ({ ...prev, phoneNumber: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
          />
          <div className="flex justify-end pt-2">
            <GlassPrimaryButton size="sm" onClick={() => setIsPhoneModalOpen(false)}>
              Save Phone
            </GlassPrimaryButton>
          </div>
        </div>
      </GlassModal>

      {/* Lifestyle Select Modal (Image 1) */}
      {activeLifestyleCategory && (
        <LifestyleSelectModal
          category={activeLifestyleCategory}
          isOpen={Boolean(activeLifestyleCategory)}
          onClose={() => setActiveLifestyleCategory(null)}
          currentValue={
            activeLifestyleCategory === 'languages' 
              ? discovery.preferredLanguages 
              : ((userAttributes.lifestyle as any)[activeLifestyleCategory] || (userAttributes.essentials as any)[activeLifestyleCategory] || '')
          }
          onSave={(cat, val) => {
            if (cat === 'languages') {
              const langs = Array.isArray(val) ? val : [val];
              const nextDisc = { ...discovery, preferredLanguages: langs };
              setDiscovery(nextDisc);
              saveDiscoverySettings(nextDisc);
              const nextAttrs = { ...userAttributes, essentials: { ...userAttributes.essentials, languages: langs } };
              setUserAttributes(nextAttrs);
              saveUserAttributes(nextAttrs);
            } else if (cat === 'zodiac' || cat === 'education') {
              const nextAttrs = { ...userAttributes, essentials: { ...userAttributes.essentials, [cat]: String(val) } };
              setUserAttributes(nextAttrs);
              saveUserAttributes(nextAttrs);
            } else {
              const nextAttrs = { ...userAttributes, lifestyle: { ...userAttributes.lifestyle, [cat]: String(val) } };
              setUserAttributes(nextAttrs);
              saveUserAttributes(nextAttrs);
            }
          }}
        />
      )}

    </div>
  );
};
