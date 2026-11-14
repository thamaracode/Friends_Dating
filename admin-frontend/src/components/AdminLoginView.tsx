import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { AdminApiClient } from '../services/adminApiClient';
import type { AdminUser } from '../types/admin';

interface AdminLoginViewProps {
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('superadmin@soulverse.im');
  const [password, setPassword] = useState('Admin@Soulverse2026!');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStep1Login = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await AdminApiClient.login(email, password, mfaCode || undefined);
      if (res.mfaRequired && res.challengeToken) {
        setMfaRequired(true);
        setChallengeToken(res.challengeToken);
        setMfaCode('192600'); // Pre-fill seeded test demo code for convenience
      } else if (res.token && res.admin) {
        AdminApiClient.setToken(res.token);
        AdminApiClient.setCachedAdmin(res.admin);
        onLoginSuccess(res.admin);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2VerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeToken) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await AdminApiClient.verifyMfa(challengeToken, mfaCode);
      if (res.token && res.admin) {
        AdminApiClient.setToken(res.token);
        AdminApiClient.setCachedAdmin(res.admin);
        onLoginSuccess(res.admin);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid 2FA code');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setMfaRequired(false);
    setChallengeToken(null);
    setMfaCode('');
  };

  return (
    <div className="min-h-screen bg-[#090A0E] flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#F6C138]/20">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#F6C138]/10 via-[#E5A817]/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand & Console Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#12141B] to-[#1A1D27] border border-[#F6C138]/30 shadow-[0_0_30px_rgba(246,193,56,0.15)] mb-2">
            <Shield className="w-7 h-7 text-[#F6C138]" />
          </div>
          <h1 className="type-hero text-white tracking-tight">Soulverse Admin</h1>
          <p className="type-supporting text-zinc-400">
            Dedicated Platform Management & Security Infrastructure
          </p>
        </div>

        {/* Login Box */}
        <div className="sv-card p-6 sm:p-8 space-y-6 border-white/15 shadow-2xl">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!mfaRequired ? (
            <form onSubmit={handleStep1Login} className="space-y-4">
              <div className="space-y-1.5">
                <label className="type-metadata text-zinc-400 uppercase tracking-wider block">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="sv-input w-full pl-10"
                    placeholder="admin@soulverse.im"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="type-metadata text-zinc-400 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="sv-input w-full pl-10"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="sv-btn-gold w-full mt-2 cursor-pointer font-bold disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Management Console'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2VerifyMfa} className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-[#F6C138]/20 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#F6C138]">
                  <KeyRound className="w-4 h-4" />
                  <span>Two-Factor Authentication Required</span>
                </div>
                <p className="type-supporting text-zinc-300">
                  Enter the 6-digit TOTP code generated for <span className="text-white font-mono">{email}</span>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="type-metadata text-zinc-400 uppercase tracking-wider block">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  className="sv-input w-full text-center text-xl font-mono tracking-widest text-[#F6C138]"
                  placeholder="192600"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMfaRequired(false)}
                  className="sv-btn-secondary flex-1 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="sv-btn-gold flex-1 cursor-pointer font-bold disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enter'}
                </button>
              </div>
            </form>
          )}

          {/* Quick-select test admin roles */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <span className="type-metadata text-zinc-500 uppercase tracking-wider block text-center">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoRole('superadmin@soulverse.im', 'Admin@Soulverse2026!')}
                className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#F6C138]/40 hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-white">Super Admin</div>
                <div className="text-[11px] text-zinc-400">Full Access</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('sysadmin@soulverse.im', 'SysAdmin@2026!')}
                className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-cyan-300">Sys Admin</div>
                <div className="text-[11px] text-zinc-400">Ops & SQLite</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('moderator@soulverse.im', 'Mod@Soulverse2026!')}
                className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-amber-300">Moderator</div>
                <div className="text-[11px] text-zinc-400">Reports & Users</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('aiadmin@soulverse.im', 'AIAdmin@2026!')}
                className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-purple-300">AI Architect</div>
                <div className="text-[11px] text-zinc-400">Providers & BYOAI</div>
              </button>
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <p className="type-metadata text-zinc-500 text-center">
          Administrative actions are strictly audited and cryptographically bound to session records.
        </p>

      </div>
    </div>
  );
};
