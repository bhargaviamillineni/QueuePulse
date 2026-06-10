import { useEffect, useRef, useState } from 'react';
import { api, errorMessage } from '../services/api';

const empty = { name: '', phone: '', emergency: false };

/** Live stopwatch counting up from a given ISO start time */
function useElapsedTime(startIso) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    if (!startIso) { setElapsed(''); return; }
    function tick() {
      const secs = Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
      if (secs < 0) { setElapsed('0:00'); return; }
      const m = Math.floor(secs / 60);
      const s = String(secs % 60).padStart(2, '0');
      setElapsed(`${m}:${s}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startIso]);
  return elapsed;
}

export default function ReceptionDashboard({ queue, staff, onError }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  // Auto-focus name field on mount — receptionist can start typing immediately
  useEffect(() => { nameRef.current?.focus(); }, []);

  const isDoctor = !staff || staff.role === 'doctor' || staff.role === 'admin';
  const waiting  = queue.waiting || [];
  const current  = queue.current;

  // Real data from backend
  const avgMin             = queue.averageConsultationMinutes || 0;
  const sampleSize         = queue.consultationSampleSize    || 0;
  const servedToday        = queue.patientsServedToday       ?? 0;
  const consultStartedAt   = queue.consultationStartedAt;    // ISO string or null

  // Live consultation timer ticking from calledAt
  const elapsed = useElapsedTime(consultStartedAt);

  async function addPatient(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/patient', form);
      setForm(empty);
      nameRef.current?.focus(); // ready for next patient immediately
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function callNext() {
    try { await api.post('/call-next'); }
    catch (err) { onError(errorMessage(err)); }
  }

  async function complete() {
    try { await api.post('/complete-consultation', {}); }
    catch (err) { onError(errorMessage(err)); }
  }

  return (
    <div className="space-y-5">

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Served today"
          value={servedToday}
          sub="from DB"
          color="green"
        />
        <Stat
          label="Avg / patient"
          value={avgMin > 0 ? `${avgMin}m` : '—'}
          sub={sampleSize > 0 ? `${sampleSize} sessions` : 'no data yet'}
          color={sampleSize > 0 ? 'teal' : 'slate'}
        />
        <Stat
          label="Waiting now"
          value={waiting.length}
          sub={waiting.length === 0 ? 'queue clear' : `next: #${waiting[0]?.tokenNumber}`}
          color={waiting.length > 5 ? 'red' : waiting.length > 2 ? 'amber' : 'slate'}
        />
      </div>

      {/* ── Main two-column ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Add Patient */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wide">
            Add Patient
            <span className="ml-2 text-xs text-slate-400 normal-case font-normal">Press Enter to save</span>
          </h2>
          <form onSubmit={addPatient} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Patient name <span className="text-red-500">*</span>
              </label>
              <input
                ref={nameRef}
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Phone <span className="text-slate-400">(optional)</span>
              </label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={form.emergency}
                onChange={e => setForm({ ...form, emergency: e.target.checked })}
                disabled={saving}
                className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-400"
              />
              <span className="text-sm font-medium text-red-600 group-hover:text-red-700">
                ⚡ Emergency — move to front of queue
              </span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 transition-all"
            >
              {saving ? 'Adding…' : '+ Add Patient'}
            </button>
          </form>
        </div>

        {/* Now Serving */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Now Serving</h2>

          {current ? (
            <div className="flex-1 rounded-xl bg-green-50 border border-green-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">Token</p>
                  <p className="text-6xl font-bold text-slate-800 leading-none mt-1">{current.tokenNumber}</p>
                  <p className="mt-2 text-slate-700 font-medium">{current.name}</p>
                  {current.phone && <p className="text-xs text-slate-500 mt-0.5">{current.phone}</p>}
                </div>
                <div className="text-right">
                  {current.emergency && (
                    <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 mb-2">
                      PRIORITY
                    </span>
                  )}
                  {elapsed && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400">In session</p>
                      <p className="text-2xl font-mono font-bold text-slate-700">{elapsed}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-xl border border-dashed border-slate-300 p-4 flex items-center justify-center text-slate-400 text-sm">
              No active consultation
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={callNext}
              disabled={!isDoctor || Boolean(current)}
              title={
                !isDoctor ? 'Only doctors/admins can call next' :
                current ? 'Complete current before calling next' :
                'Call next waiting patient'
              }
              className={`rounded-lg py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.97] ${
                isDoctor && !current
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-slate-200 cursor-not-allowed text-slate-400'
              }`}
            >
              Call Next
            </button>
            <button
              onClick={complete}
              disabled={!isDoctor || !current}
              title={
                !isDoctor ? 'Only doctors/admins can complete' :
                !current ? 'No active consultation' :
                'Mark consultation as done'
              }
              className={`rounded-lg py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.97] ${
                isDoctor && current
                  ? 'bg-slate-800 hover:bg-slate-900'
                  : 'bg-slate-200 cursor-not-allowed text-slate-400'
              }`}
            >
              ✓ Done
            </button>
          </div>

          {staff && !isDoctor && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
              Call Next and Done are restricted to doctors and admins.
            </p>
          )}
        </div>
      </div>

      {/* ── Waiting Queue ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Waiting Queue</h2>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {sampleSize > 0 && avgMin > 0 ? (
              <span className="bg-teal-50 text-teal-700 border border-teal-200 rounded px-2 py-0.5">
                Avg {avgMin} min/patient · {sampleSize} real session{sampleSize > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-slate-400">Wait times calculated from real consultations</span>
            )}
            <span>{waiting.length === 0 ? 'Clear' : `${waiting.length} waiting`}</span>
          </div>
        </div>

        {waiting.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-slate-500 text-sm">Queue is clear — no patients waiting</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {waiting.map((p, i) => (
              <div key={p._id} className={`flex items-center px-6 py-3.5 gap-4 ${p.emergency ? 'bg-red-50' : i === 0 ? 'bg-teal-50/40' : ''}`}>
                <div className="w-10 flex-shrink-0 text-center">
                  <span className="text-lg font-bold text-slate-800">{p.tokenNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  {p.phone && <p className="text-xs text-slate-400">{p.phone}</p>}
                </div>
                <div className="flex items-center gap-2 text-right">
                  {p.emergency ? (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">PRIORITY</span>
                  ) : (
                    i === 0 && <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">Next</span>
                  )}
                  {/* Real estimated wait — only show if we have real data */}
                  {sampleSize > 0 && p.estimatedWaitMinutes > 0 && (
                    <span className="text-xs text-slate-500">~{p.estimatedWaitMinutes} min</span>
                  )}
                  <span className="text-xs text-slate-400 w-14 text-right">#{i + 1} in line</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function Stat({ label, value, sub, color = 'slate' }) {
  const colors = {
    green:  'border-green-200  bg-green-50  text-green-700',
    teal:   'border-teal-200   bg-teal-50   text-teal-700',
    amber:  'border-amber-200  bg-amber-50  text-amber-700',
    red:    'border-red-200    bg-red-50    text-red-700',
    slate:  'border-slate-200  bg-white     text-slate-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1 text-slate-800">{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </div>
  );
}
