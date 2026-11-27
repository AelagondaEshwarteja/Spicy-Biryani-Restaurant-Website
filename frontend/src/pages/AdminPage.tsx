import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Admin } from '../types';
import { authApi, tokenStorage } from '../services/api';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  // If a token is saved, we need to check it with the backend before showing anything
  const [checking, setChecking] = useState(() => Boolean(tokenStorage.get()));

  useEffect(() => {
    if (!tokenStorage.get()) return;

    authApi
      .me()
      .then((data) => setAdmin(data.admin))
      .catch(() => tokenStorage.clear()) // token expired or invalid
      .finally(() => setChecking(false));
  }, []);

  // useCallback keeps the same function between renders, so child effects don't re-run
  const handleLogout = useCallback(() => {
    tokenStorage.clear();
    setAdmin(null);
  }, []);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-ink-soft">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!admin) return <AdminLogin onLogin={setAdmin} />;

  return <AdminDashboard admin={admin} onLogout={handleLogout} />;
}
