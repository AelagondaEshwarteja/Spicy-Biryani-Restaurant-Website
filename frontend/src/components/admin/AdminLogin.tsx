import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Flame, Loader2, Lock } from 'lucide-react';
import type { Admin } from '../../types';
import { authApi, tokenStorage } from '../../services/api';
import { IMAGES } from '../../data/siteInfo';

export default function AdminLogin({ onLogin }: { onLogin: (admin: Admin) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.login(email, password);
      tokenStorage.set(data.token); // saved so the admin stays logged in after refresh
      onLogin(data.admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={IMAGES.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="font-display text-4xl font-bold">Kitchen dashboard</p>
          <p className="mt-2 text-white/70">Manage orders, the menu and customer messages in one place.</p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-cream px-6 py-12 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>

          <div className="mt-10 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-saffron-500 text-ink">
              <Flame className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold">Staff login</h1>
              <p className="text-sm text-ink-soft">Spicy Biryani admin</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="label">Email</label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@spicybiryani.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="label">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-xl bg-chili-50 p-3 text-sm text-chili-700">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-xs text-ink-soft">
            The admin account is created from <code className="rounded bg-ink/5 px-1">ADMIN_EMAIL</code> and{' '}
            <code className="rounded bg-ink/5 px-1">ADMIN_PASSWORD</code> in <code>backend/.env</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
