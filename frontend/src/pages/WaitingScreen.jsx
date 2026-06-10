import { Clock, UserRoundCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function WaitingScreen({ queue }) {
  const [token, setToken] = useState('');
  const tokenNumber = Number(token);
  const patient = useMemo(() => queue.waiting.find((item) => item.tokenNumber === tokenNumber), [queue.waiting, tokenNumber]);
  const isCurrent = queue.current?.tokenNumber === tokenNumber;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h2 className="text-xl font-semibold text-clinic-ink">Patient waiting screen</h2>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Your token number</span>
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            inputMode="numeric"
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-2xl font-semibold"
            placeholder="Enter token"
          />
        </label>

        <div className="mt-5 rounded-lg bg-clinic-ink p-5 text-white">
          <p className="text-sm font-medium text-emerald-100">Currently serving</p>
          <p className="mt-2 text-6xl font-bold">{queue.current?.tokenNumber || '--'}</p>
          <p className="mt-2 text-emerald-100">{queue.current?.name || 'Waiting for next token'}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <UserRoundCheck className="h-4 w-4" />
              Ahead
            </p>
            <p className="mt-2 text-3xl font-semibold">{isCurrent ? 0 : patient?.patientsAhead ?? '--'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Clock className="h-4 w-4" />
              ETA
            </p>
            <p className="mt-2 text-3xl font-semibold">{isCurrent ? 'Now' : patient ? `${patient.estimatedWaitMinutes}m` : '--'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-clinic-ink">Queue timeline</h2>
          <span className="rounded-md bg-clinic-mist px-3 py-1 text-sm font-semibold text-clinic-teal">Live</span>
        </div>
        <div className="mt-6 space-y-3">
          {queue.current ? (
            <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-clinic-green font-bold text-white">{queue.current.tokenNumber}</div>
              <div>
                <p className="font-semibold text-clinic-ink">In consultation</p>
                <p className="text-sm text-slate-600">{queue.current.name}</p>
              </div>
            </div>
          ) : null}
          {queue.waiting.slice(0, 12).map((item, index) => (
            <div key={item._id} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${item.emergency ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                {item.tokenNumber}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-clinic-ink">{index === 0 ? 'Next' : `${index + 1} in line`}</p>
                  {item.emergency ? <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700">Priority</span> : null}
                </div>
                <p className="truncate text-sm text-slate-600">{item.name}</p>
              </div>
              <span className="text-sm font-semibold text-slate-700">{item.estimatedWaitMinutes}m</span>
            </div>
          ))}
          {!queue.current && !queue.waiting.length ? <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">No active queue</div> : null}
        </div>
      </section>
    </div>
  );
}
