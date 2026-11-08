import { useState } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  UserCheck, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Lock,
  Calendar,
  HeartHandshake,
  Info,
  ChevronRight,
  Video,
  Eye,
  Key,
  Globe
} from 'lucide-react';
import { CURRENT_USER, MOCK_PROFILES } from '../mockData';
import type { MeetSafetyPlan, UserProfile } from '../types';

export const FriendsRealHub = () => {
  const [activeTab, setActiveTab] = useState<'verification' | 'friends_meet' | 'safety_standards'>('friends_meet');

  // Photo Verification In-App Simulation State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [photoVerified, setPhotoVerified] = useState(true);

  // Meetup Safety Plan State
  const partnerUser = MOCK_PROFILES[0]; // Alex Rivera
  const [meetPlan, setMeetPlan] = useState<MeetSafetyPlan>({
    id: 'meet_colombo_01',
    partnerName: partnerUser.name,
    partnerAvatar: partnerUser.avatar,
    partnerVerifiedBadges: ['Photo Verified', 'Age 18+ Confirmed', 'Social Account Linked'],
    meetingDate: 'Tomorrow, Saturday',
    startTime: '6:30 PM',
    plannedEndTime: '8:30 PM',
    publicVenue: 'The Gallery Café, Colombo 03',
    activity: 'Coffee, discussing game design prototypes & photography',
    trustedContact: {
      name: 'Naveen (Best Friend)',
      phoneOrEmail: '+94 77 123 4567',
      notifyOnStart: true,
      notifyOnMissedCheckIn: true
    },
    checkInIntervalMinutes: 60,
    status: 'planned'
  });

  const [checkInStatus, setCheckInStatus] = useState<'safe' | 'delayed' | 'alert_sent' | null>(null);

  // Verification Simulation Handlers
  const startLivePhotoCheck = () => {
    setIsVerifying(true);
    setVerificationStep(1);
    setTimeout(() => setVerificationStep(2), 1500);
    setTimeout(() => setVerificationStep(3), 3000);
    setTimeout(() => {
      setIsVerifying(false);
      setPhotoVerified(true);
      setVerificationStep(0);
      alert('Photo Verification Passed! Live face matched against profile photos with 0-credential retention.');
    }, 4500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* 1. Header Banner: FRIENDS REAL Philosophy */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30 p-6 md:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              FRIENDS REAL & MEET
            </span>
            <span className="text-xs text-slate-400">Strict 18+ • Anti-Catfish • Real-World Safety</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Real people. Honest identities. Safer connections.
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Verification doesn't certify someone's character, but it makes deception harder. 
            When transitioning from online conversation to real-life coffee or tea, 
            <span className="text-emerald-300 font-semibold"> FRIENDS MEET</span> equips you with voluntary identity exchange, trusted contact alerts, and scheduled check-ins.
          </p>
        </div>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'friends_meet', label: '1. FRIENDS MEET (Safety Plan)', icon: MapPin },
          { id: 'verification', label: '2. Identity & Photo Check', icon: ShieldCheck },
          { id: 'safety_standards', label: '3. Legal, Privacy & Compliance (Sri Lanka & Global)', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: FRIENDS MEET (Safe In-Person Transitions) */}
      {activeTab === 'friends_meet' && (
        <div className="space-y-6">
          
          {/* Active Meetup Safety Card */}
          <div className="bg-[#121927] border border-emerald-500/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Private Meetup Protection Protocol
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Real-World Meetup: You & {meetPlan.partnerName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
                  Mutual Agreement Active
                </span>
              </div>
            </div>

            {/* Meet Partner Verification Badges */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={meetPlan.partnerAvatar} 
                  alt={meetPlan.partnerName} 
                  className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{meetPlan.partnerName}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {meetPlan.partnerVerifiedBadges.map(b => (
                      <span key={b} className="text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{b}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => alert("Initiating in-app 1-minute video greeting before meeting! Hearing each other's voice and seeing real expressions eliminates surprises.")}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pre-Meet Video Greeting</span>
              </button>
            </div>

            {/* Key Logistics Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                <span className="text-slate-200 font-semibold">{meetPlan.meetingDate} • {meetPlan.startTime}</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Public Venue</span>
                <span className="text-slate-200 font-semibold">{meetPlan.publicVenue}</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Activity</span>
                <span className="text-slate-200 font-semibold">{meetPlan.activity}</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trusted Contact</span>
                <span className="text-slate-200 font-semibold">{meetPlan.trustedContact.name}</span>
              </div>
            </div>

            {/* Check-In Action Simulation Bar */}
            <div className="bg-gradient-to-r from-emerald-950/20 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Live Check-In System (Scheduled for 8:30 PM)</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {checkInStatus === 'safe' 
                    ? 'Safe check-in sent to Naveen!' 
                    : checkInStatus === 'delayed'
                    ? 'Plan extended by 60 mins'
                    : 'Check-in pending'}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                During your meetup, FRIENDS prompts you with a low-key 1-tap confirmation. If you don't check in within 15 minutes of the deadline, an automated status ping is sent to your trusted contact with the venue details.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setCheckInStatus('safe')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>"Everything is Good" (Send Safe Ping)</span>
                </button>

                <button
                  onClick={() => setCheckInStatus('delayed')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  <span>"I Need More Time" (+60 Mins)</span>
                </button>

                <button
                  onClick={() => alert("Emergency assistance activated: Dispatches venue details to trusted contact & gives 1-touch dialer for 119/1990.")}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ml-auto"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>I Need Help / Emergency</span>
                </button>
              </div>
            </div>

            {/* Privacy Rule: Data Expiration & Non-Retention */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">Automated Data Expiration:</span>
                This meeting plan and check-in timeline automatically expire and are purged from database records 4 hours after the planned end time. FRIENDS does not keep permanent tracking logs of your real-world meetings.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: IDENTITY & PHOTO VERIFICATION (Tinder Inspired, Privacy Hardened) */}
      {activeTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">In-App Live Photo Check</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Liveness detection via in-app camera. Randomized micro-actions verify you are the real person in your photos.
              </p>
            </div>

            {/* Verification Simulation Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full mx-auto bg-slate-800 border-2 border-dashed border-emerald-500/60 flex items-center justify-center relative overflow-hidden">
                {isVerifying ? (
                  <div className="w-full h-full bg-emerald-500/20 animate-pulse flex items-center justify-center">
                    <Camera className="w-8 h-8 text-emerald-400 animate-bounce" />
                  </div>
                ) : photoVerified ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                ) : (
                  <UserCheck className="w-10 h-10 text-slate-500" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {isVerifying 
                    ? verificationStep === 1 
                      ? 'Step 1/3: Turn head slightly left...' 
                      : verificationStep === 2 
                      ? 'Step 2/3: Blink twice naturally...' 
                      : 'Step 3/3: Comparing with profile images...'
                    : photoVerified 
                    ? 'Photo Verified Badge Active' 
                    : 'Photo Verification Pending'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {isVerifying 
                    ? 'Anti-spoofing algorithms check for replayed video and synthetic filters.' 
                    : 'Confirms your face matches submitted photos. Does not certify character.'}
                </p>
              </div>

              {!isVerifying && (
                <button
                  onClick={startLivePhotoCheck}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  {photoVerified ? 'Re-Verify Face (Refresh Timestamp)' : 'Start In-App Photo Check'}
                </button>
              )}
            </div>

            {/* Badges Explanation Table */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Specific Trust Signals (Never Vague "100% Safe" Claims):
              </span>

              {[
                { badge: 'Photo Verified', desc: 'Live in-app face check matched submitted profile pictures.' },
                { badge: 'Age 18+ Verified', desc: 'Age threshold verified via document / approved age assurance.' },
                { badge: 'Recent Photo Stamp', desc: 'Captures a fresh in-app photo tagged with upload date to prevent 10-year-old pictures.' },
                { badge: 'Social Linked', desc: 'OAuth token confirms control of linked GitHub, Spotify, or Instagram.' }
              ].map((b) => (
                <div key={b.badge} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-400 block">{b.badge}</span>
                    <span className="text-slate-400 text-[11px]">{b.desc}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Recent Photo & Anti-Catfish Indicators */}
          <div className="lg:col-span-5 bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Recent Photo Guarantee</h4>
              <p className="text-xs text-slate-400">
                People change over time. Profiles display an optional "Recent Photo" timestamp so you know what they look like today.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Latest In-App Capture:</span>
                <span className="text-emerald-400 font-mono">Captured Oct 2026</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                "Verified via camera feed. No gallery upload or vintage photo."
              </p>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Private Honesty Reporting
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an encounter reveals fabricated age, misleading photos, or deceptive claims, users can file confidential reports with human moderation review.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 5. TAB 3: LEGAL, COMPLIANCE & PRIVACY MATTERS */}
      {activeTab === 'safety_standards' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white">Compliance & Legal Architecture</h3>
            <p className="text-xs text-slate-400 mt-1">
              Built from ground-up for Sri Lankan and International regulatory standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
            {/* Sri Lanka PDPA & Online Safety Act */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Sri Lanka PDPA & Online Safety Act 2024</span>
              </h4>
              <p className="text-slate-300">
                • <strong>Strict 18+ Age Restriction</strong>: In accordance with the Online Safety Act No. 9 of 2024, FRIENDS is strictly gated to adults 18+ to eliminate underage dating risks.<br />
                • <strong>PDPA No. 9 of 2022 & Amendment 2025</strong>: Full adherence to purpose limitation, data minimization, and consent. Biometric face-checks are processed on-device or via certified processors without permanent raw ID storage.
              </p>
            </div>

            {/* Apple App Store & Global Standards */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Apple App Store & International Safety (2026/2027)</span>
              </h4>
              <p className="text-slate-300">
                • <strong>Apple App Store Dating Mandates</strong>: Compliant with Apple's 18+ age rating declarations for dating and relationship features.<br />
                • <strong>Zero Persistent Location Tracking</strong>: Exact live coordinates are never exposed; meeting venues are user-chosen public spots only.<br />
                • <strong>Data Expiration & Right to Be Forgotten</strong>: Immediate account deletion and temporary meeting log purging built into the backend.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
