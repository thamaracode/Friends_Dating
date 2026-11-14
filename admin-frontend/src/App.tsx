import React, { useState, useEffect } from 'react';
import { AdminApiClient } from './services/adminApiClient';
import type { AdminUser } from './types/admin';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminShell } from './components/AdminShell';

export const App: React.FC = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => AdminApiClient.getCachedAdmin());
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = AdminApiClient.getToken();
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const res = await AdminApiClient.getMe();
        setAdmin(res.admin);
        AdminApiClient.setCachedAdmin(res.admin);
      } catch {
        AdminApiClient.clearSession();
        setAdmin(null);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();

    const handleAuthExpired = () => {
      setAdmin(null);
    };

    window.addEventListener('admin-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('admin-auth-expired', handleAuthExpired);
  }, []);

  const handleLogout = async () => {
    await AdminApiClient.logout();
    setAdmin(null);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#090A0E] flex items-center justify-center text-zinc-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F6C138] animate-ping" />
          <span>Verifying administrative session...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLoginView onLoginSuccess={(user) => setAdmin(user)} />;
  }

  return <AdminShell admin={admin} onLogout={handleLogout} />;
};

export default App;
