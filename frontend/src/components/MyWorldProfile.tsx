import { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Coffee, 
  Camera, 
  Lock, 
  Globe, 
  Eye, 
  ShieldCheck, 
  Share2, 
  ExternalLink,
  Compass,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import type { VisibilityLevel } from '../types';
import { ActiveTimeBadge } from './ActiveTimeBadge';

export const MyWorldProfile = () => {
  const [profile] = useState(CURRENT_USER);
  const [expandedChapter, setExpandedChapter] = useState<string | null>('about');
  const [activeGalleryTab, setActiveGalleryTab] = useState<'all' | 'places' | 'everyday' | 'memories'>('all');
  const [worldToast, setWorldToast] = useState<string | null>(null);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapter(prev => prev === chapterId ? null : chapterId);
  };

  const getVisibilityIcon = (level?: VisibilityLevel) => {
    switch (level) {
      case 'public':
        return <span title="Visible to everyone"><Globe className="w-3 h-3 text-emerald-400" /></span>;
      case 'members_only':
        return <span title="Visible to members only"><Eye className="w-3 h-3 text-sky-400" /></span>;
      case 'connections_only':
        return <span title="Visible to accepted friends only"><ShieldCheck className="w-3 h-3 text-purple-400" /></span>;
      case 'only_me':
        return <span title="Private to you only"><Lock className="w-3 h-3 text-slate-500" /></span>;
      default:
        return <span title="Visible to everyone"><Globe className="w-3 h-3 text-emerald-400" /></span>;
    }
  };

  const filteredGallery = profile.gallery?.filter(item => {
    if (activeGalleryTab === 'all') return true;
    return item.category === activeGalleryTab;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {worldToast && (
        <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-2xl text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-purple-400" />
          <span className="font-semibold">{worldToast}</span>
        </div>
      )}
      
      {/* 1. Profile Completeness / Strength Header */}
      <div className="bg-[#121927] border border-purple-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500"
                strokeDasharray={`${profile.profileStrength || 88}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">{profile.profileStrength}%</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Your Profile Strength</h3>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold">
                High Connection Discovery
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              More authentic details allow the HCM engine to surface meaningful common ground without superficial swiping.
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => {
              setWorldToast("Personal privacy controls: Every single section can be toggled between Public, Members Only, Friends Only, or Private.");
              setTimeout(() => setWorldToast(null), 4000);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Privacy Matrix</span>
          </button>
        </div>
      </div>

      {/* 2. Panoramic Cover Banner & Identity Header */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Photo */}
        <div className="h-56 sm:h-72 w-full relative overflow-hidden bg-slate-900">
          <img 
            src={profile.bannerImage} 
            alt="Cover banner" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121927] via-transparent to-black/40" />

          {/* Visibility indicator */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-xs text-slate-200">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public Profile</span>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative -mt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            
            {/* Avatar & Badges */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#121927] shadow-xl"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#121927]" title="Active" />
              </div>

              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
                  <span className="text-sm font-semibold text-slate-400">@{profile.username}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {profile.location}
                  </span>
                  <span>•</span>
                  <span>{profile.age} years old</span>
                  <span>•</span>
                  <span className="text-purple-400 font-medium">{profile.pronouns}</span>
                </div>
              </div>
            </div>

            {/* Status & Short Tagline */}
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl text-xs sm:text-right max-w-sm">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">Current Status</span>
              <span className="text-slate-200 font-medium">{profile.status}</span>
            </div>
          </div>

          {/* Headline */}
          <p className="mt-5 text-sm sm:text-base text-slate-200 font-medium italic border-l-3 border-[#D6AD60] pl-3">
            "{profile.headline}"
          </p>

          {/* Public Most Active Time Window Banner */}
          {profile.activeTimeWindow && (
            <div className="mt-4">
              <ActiveTimeBadge window={profile.activeTimeWindow} variant="detail" />
            </div>
          )}

          {/* Life Quote Card */}
          {profile.personalQuote && (
            <div className="mt-4 bg-gradient-to-r from-purple-950/30 to-indigo-950/20 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-200 font-semibold italic">
                  "{profile.personalQuote.quote}"
                </p>
                <span className="text-[10px] text-purple-400 uppercase tracking-widest mt-0.5 block">
                  — {profile.personalQuote.author}
                </span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`"${profile.personalQuote.quote}" — ${profile.personalQuote.author} (via Soulverse)`);
                  setWorldToast("Quote copied to clipboard as shareable text!");
                  setTimeout(() => setWorldToast(null), 3000);
                }}
                className="text-xs text-purple-300 hover:text-white flex items-center gap-1 bg-purple-900/40 px-2.5 py-1 rounded-lg border border-purple-700/50 cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>Share Quote</span>
              </button>
            </div>
          )}

          {/* Social Web Connected Links */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Social Web:</span>
            {profile.socialLinks?.map((soc) => (
              <a
                key={soc.platform}
                href={soc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs transition"
              >
                <span>{soc.platform}</span>
                {soc.handle && <span className="text-slate-400 text-[10px]">({soc.handle})</span>}
                <ExternalLink className="w-3 h-3 opacity-60" />
                {getVisibilityIcon(soc.visibility)}
              </a>
            ))}
          </div>

        </div>
      </div>

      {/* 3. EXPANDABLE CHAPTERS SYSTEM (No giant wall of text) */}
      <div className="space-y-4">
        
        {/* CHAPTER 1: ABOUT ME (Long-form Autobiography) */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden transition">
          <button
            onClick={() => toggleChapter('about')}
            className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chapter 1: The Long-form Introduction</h3>
                <p className="text-xs text-slate-400">Who am I beyond a 150-character bio?</p>
              </div>
            </div>
            {expandedChapter === 'about' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedChapter === 'about' && (
            <div className="p-6 pt-0 border-t border-slate-800/80 space-y-4">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
                {profile.aboutMeLong}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Languages</span>
                  <span className="text-slate-200 font-medium">{profile.languages.join(', ')}</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hometown</span>
                  <span className="text-slate-200 font-medium">{profile.hometown}</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Personal Web</span>
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline font-mono">
                    {profile.website}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHAPTER 2: WHO I AM LOOKING FOR (Connection Intentions) */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden transition">
          <button
            onClick={() => toggleChapter('looking_for')}
            className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chapter 2: The People I Want in My Life</h3>
                <p className="text-xs text-slate-400">Clear intentions, shared activities, and preferred connection vibes</p>
              </div>
            </div>
            {expandedChapter === 'looking_for' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedChapter === 'looking_for' && profile.connectionPreferences && (
            <div className="p-6 pt-0 border-t border-slate-800/80 space-y-4">
              <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed italic">
                "{profile.connectionPreferences.personalStatement}"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block mb-2">
                    Open To:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.connectionPreferences.openTo.map(item => (
                      <span key={item} className="bg-purple-950/40 text-purple-200 border border-purple-800/40 px-2 py-0.5 rounded-md text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-2">
                    Appreciates People Who Are:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.connectionPreferences.seekingQualities.map(item => (
                      <span key={item} className="bg-indigo-950/40 text-indigo-200 border border-indigo-800/40 px-2 py-0.5 rounded-md text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-2">
                    Enjoy Doing Together:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.connectionPreferences.enjoyTogether.map(item => (
                      <span key={item} className="bg-emerald-950/40 text-emerald-200 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHAPTER 3: PROFILE PROMPTS (Classic, Funny, Deep) */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden transition">
          <button
            onClick={() => toggleChapter('prompts')}
            className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chapter 3: Curated Conversation Prompts</h3>
                <p className="text-xs text-slate-400">Specific conversation hooks to prevent "Hey, wyd?"</p>
              </div>
            </div>
            {expandedChapter === 'prompts' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedChapter === 'prompts' && (
            <div className="p-6 pt-0 border-t border-slate-800/80 space-y-3">
              {profile.prompts?.map((pr) => (
                <div key={pr.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      {pr.prompt}
                    </span>
                    <span className="text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                      {pr.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{pr.answer}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHAPTER 4: EDUCATION & ACADEMIC JOURNEY */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden transition">
          <button
            onClick={() => toggleChapter('education')}
            className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chapter 4: Education & Intellectual Journey</h3>
                <p className="text-xs text-slate-400">Academic background, university societies, and learning pursuits</p>
              </div>
            </div>
            {expandedChapter === 'education' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedChapter === 'education' && (
            <div className="p-6 pt-0 border-t border-slate-800/80 space-y-3">
              {profile.education?.map((edu) => (
                <div key={edu.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{edu.institution}</h4>
                    <p className="text-xs text-sky-400 font-medium">{edu.degree} — {edu.field}</p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {edu.startYear} – {edu.current ? 'Present (Current)' : edu.endYear}
                    </span>
                    {edu.activities && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        Societies: {edu.activities}
                      </p>
                    )}
                  </div>
                  {getVisibilityIcon(edu.visibility)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHAPTER 5: CAREER, PROJECTS & AMBITIONS */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden transition">
          <button
            onClick={() => toggleChapter('career')}
            className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chapter 5: Career, Work & Ambitions</h3>
                <p className="text-xs text-slate-400">What I build, independent projects, and creative skills</p>
              </div>
            </div>
            {expandedChapter === 'career' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedChapter === 'career' && (
            <div className="p-6 pt-0 border-t border-slate-800/80 space-y-3">
              {profile.career?.map((car) => (
                <div key={car.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{car.role}</h4>
                    <span className="text-xs text-indigo-400 block">{car.companyOrFreelance} • {car.period}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{car.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {car.skills.map(s => (
                        <span key={s} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {getVisibilityIcon(car.visibility)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHAPTER 6: LIFESTYLE & EVERYDAY RHYTHMS */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden transition">
          <button
            onClick={() => toggleChapter('lifestyle')}
            className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chapter 6: Lifestyle & Daily Human Habits</h3>
                <p className="text-xs text-slate-400">Circadian rhythm, favorite food, pets, and weekend recharge style</p>
              </div>
            </div>
            {expandedChapter === 'lifestyle' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedChapter === 'lifestyle' && profile.lifestyle && (
            <div className="p-6 pt-0 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Circadian Rhythm</span>
                <span className="text-slate-200 font-semibold">{profile.lifestyle.circadian}</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekend Philosophy</span>
                <span className="text-slate-200 font-semibold">{profile.lifestyle.weekendStyle}</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Coffee vs Tea</span>
                <span className="text-slate-200 font-semibold">{profile.lifestyle.coffeeOrTea}</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Favorite Food</span>
                <span className="text-slate-200 font-semibold">{profile.lifestyle.dietOrFood}</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Animals</span>
                <span className="text-slate-200 font-semibold">{profile.lifestyle.petAffinity}</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Living Space</span>
                <span className="text-slate-200 font-semibold">{profile.lifestyle.cleanOrMessy}</span>
              </div>
            </div>
          )}
        </div>

        {/* CHAPTER 7: MY STORIES (Life Stories & Perspective Shifts) */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden transition">
          <button
            onClick={() => toggleChapter('stories')}
            className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chapter 7: Personal Life Stories</h3>
                <p className="text-xs text-slate-400">Moments that changed my perspective and made me who I am</p>
              </div>
            </div>
            {expandedChapter === 'stories' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedChapter === 'stories' && (
            <div className="p-6 pt-0 border-t border-slate-800/80 space-y-4">
              {profile.stories?.map((st) => (
                <div key={st.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{st.moodEmoji}</span>
                      <h4 className="text-sm font-bold text-white">{st.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500">{st.dateAdded}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                    {st.prompt}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-black/20 p-4 rounded-xl border border-white/5">
                    "{st.content}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHAPTER 8: PERSONAL DIGITAL GALLERY */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden transition">
          <button
            onClick={() => toggleChapter('gallery')}
            className="w-full p-6 text-left flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chapter 8: Personal Visual Gallery</h3>
                <p className="text-xs text-slate-400">A digital museum of places, everyday desks, and memories</p>
              </div>
            </div>
            {expandedChapter === 'gallery' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedChapter === 'gallery' && (
            <div className="p-6 pt-0 border-t border-slate-800/80 space-y-4">
              <div className="flex gap-2">
                {(['all', 'places', 'everyday', 'memories'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveGalleryTab(tab)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize cursor-pointer transition ${
                      activeGalleryTab === tab 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {filteredGallery?.map((item) => (
                  <div key={item.id} className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group">
                    <div className="h-44 overflow-hidden">
                      <img 
                        src={item.url} 
                        alt={item.caption} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="p-3 text-[11px] text-slate-300">
                      {item.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
