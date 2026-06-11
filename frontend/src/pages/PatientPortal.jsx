import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { createQueueSocket } from '../services/socket';

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

export default function PatientPortal() {
  const [queue, setQueue] = useState(null);
  const [token, setToken] = useState('');
  const [searched, setSearched] = useState(false);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get('/queue');
        if (mounted) setQueue(res.data);
      } catch { /* silent on public page */ }
    }
    load();

    const socket = createQueueSocket();
    socket.on('queue:updated', (q) => { if (mounted) setQueue(q); });
    return () => { mounted = false; socket.disconnect(); };
  }, []);

  const elapsed = useElapsedTime(queue?.consultationStartedAt);

  function handleCheck(e) {
    e.preventDefault();
    setInputError('');
    if (!token.trim()) { setInputError('Please enter your token number'); return; }
    setSearched(true);
  }

  const tokenNum   = Number(token);
  const isCurrent  = queue?.current?.tokenNumber === tokenNum;
  const inQueue    = queue?.waiting?.find(p => p.tokenNumber === tokenNum);
  const notFound   = searched && !isCurrent && !inQueue;

  const avgMin     = queue?.averageConsultationMinutes || 0;
  const sampleSize = queue?.consultationSampleSize    || 0;

  if (!queue) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading queue…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-sm mx-auto space-y-4">

        {/* Header */}
        <div className="text-center mb-1">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600">QueuePulse</p>
          <h1 className="text-xl font-bold text-slate-800 mt-0.5">Patient Queue</h1>
        </div>

        {/* Now Serving */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Now Serving</p>
          {queue.current ? (
            <>
              <p className="text-8xl font-black text-slate-800 leading-none">{queue.current.tokenNumber}</p>
              <p className="mt-3 text-slate-600 font-medium">{queue.current.name}</p>
              {queue.current.emergency && (
                <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  PRIORITY
                </span>
              )}
              {elapsed && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-mono font-semibold text-slate-600">{elapsed}</span>
                  <span className="text-xs text-slate-400">in session</span>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-7xl font-black text-slate-300">—</p>
              <p className="mt-3 text-slate-400 text-sm">No one being served right now</p>
            </>
          )}
        </div>

        {/* Token check */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-3">Check your position</p>

          {/* ✅ Full-width form — input grows, button fixed width */}
          <form onSubmit={handleCheck} className="flex items-center gap-2 w-full">
            <input
              type="number"
              min="1"
              value={token}
              onChange={e => { setToken(e.target.value); setSearched(false); setInputError(''); }}
              placeholder="Token number"
              className="flex-1 min-w-0 rounded-xl border border-slate-300 px-3 py-2.5 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="w-24 shrink-0 rounded-xl bg-teal-600 py-2.5 font-semibold text-white hover:bg-teal-700 active:scale-[0.97] transition-all"
            >
              Check
            </button>
          </form>

          {inputError && (
            <p className="mt-2 text-sm text-red-600">{inputError}</p>
          )}

          {/* It's your turn! */}
          {isCurrent && (
            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-green-700 font-bold text-lg">🎉 It's your turn!</p>
              <p className="text-green-600 text-sm mt-1">Please proceed to the doctor.</p>
            </div>
          )}

          {/* In queue with real wait estimate */}
          {inQueue && !isCurrent && (
            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2.5">
              <Row label="Your token"   value={<span className="text-2xl font-bold">{inQueue.tokenNumber}</span>} />
              <Row label="People ahead" value={<span className="text-2xl font-bold">{inQueue.patientsAhead}</span>} />

              {sampleSize > 0 && inQueue.estimatedWaitMinutes > 0 && (
                <div className="pt-2 border-t border-blue-200">
                  <Row
                    label="Est. wait"
                    value={<span className="text-2xl font-bold text-teal-700">~{inQueue.estimatedWaitMinutes} min</span>}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-center">
                    Based on {sampleSize} real consultation{sampleSize > 1 ? 's' : ''} · {avgMin} min avg
                  </p>
                </div>
              )}

              {inQueue.patientsAhead === 0 && (
                <p className="text-sm text-teal-700 font-semibold text-center pt-1">
                  🔔 You're next!
                </p>
              )}
            </div>
          )}

          {/* Not found */}
          {notFound && (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
              <p className="text-slate-500 text-sm">
                Token <strong>#{token}</strong> not found.<br />
                Check your number or ask the reception desk.
              </p>
            </div>
          )}
        </div>

        {/* Queue summary */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Patients waiting</span>
            <span className="text-3xl font-bold text-slate-800">{queue.waiting.length}</span>
          </div>
          {queue.waiting.length === 0 && (
            <p className="text-xs text-green-600 mt-1">✓ Queue is clear</p>
          )}
        </div>

      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}
