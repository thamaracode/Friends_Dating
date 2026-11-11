import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  Bell, 
  Eye, 
  Shield, 
  Palette, 
  Volume2, 
  Moon, 
  Check, 
  Ban 
} from 'lucide-react';

export const SoulverseSettingsPage: React.FC = () => {
  const [incognito, setIncognito] = useState(false);
  const [defaultVis, setDefaultVis] = useState('public');
  const [quietHours, setQuietHours] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white shadow-inner">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-white font-serif">Platform Settings & Privacy</h1>
            <p className="text-xs text-zinc-400">Configure your audience boundaries, notifications, and minimalist gray & glass aesthetic</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-2xl gray-glass-btn text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
        >
          {savedToast ? <Check className="w-4 h-4 text-emerald-300" /> : null}
          <span>{savedToast ? 'Settings Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Privacy & Visibility */}
        <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Lock className="w-4 h-4 text-zinc-300" />
            <span>Audience & Privacy Boundaries</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Incognito mode toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div>
                <h4 className="text-xs font-bold text-white">Incognito Browsing Mode</h4>
                <p className="text-[10px] text-zinc-400">Only profiles you actively like or message can ever see your identity cards.</p>
              </div>
              <button
                onClick={() => setIncognito(!incognito)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  incognito ? 'bg-white/80' : 'bg-black/50 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  incognito ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>

            {/* Default World Visibility */}
            <div className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div>
                <h4 className="text-xs font-bold text-white">Default World Publication Level</h4>
                <p className="text-[10px] text-zinc-400">Baseline visibility for newly instantiated profile worlds.</p>
              </div>
              <select
                value={defaultVis}
                onChange={(e) => setDefaultVis(e.target.value)}
                className="bg-[#181B24] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
              >
                <option value="public">🌐 Public (All)</option>
                <option value="matches">✨ Mutual Matches Only</option>
                <option value="friends">👥 Friends Only</option>
                <option value="private">🔒 Private (Draft)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Bell className="w-4 h-4 text-zinc-300" />
            <span>Notification & Quiet Hours</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div>
                <h4 className="text-xs font-bold text-white">2 AM Quiet Hours (11:00 PM – 7:00 AM)</h4>
                <p className="text-[10px] text-zinc-400">Mute all audible pings and chimes during restful hours.</p>
              </div>
              <button
                onClick={() => setQuietHours(!quietHours)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  quietHours ? 'bg-white/80' : 'bg-black/50 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  quietHours ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div>
                <h4 className="text-xs font-bold text-white">Sound Effects for Messages & Luck Dice</h4>
                <p className="text-[10px] text-zinc-400">Tactile audio cues when rolling dice or receiving incoming messages.</p>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  soundAlerts ? 'bg-white/80' : 'bg-black/50 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  soundAlerts ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Appearance & Accessibility */}
        <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Palette className="w-4 h-4 text-zinc-300" />
            <span>Theme & Motion Restraint</span>
          </div>

          <div className="p-3 rounded-2xl dark-glass-card border border-white/[0.06] flex items-center justify-between text-xs">
            <div>
              <h4 className="text-xs font-bold text-white">Reduced Motion Transitions</h4>
              <p className="text-[10px] text-zinc-400">Subdued animations without glowing or bouncing.</p>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                reducedMotion ? 'bg-white/80' : 'bg-black/50 border border-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                reducedMotion ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
