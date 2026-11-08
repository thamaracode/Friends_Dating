import { 
  ShieldAlert, 
  PhoneCall, 
  X, 
  Globe, 
  ExternalLink 
} from 'lucide-react';

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisSupportModal = ({ isOpen, onClose }: CrisisSupportModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0f1422] border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">You Don’t Have to Carry This Alone</h3>
            <p className="text-xs text-rose-300">Priority Crisis & Immediate Professional Support</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          If you are experiencing suicidal thoughts, self-harm impulses, or feel in acute crisis, 
          please reach out directly to verified, professional emergency lines. Volunteer peers and apps 
          cannot replace trained mental health crisis professionals.
        </p>

        {/* Sri Lanka Emergency Lines (Verified Directory) */}
        <div className="space-y-3 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Sri Lanka Immediate Verified Helplines (Free & Confidential)
          </span>

          <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">National Mental Health Helpline</h4>
              <p className="text-xs text-slate-400">NIMH Government Hotline (Toll-Free 24/7)</p>
            </div>
            <a 
              href="tel:1926" 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/30"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 1926</span>
            </a>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">CCCline (Courage Compassion Commitment)</h4>
              <p className="text-xs text-slate-400">24/7 Crisis Counseling & Emotional Support</p>
            </div>
            <a 
              href="tel:1333" 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 1333</span>
            </a>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Sumithrayo</h4>
              <p className="text-xs text-slate-400">Befriending and emotional sanctuary</p>
            </div>
            <div className="flex gap-1.5">
              <a 
                href="tel:0112696666" 
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
              >
                011 269 6666
              </a>
              <a 
                href="tel:0112692909" 
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
              >
                011 269 2909
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">1990 Suwa Seriya</span>
                <span className="text-[10px] text-slate-400">Free Ambulance Service</span>
              </div>
              <a href="tel:1990" className="text-rose-400 font-bold hover:underline">Call 1990</a>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">119 Police Hotline</span>
                <span className="text-[10px] text-slate-400">Emergency Services</span>
              </div>
              <a href="tel:119" className="text-rose-400 font-bold hover:underline">Call 119</a>
            </div>
          </div>
        </div>

        {/* Global Directory Link */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Outside Sri Lanka? Access global crisis directories.</span>
          </div>
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            <span>FindAHelpline</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Safety & Ethics Disclaimer */}
        <div className="mt-4 text-[10px] text-slate-500 text-center">
          FRIENDS never commercializes or monetizes crisis vulnerability. Immediate safety always precedes app activity.
        </div>
      </div>
    </div>
  );
};
