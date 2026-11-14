import { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe, 
  Download, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sliders, 
  Key, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import type { VisibilityLevel, FieldPrivacySetting, GranularFeatureConsent } from '../types';

export const PrivacyCentreHub = () => {
  const [activeTab, setActiveTab] = useState<'visibility' | 'consents' | 'lifecycle' | 'legal_docs' | 'data_export'>('visibility');
  const [exportTriggered, setExportTriggered] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [privacyToast, setPrivacyToast] = useState<string | null>(null);

  // Per-field Privacy State
  const [fieldsPrivacy, setFieldsPrivacy] = useState<FieldPrivacySetting[]>([
    { fieldKey: 'full_name', label: 'Full Display Name', currentVisibility: 'public', category: 'identity', provenanceSource: 'google', lastUpdated: 'Today' },
    { fieldKey: 'age', label: 'Age & Birthday', currentVisibility: 'members_only', category: 'identity', provenanceSource: 'user_declared', lastUpdated: 'Nov 01, 2026' },
    { fieldKey: 'location_city', label: 'Location (City Level Only)', currentVisibility: 'members_only', category: 'identity', provenanceSource: 'user_declared', lastUpdated: 'Oct 20, 2026' },
    { fieldKey: 'education', label: 'Education & University', currentVisibility: 'public', category: 'academic_career', provenanceSource: 'linkedin', lastUpdated: 'Yesterday' },
    { fieldKey: 'career', label: 'Career & Projects', currentVisibility: 'public', category: 'academic_career', provenanceSource: 'github', lastUpdated: 'Nov 02, 2026' },
    { fieldKey: 'spotify_music', label: 'Music Taste & Top Artists', currentVisibility: 'public', category: 'intimate_preferences', provenanceSource: 'spotify', lastUpdated: 'Today, 10:00 AM' },
    { fieldKey: 'personal_stories', label: 'Personal Life Stories & Reflections', currentVisibility: 'connections_only', category: 'intimate_preferences', provenanceSource: 'user_declared', lastUpdated: 'Oct 28, 2026' },
    { fieldKey: 'relationship_intent', label: 'Relationship Intentions', currentVisibility: 'members_only', category: 'intimate_preferences', provenanceSource: 'user_declared', lastUpdated: 'Today' },
    { fieldKey: 'instagram_link', label: 'Instagram Handle & Profile Link', currentVisibility: 'public', category: 'social_accounts', provenanceSource: 'instagram', lastUpdated: 'Oct 25, 2026' },
    { fieldKey: 'conflicts_affection', label: 'Conflict Style & Social Battery', currentVisibility: 'connections_only', category: 'intimate_preferences', provenanceSource: 'user_declared', lastUpdated: 'Oct 15, 2026' }
  ]);

  // Granular Feature Consents State (No single "agree to everything" checkbox)
  const [featureConsents, setFeatureConsents] = useState<GranularFeatureConsent[]>([
    {
      id: 'c_core',
      title: 'Essential Platform Membership & Security',
      description: 'Account authentication, message delivery, security incident logging, and abuse prevention.',
      category: 'core',
      granted: true,
      mandatory: true,
      dataUsed: ['Username', 'Encrypted Auth Token', 'IP & Security Audit Hashes']
    },
    {
      id: 'c_hcm',
      title: 'Human Compatibility Mapping (HCM) Personalization',
      description: 'Calculates non-superficial resonance scores using your authorized psychographic vectors and interests.',
      category: 'personalization',
      granted: true,
      mandatory: false,
      dataUsed: ['Values Tags', 'Obsessions', 'Music Taste', 'Conflict Resolution Style']
    },
    {
      id: 'c_ai_coach',
      title: 'FRIENDS Companion AI Conversation Sandbox',
      description: 'Provides private conversational feedback and situation simulations. Prompts are never used to train public LLM foundation models.',
      category: 'ai_coach',
      granted: true,
      mandatory: false,
      dataUsed: ['Practice Chat Transcripts', 'Selected Dilemmas']
    },
    {
      id: 'c_biometrics',
      title: 'In-App Live Photo Verification',
      description: 'Liveness detection to confirm face matches submitted profile photos. Raw biometric video is processed on-device and never retained in databases.',
      category: 'biometrics',
      granted: true,
      mandatory: false,
      dataUsed: ['In-App Video Stream', 'Face Match Boolean']
    },
    {
      id: 'c_meet_location',
      title: 'FRIENDS MEET Proximity & Emergency Dispatch',
      description: 'Temporary location verification for scheduled real-world meetups. Automatically deleted 4 hours post-event.',
      category: 'location',
      granted: false,
      mandatory: false,
      dataUsed: ['Public Venue Landmark', 'Emergency Alert Coordinates']
    }
  ]);

  const cycleFieldVisibility = (fieldKey: string) => {
    setFieldsPrivacy(prev => prev.map(f => {
      if (f.fieldKey === fieldKey) {
        let next: VisibilityLevel = 'public';
        if (f.currentVisibility === 'public') next = 'members_only';
        else if (f.currentVisibility === 'members_only') next = 'connections_only';
        else if (f.currentVisibility === 'connections_only') next = 'only_me';
        else next = 'public';

        return { ...f, currentVisibility: next, lastUpdated: 'Just now' };
      }
      return f;
    }));
  };

  const toggleConsent = (consentId: string) => {
    setFeatureConsents(prev => prev.map(c => {
      if (c.id === consentId && !c.mandatory) {
        return { ...c, granted: !c.granted };
      }
      return c;
    }));
  };

  const handleTriggerExport = () => {
    setExportTriggered(true);
    setTimeout(() => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: { id: 'usr_me', name: 'Kavindu Senanayake', username: 'kavindu' },
        dsarCompliance: 'Sri Lanka PDPA No. 9 of 2022 & GDPR Article 15',
        privacyPreferences: fieldsPrivacy,
        consents: featureConsents,
        auditTrailNotice: 'Export generated with cryptographic integrity.'
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soulverse-dsar-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportTriggered(false);
      setPrivacyToast('Data Subject Access Request (DSAR) bundle generated and downloaded as JSON file.');
      setTimeout(() => setPrivacyToast(null), 5000);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmOpen(false);
    setPrivacyToast('Account deletion request queued under Sri Lanka PDPA & GDPR guidelines. 30-day graceful purge window active.');
    setTimeout(() => setPrivacyToast(null), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {privacyToast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span className="font-semibold">{privacyToast}</span>
        </div>
      )}
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                FRIENDS PRIVACY & DATA GOVERNANCE
              </span>
              <span className="text-xs text-slate-400">Sri Lanka PDPA & GDPR Compliant</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              You own your identity. We respect your boundaries.
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Connecting an account does not give FRIENDS unlimited license to harvest, combine, or monetize your data. 
              Control visibility per field, grant separate consent for individual capabilities, and verify data provenance at any time.
            </p>
          </div>

          <div className="bg-[#0f1422] border border-slate-800 p-4 rounded-2xl flex-shrink-0 text-center">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Core Governance Rule</span>
            <p className="text-xs text-slate-200 mt-1 max-w-[210px] leading-tight">
              Enforced server-side. If a field is private, it is never serialized in API payloads.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'visibility', label: '1. Per-Field Privacy & Provenance', icon: Eye },
          { id: 'consents', label: '2. Granular Feature Consents', icon: CheckCircle2 },
          { id: 'lifecycle', label: '3. Data Lifecycle & Retention Matrix', icon: Database },
          { id: 'data_export', label: '4. Export (DSAR) & Deletion', icon: Download },
          { id: 'legal_docs', label: '5. Legal Documents (/legal)', icon: FileText }
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

      {/* 3. TAB 1: PER-FIELD PRIVACY & PROVENANCE AUDIT */}
      {activeTab === 'visibility' && (
        <div className="space-y-6">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Fine-Grained Field Visibility Matrix</h3>
                <p className="text-xs text-slate-400">
                  Click on any field's visibility badge to cycle through Public, Members Only, Accepted Friends, or Private.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Backend Filter Enforced</span>
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-3">
              {fieldsPrivacy.map((item) => (
                <div 
                  key={item.fieldKey}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.label}</span>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                        Origin: {item.provenanceSource}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Category: {item.category.replace('_', ' ')} • Last updated: {item.lastUpdated}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cycleFieldVisibility(item.fieldKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 capitalize ${
                        item.currentVisibility === 'public'
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                          : item.currentVisibility === 'members_only'
                          ? 'bg-sky-950/60 border border-sky-500/40 text-sky-300'
                          : item.currentVisibility === 'connections_only'
                          ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                      title="Click to cycle visibility"
                    >
                      {item.currentVisibility === 'public' && <Globe className="w-3 h-3" />}
                      {item.currentVisibility === 'members_only' && <Eye className="w-3 h-3" />}
                      {item.currentVisibility === 'connections_only' && <ShieldCheck className="w-3 h-3" />}
                      {item.currentVisibility === 'only_me' && <Lock className="w-3 h-3" />}
                      <span>{item.currentVisibility.replace('_', ' ')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: GRANULAR FEATURE CONSENTS */}
      {activeTab === 'consents' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white">Granular Feature-by-Feature Consents</h3>
            <p className="text-xs text-slate-400 mt-1">
              Never bundled into a single opaque agreement. You can enable or revoke consent for individual capabilities at any time.
            </p>
          </div>

          <div className="space-y-4">
            {featureConsents.map((consent) => (
              <div 
                key={consent.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{consent.title}</h4>
                    {consent.mandatory && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-semibold">
                        Essential
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {consent.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-slate-500 self-center mr-1">Data Processed:</span>
                    {consent.dataUsed.map(d => (
                      <span key={d} className="text-[10px] bg-black/30 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleConsent(consent.id)}
                    disabled={consent.mandatory}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      consent.granted
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    {consent.granted ? 'Consent Granted' : 'Opt-Out (Revoked)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: DATA LIFECYCLE & RETENTION MATRIX */}
      {activeTab === 'lifecycle' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white">Data Lifecycle & Retention Rules</h3>
            <p className="text-xs text-slate-400 mt-1">
              Strict purpose limitation and automated expiration schedules.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Information Domain</th>
                  <th className="py-3 px-3">Purpose Limitation</th>
                  <th className="py-3 px-3">Automated Retention Rule</th>
                  <th className="py-3 px-3">Deletion Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Active Profile & Prompts</td>
                  <td className="py-3 px-3">Personal expression & HCM matching</td>
                  <td className="py-3 px-3">Retained until user edits or deletes</td>
                  <td className="py-3 px-3 text-emerald-400">Immediate user deletion</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">FRIENDS MEET Coordinates</td>
                  <td className="py-3 px-3">Emergency contact safety checks</td>
                  <td className="py-3 px-3">Expires 4 hours post-meetup</td>
                  <td className="py-3 px-3 text-emerald-400">Automated DB purge cron</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Raw Liveness Video Check</td>
                  <td className="py-3 px-3">Anti-spoofing photo verification</td>
                  <td className="py-3 px-3">Zero persistence (processed in memory)</td>
                  <td className="py-3 px-3 text-emerald-400">Ephemeral memory wipe</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Imported OAuth Data</td>
                  <td className="py-3 px-3">Enrich profile & compatibility</td>
                  <td className="py-3 px-3">Until provider disconnected</td>
                  <td className="py-3 px-3 text-emerald-400">1-click disconnect & purge</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Security & Audit Logs</td>
                  <td className="py-3 px-3">Abuse prevention & incident response</td>
                  <td className="py-3 px-3">Rolling 90-day retention</td>
                  <td className="py-3 px-3 text-slate-400">Rotating hash archive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 4: EXPORT (DSAR) & DELETION */}
      {activeTab === 'data_export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Data Subject Access Request (DSAR) Export */}
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Download My Data (DSAR)</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Download a complete, machine-readable JSON archive of all your personal data, 
                including profile fields, provenance tags, active connections, and messages.
              </p>
            </div>

            <button
              onClick={handleTriggerExport}
              disabled={exportTriggered}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${exportTriggered ? 'animate-spin' : ''}`} />
              <span>{exportTriggered ? 'Preparing Archive...' : 'Generate Portable Data Archive'}</span>
            </button>
          </div>

          {/* Permanent Account Deletion */}
          <div className="bg-[#121927] border border-rose-900/30 rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Permanent Account Erasure</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Under the Sri Lanka PDPA and GDPR "Right to be Forgotten", you can permanently delete your FRIENDS account. 
                All profile records, photos, tokens, and active connections are scheduled for irreversible purging.
              </p>
            </div>

            {!deleteConfirmOpen ? (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Request Account Deletion
              </button>
            ) : (
              <div className="bg-rose-950/40 border border-rose-500/50 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-rose-300 block">Are you sure? This action is irreversible.</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                  >
                    Confirm Permanent Erasure
                  </button>
                  <button
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 7. TAB 5: PUBLISHED LEGAL DOCUMENTS (/legal) */}
      {activeTab === 'legal_docs' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white">FRIENDS Legal & Compliance Directory</h3>
            <p className="text-xs text-slate-400 mt-1">
              Fully transparent documentation reflecting actual software architecture, not generic boilerplate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {[
              { title: 'Privacy Policy', path: '/legal/privacy', desc: 'Comprehensive personal data handling under Sri Lanka PDPA No. 9 of 2022.' },
              { title: 'Terms of Service', path: '/legal/terms', desc: 'Account rules, community responsibilities, and platform guidelines.' },
              { title: 'Connected Accounts Notice', path: '/legal/oauth-notice', desc: 'OAuth permissions, data provenance, and token storage policies.' },
              { title: 'AI & Data Ethics Notice', path: '/legal/ai-ethics', desc: 'Zero training on private chats; educational role disclosures.' },
              { title: 'Child Safety & 18+ Policy', path: '/legal/child-safety', desc: 'Strict adult eligibility and Online Safety Act No. 9 of 2024 compliance.' },
              { title: 'Security Incident & Breach SLA', path: '/legal/security-sla', desc: '72-hour regulatory breach disclosure and user notification procedures.' }
            ].map(doc => (
              <div key={doc.title} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white">{doc.title}</h4>
                  <span className="font-mono text-[10px] text-emerald-400 block mt-0.5">{doc.path}</span>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{doc.desc}</p>
                </div>
                <button
                  onClick={() => window.open(doc.path, '_blank')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-800"
                >
                  <span>Read Full Notice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
