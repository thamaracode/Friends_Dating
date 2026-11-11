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
      <div className="p-6 rounded-3xl bg-[#160D19] border border-[#321323] shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#321323] border border-[#A64D78]/30 flex items-center justify-center text-[#D78BAF]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#E9DFE8] font-serif">Platform Settings & Privacy</h1>
            <p className="text-xs text-[#A99BAA]">Configure your audience boundaries, notifications, and 2 AM dark ambient aesthetic</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-2xl rose-gradient-btn text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
        >
          {savedToast ? <Check className="w-4 h-4 text-emerald-300" /> : null}
          <span>{savedToast ? 'Settings Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Privacy & Visibility */}
        <div className="p-5 rounded-3xl bg-[#160D19] border border-[#321323] space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E9DFE8] uppercase tracking-wider">
            <Lock className="w-4 h-4 text-[#A64D78]" />
            <span>Audience & Privacy Boundaries</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Incognito mode toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#09080D] border border-[#321323]">
              <div>
                <h4 className="text-xs font-bold text-[#E9DFE8]">Incognito Browsing Mode</h4>
                <p className="text-[10px] text-[#A99BAA]">Only profiles you actively like or message can ever see your identity cards.</p>
              </div>
              <button
                onClick={() => setIncognito(!incognito)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  incognito ? 'bg-[#A64D78]' : 'bg-black/50 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  incognito ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Default World Visibility */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#09080D] border border-[#321323]">
              <div>
                <h4 className="text-xs font-bold text-[#E9DFE8]">Default World Publication Level</h4>
                <p className="text-[10px] text-[#A99BAA]">Baseline visibility for newly instantiated profile worlds.</p>
              </div>
              <select
                value={defaultVis}
                onChange={(e) => setDefaultVis(e.target.value)}
                className="bg-[#160D19] border border-[#321323] rounded-xl px-3 py-1.5 text-xs text-[#E9DFE8] focus:outline-none focus:border-[#A64D78]"
              >
                <option value="public">🌐 Public (All)</option>
                <option value="matches">💖 Mutual Matches Only</option>
                <option value="friends">👥 Friends Only</option>
                <option value="private">🔒 Private (Draft)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-5 rounded-3xl bg-[#160D19] border border-[#321323] space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E9DFE8] uppercase tracking-wider">
            <Bell className="w-4 h-4 text-[#A64D78]" />
            <span>Notification & Quiet Hours</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#09080D] border border-[#321323]">
              <div>
                <h4 className="text-xs font-bold text-[#E9DFE8]">2 AM Quiet Hours (11:00 PM – 7:00 AM)</h4>
                <p className="text-[10px] text-[#A99BAA]">Mute all audible pings and chimes during restful hours.</p>
              </div>
              <button
                onClick={() => setQuietHours(!quietHours)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  quietHours ? 'bg-[#A64D78]' : 'bg-black/50 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  quietHours ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#09080D] border border-[#321323]">
              <div>
                <h4 className="text-xs font-bold text-[#E9DFE8]">Sound Effects for Messages & Luck Dice</h4>
                <p className="text-[10px] text-[#A99BAA]">Tactile audio cues when rolling dice or receiving incoming messages.</p>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  soundAlerts ? 'bg-[#A64D78]' : 'bg-black/50 border border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  soundAlerts ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Appearance & Accessibility */}
        <div className="p-5 rounded-3xl bg-[#160D19] border border-[#321323] space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E9DFE8] uppercase tracking-wider">
            <Palette className="w-4 h-4 text-[#A64D78]" />
            <span>Theme & Motion Restraint</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#09080D] border border-[#321323] flex items-center justify-between text-xs">
            <div>
              <h4 className="text-xs font-bold text-[#E9DFE8]">Reduced Motion Transitions</h4>
              <p className="text-[10px] text-[#A99BAA]">Subdued animations without glowing or bouncing.</p>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                reducedMotion ? 'bg-[#A64D78]' : 'bg-black/50 border border-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                reducedMotion ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
