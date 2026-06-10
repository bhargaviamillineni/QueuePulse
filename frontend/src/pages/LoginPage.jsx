import { useState } from 'react';
import { api, errorMessage, setAuthToken } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuthToken(res.data.token);
      onLoginSuccess();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600">QueuePulse</p>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Staff Login</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage the queue</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="staff@clinic.com"
                required
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">Demo credentials</p>
            <div className="space-y-1.5">
              {[
                { email: 'receptionist@clinic.com', role: 'Receptionist' },
                { email: 'doctor@clinic.com', role: 'Doctor' },
                { email: 'admin@clinic.com', role: 'Admin' },
              ].map(({ email: e, role }) => (
                <button
                  key={e}
                  type="button"
                  disabled={loading}
                  onClick={() => { setEmail(e); setPassword('password123'); setError(''); }}
                  className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50 transition disabled:opacity-50"
                >
                  <span className="text-slate-600">{e}</span>
                  <span className={`rounded px-1.5 py-0.5 font-semibold ${
                    role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                    role === 'Doctor' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{role}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Password: password123</p>
          </div>
        </div>

        {/* Patient portal link */}
        <p className="text-center mt-4 text-sm text-slate-500">
          Patient?{' '}
          <a href="/?view=patient" className="text-teal-600 font-semibold hover:underline">
            Check your queue position →
          </a>
        </p>
      </div>
    </div>
  );
}
