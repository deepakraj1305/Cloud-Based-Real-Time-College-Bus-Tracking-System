import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, ArrowLeft, User, KeyRound, Shield, GraduationCap, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'admin' as const, email: 'admin@campustransit.edu', password: 'admin123', label: 'Admin', icon: Shield, hint: 'Full control of buses, drivers, students, routes.' },
  { role: 'driver' as const, email: 'driver@campustransit.edu', password: 'driver123', label: 'Driver', icon: UserCog, hint: 'Start/end trips, view route, raise alerts.' },
  { role: 'student' as const, email: 'student@campustransit.edu', password: 'student123', label: 'Student', icon: GraduationCap, hint: 'Track your bus, see pickup stop and ETA.' },
];

export default function Login() {
  const { user, profile, signIn, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@campustransit.edu');
  const [password, setPassword] = useState('admin123');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      const to = profile.role === 'admin' ? '/admin' : profile.role === 'driver' ? '/driver' : '/student';
      navigate(to, { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const doSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await signIn(email.trim(), password);
    if (res.error) {
      setErr(res.error);
      setBusy(false);
    }
  };

  const useDemo = (acct: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(acct.email);
    setPassword(acct.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-ink-950 dark:via-ink-900 dark:to-brand-950 flex flex-col">
      <div className="p-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-8 max-w-6xl w-full mx-auto p-5">
        {/* Login form */}
        <div className="flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center text-white shadow-lg">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xl text-ink-900 dark:text-white tracking-tight">CampusTransit</div>
                <div className="text-xs text-ink-500 uppercase tracking-widest">Cloud Bus System</div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-ink-500 mt-1 mb-8">Sign in to access your dashboard.</p>

            <form onSubmit={doSignIn} className="space-y-4">
              <label className="block">
                <span className="block text-xs font-medium text-ink-600 dark:text-ink-400 mb-1.5 uppercase tracking-wider">Email</span>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-ink-600 dark:text-ink-400 mb-1.5 uppercase tracking-wider">Password</span>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </label>

              {err && (
                <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow disabled:opacity-60"
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-xs text-center text-ink-500">
              Auth powered by <span className="font-semibold">Supabase</span>. No personal data used.
            </div>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="flex items-center">
          <div className="w-full bg-white/70 dark:bg-ink-900/60 backdrop-blur rounded-2xl p-6 border border-ink-200 dark:border-ink-800">
            <div className="text-xs uppercase tracking-widest font-semibold text-brand-600 dark:text-brand-400 mb-2">Demo accounts</div>
            <div className="font-semibold text-ink-900 dark:text-white text-lg mb-4">Try each role in one click</div>
            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.role}
                  onClick={() => useDemo(a)}
                  className="w-full text-left group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 hover:border-brand-500 dark:hover:border-brand-500 transition shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0">
                    <a.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-ink-900 dark:text-white">{a.label}</div>
                    <div className="text-xs text-ink-500 truncate font-mono">{a.email}</div>
                    <div className="text-xs text-ink-500 mt-1">{a.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
