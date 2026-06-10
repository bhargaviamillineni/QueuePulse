import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import PatientPortal from './pages/PatientPortal';
import ReceptionDashboard from './pages/ReceptionDashboard';
import { api, clearAuth, getAuthToken, initializeAuth, setAuthToken } from './services/api';
import { createQueueSocket } from './services/socket';

const initialQueue = {
  current: null,
  waiting: [],
  pendingApprovals: [],
  averageConsultationMinutes: 8,
  generatedAt: null
};

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view') || 'staff';
  const isPatientMode = viewParam === 'patient';

  const [queue, setQueue] = useState(initialQueue);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [staff, setStaff] = useState(null);

  // Restore auth token on load
  useEffect(() => {
    initializeAuth();
    setIsAuthenticated(!!getAuthToken());
  }, []);

  // Load data + real-time socket when logged in
  useEffect(() => {
    if (!isAuthenticated || isPatientMode) return;
    let mounted = true;

    async function load() {
      try {
        const [qRes, staffRes] = await Promise.all([
          api.get('/queue'),
          api.get('/auth/me')
        ]);
        if (mounted) {
          setQueue(qRes.data);
          setStaff(staffRes.data);
        }
      } catch (err) {
        if (!mounted) return;
        if (err?.response?.status === 401) {
          clearAuth();
          setIsAuthenticated(false);
        } else {
          setError(err?.response?.data?.message || err.message);
        }
      }
    }

    load();

    const socket = createQueueSocket();
    socket.on('queue:updated', (q) => { if (mounted) setQueue(q); });
    socket.on('connect_error', () => { if (mounted) setError('Connection lost. Reconnecting…'); });
    socket.on('connect', () => { if (mounted) setError(''); });

    return () => { mounted = false; socket.disconnect(); };
  }, [isAuthenticated, isPatientMode]);

  function handleLoginSuccess() {
    setIsAuthenticated(true);
    setError('');
  }

  function handleLogout() {
    clearAuth();
    setIsAuthenticated(false);
    setStaff(null);
    setQueue(initialQueue);
    setError('');
  }

  // Public patient portal
  if (isPatientMode) {
    return (
      <div>
        <PatientPortal />
        <div className="fixed bottom-4 right-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 transition"
          >
            Staff Login
          </a>
        </div>
      </div>
    );
  }

  // Staff login
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Staff dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-bold tracking-widest text-teal-600 uppercase">QueuePulse</span>
          <h1 className="text-base sm:text-lg font-semibold text-slate-800 leading-tight">Reception</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {staff && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-600 truncate max-w-[120px]">{staff.name}</span>
              <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize flex-shrink-0 ${
                staff.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                staff.role === 'doctor' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>{staff.role}</span>
            </div>
          )}
          {staff && (
            <span className={`sm:hidden rounded px-2 py-0.5 text-xs font-semibold capitalize ${
              staff.role === 'admin' ? 'bg-purple-100 text-purple-700' :
              staff.role === 'doctor' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>{staff.role}</span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition whitespace-nowrap"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">↩</span>
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <ReceptionDashboard queue={queue} staff={staff} onError={setError} />
      </main>
    </div>
  );
}
