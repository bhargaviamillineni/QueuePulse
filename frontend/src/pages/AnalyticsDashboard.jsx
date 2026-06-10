import Metric from '../components/Metric';

export default function AnalyticsDashboard({ analytics, queue }) {
  const healthTone = {
    calm: 'good',
    steady: 'default',
    busy: 'warn',
    critical: 'danger'
  }[analytics.queueHealth || 'calm'];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Metric label="Served today" value={analytics.patientsServed ?? 0} detail="Completed consultations" />
        <Metric label="Avg duration" value={`${analytics.averageConsultationMinutes ?? queue.averageConsultationMinutes}m`} detail="Last 10 completed" />
        <Metric label="Longest wait" value={`${analytics.longestWaitMinutes ?? 0}m`} detail="Current queue" tone={(analytics.longestWaitMinutes ?? 0) > 45 ? 'warn' : 'default'} />
        <Metric label="Queue health" value={analytics.queueHealth || 'calm'} detail={`${queue.waiting.length} waiting`} tone={healthTone} />
        <Metric label="Efficiency" value={`${analytics.efficiencyScore ?? 100}%`} detail="Daily score" tone={(analytics.efficiencyScore ?? 100) < 60 ? 'danger' : 'good'} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h2 className="text-xl font-semibold text-clinic-ink">Operational pulse</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-600">Prediction engine</p>
            <p className="mt-2 text-slate-700">ETA is recalculated from the average of the last 10 completed consultations.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-600">Emergency load</p>
            <p className="mt-2 text-3xl font-semibold text-clinic-ink">{queue.waiting.filter((patient) => patient.emergency).length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-600">Pending approvals</p>
            <p className="mt-2 text-3xl font-semibold text-clinic-ink">{queue.pendingApprovals.length}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
