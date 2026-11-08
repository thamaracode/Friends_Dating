import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Lock, 
  Eye, 
  Download, 
  Search,
  Filter,
  BarChart2,
  Clock,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'verifications' | 'moderation' | 'privacy_audit'>('overview');
  const [verificationFilter, setVerificationFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Pending Verifications Queue
  const [verifications, setVerifications] = useState([
    {
      id: 'ver-101',
      user: 'Dinuk Perera',
      handle: '@dinuk',
      submittedAt: '12 mins ago',
      type: 'Liveness Selfie + Gov ID',
      matchScore: '98.4%',
      status: 'pending',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'ver-102',
      user: 'Senuri Wijesinghe',
      handle: '@senuri_w',
      submittedAt: '45 mins ago',
      type: 'Video Greeting Check',
      matchScore: '94.1%',
      status: 'pending',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'ver-103',
      user: 'Malik Fernando',
      handle: '@malik_f',
      submittedAt: '2 hours ago',
      type: 'Liveness Gesture Check',
      matchScore: '89.2%',
      status: 'pending',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    }
  ]);

  // Moderation Incidents
  const [incidentReports, setIncidentReports] = useState([
    {
      id: 'rep-88',
      reporter: 'Anonymous User #402',
      reportedUser: 'Suspicious Profile #991',
      reason: 'Possible Catfishing / External Telegram redirection',
      severity: 'high',
      status: 'review_required',
      timestamp: '1 hour ago'
    },
    {
      id: 'rep-89',
      reporter: 'Alex M.',
      reportedUser: 'Inappropriate DM spam #204',
      reason: 'Harassment after connection rejection',
      severity: 'medium',
      status: 'review_required',
      timestamp: '3 hours ago'
    }
  ]);

  // DSAR Requests
  const dsarLog = [
    {
      id: 'dsar-401',
      user: 'Kavindu Senanayake (@kavindu)',
      type: 'DSAR Export (JSON)',
      status: 'Completed',
      requestedAt: '2026-11-08 14:15',
      retentionPolicyApplied: 'Sri Lanka PDPA Compliant'
    },
    {
      id: 'dsar-402',
      user: 'Ruwantha D. (@ruwan)',
      type: 'Right to be Forgotten (Account Deletion)',
      status: 'Pending 7-day Grace Period',
      requestedAt: '2026-11-07 09:30',
      retentionPolicyApplied: 'PIDs purged in 7 days'
    }
  ];

  const handleApproveVerification = (id: string) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v));
  };

  const handleRejectVerification = (id: string) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected' } : v));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#302B22]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>CONFIDENTIAL ADMIN & TRUST SANCTUARY • RBAC LEVEL 4</span>
          </div>
          <h1 className="text-2xl font-black text-[#F5F0E6]">
            Governance, Trust & Verification Ops
          </h1>
          <p className="text-xs text-[#A7A094] mt-0.5">
            Real-time metric telemetry, identity verification queue, trust escalation triage, and data subject access requests.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-2xl border border-[#302B22]">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'overview' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('verifications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'verifications' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            Verifications (3)
          </button>
          <button
            onClick={() => setActiveSection('moderation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'moderation' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            Safety Triage (2)
          </button>
          <button
            onClick={() => setActiveSection('privacy_audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'privacy_audit' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            Privacy Audit
          </button>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW METRICS */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* North Star Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#171717] border border-[#302B22]">
              <div className="flex items-center justify-between text-xs text-[#A7A094]">
                <span>WMCAU (Meaningful Connections)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-[#F5F0E6] mt-2">1,842</div>
              <p className="text-[11px] text-emerald-400 mt-1">↑ +14.2% from last week</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#171717] border border-[#302B22]">
              <div className="flex items-center justify-between text-xs text-[#A7A094]">
                <span>D7 Meaningful Retention</span>
                <Users className="w-4 h-4 text-[#D6AD60]" />
              </div>
              <div className="text-2xl font-black text-[#F5F0E6] mt-2">68.4%</div>
              <p className="text-[11px] text-[#A7A094] mt-1">Goal: &gt;60% (Zero Swipe churn)</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#171717] border border-[#302B22]">
              <div className="flex items-center justify-between text-xs text-[#A7A094]">
                <span>Verified Real Identity Ratio</span>
                <ShieldCheck className="w-4 h-4 text-[#D6AD60]" />
              </div>
              <div className="text-2xl font-black text-[#F5F0E6] mt-2">91.8%</div>
              <p className="text-[11px] text-[#A7A094] mt-1">Liveness + Anti-catfish gate</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#171717] border border-[#302B22]">
              <div className="flex items-center justify-between text-xs text-[#A7A094]">
                <span>FRIENDS MEET Incidents</span>
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">0</div>
              <p className="text-[11px] text-emerald-400 mt-1">100% check-ins verified</p>
            </div>
          </div>

          {/* Quick Ops Callout */}
          <div className="p-5 rounded-3xl bg-[#111111] border border-[#302B22] flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#F5F0E6]">Identity Verification SLA status: Healthy</h3>
              <p className="text-xs text-[#A7A094] mt-0.5">Average verification latency is currently 14 minutes. 3 users awaiting review.</p>
            </div>
            <button
              onClick={() => setActiveSection('verifications')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6AD60] to-[#F1D99F] text-[#090909] font-bold text-xs cursor-pointer shadow-md shadow-[#D6AD60]/20"
            >
              Open Verification Queue →
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: IDENTITY VERIFICATION QUEUE */}
      {activeSection === 'verifications' && (
        <div className="rounded-3xl bg-[#171717] border border-[#302B22] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#302B22]">
            <h3 className="text-sm font-bold text-[#F5F0E6] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#D6AD60]" />
              <span>Pending Human Verification Audits</span>
            </h3>
            <span className="text-xs text-[#A7A094]">3 items awaiting approval</span>
          </div>

          <div className="space-y-3">
            {verifications.map(item => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-[#111111] border border-[#211E18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={item.photoUrl} 
                    alt={item.user} 
                    className="w-12 h-12 rounded-xl object-cover border border-[#302B22]" 
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#F5F0E6]">{item.user}</span>
                      <span className="text-xs text-[#A7A094]">{item.handle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#211E18] text-[#D6AD60]">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-xs text-[#A7A094] mt-1 flex items-center gap-3">
                      <span>Submitted: {item.submittedAt}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">Liveness Score: {item.matchScore}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApproveVerification(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Badge</span>
                      </button>
                      <button
                        onClick={() => handleRejectVerification(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs border border-rose-500/30 cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                      item.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: MODERATION & SAFETY TRIAGE */}
      {activeSection === 'moderation' && (
        <div className="rounded-3xl bg-[#171717] border border-[#302B22] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#302B22]">
            <h3 className="text-sm font-bold text-[#F5F0E6] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Safety Escalation & Incident Triage</span>
            </h3>
            <span className="text-xs text-[#A7A094]">Automated zero-tolerance filters active</span>
          </div>

          <div className="space-y-3">
            {incidentReports.map(rep => (
              <div 
                key={rep.id}
                className="p-4 rounded-2xl bg-[#111111] border border-[#302B22] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/30">
                      {rep.severity} SEVERITY
                    </span>
                    <span className="text-xs font-bold text-[#F5F0E6]">Incident #{rep.id}</span>
                    <span className="text-[11px] text-[#A7A094]">{rep.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#F5F0E6] font-medium">{rep.reason}</p>
                  <p className="text-[11px] text-[#A7A094]">Reported by {rep.reporter} against {rep.reportedUser}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => alert(`Reviewing incident evidence for #${rep.id}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#211E18] hover:bg-[#302B22] text-[#F5F0E6] text-xs font-medium cursor-pointer"
                  >
                    Inspect Transcript
                  </button>
                  <button
                    onClick={() => alert(`Account suspended and isolated.`)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Freeze Account
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: PRIVACY AUDIT & DSAR LOGS */}
      {activeSection === 'privacy_audit' && (
        <div className="rounded-3xl bg-[#171717] border border-[#302B22] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#302B22]">
            <h3 className="text-sm font-bold text-[#F5F0E6] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D6AD60]" />
              <span>Data Subject Access Request (DSAR) & PDPA Compliance Log</span>
            </h3>
            <span className="text-xs text-[#A7A094]">Immutable Audit Trail</span>
          </div>

          <div className="space-y-3">
            {dsarLog.map(log => (
              <div 
                key={log.id}
                className="p-4 rounded-2xl bg-[#111111] border border-[#211E18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F0E6]">{log.user}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#211E18] text-[#D6AD60]">
                      {log.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7A094]">
                    Requested: {log.requestedAt} • Legal rule: {log.retentionPolicyApplied}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
