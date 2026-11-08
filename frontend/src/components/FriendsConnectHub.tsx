import { useState } from 'react';
import { 
  Compass, 
  ExternalLink, 
  Sparkles, 
  Share2, 
  Globe, 
  Link2, 
  CheckCircle2, 
  Gamepad2, 
  MessageSquare, 
  HeartHandshake, 
  Camera, 
  Heart, 
  Music, 
  Send,
  HelpCircle,
  ShieldCheck,
  Info,
  ArrowRight,
  Filter
} from 'lucide-react';
import { EXTERNAL_PLATFORMS } from '../platformsData';
import type { PlatformGoal, ExternalPlatform } from '../types';

export const FriendsConnectHub = () => {
  const [selectedGoal, setSelectedGoal] = useState<PlatformGoal | 'all'>('activity_gaming');
  const [searchQuery, setSearchQuery] = useState('');

  // Connected Accounts State
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, { handle: string; connected: boolean }>>({
    spotify: { handle: 'kavindu_sounds', connected: true },
    github: { handle: 'kavindu-s', connected: true },
    discord: { handle: 'kavindu_dev#1234', connected: false },
    instagram: { handle: '@kavindu.visuals', connected: true }
  });

  const getPlatformIcon = (iconType: string) => {
    switch (iconType) {
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-indigo-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-orange-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-sky-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-emerald-400" />;
      case 'Camera': return <Camera className="w-5 h-5 text-pink-400" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'Music': return <Music className="w-5 h-5 text-emerald-400" />;
      case 'Send': return <Send className="w-5 h-5 text-emerald-500" />;
      default: return <Globe className="w-5 h-5 text-purple-400" />;
    }
  };

  const getIntegrationBadge = (level: string) => {
    switch (level) {
      case 'official_oauth':
        return <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">Official Integration</span>;
      case 'public_link':
        return <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">Public Profile Link</span>;
      case 'share_destination':
        return <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">Native Share Channel</span>;
      case 'external_recommendation':
        return <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">Curated Destination</span>;
      default:
        return null;
    }
  };

  const filteredPlatforms = EXTERNAL_PLATFORMS.filter(p => {
    const matchesGoal = selectedGoal === 'all' || p.recommendedGoals.includes(selectedGoal);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.bestFor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGoal && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border border-sky-500/30 p-6 md:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              FRIENDS CONNECT (Beyond Our Platform)
            </span>
            <span className="text-xs text-slate-400">Honest Discovery Assistant</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Find your people, wherever they are.
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            When you cannot find the specific connection you are looking for inside FRIENDS, 
            we do not leave you stranded in an empty feed. We recommend authentic communities, 
            servers, and platforms that specialize in what you need right now.
          </p>
        </div>
      </div>

      {/* 2. Interactive Discovery Assistant: "Who are you trying to find?" */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
            Discovery Assistant
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            What kind of connection are you looking for right now?
          </h3>
          <p className="text-xs text-slate-400">
            Select your primary intention to see verified external communities and platforms tailored to your goal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {[
            { id: 'activity_gaming', label: 'Gaming & Hobbies', desc: 'Discord, Twitch, Steam' },
            { id: 'study_tech', label: 'Study & Tech', desc: 'Reddit, GitHub, Dev chats' },
            { id: 'international_language', label: 'Language Exchange', desc: 'Tandem, HelloTalk, Slowly' },
            { id: 'talk_support', label: 'Empathetic Listening', desc: '7 Cups, Peer Lounges' },
            { id: 'platonic_friends', label: 'Local Platonic Friends', desc: 'Meetup, WhatsApp circles' },
            { id: 'dating_romance', label: 'Mainstream Dating', desc: 'Tinder, Bumble, Hinge' }
          ].map(goal => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id as any)}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedGoal === goal.id
                  ? 'bg-sky-950/40 border-sky-500/60 text-white shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-slate-200 block mb-1">{goal.label}</span>
              <span className="text-[10px] text-slate-500 block">{goal.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Platform Directory Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recommended Channels & Integration Directory
          </h3>
          <span className="text-xs text-sky-400 font-mono">{filteredPlatforms.length} destinations matched</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPlatforms.map(platform => (
            <div 
              key={platform.id}
              className="bg-[#121927] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between gap-4 transition shadow-xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {getPlatformIcon(platform.iconType)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{platform.name}</span>
                        {getIntegrationBadge(platform.integrationLevel)}
                      </h4>
                      <span className="text-xs text-sky-400">{platform.category}</span>
                    </div>
                  </div>

                  <a
                    href={platform.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
                    title={`Open ${platform.name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Best For */}
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  <strong className="text-slate-200">Best for: </strong>
                  {platform.bestFor}
                </p>

                {/* FRIENDS Action */}
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-xs text-slate-300 mt-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-300 font-semibold text-[11px]">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span>How FRIENDS interacts:</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{platform.friendsAction}</p>
                </div>

                {/* Honest API Limitations Note */}
                <div className="flex items-start gap-2 text-[10px] text-slate-500 mt-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{platform.apiLimitationNote}</span>
                </div>
              </div>

              {/* Bottom Fit Badge */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 italic">{platform.fitScoreDescription}</span>
                <a
                  href={platform.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                >
                  <span>Explore Destination</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Strategic Transparency: Why FRIENDS does this */}
      <div className="bg-gradient-to-r from-slate-900 to-[#121927] border border-slate-800 rounded-3xl p-6 text-xs text-slate-400 leading-relaxed space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>The FRIENDS Relationship Promise</span>
        </h4>
        <p>
          Conventional platforms hide competing apps because they want to trap you inside an attention monopoly. 
          FRIENDS believes human connection is bigger than any single app. If you need a gaming squad tonight, Discord is built for it. 
          If you want to practice Japanese, Tandem is ready. 
          <br /><br />
          We never say: <span className="text-rose-300 italic">"There are no people here, go somewhere else."</span><br />
          We say: <span className="text-emerald-300 font-semibold">"We haven't found your people here yet. Let's help you explore other spaces while we continue improving your recommendations."</span>
        </p>
      </div>

    </div>
  );
};
